import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { useWallet } from "./useWallet.js";
import { useRegionStats, useReportsByRegion, useP2Trend } from "./hooks/useStats.js";
import { REGION_NAMES } from "./geoConfig.js";
import ReportModule from "./components/ReportModule.jsx";
import "leaflet/dist/leaflet.css";

const JabarMap = lazy(() => import("./components/JabarMap.jsx"));

// Kontrak Deployed di Polygon Amoy Testnet (Chain ID: 80002)
const CONTRACTS = {
  IdentityRegistry: "0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84",
  AidDisbursement: "0xDd9E6cffA4DEB9493D6406A839480673Af13859D",
  ReportRegistry: "0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d",
  ChainId: 80002
};

// Data Awal Transaksi Audit On-Chain (SIMULASI Bantuan Jawa Barat)
const INITIAL_AUDIT_RECORDS = [
  {
    timestamp: "2026-11-20 14:42:10 WIB",
    block: 14892218,
    refId: "RCP-3201-01",
    identityHash: "0x9f2c8b14a7d3e601c584f920b17e4a3d8c6190f2e4b71a83c5d09e12f4a86c31",
    program: "PKH-2026-P1",
    period: "P1-2026",
    kodeWilayah: 3201,
    province: "Kab. Bogor",
    aiScore: 84,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Pita Pengeluaran (Band 1)", impact: "+" },
      { name: "Kualitas Fisik Hunian Rendah", impact: "+" },
      { name: "Jumlah Anggota Keluarga (6 Jiwa)", impact: "+" }
    ],
    amount: 750000,
    txHash: "0x3b8f19c2a4d7e60581b9c3f4a2e8d1097c4b5a6f8e2d1c3b4a59687766554433",
    officer: "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
  },
  {
    timestamp: "2026-11-20 14:28:04 WIB",
    block: 14892095,
    refId: "RCP-3203-02",
    identityHash: "0x4e1a7c93d2b8f504a619e832c70d5b2f9a4183e6c0b29d74f1a85c30e6b92d47",
    program: "BPNT-2026-P1",
    period: "P1-2026",
    kodeWilayah: 3203,
    province: "Kab. Cianjur",
    aiScore: 78,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Keparahan Wilayah P2 (0.41)", impact: "+" },
      { name: "Anggota Rentan (Disabilitas/Lansia)", impact: "+" },
      { name: "Pita Pengeluaran (Band 1)", impact: "+" }
    ],
    amount: 600000,
    txHash: "0x7a1c44e9b2d8f30692c1a5e7b3d9f0184e6c7b8a9d0e1f2a3b4c5d6e7f8091a2",
    officer: "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
  },
  {
    timestamp: "2026-11-20 14:11:39 WIB",
    block: 14891912,
    refId: "RCP-3205-03",
    identityHash: "0x1d8b5f20c9a4e736b108d492f63a8c1e5b7092d4a8f16c35e9b07d24a6c81f53",
    program: "PKH-2026-P1",
    period: "P1-2026",
    kodeWilayah: 3205,
    province: "Kab. Garut",
    aiScore: 81,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Keparahan Wilayah P2 (0.39)", impact: "+" },
      { name: "Pita Pengeluaran (Band 1)", impact: "+" },
      { name: "Jumlah Anggota Keluarga (5 Jiwa)", impact: "+" }
    ],
    amount: 750000,
    txHash: "0x9e5d21a8c4f7b03912d6e8a4c0f2b5793a1d4c6e8b0a2f4d6c8e0a1b3d5f7981",
    officer: "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
  },
  {
    timestamp: "2026-11-20 13:54:22 WIB",
    block: 14891744,
    refId: "RCP-3209-04",
    identityHash: "0x6c3f9a12e8b4d705c291a843f50e6b1d9c7284a0e3b51f96d2c84a07e5b93c68",
    program: "PKH-2026-P1",
    period: "P1-2026",
    kodeWilayah: 3209,
    province: "Kab. Cirebon",
    aiScore: 88,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Pita Pengeluaran (Band 1)", impact: "+" },
      { name: "Keparahan Wilayah P2 (0.35)", impact: "+" },
      { name: "Kualitas Fisik Hunian Rendah", impact: "+" }
    ],
    amount: 750000,
    txHash: "0x2f4b88d1e6a9c30754b2d8f0a6c4e9128b7d5f3a1c9e7b5d3f1a8c6e4b2d0975",
    officer: "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
  },
  {
    timestamp: "2026-11-20 13:42:08 WIB",
    block: 14891620,
    refId: "DUP-3201-09",
    identityHash: "0x9f2c8b14a7d3e601c584f920b17e4a3d8c6190f2e4b71a83c5d09e12f4a86c31",
    program: "BPNT-2026-P1",
    period: "P1-2026",
    kodeWilayah: 3201,
    province: "Kab. Bogor",
    aiScore: 0,
    aiLabel: "REJECTED",
    status: "DITOLAK_DUPLIKAT",
    factors: [
      { name: "Smart Contract: IdentityAlreadyRegistered()", impact: "-" }
    ],
    amount: 0,
    txHash: "0x11223344556677889900aabbccddeeff00112233445566778899aabbccddeeff",
    officer: "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
  },
  {
    timestamp: "2026-11-20 13:30:15 WIB",
    block: 14891510,
    refId: "RCP-3212-05",
    identityHash: "0x8b4e2d71f0a9c638e512b904d73f1a8c6e9025b7d4a83c19f6e02b58d7a94c12",
    program: "BPNT-2026-P1",
    period: "P1-2026",
    kodeWilayah: 3212,
    province: "Kab. Indramayu",
    aiScore: 69,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Pita Pengeluaran (Band 2)", impact: "+" },
      { name: "Pendidikan Kepala RT (SD)", impact: "+" },
      { name: "Anggota Rentan (Ada)", impact: "+" }
    ],
    amount: 600000,
    txHash: "0x5c7a93f0d2e8b41683a9c5e1f7b3d9042c6e8a0b2d4f6a8c0e2b4d6f8a0c2e46",
    officer: "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
  }
];

function formatIDR(val) {
  if (val >= 1e9) return "Rp " + (val / 1e9).toFixed(2).replace(".", ",") + " M";
  if (val >= 1e6) return "Rp " + (val / 1e6).toFixed(1).replace(".", ",") + " jt";
  return "Rp " + Number(val || 0).toLocaleString("id-ID");
}

function shortHex(hex) {
  return hex && hex.length > 14 ? `${hex.slice(0, 6)}...${hex.slice(-4)}` : hex;
}

export default function App() {
  const wallet = useWallet();
  const { data: regionStats, loading: statsLoading } = useRegionStats();
  const { data: reportCounts } = useReportsByRegion();

  const [activeTab, setActiveTab] = useState("home"); // home | reports
  const [mapMetric, setMapMetric] = useState("p2"); // p2 | p1 | trend | poor
  const [selectedRegionCode, setSelectedRegionCode] = useState("3201"); // Default: Kab. Bogor
  const [auditRecords, setAuditRecords] = useState(INITIAL_AUDIT_RECORDS);
  const [ledgerFilter, setLedgerFilter] = useState("all"); // all | ok | no
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Toasts
  const [selectedTxForModal, setSelectedTxForModal] = useState(null);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Wizard Petugas State (Step 1-3)
  const [wizardStep, setWizardStep] = useState(1);
  const [simNik, setSimNik] = useState("3201012304920005");
  const [simProgram, setSimProgram] = useState("PKH-2026-P1");
  const [simTargetRegion, setSimTargetRegion] = useState("3201");
  const [duplicateAlert, setDuplicateAlert] = useState(false);
  const [generatedHash, setGeneratedHash] = useState("0x7d91c4e28b30a6f194c82d7e51a039b4f6c28e10d5a73b94c1f08e26a4d91b3c");

  // Multidimensional AI Inputs (Model v2.0)
  const [aiIncomeBand, setAiIncomeBand] = useState(1);
  const [aiHousehold, setAiHousehold] = useState(5);
  const [aiEduLevel, setAiEduLevel] = useState(1);
  const [aiHousing, setAiHousing] = useState(1);
  const [aiVulnerable, setAiVulnerable] = useState(true);
  const [aiCivilServant, setAiCivilServant] = useState(false);
  const [aiLandOwner, setAiLandOwner] = useState(false);
  const [aiHasBpjs, setAiHasBpjs] = useState(false);
  const [aiUnemployed, setAiUnemployed] = useState(true);
  const [aiLiveScore, setAiLiveScore] = useState(99);
  const [aiLabel, setAiLabel] = useState("ELIGIBLE");
  const [aiModelVersion, setAiModelVersion] = useState("lr-jabar-multidim-2.0");
  const [aiFactors, setAiFactors] = useState([]);

  // Dynamic Typing Tagline in Hero
  const [typedText, setTypedText] = useState("");
  const fullText = "Wujudkan bantuan sosial yang transparan dan bebas duplikasi";

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, idx));
      idx++;
      if (idx > fullText.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // Compute Enriched Region Stats with Reports
  const enrichedRegions = useMemo(() => {
    return regionStats.map(s => ({
      ...s,
      laporan_verified: reportCounts[String(s.kode)] || 0
    }));
  }, [regionStats, reportCounts]);

  // Selected Region Object
  const activeRegion = useMemo(() => {
    const found = enrichedRegions.find(r => String(r.kode) === String(selectedRegionCode));
    if (found) return found;
    return {
      kode: 3201,
      nama: "Kabupaten Bogor",
      p2_terkini: 0.23,
      p1_terkini: 0.97,
      tren: -0.22,
      garis_kemiskinan_k: 531.412,
      penduduk_miskin_k: 401.86,
      tahun_data: 2025,
      registrasi: 124,
      penyaluran: 118,
      laporan_verified: 0
    };
  }, [enrichedRegions, selectedRegionCode]);

  // Riwayat Tren P2 BPS 2004–2025
  const { trend: p2TrendHistory, loading: trendLoading } = useP2Trend(activeRegion.kode);

  // KPIs
  const totalRegistered = useMemo(() => 1248 + auditRecords.filter(r => r.status === "TERCATAT").length, [auditRecords]);
  const totalDisbursed = useMemo(() => 1192 + auditRecords.filter(r => r.status === "TERCATAT").length, [auditRecords]);
  const totalRejected = useMemo(() => 21 + auditRecords.filter(r => r.status !== "TERCATAT").length, [auditRecords]);
  const totalSimulatedAid = useMemo(() => auditRecords.filter(r => r.status === "TERCATAT").reduce((sum, r) => sum + (r.amount || 0), 894000000 - 4050000), [auditRecords]);

  // Toast Function
  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3200);
  };

  const copyText = (text, label = "Teks disalin ke clipboard") => {
    navigator.clipboard.writeText(text);
    showToast(label);
  };

  // Live scoring API call ke model v2.0
  useEffect(() => {
    let isMounted = true;
    const payload = {
      features: {
        kode_kabupaten_kota: parseInt(simTargetRegion) || 3201,
        household_size: aiHousehold,
        income_per_capita_band: aiIncomeBand,
        head_education_level: aiEduLevel,
        housing_quality: aiHousing,
        has_disabled_or_elderly: aiVulnerable ? 1 : 0,
        is_civil_servant_or_security: aiCivilServant ? 1 : 0,
        land_ownership: aiLandOwner ? 1 : 0,
        has_bpjs: aiHasBpjs ? 1 : 0,
        head_unemployed: aiUnemployed ? 1 : 0
      }
    };

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
    fetch(`${API_URL}/public/score-simulasi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(res => {
        if (!isMounted) return;
        setAiLiveScore(res.score);
        setAiLabel(res.label);
        if (res.top_factors) setAiFactors(res.top_factors);
        if (res.model_version) setAiModelVersion(res.model_version);
      })
      .catch(() => {
        if (!isMounted) return;
        let score = 52 + (5 - aiIncomeBand) * 8 + (aiHousehold - 3) * 3 + (4 - aiHousing) * 7 - aiEduLevel * 3;
        if (aiVulnerable) score += 12;
        if (aiUnemployed) score += 8;
        if (!aiLandOwner) score += 6;
        if (aiCivilServant) score -= 50;
        score = Math.max(5, Math.min(99, Math.round(score)));
        setAiLiveScore(score);
        setAiLabel(score >= 60 ? "ELIGIBLE" : score >= 45 ? "REVIEW" : "NOT_ELIGIBLE");
      });

    return () => { isMounted = false; };
  }, [simTargetRegion, aiIncomeBand, aiHousehold, aiEduLevel, aiHousing, aiVulnerable, aiCivilServant, aiLandOwner, aiHasBpjs, aiUnemployed]);

  // Simulasi Penyaluran Cepat dari Section Ledger
  const handleSimulateDisburse = () => {
    const regCodes = Object.keys(REGION_NAMES);
    const randCode = regCodes[Math.floor(Math.random() * regCodes.length)];
    const randHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newTxHash = "0x" + randHex;
    const now = new Date();
    const tsStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
    const prog = Math.random() > 0.4 ? "PKH-2026-P1" : "BPNT-2026-P1";
    const amt = prog.startsWith("PKH") ? 750000 : 600000;
    const score = 65 + Math.floor(Math.random() * 32);

    const newRecord = {
      timestamp: tsStr,
      block: 14892260 + auditRecords.length,
      refId: `SIM-${randCode}-0${auditRecords.length + 1}`,
      identityHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      program: prog,
      period: "P1-2026",
      kodeWilayah: parseInt(randCode),
      province: REGION_NAMES[parseInt(randCode)] || `Kab/Kota ${randCode}`,
      aiScore: score,
      aiLabel: "ELIGIBLE",
      status: "TERCATAT",
      factors: [
        { name: "Pita Pengeluaran (Band 1)", impact: "+" },
        { name: "Kondisi Hunian Tidak Layak", impact: "+" },
        { name: "Anggota Rentan (Ada)", impact: "+" }
      ],
      amount: amt,
      txHash: newTxHash,
      officer: wallet.address || "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
    };

    setAuditRecords([newRecord, ...auditRecords]);
    showToast(`Penyaluran ${prog} sebesar ${formatIDR(amt)} berhasil dicatat on-chain!`);
  };

  // Simulasi Penolakan Duplikat Cepat dari Section Ledger
  const handleSimulateDuplicate = () => {
    const existing = auditRecords[0] || INITIAL_AUDIT_RECORDS[0];
    const randHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newTxHash = "0x" + randHex;
    const now = new Date();
    const tsStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    const dupRecord = {
      timestamp: tsStr,
      block: 14892265 + auditRecords.length,
      refId: `DUP-${existing.kodeWilayah}-99`,
      identityHash: existing.identityHash,
      program: existing.program === "PKH-2026-P1" ? "BPNT-2026-P1" : "PKH-2026-P1",
      period: "P1-2026",
      kodeWilayah: existing.kodeWilayah,
      province: existing.province,
      aiScore: 0,
      aiLabel: "REJECTED",
      status: "DITOLAK_DUPLIKAT",
      factors: [
        { name: "IdentityRegistry: IdentityAlreadyRegistered()", impact: "-" }
      ],
      amount: 0,
      txHash: newTxHash,
      officer: wallet.address || "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
    };

    setAuditRecords([dupRecord, ...auditRecords]);
    showToast("Smart contract revert: Duplikasi identitas pada periode yang sama ditolak!", true);
  };

  // Submit Penyaluran dari Wizard Petugas
  const handleFinalDisburseFromWizard = () => {
    const newRef = `RCP-${simTargetRegion}-0${auditRecords.length + 1}`;
    const randHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newTxHash = "0x" + randHex;
    const now = new Date();
    const tsStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
    const amt = simProgram.startsWith("PKH") ? 750000 : 600000;

    const newRecord = {
      timestamp: tsStr,
      block: 14892250 + auditRecords.length,
      refId: newRef,
      identityHash: generatedHash,
      program: simProgram,
      period: "P1-2026",
      kodeWilayah: parseInt(simTargetRegion),
      province: REGION_NAMES[parseInt(simTargetRegion)] || `Kab/Kota ${simTargetRegion}`,
      aiScore: aiLiveScore,
      aiLabel: aiLabel,
      status: "TERCATAT",
      factors: aiFactors.length > 0 ? aiFactors : [
        { name: `Pita Pengeluaran (Band ${aiIncomeBand})`, impact: "+" },
        { name: `Jumlah Anggota (${aiHousehold} Jiwa)`, impact: "+" },
        { name: aiVulnerable ? "Anggota Rentan (Ada)" : "Kualitas Hunian Rendah", impact: "+" }
      ],
      amount: amt,
      txHash: newTxHash,
      officer: wallet.address || "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"
    };

    setAuditRecords([newRecord, ...auditRecords]);
    setIsOfficerModalOpen(false);
    setWizardStep(1);
    showToast(`Penyaluran ${newRef} berhasil dicatat on-chain Polygon Amoy!`);
  };

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return auditRecords.filter(r => {
      const matchFilter = ledgerFilter === "all" || (ledgerFilter === "ok" ? r.status === "TERCATAT" : r.status !== "TERCATAT");
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || r.txHash.toLowerCase().includes(q) || r.refId.toLowerCase().includes(q) || r.identityHash.toLowerCase().includes(q) || r.province.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [auditRecords, ledgerFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050f18] text-white selection:bg-[#479ece]/30 selection:text-white font-sans">

      {/* 1. TOP DISCLOSURE BANNER */}
      <div className="bg-[#030910] text-[#9fb8c9] border-b border-[rgba(71,158,206,0.14)] px-3 py-1.5 sticky top-0 z-50 text-[11px] font-mono">
        <div className="max-w-[1120px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>DATA DEMO = SIMULASI (JAWA BARAT 27 KAB/KOTA)</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#5fd7a0] hidden sm:inline">Polygon Amoy Testnet (Chain ID: 80002)</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span>Zero Raw NIK Stored On-Chain (HMAC-SHA256)</span>
          </div>
        </div>
      </div>

      {/* 2. STICKY NAV BAR */}
      <header className="sticky top-[29px] z-40 bg-[rgba(5,15,24,0.85)] backdrop-blur-md border-b border-[rgba(71,158,206,0.18)]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo & Brand Wordmark */}
          <a href="#top" className="flex items-center gap-3 group text-left cursor-pointer shrink-0">
            <img
              src="/logo-rantaiasa.png"
              alt="RantaiAsa"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_4px_14px_rgba(71,158,206,0.45)] group-hover:scale-105 transition duration-200"
            />
            <div className="hidden sm:flex flex-col border-l border-white/15 pl-2.5">
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[rgba(71,158,206,0.14)] text-[#bfe6f8] border border-[rgba(71,158,206,0.28)] font-semibold w-fit">
                JABAR
              </span>
              <small className="text-[10px] text-[#9fb8c9] leading-tight mt-0.5">Audit bansos publik</small>
            </div>
          </a>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#9fb8c9]">
            <a href="#tentang" className="hover:text-white transition">Tentang</a>
            <a href="#alur" className="hover:text-white transition">Alur</a>
            <a href="#wilayah" className="hover:text-white transition">Wilayah</a>
            <a href="#ledger" className="hover:text-white transition">Ledger</a>
            <button
              onClick={() => setActiveTab(t => t === "reports" ? "home" : "reports")}
              className={`transition cursor-pointer ${activeTab === "reports" ? "text-[#479ece] font-bold" : "hover:text-white"}`}
            >
              Laporan Warga
            </button>
          </nav>

          {/* Action Button: Cek Penyaluran / Portal Petugas */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (!wallet.address) wallet.connect();
                setIsOfficerModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#479ece] to-[#2c7fb0] hover:brightness-110 shadow-[0_8px_24px_rgba(71,158,206,0.3)] transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span>{wallet.address ? shortHex(wallet.address) : "Portal Petugas"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section id="top" className="relative text-center pt-8 pb-16 px-4 bg-[radial-gradient(ellipse_70%_90%_at_50%_0%,rgba(71,158,206,0.45),transparent_70%),linear-gradient(180deg,#0b2a40,#050f18)]">
        <div className="max-w-[1080px] mx-auto">

          {/* Hero Badges & Typography */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(71,158,206,0.14)] border border-[rgba(71,158,206,0.28)] text-xs text-[#d6ecf8] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5fd7a0]"></span>
            <span>Lapisan verifikasi blockchain &amp; AI untuk bansos Jawa Barat</span>
          </div>

          <h1 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-wider text-white my-3 leading-none drop-shadow-[0_8px_30px_rgba(71,158,206,0.4)]">
            RantaiAsa
          </h1>

          <div className="text-xs sm:text-sm tracking-[0.2em] font-semibold text-[#9fb8c9] uppercase mb-4">
            SISTEM AUDIT ANTI-FRAUD PENYALURAN BANTUAN SOSIAL
          </div>


          {/* LEAFLET JABAR CHOROPLETH MAP BOX (Persis Template) */}
          <div className="relative w-full max-w-[920px] mx-auto mb-8 rounded-[22px] overflow-hidden border border-[rgba(71,158,206,0.28)] shadow-[0_24px_70px_rgba(71,158,206,0.28)] text-left bg-[#07131d]">

            {/* Map Container */}
            <Suspense fallback={<div className="h-[380px] flex items-center justify-center text-[#9fb8c9] text-xs">Memuat peta interaktif Jawa Barat...</div>}>
              <JabarMap
                regionStats={enrichedRegions}
                selectedRegion={selectedRegionCode}
                onSelectRegion={(reg) => setSelectedRegionCode(reg.kode)}
                metric={mapMetric}
              />
            </Suspense>

            {/* Overlay Info (Kiri Atas) */}
            <div className="absolute left-3 top-3 z-[500] bg-[rgba(5,15,24,0.85)] backdrop-blur-md border border-[rgba(71,158,206,0.28)] rounded-xl p-3 text-xs shadow-lg pointer-events-none min-w-[170px]">
              <small className="text-[#9fb8c9] block font-mono text-[10px]">
                {mapMetric === "p2" && "Indeks Keparahan (P2 BPS)"}
                {mapMetric === "p1" && "Indeks Kedalaman (P1 BPS)"}
                {mapMetric === "trend" && "Tren Perubahan (3 Thn)"}
                {mapMetric === "poor" && "Jumlah Penduduk Miskin"}
              </small>
              <span className="block font-semibold text-white text-sm mt-0.5 truncate max-w-[180px]">
                {activeRegion.nama}
              </span>
              <b className="font-heading font-extrabold text-xl text-[#479ece] block mt-0.5">
                {mapMetric === "p2" && (activeRegion.p2_terkini?.toFixed(3) ?? "0.230")}
                {mapMetric === "p1" && (activeRegion.p1_terkini?.toFixed(3) ?? "0.970")}
                {mapMetric === "trend" && (activeRegion.tren !== undefined ? (activeRegion.tren > 0 ? `+${activeRegion.tren.toFixed(3)}` : activeRegion.tren.toFixed(3)) : "-0.220")}
                {mapMetric === "poor" && `${Number(activeRegion.penduduk_miskin_k || 401.8).toLocaleString("id-ID")} rb jiwa`}
              </b>
            </div>

            {/* Overlay Metric Toggle (Kanan Atas) */}
            <div className="absolute right-3 top-3 z-[500] flex gap-1.5 bg-[rgba(5,15,24,0.85)] backdrop-blur-md border border-[rgba(71,158,206,0.28)] rounded-xl p-1.5 shadow-lg">
              {[
                ["p2", "P2"],
                ["p1", "P1"],
                ["trend", "Tren"],
                ["poor", "Miskin"]
              ].map(([mKey, mLabel]) => (
                <button
                  key={mKey}
                  onClick={() => setMapMetric(mKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${mapMetric === mKey
                    ? "bg-[#479ece] text-[#04121c] font-bold shadow-xs"
                    : "text-[#9fb8c9] hover:text-white hover:bg-white/5"
                    }`}
                >
                  {mLabel}
                </button>
              ))}
            </div>

            {/* Overlay Gradient Legend (Kiri Bawah) */}
            <div className="hidden sm:block absolute left-3 bottom-3 z-[500] bg-[rgba(5,15,24,0.85)] backdrop-blur-md border border-[rgba(71,158,206,0.28)] rounded-xl px-3 py-2 text-xs shadow-lg pointer-events-none">
              <small className="text-[#9fb8c9] block text-[10.5px]">Tingkat Keparahan / Beban Wilayah</small>
              <div className="w-[150px] h-2 rounded-full my-1.5 bg-gradient-to-r from-[#0b3a5a] via-[#479ece] via-[#bfe6f8] to-[#ffffff]" />
              <div className="flex justify-between text-[#9fb8c9] text-[10px] font-mono">
                <span>Rendah</span>
                <span>Tinggi</span>
              </div>
            </div>
          </div>


          <div className="font-heading font-semibold text-lg sm:text-xl text-white min-h-[30px] flex items-center justify-center gap-1 type-cursor">
            {typedText}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <a
              href="#ledger"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#479ece] to-[#2c7fb0] hover:brightness-110 shadow-[0_8px_24px_rgba(71,158,206,0.3)] transition cursor-pointer"
            >
              Lihat ledger publik
            </a>
            <a
              href="#alur"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-white/[0.06] border border-white/[0.22] hover:bg-white/[0.12] transition cursor-pointer"
            >
              Cara kerja
            </a>
            <button
              onClick={() => setIsOfficerModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-[#bfe6f8] bg-[rgba(71,158,206,0.15)] border border-[rgba(71,158,206,0.35)] hover:bg-[rgba(71,158,206,0.25)] transition cursor-pointer"
            >
              Uji Skoring AI
            </button>
          </div>
        </div>
      </section>

      {/* VIEW CONDITIONAL: LAPORAN WARGA MODAL/SECTION */}
      {activeTab === "reports" && (
        <section id="laporan" className="py-12 px-4 bg-[#0a1b2a] border-b border-[rgba(71,158,206,0.18)]">
          <div className="max-w-[800px] mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-xs font-mono font-bold text-[#479ece] uppercase">Kanal Pengaduan Masyarakat</span>
                <h2 className="text-xl font-bold font-heading text-white">Modul Pelaporan Warga &amp; Relawan Jabar</h2>
              </div>
              <button
                onClick={() => setActiveTab("home")}
                className="px-3 py-1.5 rounded-lg border border-white/20 text-xs text-[#9fb8c9] hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
            <ReportModule />
          </div>
        </section>
      )}

      {/* 4. SECTION TENTANG (Persis Template) */}
      <section id="tentang" className="py-20 px-4">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[680px] mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(71,158,206,0.14)] border border-[rgba(71,158,206,0.28)] text-xs text-[#d6ecf8]">
              Tentang RantaiAsa
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-3.5 mb-2.5 leading-tight">
              Bukti publik bahwa bantuan <em className="text-[#479ece] not-italic">sampai sekali</em> ke orang yang tepat
            </h2>
            <p className="text-[#9fb8c9] text-sm leading-relaxed">
              Setiap penyaluran tercatat di blockchain Polygon Amoy. Siapa pun bisa memeriksanya tanpa izin dan tanpa login.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Kiri: Narasi & Checklist */}
            <div className="lg:col-span-5 space-y-4 text-sm text-[#9fb8c9] leading-relaxed">
              <h3 className="font-heading font-bold text-xl text-white">Mengapa perlu lapisan audit independen?</h3>
              <p>
                Pada 2021 Kemensos menonaktifkan 21.000.156 data ganda DTKS. Data terpusat rentan diubah oleh pemegang hak tulis. RantaiAsa mengamankan hash NIK secara terdesentralisasi, bukan NIK mentah, sehingga duplikasi langsung ditolak oleh kontrak pintar secara matematis.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs text-white">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border border-[#479ece] text-[#479ece] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                  <span>Duplikasi ditolak otomatis oleh IdentityRegistry.sol</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border border-[#479ece] text-[#479ece] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                  <span>Skor kelayakan AI multidimensi BPS Jawa Barat ({aiModelVersion})</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border border-[#479ece] text-[#479ece] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                  <span>Setiap transaksi bisa dicek di block explorer secara independen</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border border-[#479ece] text-[#479ece] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                  <span>Zero raw NIK di blockchain (HMAC-SHA256 volatile memory)</span>
                </li>
              </ul>
            </div>

            {/* Kanan: 4 Kartu Fitur */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] shadow-lg hover:border-[#479ece]/50 transition">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#479ece] to-[#2c7fb0] flex items-center justify-center text-white mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-base text-white">Anti-duplikasi</h3>
                <p className="text-xs text-[#9fb8c9] mt-1">Hash NIK yang sama ditolak oleh smart contract bila terdaftar pada periode berjalan.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] shadow-lg hover:border-[#479ece]/50 transition">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#479ece] to-[#2c7fb0] flex items-center justify-center text-white mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-base text-white">Transparan</h3>
                <p className="text-xs text-[#9fb8c9] mt-1">Ledger terbuka untuk warga, LSM, jurnalis investigasi, dan Ombudsman RI tanpa izin khusus.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] shadow-lg hover:border-[#479ece]/50 transition">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#479ece] to-[#2c7fb0] flex items-center justify-center text-white mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V9M10 19V5M16 19v-8M22 19H2" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-base text-white">Skor AI Multidimensi</h3>
                <p className="text-xs text-[#9fb8c9] mt-1">14 Indikator kemiskinan multidimensi BPS Jabar menentukan kelayakan (Ambang batas ≥ 60).</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] shadow-lg hover:border-[#479ece]/50 transition">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#479ece] to-[#2c7fb0] flex items-center justify-center text-white mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-base text-white">Tak Bisa Diubah</h3>
                <p className="text-xs text-[#9fb8c9] mt-1">Koreksi hanya dapat dilakukan lewat transaksi baru on-chain yang ikut terekam abadi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION ALUR VERIFIKASI & KPI (Persis Template) */}
      <section id="alur" className="py-20 px-4 bg-[#0a1b2a]">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[680px] mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(71,158,206,0.14)] border border-[rgba(71,158,206,0.28)] text-xs text-[#d6ecf8]">
              Alur Verifikasi
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-3.5 mb-2.5 leading-tight">
              Dari pendaftaran hingga <em className="text-[#479ece] not-italic">ledger publik</em>
            </h2>
            <p className="text-[#9fb8c9] text-sm">
              Tiga gerbang verifikasi harus lolos sebelum satu penyaluran dicatat permanen on-chain.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Kiri: Flow Diagram Interaktif */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#479ece]/20 text-[#479ece] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" />
                  </svg>
                </div>
                <div>
                  <b className="text-xs sm:text-sm text-white block">1. Petugas Mengajukan Registrasi</b>
                  <small className="text-[#9fb8c9] text-[11px]">Autentikasi dompet petugas lapangan (MetaMask / Ethers.js)</small>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#479ece] flex items-center gap-3 shadow-[0_0_15px_rgba(71,158,206,0.2)]">
                <div className="w-8 h-8 rounded-lg bg-[#479ece] text-[#050f18] flex items-center justify-center shrink-0 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
                  </svg>
                </div>
                <div>
                  <b className="text-xs sm:text-sm text-white block">2. IdentityRegistry (On-Chain Check)</b>
                  <small className="text-[#9fb8c9] text-[11px]">Verifikasi keunikan hash NIK pada periode bersangkutan</small>
                </div>
              </div>

              {/* Sub-branch Rejection Duplikat */}
              <div className="ml-7 p-2.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff8a8a] shrink-0"></span>
                <span><strong>Ditolak: Duplikat</strong> — Revert transaksi jika hash sudah terdaftar</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#479ece]/20 text-[#479ece] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V9M10 19V5M16 19v-8M22 19H2" />
                  </svg>
                </div>
                <div>
                  <b className="text-xs sm:text-sm text-white block">3. Skor Kebutuhan AI (FastAPI Multidimensi)</b>
                  <small className="text-[#9fb8c9] text-[11px]">Model scikit-learn evaluasi 14 fitur (P2, GK, hunian, disabilitas, ASN)</small>
                </div>
              </div>

              {/* Sub-branch Rejection Threshold */}
              <div className="ml-7 p-2.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff8a8a] shrink-0"></span>
                <span><strong>Ditolak: Di Bawah Ambang</strong> — Skor &lt; 60 tidak dapat dieksekusi penyaluran</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#479ece] flex items-center gap-3 shadow-[0_0_15px_rgba(71,158,206,0.2)]">
                <div className="w-8 h-8 rounded-lg bg-[#479ece] text-[#050f18] flex items-center justify-center shrink-0 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12M7 10l5 5 5-5M4 21h16" />
                  </svg>
                </div>
                <div>
                  <b className="text-xs sm:text-sm text-white block">4. AidDisbursement (On-Chain Event)</b>
                  <small className="text-[#9fb8c9] text-[11px]">Oracle meng-attest skor, event AidDisbursed dipancarkan permanen</small>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#479ece]/20 text-[#479ece] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 14h8" />
                  </svg>
                </div>
                <div>
                  <b className="text-xs sm:text-sm text-white block">5. Dashboard Audit Publik Terverifikasi</b>
                  <small className="text-[#9fb8c9] text-[11px]">Muncul di ledger real-time dengan link transaksi explorer</small>
                </div>
              </div>
            </div>

            {/* Kanan: 4 Kartu KPI & Info Security */}
            <div className="lg:col-span-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] text-center">
                  <b className="font-heading font-extrabold text-2xl sm:text-3xl text-[#479ece] block">
                    {totalRegistered.toLocaleString("id-ID")}
                  </b>
                  <span className="text-xs text-[#9fb8c9] mt-1 block">Penerima terdaftar</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] text-center">
                  <b className="font-heading font-extrabold text-2xl sm:text-3xl text-[#5fd7a0] block">
                    {totalDisbursed.toLocaleString("id-ID")}
                  </b>
                  <span className="text-xs text-[#9fb8c9] mt-1 block">Penyaluran tercatat</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] text-center">
                  <b className="font-heading font-extrabold text-2xl sm:text-3xl text-[#ff8a8a] block">
                    {totalRejected.toLocaleString("id-ID")}
                  </b>
                  <span className="text-xs text-[#9fb8c9] mt-1 block">Duplikat ditolak</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] text-center">
                  <b className="font-heading font-extrabold text-xl sm:text-2xl text-[#bfe6f8] block">
                    {formatIDR(totalSimulatedAid)}
                  </b>
                  <span className="text-xs text-[#9fb8c9] mt-1 block">Dana tersalurkan</span>
                </div>
              </div>

              {/* Jaringan & Keamanan */}
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] space-y-2">
                <h3 className="font-heading font-bold text-sm text-white">Jaringan &amp; Keamanan Data</h3>
                <p className="text-xs text-[#9fb8c9] leading-relaxed">
                  Polygon Amoy Testnet (Chain ID 80002). Hanya hash NIK <code className="text-[#bfe3f6] font-mono">bytes32</code> yang disimpan on-chain, tanpa identitas pribadi mentah (PII).
                </p>
                <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-[rgba(71,158,206,0.15)] text-[#479ece] border border-[rgba(71,158,206,0.3)]">
                    IdentityRegistry: {shortHex(CONTRACTS.IdentityRegistry)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[rgba(71,158,206,0.15)] text-[#5fd7a0] border border-[rgba(71,158,206,0.3)]">
                    AidDisbursement: {shortHex(CONTRACTS.AidDisbursement)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. SECTION KESENJANGAN WILAYAH JAWA BARAT (27 Kab/Kota) */}
      <section id="wilayah" className="py-20 px-4">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[680px] mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(71,158,206,0.14)] border border-[rgba(71,158,206,0.28)] text-xs text-[#d6ecf8]">
              Kesenjangan Wilayah
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-3.5 mb-2.5 leading-tight">
              Audit harus bekerja di skala yang <em className="text-[#479ece] not-italic">berbeda-beda</em>
            </h2>
            <p className="text-[#9fb8c9] text-sm">
              Disparitas kemiskinan antar 27 Kabupaten/Kota di Jawa Barat mencapai 8x lipat. Sistem RantaiAsa mengintegrasikan data terbuka resmi BPS Jawa Barat.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Kiri: Bar Disparitas Wilayah Terpilih vs Rata-rata */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-white">Benchmark Keparahan Kemiskinan (P2) Jabar</h3>
                <span className="text-[11px] font-mono text-[#9fb8c9]">Data Terbuka BPS</span>
              </div>

              {/* Bars perbandingan */}
              <div className="space-y-3 pt-2 text-xs">
                {/* Wilayah Terpilih */}
                <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                  <span className="font-semibold text-white truncate">{activeRegion.nama}</span>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2c7fb0] to-[#ffffff] transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(10, ((activeRegion.p2_terkini || 0.23) / 0.6) * 100))}%` }}
                    />
                  </div>
                  <b className="font-mono text-right text-white font-bold">{activeRegion.p2_terkini?.toFixed(3) ?? "0.230"}</b>
                </div>

                {/* Kab. Tasikmalaya (Tertinggi) */}
                <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                  <span className="text-[#9fb8c9]">Kab. Tasikmalaya</span>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#2c7fb0] to-[#bfe6f8]" style={{ width: "90%" }} />
                  </div>
                  <b className="font-mono text-right text-[#bfe6f8]">0.540</b>
                </div>

                {/* Kab. Cianjur */}
                <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                  <span className="text-[#9fb8c9]">Kab. Cianjur</span>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#2c7fb0] to-[#479ece]" style={{ width: "68%" }} />
                  </div>
                  <b className="font-mono text-right text-[#479ece]">0.410</b>
                </div>

                {/* Rata-rata Jabar */}
                <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                  <span className="text-[#9fb8c9]">Rata-rata Jabar</span>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0b3a5a] to-[#2c7fb0]" style={{ width: "55%" }} />
                  </div>
                  <b className="font-mono text-right text-[#9fb8c9]">0.330</b>
                </div>

                {/* Kota Depok (Terendah) */}
                <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                  <span className="text-[#9fb8c9]">Kota Depok</span>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-[#0b3a5a]" style={{ width: "12%" }} />
                  </div>
                  <b className="font-mono text-right text-[#479ece]">0.070</b>
                </div>
              </div>

              {/* Riwayat Tren 2004-2025 untuk Wilayah Aktif */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Riwayat Tren P2 2004–2025: <span className="text-[#479ece]">{activeRegion.nama}</span></span>
                  <span className="text-[10px] font-mono text-[#9fb8c9]">BPS Jawa Barat</span>
                </div>
                {p2TrendHistory && p2TrendHistory.length > 0 ? (
                  <div>
                    <div className="flex items-end gap-1 h-16 pt-2 pb-1 overflow-x-auto">
                      {p2TrendHistory.map((item, idx) => {
                        const maxP2 = 1.2;
                        const heightPct = Math.min(100, Math.max(10, (item.p2 / maxP2) * 100));
                        const isLatest = idx === p2TrendHistory.length - 1;
                        return (
                          <div
                            key={item.tahun}
                            className="flex-1 min-w-[12px] flex flex-col items-center group relative cursor-pointer"
                            title={`${item.tahun}: P2 ${item.p2.toFixed(3)}`}
                          >
                            <div
                              className={`w-full rounded-t transition-all ${isLatest ? "bg-white shadow-[0_0_8px_#ffffff]" : "bg-[#479ece]/60 group-hover:bg-[#bfe6f8]"
                                }`}
                              style={{ height: `${heightPct}%` }}
                            />
                            <span className="text-[8px] font-mono text-[#9fb8c9] mt-1 scale-90">
                              {String(item.tahun).slice(-2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#9fb8c9] mt-0.5">
                      <span>2004 ({p2TrendHistory[0]?.p2.toFixed(2)})</span>
                      <span className="text-[#5fd7a0] font-bold">2025 ({p2TrendHistory[p2TrendHistory.length - 1]?.p2.toFixed(2)})</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs text-[#9fb8c9]">
                    {trendLoading ? "Memuat riwayat tren..." : "Memuat data riwayat BPS..."}
                  </div>
                )}
              </div>
            </div>

            {/* Kanan: 4 Card Indikator BPS Nyata */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#9fb8c9]">Garis Kemiskinan (GK BPS)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(71,158,206,0.15)] text-[#479ece]">
                    Kode: {activeRegion.kode}
                  </span>
                </div>
                <div className="font-heading font-extrabold text-2xl text-white">
                  {formatIDR(Math.round((activeRegion.garis_kemiskinan_k || 531.4) * 1000))}
                </div>
                <small className="text-[#9fb8c9] text-[11px] block mt-0.5">Rupiah per kapita per bulan di {activeRegion.nama}</small>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#9fb8c9]">Jumlah Penduduk Miskin</span>
                  <span className="text-[10px] font-mono text-[#5fd7a0]">Tahun {activeRegion.tahun_data || 2025}</span>
                </div>
                <div className="font-heading font-extrabold text-2xl text-[#bfe6f8]">
                  {Number(activeRegion.penduduk_miskin_k || 401.8).toLocaleString("id-ID")} <span className="text-base font-normal text-slate-300">ribu jiwa</span>
                </div>
                <small className="text-[#9fb8c9] text-[11px] block mt-0.5">Berdasarkan sensus data terbuka Galura Jabar BPS</small>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)]">
                  <span className="text-[#9fb8c9] text-[11px] block">Indeks Keparahan (P2)</span>
                  <span className="font-heading font-bold text-xl text-white mt-0.5 block">
                    {activeRegion.p2_terkini?.toFixed(3) ?? "0.230"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)]">
                  <span className="text-[#9fb8c9] text-[11px] block">Indeks Kedalaman (P1)</span>
                  <span className="font-heading font-bold text-xl text-[#479ece] mt-0.5 block">
                    {activeRegion.p1_terkini?.toFixed(3) ?? "0.970"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. SECTION LEDGER AUDIT PUBLIK (Persis Template) */}
      <section id="ledger" className="py-20 px-4 bg-[#0a1b2a]">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[680px] mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(71,158,206,0.14)] border border-[rgba(71,158,206,0.28)] text-xs text-[#d6ecf8]">
              Ledger Audit Publik
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-3.5 mb-2.5 leading-tight">
              Setiap penyaluran, <em className="text-[#479ece] not-italic">terverifikasi</em> siapa pun
            </h2>
            <p className="text-[#9fb8c9] text-sm">
              Coba simulasikan penyaluran atau pendaftaran ganda dan amati bagaimana smart contract menolaknya tanpa kompromi.
            </p>
          </div>

          {/* Tools & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLedgerFilter("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${ledgerFilter === "all"
                  ? "bg-[#479ece] text-[#04121c] font-bold"
                  : "border border-[rgba(71,158,206,0.28)] text-[#9fb8c9] hover:text-white"
                  }`}
              >
                Semua ({auditRecords.length})
              </button>
              <button
                onClick={() => setLedgerFilter("ok")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${ledgerFilter === "ok"
                  ? "bg-[#479ece] text-[#04121c] font-bold"
                  : "border border-[rgba(71,158,206,0.28)] text-[#9fb8c9] hover:text-white"
                  }`}
              >
                Tersalurkan ({auditRecords.filter(r => r.status === "TERCATAT").length})
              </button>
              <button
                onClick={() => setLedgerFilter("no")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${ledgerFilter === "no"
                  ? "bg-[#479ece] text-[#04121c] font-bold"
                  : "border border-[rgba(71,158,206,0.28)] text-[#9fb8c9] hover:text-white"
                  }`}
              >
                Ditolak ({auditRecords.filter(r => r.status !== "TERCATAT").length})
              </button>
            </div>

            {/* Simulation Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSimulateDisburse}
                className="px-3.5 py-1.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#479ece] to-[#2c7fb0] hover:brightness-110 shadow-sm transition cursor-pointer"
              >
                + Simulasikan penyaluran
              </button>
              <button
                onClick={handleSimulateDuplicate}
                className="px-3.5 py-1.5 rounded-xl font-semibold text-xs text-[#ff8a8a] bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition cursor-pointer"
              >
                Uji pendaftaran ganda
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Cari berdasarkan Tx Hash, Hash Identitas, Kode Referensi, atau Kabupaten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-[rgba(71,158,206,0.2)] text-xs text-white placeholder-[#9fb8c9]/50 focus:outline-none focus:border-[#479ece]"
            />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[rgba(71,158,206,0.07)] text-[#9fb8c9] text-[11px] font-medium border-b border-white/[0.06]">
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Blok</th>
                  <th className="py-3 px-4">Hash Identitas</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Kab/Kota Jabar</th>
                  <th className="py-3 px-4">Skor AI</th>
                  <th className="py-3 px-4">Status Smart Contract</th>
                  <th className="py-3 px-4">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredLedger.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedTxForModal(row)}
                    className="hover:bg-white/[0.04] cursor-pointer transition"
                  >
                    <td className="py-3 px-4 text-[#9fb8c9] font-mono text-[11px] whitespace-nowrap">{row.timestamp}</td>
                    <td className="py-3 px-4 font-mono text-white text-[11px]">#{row.block}</td>
                    <td className="py-3 px-4 font-mono text-[#bfe3f6] text-[11px]">{shortHex(row.identityHash)}</td>
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">{row.program}</td>
                    <td className="py-3 px-4 text-white whitespace-nowrap">{row.province}</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {row.aiScore > 0 ? (
                        <span className={row.aiScore >= 60 ? "text-[#5fd7a0]" : "text-[#ff8a8a]"}>{row.aiScore}</span>
                      ) : (
                        <span className="text-[#9fb8c9]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {row.status === "TERCATAT" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5fd7a0]/15 text-[#5fd7a0] border border-[#5fd7a0]/30">
                          Tersalurkan
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff8a8a]/15 text-[#ff8a8a] border border-[#ff8a8a]/30">
                          Ditolak: Duplikat
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#479ece] text-[11px]">
                      <span className="hover:underline">{shortHex(row.txHash)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-[#9fb8c9] mt-3">
            *Data demo adalah simulasi interaktif. Pada mode produksi, setiap baris dibaca langsung dari event smart contract di Polygon Amoy Testnet.
          </p>
        </div>
      </section>

      {/* 8. FINAL CTA SECTION (Persis Template) */}
      <section className="py-20 px-4 text-center bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(71,158,206,0.32),transparent_70%),#050f18]">
        <div className="max-w-[640px] mx-auto space-y-4">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            Siap membuat bantuan sosial yang bisa diaudit siapa saja?
          </h2>
          <p className="text-[#9fb8c9] text-sm leading-relaxed">
            Mulai dari satu kecamatan, satu kohort PKH, lalu perluas ke PKH, BPNT, dan bantuan beras di seluruh 27 Kabupaten/Kota Jawa Barat.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsOfficerModalOpen(true)}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#479ece] to-[#2c7fb0] hover:brightness-110 shadow-[0_10px_30px_rgba(71,158,206,0.35)] transition cursor-pointer"
            >
              Buka Portal Verifikasi Petugas
            </button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER (Persis Template) */}
      <footer className="border-t border-[rgba(71,158,206,0.18)] py-8 px-4 text-[#9fb8c9] text-xs">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-rantaiasa.png" alt="RantaiAsa" className="h-6 w-auto object-contain" />
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span>Tim LFT, Universitas Pendidikan Indonesia</span>
          </div>
          <div>
            <span>Hacksphere 2026 · Kategori National · Polygon Amoy (80002)</span>
          </div>
        </div>
      </footer>

      {/* TOAST POPUP */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed left-1/2 bottom-8 -translate-x-1/2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl z-50 flex items-center gap-2 transition-all ${toastMessage.isError ? "bg-rose-950 text-rose-200 border border-rose-500" : "bg-[#0a1b2a] text-white border border-[#479ece]"
            }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* MODAL 1: SOLIDITY EVENT INSPECTOR */}
      {selectedTxForModal && (
        <div className="fixed inset-0 z-50 bg-[#050f18]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1b2a] rounded-2xl border border-[rgba(71,158,206,0.28)] max-w-xl w-full shadow-2xl overflow-hidden my-8">
            <div className="px-5 py-4 bg-[#050f18] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#479ece]/20 text-[#479ece] font-mono text-[10px] font-bold">ON-CHAIN AUDIT</span>
                <h3 className="font-heading font-bold text-sm text-white">Event Log Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedTxForModal(null)}
                className="text-[#9fb8c9] hover:text-white p-1 rounded-lg cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex justify-between items-center">
                <span className="text-[#9fb8c9]">Referensi: <strong>{selectedTxForModal.refId}</strong> ({selectedTxForModal.province})</span>
                <a
                  href={`https://amoy.polygonscan.com/tx/${selectedTxForModal.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#479ece] hover:underline font-semibold"
                >
                  Polygonscan ↗
                </a>
              </div>

              <div className="p-3 rounded-xl bg-[#050f18] border border-[rgba(71,158,206,0.2)] font-mono text-[11px] space-y-1">
                <div className="text-[#9fb8c9]">Tx Hash: <span className="text-white break-all">{selectedTxForModal.txHash}</span></div>
                <div className="text-[#9fb8c9]">Identity Hash: <span className="text-[#bfe3f6] break-all">{selectedTxForModal.identityHash}</span></div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#9fb8c9] uppercase">Solidity Event Log:</span>
                <pre className="p-3 rounded-xl bg-[#050f18] border border-white/10 font-mono text-[10.5px] text-[#5fd7a0] overflow-x-auto leading-relaxed">
                  {selectedTxForModal.status === "TERCATAT" ? `event AidDisbursed(
  bytes32 indexed identityHash = ${shortHex(selectedTxForModal.identityHash)},
  string  indexed programCode  = "${selectedTxForModal.program}",
  uint256 indexed periodId     = 202611,
  uint256 amount               = ${selectedTxForModal.amount},
  address officer              = ${shortHex(selectedTxForModal.officer)}
);` : `revert IdentityAlreadyRegistered(
  bytes32 identityHash = ${shortHex(selectedTxForModal.identityHash)},
  uint256 periodId     = 202611
);`}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedTxForModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#479ece] text-[#050f18] font-bold text-xs cursor-pointer hover:bg-[#bfe6f8]"
                >
                  Tutup Inspeksi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PORTAL PETUGAS (3-STEP WIZARD) */}
      {isOfficerModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#050f18]/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a1b2a] rounded-2xl border border-[rgba(71,158,206,0.35)] max-w-2xl w-full shadow-2xl overflow-hidden my-8">

            <div className="px-6 py-4 bg-[#050f18] border-b border-[rgba(71,158,206,0.2)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo-icon.png" alt="RantaiAsa" className="w-5 h-5 object-contain" />
                <h3 className="font-heading font-bold text-base text-white">Portal Petugas &amp; Auditor Bansos</h3>
              </div>
              <button
                onClick={() => setIsOfficerModalOpen(false)}
                className="text-[#9fb8c9] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="px-6 pt-4">
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <div className={`p-2.5 rounded-xl border text-center transition ${wizardStep === 1 ? "bg-[#479ece] text-[#050f18] font-bold border-[#479ece]" : "bg-white/[0.04] text-[#9fb8c9] border-white/10"}`}>
                  1. Registrasi NIK
                </div>
                <div className={`p-2.5 rounded-xl border text-center transition ${wizardStep === 2 ? "bg-[#479ece] text-[#050f18] font-bold border-[#479ece]" : "bg-white/[0.04] text-[#9fb8c9] border-white/10"}`}>
                  2. Skor AI ({aiModelVersion})
                </div>
                <div className={`p-2.5 rounded-xl border text-center transition ${wizardStep === 3 ? "bg-[#479ece] text-[#050f18] font-bold border-[#479ece]" : "bg-white/[0.04] text-[#9fb8c9] border-white/10"}`}>
                  3. Eksekusi Penyaluran
                </div>
              </div>
            </div>

            <div className="p-6">

              {/* STEP 1: REGISTRASI IDENTITAS HASH */}
              {wizardStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                    <strong>Prinsip Privasi Keras:</strong> NIK 16 digit simulasi hanya diproses di volatile memory melalui <code className="font-mono text-[#bfe3f6]">HMAC-SHA256</code>. NIK asli dibuang dan tidak pernah disimpan di blockchain/database.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-semibold text-white mb-1">Simulasi NIK 16 Digit</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={simNik}
                        onChange={(e) => {
                          setSimNik(e.target.value);
                          setDuplicateAlert(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#050f18] border border-white/15 font-mono text-white focus:border-[#479ece] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-white mb-1">Kabupaten/Kota Target (Jabar)</label>
                      <select
                        value={simTargetRegion}
                        onChange={(e) => setSimTargetRegion(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#050f18] border border-white/15 text-white focus:border-[#479ece] focus:outline-none"
                      >
                        {Object.entries(REGION_NAMES).map(([code, name]) => (
                          <option key={code} value={code}>{name} ({code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-white mb-1">Pilihan Program Bansos</label>
                      <select
                        value={simProgram}
                        onChange={(e) => setSimProgram(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#050f18] border border-white/15 text-white focus:border-[#479ece] focus:outline-none"
                      >
                        <option value="PKH-2026-P1">PKH-2026-P1 (Rp 750.000)</option>
                        <option value="BPNT-2026-P1">BPNT-2026-P1 (Rp 600.000)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-white mb-1">Kode Referensi Otomatis</label>
                      <input
                        type="text"
                        value={`RCP-${simTargetRegion}-0${auditRecords.length + 1}`}
                        readOnly
                        className="w-full px-3 py-2 rounded-xl bg-[#050f18] border border-white/10 font-mono text-[#9fb8c9]"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#050f18] border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-[#479ece] uppercase">Hasil Komputasi bytes32 IdentityHash:</span>
                    <div className="font-mono text-[11px] text-[#bfe3f6] break-all">{generatedHash}</div>
                  </div>

                  {duplicateAlert && (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 space-y-1">
                      <div className="font-bold text-[#ff8a8a]">Smart Contract Revert: IdentityAlreadyRegistered()</div>
                      <p>
                        Duplikasi terdeteksi pada periode <strong>P1-2026</strong>. Kontrak <code className="font-mono text-[#bfe3f6]">IdentityRegistry.sol</code> secara otomatis menggagalkan transaksi pendaftaran ganda lintas program.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setDuplicateAlert(true)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold hover:bg-rose-500/20 cursor-pointer"
                    >
                      Uji Revert Duplikat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDuplicateAlert(false);
                        setWizardStep(2);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#479ece] text-[#050f18] font-bold hover:bg-[#bfe6f8] cursor-pointer shadow-md"
                    >
                      Sign registerIdentity() →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SKORING AI MULTIDIMENSI (Model v2.0) */}
              {wizardStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase">Model Multidimensional Poverty ({aiModelVersion})</span>
                    <span className="font-mono text-[#9fb8c9]">Ambang Batas Kelayakan ≥ 60</span>
                  </div>

                  {/* Context Auto-Injected from Selected Region */}
                  <div className="p-3 rounded-xl bg-[#479ece]/10 border border-[#479ece]/30 flex justify-between items-center">
                    <div>
                      <strong className="text-white">Wilayah Target:</strong> {REGION_NAMES[parseInt(simTargetRegion)]}
                      <span className="block text-[11px] text-[#9fb8c9] mt-0.5">
                        *5 Fitur BPS wilayah otomatis disuntikkan: P2, P1, Tren 3 Thn, Garis Kemiskinan, &amp; Penduduk Miskin.
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#479ece]">Kode: {simTargetRegion}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#050f18] border border-white/10 space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span>Pita Pengeluaran Per Kapita</span>
                        <span className="font-mono text-[#479ece]">Band {aiIncomeBand}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={aiIncomeBand}
                        onChange={(e) => setAiIncomeBand(parseInt(e.target.value))}
                        className="w-full accent-[#479ece]"
                      />
                      <span className="text-[10px] text-[#9fb8c9] block">1: Sangat Rendah (&lt;0.8 GK) s/d 5: Di atas GK</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#050f18] border border-white/10 space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span>Jumlah Anggota Keluarga</span>
                        <span className="font-mono text-[#479ece]">{aiHousehold} Jiwa</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={aiHousehold}
                        onChange={(e) => setAiHousehold(parseInt(e.target.value))}
                        className="w-full accent-[#479ece]"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#050f18] border border-white/10 space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span>Pendidikan Kepala Keluarga</span>
                        <span className="font-mono text-[#479ece]">
                          {["Tidak Sekolah", "SD", "SMP", "SMA", "Perguruan Tinggi"][aiEduLevel]}
                        </span>
                      </div>
                      <select
                        value={aiEduLevel}
                        onChange={(e) => setAiEduLevel(parseInt(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a1b2a] border border-white/15 text-white"
                      >
                        <option value={0}>Tidak Pernah Sekolah</option>
                        <option value={1}>SD / Sederajat</option>
                        <option value={2}>SMP / Sederajat</option>
                        <option value={3}>SMA / SMK / Sederajat</option>
                        <option value={4}>Diploma / Sarjana (PT)</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-[#050f18] border border-white/10 space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span>Kualitas Fisik Hunian</span>
                        <span className="font-mono text-[#479ece]">
                          {["", "Rendah / Bambu", "Sederhana", "Layak / Baik"][aiHousing]}
                        </span>
                      </div>
                      <select
                        value={aiHousing}
                        onChange={(e) => setAiHousing(parseInt(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a1b2a] border border-white/15 text-white"
                      >
                        <option value={1}>1 - Rendah / Tidak Layak Huni</option>
                        <option value={2}>2 - Sederhana / Semi Permanen</option>
                        <option value={3}>3 - Layak Huni / Permanen</option>
                      </select>
                    </div>

                    {/* Dimensi Multidimensi Baru */}
                    <div className="sm:col-span-2 p-3 rounded-xl bg-[#050f18] border border-white/10 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={aiVulnerable}
                            onChange={(e) => setAiVulnerable(e.target.checked)}
                            className="accent-[#479ece]"
                          />
                          <span>Anggota Rentan (Disabilitas / Lansia)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={aiUnemployed}
                            onChange={(e) => setAiUnemployed(e.target.checked)}
                            className="accent-[#479ece]"
                          />
                          <span>Kepala Keluarga Menganggur</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={aiLandOwner}
                            onChange={(e) => setAiLandOwner(e.target.checked)}
                            className="accent-[#479ece]"
                          />
                          <span>Memiliki Lahan / Rumah Sendiri</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={aiHasBpjs}
                            onChange={(e) => setAiHasBpjs(e.target.checked)}
                            className="accent-[#479ece]"
                          />
                          <span>Akses BPJS Kesehatan Mandiri</span>
                        </label>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#ff8a8a] pt-1 border-t border-white/10">
                        <input
                          type="checkbox"
                          checked={aiCivilServant}
                          onChange={(e) => setAiCivilServant(e.target.checked)}
                          className="accent-rose-500"
                        />
                        <span>Berstatus ASN / TNI / Polri Aktif (Otomatis Tidak Layak)</span>
                      </label>
                    </div>
                  </div>

                  {/* Skor Real-Time */}
                  <div className="p-4 rounded-xl bg-[#050f18] border border-[rgba(71,158,206,0.3)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#9fb8c9] uppercase">Hasil Evaluasi AI Scoring</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className={`text-3xl font-extrabold font-heading ${aiLiveScore >= 60 ? "text-[#5fd7a0]" : "text-[#ff8a8a]"}`}>
                          {aiLiveScore}
                        </span>
                        <span className="text-sm font-mono text-[#9fb8c9]">/ 100</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${aiLabel === "ELIGIBLE"
                          ? "bg-[#5fd7a0]/15 text-[#5fd7a0] border border-[#5fd7a0]/30"
                          : "bg-[#ff8a8a]/15 text-[#ff8a8a] border border-[#ff8a8a]/30"
                          }`}>
                          {aiLabel}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-[10px] text-[#9fb8c9] block font-mono">Faktor Dominan:</span>
                      <div className="flex flex-wrap gap-1 justify-end mt-1 max-w-xs font-mono text-[10px]">
                        {aiFactors.slice(0, 2).map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#bfe6f8]">
                            <strong>{f.impact}</strong> {f.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#9fb8c9] hover:text-white cursor-pointer"
                    >
                      ← Kembali
                    </button>
                    <button
                      disabled={aiLiveScore < 60}
                      onClick={() => setWizardStep(3)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition ${aiLiveScore >= 60
                        ? "bg-[#479ece] text-[#050f18] hover:bg-[#bfe6f8] cursor-pointer"
                        : "bg-white/10 text-slate-500 cursor-not-allowed"
                        }`}
                    >
                      Oracle attestScore() →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DISBURSEMENT ON-CHAIN */}
              {wizardStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#5fd7a0]/15 border border-[#5fd7a0]/30 text-[#5fd7a0] flex items-center gap-2">
                    <span className="text-base font-bold">✓</span>
                    <span><strong>Lolos Validasi:</strong> Hash NIK unik dan skor kelayakan AI ({aiLiveScore}) memenuhi ambang batas ≥ 60.</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#050f18] border border-white/10 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#9fb8c9]">Penerima &amp; Wilayah:</span>
                      <span className="font-semibold text-white">RCP-{simTargetRegion}-0{auditRecords.length + 1} ({REGION_NAMES[parseInt(simTargetRegion)]})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9fb8c9]">Program &amp; Periode:</span>
                      <span className="font-semibold text-white">{simProgram} (P1-2026)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9fb8c9]">Besaran Bantuan Tunai:</span>
                      <span className="font-heading font-extrabold text-white text-sm">{formatIDR(simProgram.startsWith("PKH") ? 750000 : 600000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9fb8c9]">Petugas Penyalur:</span>
                      <span className="font-mono text-[#bfe3f6]">{wallet.address ? shortHex(wallet.address) : "0xDebE...F3bf"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#9fb8c9] hover:text-white cursor-pointer"
                    >
                      ← Kembali
                    </button>
                    <button
                      onClick={handleFinalDisburseFromWizard}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] text-white font-bold text-xs shadow-lg hover:brightness-110 cursor-pointer"
                    >
                      Kirim Transaksi on-chain (disburseAid)
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
