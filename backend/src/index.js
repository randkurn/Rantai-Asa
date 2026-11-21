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

const nonces = new Map(); // TODO: pindah ke DB/Redis

const ABI_DISBURSE  = ["function attestScore(bytes32,uint32,uint16)"];
const ABI_REPORT    = ["function recordVerification(bytes32,uint32,string,uint8) returns (bool)"];

const err = (res, s, code, detail) => res.status(s).json({ error: code, detail });
const auth = (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), JWT_SECRET);
    next();
  } catch { err(res, 401, "AUTH_REQUIRED", "token tidak valid"); }
};

// ── Validasi kode wilayah Jabar 3201–3279 ──
const VALID_REGION = /^32(0[1-9]|1[0-8]|7[1-9])$/;
const isValidRegion = (code) => VALID_REGION.test(String(code));

// ── Health ──
app.get("/health", (_q, r) => r.json({ status: "ok" }));

// ── Auth ──
app.post("/auth/nonce", (q, r) => {
  const w = String(q.body.wallet || "").toLowerCase();
  if (!ethers.isAddress(w)) return err(r, 422, "INVALID_INPUT", "wallet");
  const n = crypto.randomBytes(16).toString("hex");
  nonces.set(w, n);
  r.json({ nonce: n });
});

app.post("/auth/verify", (q, r) => {
  const w = String(q.body.wallet || "").toLowerCase();
  const n = nonces.get(w);
  if (!n) return err(r, 401, "AUTH_REQUIRED", "nonce");
  try {
    const rec = ethers.verifyMessage(`RantaiAsa login: ${n}`, q.body.signature);
    if (rec.toLowerCase() !== w) throw 0;
    nonces.delete(w);
    r.json({ token: jwt.sign({ wallet: w, role: "OFFICER" }, JWT_SECRET, { expiresIn: "30m" }) });
  } catch { err(r, 401, "AUTH_REQUIRED", "signature"); }
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
  const { identityHash, periodId, features } = q.body;
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
  try {
    const w = new ethers.Wallet(PRIVATE_KEY_ORACLE, new ethers.JsonRpcProvider(RPC_URL));
    const c = new ethers.Contract(DISBURSE_ADDRESS, ABI_DISBURSE, w);
    const tx = await c.attestScore(identityHash, periodId, ai.score);
    await tx.wait();
    r.json({ ...ai, attestTxHash: tx.hash });
  } catch (e) { err(r, 503, "CHAIN_UNAVAILABLE", String(e.shortMessage || e.message)); }
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
  const { refCode, identityHash, regTxHash, programId = 1, periodId = 202611 } = q.body;
  if (!refCode || !identityHash) {
    return err(r, 422, "INVALID_INPUT", "refCode and identityHash required");
  }
  const id = recipientsStore.length + 1;
  const newRec = {
    id,
    refCode,
    identityHash,
    regTxHash: regTxHash || null,
    programId,
    periodId,
    officer: q.user.wallet,
    status: "REGISTERED",
    created_at: new Date().toISOString()
  };
  recipientsStore.push(newRec);
  logAudit(q.user.wallet, "REGISTER_RECIPIENT", "RECIPIENT_REF", refCode, regTxHash);
  r.status(201).json({ id, refCode, status: "REGISTERED" });
});

// ── Doc 07: POST /disbursements ──
app.post("/disbursements", auth, (q, r) => {
  const { refCode, txHash, amount = 750000, programId = 1, periodId = 202611 } = q.body;
  if (!refCode || !txHash) {
    return err(r, 422, "INVALID_INPUT", "refCode and txHash required");
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
app.get("/public/programs", (_q, r) => {
  r.json(AID_PROGRAMS);
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
  const counts = {};
  reportsStore.filter(x => x.status === "VERIFIED").forEach(x => {
    counts[x.region_code] = (counts[x.region_code] || 0) + 1;
  });
  r.json({ data: counts, notice: "Hanya laporan terverifikasi. SIMULASI." });
});

app.listen(PORT, () => console.log("backend :" + PORT));
