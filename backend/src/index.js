import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config(); // fallback local

import express from "express";
import cors from "cors";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { ethers } from "ethers";
import { pool, query, transaction } from "./db.js";

const {
  HMAC_SECRET = "default_hmac_secret_rantaiasa_2026",
  JWT_SECRET = "default_jwt_secret_rantaiasa_2026",
  RPC_URL = "https://polygon-amoy-bor-rpc.publicnode.com",
  PRIVATE_KEY_ORACLE,
  AI_SERVICE_URL = "http://localhost:8000",
  DISBURSE_ADDRESS,
  REPORT_REGISTRY_ADDRESS,
  PORT = 4000
} = process.env;

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({ windowMs: 60000, limit: 120 }));

const ABI_DISBURSE  = ["function attestScore(bytes32,uint32,uint16)"];
const ABI_REPORT    = ["function recordVerification(bytes32,uint32,string,uint8) returns (bool)"];

const err = (res, s, code, detail) => res.status(s).json({ error: code, detail });
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2$${salt}$${digest}`;
}
function verifyPassword(password, stored) {
  const parts = String(stored || "").split("$");
  if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
  const actual = crypto.pbkdf2Sync(password, parts[1], 120000, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(parts[2], "hex"));
}
const auth = (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), JWT_SECRET);
    next();
  } catch { err(res, 401, "AUTH_REQUIRED", "token tidak valid"); }
};

async function ensureOfficer(client, wallet) {
  const user = await client.query(
    `INSERT INTO users (wallet_address, role)
     VALUES ($1, 'OFFICER')
     ON CONFLICT (wallet_address) DO UPDATE SET wallet_address = EXCLUDED.wallet_address
     RETURNING id`,
    [wallet],
  );
  const existing = await client.query(
    "SELECT id FROM officers WHERE user_id = $1",
    [user.rows[0].id],
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const officer = await client.query(
    `INSERT INTO officers (user_id, display_name, active)
     VALUES ($1, $2, true)
     RETURNING id`,
    [user.rows[0].id, wallet],
  );
  return officer.rows[0].id;
}

// ── Validasi kode wilayah Jabar 3201–3279 ──
const VALID_REGION = /^32(0[1-9]|1[0-8]|7[1-9])$/;
const isValidRegion = (code) => VALID_REGION.test(String(code));

// In-memory nonces untuk fallback tanpa PostgreSQL
const inMemoryNonces = new Map();

// ── Health ──
app.get("/health", async (_q, r) => {
  if (!pool) {
    return r.json({ status: "ok", database: "in-memory (no postgresql)", notice: "DATABASE_URL tidak diset, berjalan dalam mode simulasi." });
  }
  try {
    await pool.query("SELECT 1");
    r.json({ status: "ok", database: "connected" });
  } catch (e) {
    r.status(503).json({ status: "error", database: "disconnected", detail: e.message });
  }
});

// ── Auth ──
app.post("/auth/nonce", async (q, r) => {
  const w = String(q.body.wallet || "").toLowerCase();
  if (!ethers.isAddress(w)) return err(r, 422, "INVALID_INPUT", "wallet");
  const nonce = crypto.randomBytes(16).toString("hex");
  if (!pool) {
    inMemoryNonces.set(w, { nonce, expiresAt: Date.now() + 10 * 60 * 1000 });
    return r.json({ nonce });
  }
  try {
    await query(
      `INSERT INTO login_nonces (wallet_address, nonce, expires_at)
       VALUES ($1,$2,now()+interval '10 minutes')
       ON CONFLICT (wallet_address) DO UPDATE
       SET nonce=EXCLUDED.nonce, expires_at=EXCLUDED.expires_at`,
      [w, nonce],
    );
    r.json({ nonce });
  } catch (e) {
    err(r, 503, "DATABASE_UNAVAILABLE", e.message);
  }
});

app.post("/auth/verify", async (q, r) => {
  const w = String(q.body.wallet || "").toLowerCase();
  if (!pool) {
    const entry = inMemoryNonces.get(w);
    const nonce = entry ? entry.nonce : "sim-nonce-fallback";
    try {
      const recovered = ethers.verifyMessage(`RantaiAsa login: ${nonce}`, q.body.signature);
      if (recovered.toLowerCase() !== w && entry) return err(r, 401, "AUTH_REQUIRED", "signature");
    } catch {}
    inMemoryNonces.delete(w);
    return r.json({ token: jwt.sign({ wallet: w, role: "OFFICER" }, JWT_SECRET, { expiresIn: "30m" }) });
  }
  try {
    const nonceResult = await query(
      "SELECT nonce FROM login_nonces WHERE wallet_address=$1 AND expires_at > now()",
      [w],
    );
    const nonce = nonceResult?.rows[0]?.nonce;
    if (!nonce) return err(r, 401, "AUTH_REQUIRED", "nonce");
    const recovered = ethers.verifyMessage(`RantaiAsa login: ${nonce}`, q.body.signature);
    if (recovered.toLowerCase() !== w) return err(r, 401, "AUTH_REQUIRED", "signature");
    await query("DELETE FROM login_nonces WHERE wallet_address=$1", [w]);
    await transaction(async (client) => {
      await ensureOfficer(client, w);
    });
    r.json({ token: jwt.sign({ wallet: w, role: "OFFICER" }, JWT_SECRET, { expiresIn: "30m" }) });
  } catch (e) {
    err(r, 401, "AUTH_REQUIRED", e.message);
  }
});

app.post("/auth/credentials", async (q, r) => {
  const nip = String(q.body.nip || "").trim();
  const password = String(q.body.password || "");
  if (!pool) {
    const demoNip = process.env.DEMO_OFFICER_NIP || "19880415 201201 1 002";
    const demoPass = process.env.DEMO_OFFICER_PASSWORD || "petugas2026";
    if (nip.replace(/\s+/g, "") === demoNip.replace(/\s+/g, "") && password === demoPass) {
      return r.json({
        token: jwt.sign({ wallet: "0xDebE39681c91F60C010d7C66e443770cf85dF3bf", role: "OFFICER", nip }, JWT_SECRET, { expiresIn: "30m" }),
      });
    }
    return err(r, 401, "AUTH_REQUIRED", "NIP atau kata sandi tidak valid");
  }
  try {
    const credential = await query(
      `SELECT c.password_hash, o.id AS officer_id, o.display_name, o.nip,
              o.region_code, o.department, o.role_name, o.status, u.wallet_address
       FROM officer_credentials c
       JOIN officers o ON o.id=c.officer_id
       JOIN users u ON u.id=o.user_id
       WHERE c.nip=$1 AND c.active=true`,
      [nip],
    );
    const officer = credential.rows[0];
    if (!officer || !verifyPassword(password, officer.password_hash)) {
      return err(r, 401, "AUTH_REQUIRED", "NIP atau kata sandi tidak valid");
    }
    const identity = officer.wallet_address || `nip:${nip}`;
    r.json({
      token: jwt.sign({ wallet: identity, role: "OFFICER", nip }, JWT_SECRET, { expiresIn: "30m" }),
    });
  } catch (e) {
    err(r, 503, "DATABASE_UNAVAILABLE", e.message);
  }
});

app.get("/auth/me", auth, async (q, r) => {
  if (!pool) {
    return r.json({
      id: "OFFICER-3201-09",
      display_name: "Budi Santoso, S.STP",
      nip: q.user.nip || "19880415 201201 1 002",
      region_code: "3201",
      regionName: "Kabupaten Bogor",
      department: "Dinas Sosial Provinsi Jawa Barat",
      role_name: "Petugas Verifikator Wilayah",
      status: "ACTIVE_VERIFIED",
      wallet_address: q.user.wallet || "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
    });
  }
  try {
    const result = await query(
      `SELECT o.id, o.display_name, o.nip, o.region_code, o.department,
              o.role_name, o.status, u.wallet_address
       FROM users u
       JOIN officers o ON o.user_id=u.id
       WHERE u.wallet_address=$1
       LIMIT 1`,
      [q.user.wallet],
    );
    if (!result.rows[0]) return err(r, 404, "NOT_FOUND", "petugas");
    r.json(result.rows[0]);
  } catch (e) {
    err(r, 503, "DATABASE_UNAVAILABLE", e.message);
  }
});

// ── Identity (NIK diproses di memori, tidak disimpan/dilog) ──
app.post("/identity/pseudonymize", auth, (q, r) => {
  const { nik, programId, periodId } = q.body;
  if (!/^\d{16}$/.test(String(nik || "")) || !Number.isInteger(periodId) || !Number.isInteger(programId))
    return err(r, 422, "INVALID_INPUT", "nik 16 digit, programId, periodId");
  const identityHash = "0x" + crypto.createHmac("sha256", HMAC_SECRET).update(String(nik)).digest("hex");
  r.json({ identityHash, refCode: "RCP-" + crypto.randomBytes(3).toString("hex").toUpperCase() });
});

// ── Assessment (skor AI + attest on-chain) ──
app.post("/assessments", auth, async (q, r) => {
  const { identityHash, periodId, refCode, features } = q.body;
  if (!/^0x[0-9a-fA-F]{64}$/.test(String(identityHash || ""))) {
    return err(r, 422, "INVALID_INPUT", "identityHash");
  }
  let ai;
  try {
    const x = await fetch(`${AI_SERVICE_URL}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features })
    });
    if (!x.ok) return err(r, x.status === 422 ? 422 : 503, x.status === 422 ? "INVALID_INPUT" : "AI_UNAVAILABLE", "");
    ai = await x.json();
  } catch { return err(r, 503, "AI_UNAVAILABLE", ""); }
  let attestTxHash = null;
  if (PRIVATE_KEY_ORACLE && DISBURSE_ADDRESS) {
    try {
      const w = new ethers.Wallet(PRIVATE_KEY_ORACLE, new ethers.JsonRpcProvider(RPC_URL));
      const c = new ethers.Contract(DISBURSE_ADDRESS, ABI_DISBURSE, w);
      const tx = await c.attestScore(identityHash, periodId, ai.score);
      await tx.wait();
      attestTxHash = tx.hash;
    } catch (e) {
      console.error("assessment chain attestation failed:", e.message);
    }
  }
  try {
    await transaction(async (client) => {
      let recipientId = null;
      if (refCode) {
        const recipient = await client.query(
          "SELECT id FROM recipient_refs WHERE ref_code=$1",
          [refCode],
        );
        recipientId = recipient.rows[0]?.id || null;
      }
      await client.query(
        `INSERT INTO eligibility_assessments
          (recipient_id, score, label, review_required, top_factors, model_version, attest_tx_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          recipientId,
          ai.score,
          ai.label,
          ai.review_required ?? ai.score < 60,
          JSON.stringify(ai.top_factors || ai.factors || []),
          ai.model_version,
          attestTxHash,
        ],
      );
    });
    r.json({ ...ai, attestTxHash });
  } catch (e) {
    err(r, 503, "DATABASE_UNAVAILABLE", e.message);
  }
});

// ── PUBLIC: Stats per wilayah (Tahap 2) ──
// Cache sederhana; refresh setiap 5 menit
let _statsCache = null; let _statsCacheAt = 0;
// Fallback membaca data P2 langsung dari CSV jika ai-engine belum dinyalakan
import fs from "fs";

function getFallbackRegions() {
  try {
    const csvPath = path.resolve(__dirname, "../../ai-engine/data/p2_jabar.csv");
    if (!fs.existsSync(csvPath)) return [];
    const text = fs.readFileSync(csvPath, "utf-8");
    const lines = text.trim().split("\n");
    const latestByKode = {};
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",");
      if (parts.length >= 8) {
        const kode = parts[3].trim();
        const nama = parts[4].trim();
        const p2 = parseFloat(parts[5]);
        const thn = parseInt(parts[7]);
        if (!latestByKode[kode] || thn >= latestByKode[kode].tahun) {
          latestByKode[kode] = { kode: parseInt(kode), nama, p2_latest: p2, tahun: thn };
        }
      }
    }
    return Object.values(latestByKode).map(r => ({
      kode: r.kode,
      nama: r.nama,
      p2_terkini: r.p2_latest,
      tren: 0,
      registrasi: 0,
      penyaluran: 0,
      laporan_verified: 0
    }));
  } catch (e) {
    return [];
  }
}

async function fetchRegionStats() {
  try {
    // Coba ambil data lengkap dari ai-engine /regions (model lr-jabar-sim-1.3)
    const res = await fetch(`${AI_SERVICE_URL}/regions`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const regions = await res.json();
      return regions.map(r => ({
        kode: r.kode_kabupaten_kota,
        nama: r.nama || r.nama_kabupaten_kota || "",
        p2_terkini: r.regional_severity ?? r.p2_latest ?? 0,
        p1_terkini: r.regional_depth ?? 0,
        tren: r.regional_trend ?? r.trend_3yr ?? 0,
        garis_kemiskinan_k: r.poverty_line_k ?? 0,
        penduduk_miskin_k: r.poor_count_k ?? 0,
        tahun_data: r.tahun_data ?? 2025,
        registrasi: 0,
        penyaluran: 0,
        laporan_verified: 0
      }));
    }
  } catch (e) {
    // ai-engine offline: gunakan fallback CSV lokal
  }
  return getFallbackRegions();
}

app.get("/public/stats-by-region", async (q, r) => {
  try {
    const now = Date.now();
    if (!_statsCache || now - _statsCacheAt > 60_000) {
      _statsCache = await fetchRegionStats();
      _statsCacheAt = now;
    }
    let data = _statsCache;
    if (pool) {
      const [recipientCounts, disbursementCounts, reportCounts] = await Promise.all([
        query(`SELECT region_code, COUNT(*)::int AS count FROM recipient_refs WHERE region_code IS NOT NULL GROUP BY region_code`),
        query(`SELECT r.region_code, COUNT(d.*)::int AS count FROM disbursement_refs d JOIN recipient_refs r ON r.id=d.recipient_id WHERE r.region_code IS NOT NULL GROUP BY r.region_code`),
        query(`SELECT region_code, COUNT(*)::int AS count FROM reports WHERE status='VERIFIED' GROUP BY region_code`),
      ]);
      const registrasi = new Map(recipientCounts.rows.map(x => [String(x.region_code), x.count]));
      const penyaluran = new Map(disbursementCounts.rows.map(x => [String(x.region_code), x.count]));
      const laporan = new Map(reportCounts.rows.map(x => [String(x.region_code), x.count]));
      data = data.map(item => ({
        ...item,
        registrasi: registrasi.get(String(item.kode)) || 0,
        penyaluran: penyaluran.get(String(item.kode)) || 0,
        laporan_verified: laporan.get(String(item.kode)) || 0,
      }));
    }
    // Filter opsional: ?program=1&periode=202611
    if (q.query.program) data = data.filter(d => d.program_id == q.query.program);
    r.json({ data, generated_at: new Date(_statsCacheAt).toISOString(), notice: "SIMULASI (Jawa Barat)" });
  } catch (e) { err(r, 503, "SERVICE_UNAVAILABLE", String(e.message)); }
});

// ── PUBLIC: Riwayat Tren P2 2004–2025 per wilayah dari CSV BPS ──
app.get("/public/regions/:kode/trend", (q, r) => {
  const kode = parseInt(q.params.kode);
  if (isNaN(kode)) return err(r, 422, "INVALID_INPUT", "kode wilayah harus angka");
  try {
    const csvPath = path.resolve(__dirname, "../../ai-engine/data/p2_jabar.csv");
    if (!fs.existsSync(csvPath)) return r.json({ data: [] });
    const text = fs.readFileSync(csvPath, "utf-8");
    const lines = text.trim().split("\n");
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",");
      if (parts.length >= 8) {
        const k = parseInt(parts[3].trim());
        if (k === kode) {
          results.push({
            tahun: parseInt(parts[7].trim()),
            p2: parseFloat(parts[5].trim())
          });
        }
      }
    }
    results.sort((a, b) => a.tahun - b.tahun);
    r.json({ kode, data: results });
  } catch (e) {
    err(r, 500, "SERVER_ERROR", e.message);
  }
});

// ── PUBLIC: Live AI scoring preview (model lr-jabar-sim-1.3) ──
app.post("/public/score-simulasi", async (q, r) => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features: q.body.features || {} }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return r.status(res.status).json(errJson);
    }
    const data = await res.json();
    r.json(data);
  } catch (e) {
    err(r, 503, "AI_UNAVAILABLE", e.message);
  }
});

app.get("/public/contracts", (_q, r) => r.json({
  chain_id: Number(process.env.CHAIN_ID || 80002),
  contracts: {
    identity_registry: process.env.REGISTRY_ADDRESS || "0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84",
    aid_disbursement: process.env.DISBURSE_ADDRESS || "0xDd9E6cffA4DEB9493D6406A839480673Af13859D",
    report_registry: process.env.REPORT_REGISTRY_ADDRESS || "0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d",
  },
}));

app.get("/public/network", async (_q, r) => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const started = Date.now();
    const [network, blockNumber] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
    ]);
    r.json({
      connected: true,
      chain_id: Number(network.chainId),
      block_number: blockNumber,
      latency_ms: Date.now() - started,
      rpc_url: RPC_URL,
    });
  } catch (e) {
    r.status(503).json({ connected: false, chain_id: Number(process.env.CHAIN_ID || 80002), detail: e.message });
  }
});

app.get("/officer/stats", auth, async (q, r) => {
  if (!pool) {
    return r.json({
      recipients_verified: recipientsStore.length || 48,
      disbursements: disbursementsStore.length || 36,
      disbursed_amount: disbursementsStore.reduce((sum, d) => sum + (d.amount || 0), 0) || 27000000,
      reports_handled: reportsStore.filter(x => x.status === "VERIFIED").length || 4,
    });
  }
  try {
    const officerResult = await query(
      `SELECT o.id FROM officers o JOIN users u ON u.id=o.user_id WHERE u.wallet_address=$1 LIMIT 1`,
      [q.user.wallet],
    );
    if (!officerResult.rows[0]) return err(r, 404, "NOT_FOUND", "petugas");
    const officerId = officerResult.rows[0].id;
    const [recipients, disbursements, reports] = await Promise.all([
      query("SELECT COUNT(*) FROM recipient_refs WHERE officer_id=$1", [officerId]),
      query(`SELECT COUNT(*)::int AS count, COALESCE(SUM(d.amount),0) AS total
             FROM disbursement_refs d JOIN recipient_refs r ON r.id=d.recipient_id
             WHERE r.officer_id=$1`, [officerId]),
      query(`SELECT COUNT(*)::int AS count FROM reports WHERE officer_id=$1`, [officerId]),
    ]);
    r.json({
      recipients_verified: Number(recipients.rows[0].count),
      disbursements: Number(disbursements.rows[0].count),
      disbursed_amount: Number(disbursements.rows[0].total),
      reports_handled: Number(reports.rows[0].count),
    });
  } catch (e) {
    err(r, 503, "DATABASE_UNAVAILABLE", e.message);
  }
});

// ── PUBLIC: Search tx hash ──
app.get("/public/tx/:hash", (_q, r) => {
  const hash = _q.params.hash;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) return err(r, 422, "INVALID_INPUT", "tx hash format");
  // Explorer link (Polygon Amoy)
  r.json({ explorer_url: `https://amoy.polygonscan.com/tx/${hash}` });
});

// ══════════════════════════════════════════
// TAHAP 3 — Modul Pelaporan
// ══════════════════════════════════════════

// In-memory store (ganti DB bila DATABASE_URL tersedia)
const reportsStore = [];
let _reportIdSeq = 1;

// Off-chain stores sesuai Doc 07 (Database & API Documentation)
const recipientsStore = [];
const disbursementsStore = [];
const auditLogsStore = [];

const AID_PROGRAMS = [
  { id: 1, code: "PKH-2026-P1", name: "Program Keluarga Harapan", period_id: 202611, amount_unit: 750000, threshold: 60, active: true },
  { id: 2, code: "BPNT-2026-P1", name: "Bantuan Pangan Non-Tunai", period_id: 202611, amount_unit: 600000, threshold: 60, active: true },
  { id: 3, code: "BERAS-2026-P1", name: "Bantuan Cadangan Beras", period_id: 202611, amount_unit: 300000, threshold: 60, active: true }
];

// Helper: audit log off-chain (Doc 07 / SRS-FR)
function logAudit(officerWallet, action, entity, entityId, txHash = null) {
  auditLogsStore.unshift({
    id: auditLogsStore.length + 1,
    officer: officerWallet || "SYSTEM",
    action,
    entity,
    entity_id: entityId,
    tx_hash: txHash,
    created_at: new Date().toISOString()
  });
}

// ── Doc 07: POST /recipients ──
app.post("/recipients", auth, (q, r) => {
  const { refCode, identityHash, regTxHash, programId = 1, periodId = 202611, regionCode } = q.body;
  if (!refCode || !identityHash) {
    return err(r, 422, "INVALID_INPUT", "refCode and identityHash required");
  }
  if (/^0x[0-9a-fA-F]{64}$/.test(identityHash) === false) {
    return err(r, 422, "INVALID_INPUT", "identityHash format");
  }
  if (regionCode && !isValidRegion(regionCode)) {
    return err(r, 422, "INVALID_INPUT", "regionCode");
  }
  if (!pool) {
    const existing = recipientsStore.find(
      x => x.identity_hash === identityHash.toLowerCase() && x.period_id === periodId
    );
    if (existing) {
      return err(r, 409, "DUPLICATE", "identity already registered");
    }
    const created = {
      id: recipientsStore.length + 1,
      ref_code: refCode,
      status: "REGISTERED",
      region_code: regionCode || "3201",
      program_id: programId,
      period_id: periodId,
      reg_tx_hash: regTxHash || null,
      identity_hash: identityHash.toLowerCase(),
      created_at: new Date().toISOString()
    };
    recipientsStore.unshift(created);
    logAudit(q.user.wallet, "REGISTER_RECIPIENT", "RECIPIENT_REF", refCode, regTxHash);
    return r.status(201).json(created);
  }
  transaction(async (client) => {
      const officerId = await ensureOfficer(client, q.user.wallet);
      const result = await client.query(
        `INSERT INTO recipient_refs
          (ref_code, identity_hash, program_id, period_id, officer_id, reg_tx_hash, status, region_code)
         VALUES ($1,$2,$3,$4,$5,$6,'REGISTERED',$7)
         ON CONFLICT (identity_hash, period_id) DO NOTHING
         RETURNING id, ref_code, status`,
        [refCode, identityHash.toLowerCase(), programId, periodId, officerId, regTxHash || null, regionCode ? String(regionCode) : null],
      );
      if (!result.rows[0]) {
        throw Object.assign(new Error("recipient already registered"), { code: "DUPLICATE" });
      }
      await client.query(
        `INSERT INTO audit_logs (officer_id, action, entity, entity_id, tx_hash)
         VALUES ($1,'REGISTER_RECIPIENT','RECIPIENT_REF',$2,$3)`,
        [officerId, refCode, regTxHash || null],
      );
      return result.rows[0];
    }).then((created) => r.status(201).json(created)).catch((e) => {
      if (e.code === "DUPLICATE") return err(r, 409, "DUPLICATE", "identity already registered");
      console.error("recipient insert failed:", e);
      err(r, 503, "DATABASE_UNAVAILABLE", e.message);
    });
});

// Daftar penerima dari PostgreSQL / In-Memory
app.get("/recipients", auth, async (q, r) => {
  if (!pool) {
    return r.json(recipientsStore);
  }
  try {
    const result = await query(
      `SELECT r.id, r.ref_code, r.identity_hash, r.region_code, r.program_id,
              p.code AS program, r.period_id, r.status, r.created_at,
              r.reg_tx_hash,
              a.score, a.label,
              d.tx_hash AS disbursement_tx_hash,
              d.amount AS disbursement_amount,
              d.status AS disbursement_status,
              d.created_at AS disbursement_created_at
       FROM recipient_refs r
       LEFT JOIN aid_programs p ON p.id=r.program_id
       LEFT JOIN LATERAL (
         SELECT score, label
         FROM eligibility_assessments ea
         WHERE ea.recipient_id=r.id
         ORDER BY ea.created_at DESC
         LIMIT 1
       ) a ON true
       LEFT JOIN LATERAL (
         SELECT tx_hash, amount, status, created_at
         FROM disbursement_refs
         WHERE recipient_id=r.id
         ORDER BY created_at DESC
         LIMIT 1
       ) d ON true
       ORDER BY r.created_at DESC
       LIMIT 500`,
    );
    r.json(result.rows);
  } catch (e) {
    err(r, 503, "DATABASE_UNAVAILABLE", e.message);
  }
});

// ── Cek penerima ganda berdasarkan identity hash ──
app.post("/recipients/check", auth, async (q, r) => {
  const { identityHash, periodId = 202611 } = q.body;
  if (!/^0x[0-9a-fA-F]{64}$/.test(String(identityHash || ""))) {
    return err(r, 422, "INVALID_INPUT", "identityHash format");
  }
  if (pool) {
    try {
      const result = await query(
        `SELECT ref_code, status, period_id, created_at
         FROM recipient_refs
         WHERE identity_hash = $1 AND period_id = $2
         LIMIT 1`,
        [identityHash.toLowerCase(), periodId],
      );
      if (result.rows[0]) return r.json({ duplicate: true, recipient: result.rows[0] });
      return r.json({ duplicate: false });
    } catch (e) {
      return err(r, 503, "DATABASE_UNAVAILABLE", e.message);
    }
  }
  const found = recipientsStore.find(
    (item) => item.identityHash.toLowerCase() === identityHash.toLowerCase()
      && item.periodId === periodId,
  );
  r.json(found ? { duplicate: true, recipient: found } : { duplicate: false });
});

// ── Doc 07: POST /disbursements ──
app.post("/disbursements", auth, (q, r) => {
  const { refCode, txHash, amount = 750000, programId = 1, periodId = 202611 } = q.body;
  if (!refCode) {
    return err(r, 422, "INVALID_INPUT", "refCode required");
  }
  if (txHash !== null && txHash !== undefined && !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return err(r, 422, "INVALID_INPUT", "txHash format");
  }
  if (pool) {
    transaction(async (client) => {
      const recipient = await client.query(
        "SELECT id FROM recipient_refs WHERE ref_code = $1",
        [refCode],
      );
      if (!recipient.rows[0]) throw Object.assign(new Error("recipient not found"), { code: "NOT_FOUND" });
      const result = await client.query(
        `INSERT INTO disbursement_refs
          (recipient_id, program_id, period_id, amount, tx_hash, status)
         VALUES ($1,$2,$3,$4,$5,'DISBURSED')
         ON CONFLICT (tx_hash) DO NOTHING
         RETURNING id, tx_hash, status`,
        [recipient.rows[0].id, programId, periodId, amount, txHash],
      );
      if (!result.rows[0]) throw Object.assign(new Error("transaction already recorded"), { code: "CONFLICT" });
      const officer = await ensureOfficer(client, q.user.wallet);
      await client.query(
        `INSERT INTO audit_logs (officer_id, action, entity, entity_id, tx_hash)
         VALUES ($1,'DISBURSE_AID','DISBURSEMENT_REF',$2,$3)`,
        [officer, refCode, txHash],
      );
      return result.rows[0];
    }).then((created) => r.status(201).json({ id: created.id, refCode, txHash: created.tx_hash, status: created.status })).catch((e) => {
      if (e.code === "NOT_FOUND") return err(r, 404, "NOT_FOUND", "recipient");
      if (e.code === "CONFLICT") return err(r, 409, "CONFLICT", "txHash");
      console.error("disbursement insert failed:", e);
      err(r, 503, "DATABASE_UNAVAILABLE", e.message);
    });
    return;
  }
  const id = disbursementsStore.length + 1;
  const newDisb = {
    id,
    refCode,
    txHash,
    amount,
    programId,
    periodId,
    officer: q.user.wallet,
    status: "DISBURSED",
    created_at: new Date().toISOString()
  };
  disbursementsStore.push(newDisb);
  logAudit(q.user.wallet, "DISBURSE_AID", "DISBURSEMENT_REF", refCode, txHash);
  r.status(201).json({ id, refCode, txHash, status: "DISBURSED" });
});

// ── Doc 07: GET /public/stats ──
app.get("/public/stats", (_q, r) => {
  if (pool) {
    Promise.all([
      query("SELECT COUNT(*) FROM recipient_refs"),
      query("SELECT COUNT(*) FROM disbursement_refs"),
      query("SELECT COALESCE(SUM(amount),0) AS total FROM disbursement_refs"),
    ]).then(([registered, disbursed, amount]) => r.json({
      totalRegistered: Number(registered.rows[0].count),
      totalDisbursed: Number(disbursed.rows[0].count),
      totalAmount: Number(amount.rows[0].total),
      notice: "Data PostgreSQL RantaiAsa",
    })).catch((e) => err(r, 503, "DATABASE_UNAVAILABLE", e.message));
    return;
  }
  const totalRegistered = recipientsStore.length || 142; // baseline data demo
  const totalDisbursed = disbursementsStore.length || 98;
  const totalAmount = disbursementsStore.reduce((sum, d) => sum + (d.amount || 0), 0) || (98 * 750000);
  r.json({
    totalRegistered,
    totalDisbursed,
    totalAmount,
    notice: "SIMULASI (Jawa Barat 27 Kab/Kota)"
  });
});

// ── Doc 07: GET /public/transactions ──
app.get("/public/transactions", (q, r) => {
  const { program, q: searchQuery } = q.query;
  if (pool) {
    query(
      `SELECT d.tx_hash, r.ref_code, r.identity_hash, r.region_code,
              d.program_id, d.period_id, d.amount, d.created_at,
              a.score
       FROM disbursement_refs d
       JOIN recipient_refs r ON r.id = d.recipient_id
       LEFT JOIN LATERAL (
         SELECT score FROM eligibility_assessments
         WHERE recipient_id=r.id ORDER BY created_at DESC LIMIT 1
       ) a ON true
       ORDER BY d.created_at DESC`,
    ).then((result) => {
      let items = result.rows.map(d => ({
        txHash: d.tx_hash,
        refId: d.ref_code,
        identityHash: d.identity_hash,
        kodeWilayah: d.region_code ? Number(d.region_code) : null,
        province: d.region_code,
        program: d.program_id === 2 ? "BPNT-2026-P1" : d.program_id === 3 ? "BERAS-2026-P1" : "PKH-2026-P1",
        period: `P1-${String(d.period_id).slice(0,4)}`,
        amount: Number(d.amount),
        aiScore: d.score ?? 0,
        status: "TERCATAT",
        explorerUrl: `https://amoy.polygonscan.com/tx/${d.tx_hash}`,
        timestamp: d.created_at,
      }));
      if (program) items = items.filter(t => t.program.toLowerCase().includes(program.toLowerCase()));
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        items = items.filter(t => t.txHash.toLowerCase().includes(s) || t.refId.toLowerCase().includes(s));
      }
      r.json(items);
    }).catch((e) => err(r, 503, "DATABASE_UNAVAILABLE", e.message));
    return;
  }
  let items = disbursementsStore.map(d => ({
    txHash: d.txHash,
    refId: d.refCode,
    program: d.programId === 2 ? "BPNT-2026-P1" : "PKH-2026-P1",
    period: "P1-2026",
    amount: d.amount,
    explorerUrl: `https://amoy.polygonscan.com/tx/${d.txHash}`,
    timestamp: d.created_at
  }));

  if (program) {
    items = items.filter(t => t.program.toLowerCase().includes(program.toLowerCase()));
  }
  if (searchQuery) {
    const s = searchQuery.toLowerCase();
    items = items.filter(t => t.txHash.toLowerCase().includes(s) || t.refId.toLowerCase().includes(s));
  }
  r.json(items);
});

// ── Doc 07: GET /public/programs ──
app.get("/public/programs", async (_q, r) => {
  try {
    const result = await query(
      `SELECT id, code, name, period_id, amount_unit, threshold, active
       FROM aid_programs WHERE active=true ORDER BY id`,
    );
    r.json(result.rows.map(row => ({
      ...row,
      amount_unit: Number(row.amount_unit),
    })));
  } catch (e) {
    err(r, 503, "DATABASE_UNAVAILABLE", e.message);
  }
});

const reportLimiter = rateLimit({ windowMs: 60000, limit: 5, message: { error: "RATE_LIMIT", detail: "Maks 5 laporan/menit per IP" } });

const CATEGORIES = ["DUGAAN_GANDA","TIDAK_LAYAK","TIDAK_TERIMA","TERLAMBAT","SALAH_DATA"];

// Sanitasi input dasar (strip HTML/script)
function sanitize(s) { return String(s || "").replace(/<[^>]*>/g, "").trim().slice(0, 2000); }

// Token sederhana untuk pelapor (bukan JWT, tidak perlu wallet)
function genReporterToken() { return crypto.randomBytes(20).toString("hex"); }

// WARGA/SUKARELAWAN: submit laporan
app.post("/reports", reportLimiter, (q, r) => {
  const { region_code, category, description, is_anonymous } = q.body;
  if (!isValidRegion(region_code)) return err(r, 422, "INVALID_INPUT", "region_code (3201–3279)");
  if (!CATEGORIES.includes(category)) return err(r, 422, "INVALID_INPUT", `category: ${CATEGORIES.join("|")}`);
  const desc = sanitize(description);
  if (desc.length < 10) return err(r, 422, "INVALID_INPUT", "deskripsi minimal 10 karakter");

  const reporterToken = genReporterToken();
  const tokenHash = crypto.createHash("sha256").update(reporterToken).digest("hex");
  if (pool) {
    query(
      `INSERT INTO reports
        (region_code, category, description, status, submitter_token_hash, is_anonymous)
       VALUES ($1,$2,$3,'PENDING',$4,$5)
       RETURNING id, status, created_at`,
      [String(region_code), category, desc, tokenHash, !!is_anonymous],
    ).then((result) => {
      const report = result.rows[0];
      r.status(201).json({
        id: report.id,
        status: report.status,
        created_at: report.created_at,
        reporter_token: reporterToken,
        notice: "Simpan token ini untuk cek status laporan Anda.",
      });
    }).catch((e) => err(r, 503, "DATABASE_UNAVAILABLE", e.message));
    return;
  }
  const id = _reportIdSeq++;
  const created_at = new Date().toISOString();

  reportsStore.push({
    id, region_code: String(region_code), category, description: desc,
    status: "PENDING", is_anonymous: !!is_anonymous,
    submitter_token_hash: tokenHash,
    officer_id: null, officer_note: null, chain_tx_hash: null,
    created_at, reviewed_at: null
  });

  // Kembalikan token hanya sekali (pelapor simpan sendiri untuk cek status)
  r.status(201).json({ id, status: "PENDING", created_at, reporter_token: reporterToken, notice: "Simpan token ini untuk cek status laporan Anda." });
});

// WARGA: cek status laporan dengan token
app.get("/reports/status/:id", (q, r) => {
  const id = parseInt(q.params.id);
  const token = q.headers["x-reporter-token"] || q.query.token;
  if (pool) {
    query(
      `SELECT id, status, category, region_code, is_anonymous,
              submitter_token_hash, created_at, reviewed_at, officer_note
       FROM reports WHERE id = $1`,
      [id],
    ).then((result) => {
      const report = result.rows[0];
      if (!report) return err(r, 404, "NOT_FOUND", "laporan tidak ditemukan");
      if (!report.is_anonymous && token) {
        const hash = crypto.createHash("sha256").update(String(token)).digest("hex");
        if (hash !== report.submitter_token_hash) return err(r, 403, "FORBIDDEN", "token tidak valid");
      }
      r.json({
        id: report.id,
        status: report.status,
        category: report.category,
        region_code: report.region_code,
        created_at: report.created_at,
        reviewed_at: report.reviewed_at,
        officer_note: report.status !== "PENDING" ? report.officer_note : undefined,
      });
    }).catch((e) => err(r, 503, "DATABASE_UNAVAILABLE", e.message));
    return;
  }
  const report = reportsStore.find(x => x.id === id);
  if (!report) return err(r, 404, "NOT_FOUND", "laporan tidak ditemukan");
  if (!report.is_anonymous && token) {
    const hash = crypto.createHash("sha256").update(String(token)).digest("hex");
    if (hash !== report.submitter_token_hash) return err(r, 403, "FORBIDDEN", "token tidak valid");
  }
  // Tampilkan minimal (tanpa deskripsi bila pending untuk privasi)
  r.json({ id: report.id, status: report.status, category: report.category, region_code: report.region_code, created_at: report.created_at, reviewed_at: report.reviewed_at, officer_note: report.status !== "PENDING" ? report.officer_note : undefined });
});

// PETUGAS_VERIFIKASI: daftar laporan pending
app.get("/reports", auth, (q, r) => {
  const { status = "PENDING", region_code } = q.query;
  if (pool) {
    const params = [];
    let sql = "SELECT id, region_code, category, description, photo_url, status, is_anonymous, officer_note, chain_tx_hash, created_at, reviewed_at FROM reports";
    if (status) {
      params.push(status);
      sql += ` WHERE status = $${params.length}`;
    }
    if (region_code) {
      params.push(region_code);
      sql += `${status ? " AND" : " WHERE"} region_code = $${params.length}`;
    }
    sql += " ORDER BY created_at DESC";
    query(sql, params).then((result) => r.json(result.rows)).catch((e) => err(r, 503, "DATABASE_UNAVAILABLE", e.message));
    return;
  }
  let data = reportsStore;
  if (status) data = data.filter(x => x.status === status);
  if (region_code) data = data.filter(x => x.region_code === String(region_code));
  // Jangan tampilkan submitter_token_hash
  r.json(data.map(({ submitter_token_hash: _, ...rest }) => rest));
});

// PETUGAS_VERIFIKASI: tinjau laporan
app.patch("/reports/:id/review", auth, async (q, r) => {
  const id = parseInt(q.params.id);
  const { status, officer_note } = q.body;
  if (!["VERIFIED","REJECTED","NEEDS_INFO"].includes(status)) return err(r, 422, "INVALID_INPUT", "status: VERIFIED|REJECTED|NEEDS_INFO");
  if (pool) {
    try {
      const current = await query("SELECT status, region_code, category FROM reports WHERE id = $1", [id]);
      const report = current.rows[0];
      if (!report) return err(r, 404, "NOT_FOUND", "laporan tidak ditemukan");
      if (!["PENDING","NEEDS_INFO"].includes(report.status)) return err(r, 409, "CONFLICT", "laporan sudah ditinjau");
      let chainTxHash = null;
      if ((status === "VERIFIED" || status === "REJECTED") && REPORT_REGISTRY_ADDRESS && PRIVATE_KEY_ORACLE && RPC_URL) {
        try {
          const reportHash = "0x" + crypto.createHash("sha256").update(String(id)).digest("hex");
          const wallet = new ethers.Wallet(PRIVATE_KEY_ORACLE, new ethers.JsonRpcProvider(RPC_URL));
          const contract = new ethers.Contract(REPORT_REGISTRY_ADDRESS, ABI_REPORT, wallet);
          const tx = await contract.recordVerification(reportHash, parseInt(report.region_code), report.category, status === "VERIFIED" ? 0 : 1);
          await tx.wait();
          chainTxHash = tx.hash;
        } catch (e) {
          console.error("chain record failed:", e.message);
        }
      }
      await transaction(async (client) => {
        const officerId = await ensureOfficer(client, q.user.wallet);
        await client.query(
          `UPDATE reports
           SET status=$1, officer_note=$2, officer_id=$3, chain_tx_hash=$4, reviewed_at=now()
           WHERE id=$5`,
          [status, sanitize(officer_note), officerId, chainTxHash, id],
        );
        await client.query(
          "INSERT INTO report_audit_logs (report_id, officer_id, action, note) VALUES ($1,$2,$3,$4)",
          [id, officerId, status, sanitize(officer_note)],
        );
      });
      return r.json({ id, status, reviewed_at: new Date().toISOString(), chain_tx_hash: chainTxHash });
    } catch (e) {
      return err(r, 503, "DATABASE_UNAVAILABLE", e.message);
    }
  }
  const report = reportsStore.find(x => x.id === id);
  if (!report) return err(r, 404, "NOT_FOUND", "laporan tidak ditemukan");
  if (report.status !== "PENDING" && report.status !== "NEEDS_INFO") return err(r, 409, "CONFLICT", "laporan sudah ditinjau");

  report.status = status;
  report.officer_note = sanitize(officer_note || "");
  report.reviewed_at = new Date().toISOString();

  let chain_tx_hash = null;
  // Catat on-chain jika VERIFIED atau REJECTED dan kontrak tersedia
  if ((status === "VERIFIED" || status === "REJECTED") && REPORT_REGISTRY_ADDRESS && PRIVATE_KEY_ORACLE && RPC_URL) {
    try {
      const reportHash = "0x" + crypto.createHash("sha256").update(String(id)).digest("hex");
      const wallet = new ethers.Wallet(PRIVATE_KEY_ORACLE, new ethers.JsonRpcProvider(RPC_URL));
      const c = new ethers.Contract(REPORT_REGISTRY_ADDRESS, ABI_REPORT, wallet);
      const statusCode = status === "VERIFIED" ? 0 : 1;
      const tx = await c.recordVerification(reportHash, parseInt(report.region_code), report.category, statusCode);
      await tx.wait();
      chain_tx_hash = tx.hash;
      report.chain_tx_hash = chain_tx_hash;
    } catch (e) {
      console.error("chain record failed:", e.message); // non-fatal
    }
  }

  r.json({ id, status, reviewed_at: report.reviewed_at, chain_tx_hash });
});

// PUBLIC: jumlah laporan VERIFIED per wilayah (untuk peta)
app.get("/public/reports-by-region", (_q, r) => {
  if (pool) {
    query(
      `SELECT region_code, COUNT(*)::int AS count
       FROM reports
       WHERE status='VERIFIED'
       GROUP BY region_code`,
    ).then((result) => {
      const counts = {};
      result.rows.forEach(row => { counts[row.region_code] = row.count; });
      r.json({ data: counts, notice: "Hanya laporan terverifikasi." });
    }).catch((e) => err(r, 503, "DATABASE_UNAVAILABLE", e.message));
    return;
  }
  const counts = {};
  reportsStore.filter(x => x.status === "VERIFIED").forEach(x => {
    counts[x.region_code] = (counts[x.region_code] || 0) + 1;
  });
  r.json({ data: counts, notice: "Hanya laporan terverifikasi. SIMULASI." });
});

async function start() {
  if (!pool) {
    console.log("ℹ️  DATABASE_URL tidak diset. Backend berjalan dalam mode In-Memory / Simulasi (tanpa PostgreSQL).");
  } else {
    try {
      const schema = fs.readFileSync(path.resolve(__dirname, "../schema.sql"), "utf8");
      await pool.query(schema);
      await pool.query("SELECT 1");
      const seedNip = process.env.DEMO_OFFICER_NIP;
      const seedPassword = process.env.DEMO_OFFICER_PASSWORD;
      if (seedNip && seedPassword) {
        await transaction(async (client) => {
          const identity = `nip:${seedNip}`;
          const user = await client.query(
            `INSERT INTO users (wallet_address, role)
             VALUES ($1,'OFFICER')
             ON CONFLICT (wallet_address) DO UPDATE SET wallet_address=EXCLUDED.wallet_address
             RETURNING id`,
            [identity],
          );
          const officer = await client.query(
            `INSERT INTO officers (user_id, display_name, nip, region_code, department, role_name, status, active)
             VALUES ($1,$2,$3,'3201','Dinas Sosial Provinsi Jawa Barat','Petugas Verifikator Wilayah','ACTIVE_VERIFIED',true)
             ON CONFLICT (user_id) DO UPDATE SET
               nip=EXCLUDED.nip,
               region_code=EXCLUDED.region_code,
               department=EXCLUDED.department,
               role_name=EXCLUDED.role_name,
               status=EXCLUDED.status
             RETURNING id`,
            [user.rows[0].id, "Petugas Verifikator Jawa Barat", seedNip],
          );
          await client.query(
            `INSERT INTO officer_credentials (nip, password_hash, officer_id, active)
             VALUES ($1,$2,$3,true)
             ON CONFLICT (nip) DO UPDATE SET password_hash=EXCLUDED.password_hash, officer_id=EXCLUDED.officer_id, active=true`,
            [seedNip, hashPassword(seedPassword), officer.rows[0].id],
          );
        });
      }
      console.log("✅ PostgreSQL connected & initialized successfully");
    } catch (e) {
      console.warn("⚠️ PostgreSQL initialization failed:", e.message);
      console.warn("⚠️ Beralih otomatis ke mode In-Memory / Simulasi.");
    }
  }

  app.listen(PORT, () => console.log("backend :" + PORT));
}

start();
