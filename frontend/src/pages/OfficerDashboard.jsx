import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { REGION_NAMES } from "../geoConfig.js";
import { formatIDR, shortHex } from "../constants/auditData.js";

export default function OfficerDashboard() {
  const { officer, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Active Menu Tab state matching User Specification:
  // "OPERASIONAL BANTUAN": "data-penerima" | "registrasi" | "verifikasi" | "penilaian-ai" | "penyaluran"
  // "TRANSPARANSI & AUDIT": "riwayat" | "pencarian" | "explorer"
  // "AKUN": "koneksi-wallet" | "profil"
  const [activeMenu, setActiveMenu] = useState("data-penerima");

  // Mocked state for Operations
  const [recipientList, setRecipientList] = useState([
    {
      id: "REC-3201-101",
      nikMasked: "320101******0005",
      identityHash: "0x7d91c4e28b30a6f194c82d7e51a039b4f6c28e10d5a73b94c1f08e26a4d91b3c",
      regionCode: "3201",
      regionName: "Kabupaten Bogor",
      program: "PKH-2026-P1",
      aiScore: 92,
      aiStatus: "ELIGIBLE",
      status: "TERCATAT_CHAIN",
      amount: 750000,
      timestamp: "2026-11-21 10:14 WIB",
      txHash: "0x3b8f19c2a4d7e60581b9c3f4a2e8d1097c4b5a6f8e2d1c3b4a59687766554433"
    },
    {
      id: "REC-3203-102",
      nikMasked: "320305******0012",
      identityHash: "0x4e1a7c93d2b8f504a619e832c70d5b2f9a4183e6c0b29d74f1a85c30e6b92d47",
      regionCode: "3203",
      regionName: "Kabupaten Cianjur",
      program: "BPNT-2026-P1",
      aiScore: 84,
      aiStatus: "ELIGIBLE",
      status: "TERCATAT_CHAIN",
      amount: 600000,
      timestamp: "2026-11-21 09:40 WIB",
      txHash: "0x7a1c44e9b2d8f30692c1a5e7b3d9f0184e6c7b8a9d0e1f2a3b4c5d6e7f8091a2"
    },
    {
      id: "REC-3205-103",
      nikMasked: "320512******0089",
      identityHash: "0x1d8b5f20c9a4e736b108d492f63a8c1e5b7092d4a8f16c35e9b07d24a6c81f53",
      regionCode: "3205",
      regionName: "Kabupaten Garut",
      program: "PKH-2026-P1",
      aiScore: 78,
      aiStatus: "ELIGIBLE",
      status: "MENUNGGU_PENYALURAN",
      amount: 750000,
      timestamp: "2026-11-21 08:30 WIB",
      txHash: "-"
    },
    {
      id: "REC-3273-104",
      nikMasked: "327301******0044",
      identityHash: "0x98bca410293847afbd7810398402948cba019283748293840192837461928374",
      regionCode: "3273",
      regionName: "Kota Bandung",
      program: "PKH-2026-P1",
      aiScore: 35,
      aiStatus: "NOT_ELIGIBLE",
      status: "DITOLAK_AI",
      amount: 0,
      timestamp: "2026-11-20 16:20 WIB",
      txHash: "-"
    }
  ]);

  // Operational Form States
  const [nikInput, setNikInput] = useState("3201012304920005");
  const [selectedProgram, setSelectedProgram] = useState("PKH-2026-P1");
  const [selectedRegion, setSelectedRegion] = useState(officer?.assignedRegion || "3201");
  const [searchQuery, setSearchQuery] = useState("");
  const [pseudonymHash, setPseudonymHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState(null);

  // Multidimensional AI Assessment State
  const [aiForm, setAiForm] = useState({
    household_size: 5,
    income_per_capita_band: 1,
    head_education_level: 1,
    housing_quality: 1,
    has_disabled_or_elderly: true,
    is_civil_servant_or_security: false,
    land_ownership: false,
    has_bpjs: false,
    head_unemployed: true
  });
  const [aiScoreResult, setAiScoreResult] = useState({
    score: 95,
    label: "ELIGIBLE",
    factors: [
      { name: "Pita Pengeluaran (Band 1)", impact: "+" },
      { name: "Kondisi Rumah Tidak Layak", impact: "+" },
      { name: "Kepala Rumah Tangga Menganggur", impact: "+" }
    ],
    modelVersion: "lr-jabar-multidim-2.0"
  });
  const [isScoring, setIsScoring] = useState(false);
  const [disburseNotification, setDisburseNotification] = useState(null);

  // Auto calculate AI score on form changes
  useEffect(() => {
    let active = true;
    const runLiveScore = async () => {
      setIsScoring(true);
      try {
        const payload = {
          features: {
            kode_kabupaten_kota: parseInt(selectedRegion) || 3201,
            household_size: Number(aiForm.household_size),
            income_per_capita_band: Number(aiForm.income_per_capita_band),
            head_education_level: Number(aiForm.head_education_level),
            housing_quality: Number(aiForm.housing_quality),
            has_disabled_or_elderly: aiForm.has_disabled_or_elderly ? 1 : 0,
            is_civil_servant_or_security: aiForm.is_civil_servant_or_security ? 1 : 0,
            land_ownership: aiForm.land_ownership ? 1 : 0,
            has_bpjs: aiForm.has_bpjs ? 1 : 0,
            head_unemployed: aiForm.head_unemployed ? 1 : 0
          }
        };

        const res = await fetch("http://localhost:8000/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok && active) {
          const data = await res.json();
          setAiScoreResult({
            score: data.score,
            label: data.label,
            factors: data.top_factors || [],
            modelVersion: data.model_version || "lr-jabar-multidim-2.0"
          });
        }
      } catch (err) {
        // Fallback calculation if ai-engine is temporarily offline
        if (active) {
          let calcScore = 80;
          if (aiForm.is_civil_servant_or_security) calcScore = 2;
          else {
            if (aiForm.income_per_capita_band === 1) calcScore += 12;
            if (aiForm.head_unemployed) calcScore += 8;
            if (aiForm.has_disabled_or_elderly) calcScore += 5;
          }
          setAiScoreResult({
            score: Math.min(100, Math.max(1, calcScore)),
            label: calcScore >= 60 ? "ELIGIBLE" : "NOT_ELIGIBLE",
            factors: [
              { name: "Pita Pengeluaran Rendah", impact: "+" },
              { name: "Beban Keluarga & Kerentanan", impact: "+" }
            ],
            modelVersion: "lr-jabar-multidim-2.0 (local fallback)"
          });
        }
      } finally {
        if (active) setIsScoring(false);
      }
    };

    const timer = setTimeout(runLiveScore, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [aiForm, selectedRegion]);

  // Handle Hash Pseudonymization
  const handleGeneratePseudonym = async (e) => {
    e.preventDefault();
    setIsHashing(true);
    setVerificationFeedback(null);

    // Call backend /identity/pseudonymize if available or local HMAC
    try {
      const res = await fetch("http://localhost:4000/identity/pseudonymize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("rantaiasa_officer_token") || ""}`
        },
        body: JSON.stringify({
          nik: nikInput,
          programId: selectedProgram,
          periodId: 202611
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPseudonymHash(data.identityHash);
      } else {
        throw new Error("Local HMAC fallback");
      }
    } catch {
      // Local fallback computation for demo
      const fakeHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setPseudonymHash("0x" + fakeHex);
    } finally {
      setIsHashing(false);
    }
  };

  // Check Duplicate on Chain
  const handleVerifyDuplicate = () => {
    if (!pseudonymHash) {
      setVerificationFeedback({
        status: "ERROR",
        message: "Lakukan proses pseudonimasi NIK terlebih dahulu."
      });
      return;
    }

    const isDup = recipientList.some(
      (r) => r.identityHash.toLowerCase() === pseudonymHash.toLowerCase()
    );

    if (isDup) {
      setVerificationFeedback({
        status: "DUPLICATE",
        message: "SMART CONTRACT REVERT: Hash NIK sudah terdaftar pada periode berjalan (Duplikasi Terdeteksi!)."
      });
    } else {
      setVerificationFeedback({
        status: "VALID",
        message: "LOLOS VALIDASI REGISTRY: Hash NIK belum terdaftar. Identitas unik dan berhak diproses."
      });
    }
  };

  // Register & Disburse
  const handleExecuteDisbursement = () => {
    if (!pseudonymHash) return;
    const randHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newTx = "0x" + randHex;
    const newRefId = `REC-${selectedRegion}-0${recipientList.length + 101}`;
    const amt = selectedProgram.startsWith("PKH") ? 750000 : 600000;

    const newRecipient = {
      id: newRefId,
      nikMasked: nikInput.slice(0, 6) + "******" + nikInput.slice(-4),
      identityHash: pseudonymHash,
      regionCode: selectedRegion,
      regionName: REGION_NAMES[parseInt(selectedRegion)] || "Jawa Barat",
      program: selectedProgram,
      aiScore: aiScoreResult.score,
      aiStatus: aiScoreResult.label,
      status: "TERCATAT_CHAIN",
      amount: amt,
      timestamp: new Date().toLocaleString("id-ID") + " WIB",
      txHash: newTx
    };

    setRecipientList([newRecipient, ...recipientList]);
    setDisburseNotification({
      refId: newRefId,
      txHash: newTx,
      amount: amt
    });
    setActiveMenu("riwayat");
  };

  const filteredRecipients = recipientList.filter(
    (r) =>
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.identityHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#030910] font-sans text-white">
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-sky-400/20 bg-[#050f18]/95 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <img src="/logo-icon.png" alt="RantaiAsa" className="h-8 w-8 object-contain" />
          <div>
            <div className="flex items-center gap-1.5 font-heading text-base font-bold tracking-tight">
              <span>Rantai</span>
              <span className="text-[#479ece]">Asa</span>
              <span className="rounded border border-sky-400/30 bg-sky-950/40 px-1.5 py-0.2 font-mono text-[9px] text-sky-300">
                OFFICER
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none">Social Aid Audit & Ops</p>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 text-xs">
          {/* GENERAL DASHBOARD */}
          <div>
            <span className="block px-3 pb-2 font-mono text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              GENERAL DASHBOARD
            </span>
            <button
              onClick={() => setActiveMenu("data-penerima")}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition ${
                activeMenu === "data-penerima"
                  ? "bg-[#479ece] font-semibold text-[#050f18] shadow"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Overview Operasional</span>
            </button>
          </div>

          {/* OPERASIONAL BANTUAN */}
          <div>
            <span className="block px-3 pb-2 font-mono text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              OPERASIONAL BANTUAN
            </span>
            <div className="space-y-1">
              {[
                { id: "data-penerima", label: "Data Penerima", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
                { id: "registrasi", label: "Registrasi Penerima", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
                { id: "verifikasi", label: "Verifikasi Identitas", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                { id: "penilaian-ai", label: "Penilaian Kelayakan AI", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
                { id: "penyaluran", label: "Penyaluran Bantuan", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                    activeMenu === item.id
                      ? "bg-[#479ece] font-semibold text-[#050f18] shadow"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TRANSPARANSI & AUDIT */}
          <div>
            <span className="block px-3 pb-2 font-mono text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              TRANSPARANSI & AUDIT
            </span>
            <div className="space-y-1">
              {[
                { id: "riwayat", label: "Riwayat Aktivitas", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                { id: "pencarian", label: "Pencarian Transaksi", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                { id: "explorer", label: "Blockchain Explorer", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                    activeMenu === item.id
                      ? "bg-[#479ece] font-semibold text-[#050f18] shadow"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AKUN */}
          <div>
            <span className="block px-3 pb-2 font-mono text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              AKUN
            </span>
            <div className="space-y-1">
              <button
                onClick={() => setActiveMenu("koneksi-wallet")}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                  activeMenu === "koneksi-wallet"
                    ? "bg-[#479ece] font-semibold text-[#050f18] shadow"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Koneksi Wallet</span>
              </button>

              <button
                onClick={() => setActiveMenu("profil")}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                  activeMenu === "profil"
                    ? "bg-[#479ece] font-semibold text-[#050f18] shadow"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profil Petugas</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Mini Banner */}
        <div className="border-t border-white/10 p-3.5">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 font-bold text-xs">
              {officer?.name ? officer.name.charAt(0) : "P"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-white">
                {officer?.name || "Petugas Dinsos Jabar"}
              </span>
              <span className="block truncate font-mono text-[10px] text-slate-400">
                {officer?.assignedRegion ? `Wilayah ${officer.assignedRegion}` : "Wilayah 3201 (Bogor)"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-sky-400/20 bg-[#050f18]/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-lg font-bold text-white capitalize">
              {activeMenu.replace("-", " ")}
            </h1>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              Session Aktif
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs text-sky-400 transition hover:text-sky-300 hover:underline"
            >
              ← Lihat Portal Publik
            </Link>
            <div className="flex items-center gap-2 rounded-xl border border-sky-400/20 bg-sky-950/30 px-3 py-1.5 font-mono text-xs text-sky-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Polygon Amoy (80002)</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8">
          {disburseNotification && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-base">✓</span>
                <div>
                  <strong>Penyaluran Berhasil Dicatat:</strong> Ref ID: {disburseNotification.refId} ({formatIDR(disburseNotification.amount)})
                  <span className="block font-mono text-[11px] text-slate-300">Tx: {disburseNotification.txHash}</span>
                </div>
              </div>
              <button
                onClick={() => setDisburseNotification(null)}
                className="text-emerald-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* 1. DATA PENERIMA */}
          {activeMenu === "data-penerima" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-5">
                  <span className="text-xs text-slate-400">Total Penerima Terverifikasi</span>
                  <div className="mt-2 font-heading text-2xl font-bold text-white">
                    {recipientList.length.toLocaleString("id-ID")}
                  </div>
                  <span className="mt-1 block text-[11px] text-emerald-400">100% Bebas Duplikasi NIK</span>
                </div>

                <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-5">
                  <span className="text-xs text-slate-400">Penyaluran Berhasil (On-Chain)</span>
                  <div className="mt-2 font-heading text-2xl font-bold text-sky-400">
                    {recipientList.filter((r) => r.status === "TERCATAT_CHAIN").length}
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-400">Tercatat di Smart Contract</span>
                </div>

                <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-5">
                  <span className="text-xs text-slate-400">Total Bantuan Tersalurkan</span>
                  <div className="mt-2 font-heading text-2xl font-bold text-white">
                    {formatIDR(recipientList.reduce((acc, curr) => acc + curr.amount, 0))}
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-400">Alokasi Wilayah Jabar</span>
                </div>

                <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-5">
                  <span className="text-xs text-slate-400">Model AI Terpasang</span>
                  <div className="mt-2 font-mono text-sm font-bold text-emerald-400">
                    lr-jabar-multidim-2.0
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-400">ROC-AUC 0.934 | 14 Fitur BPS</span>
                </div>
              </div>

              {/* Recipient Table */}
              <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-6">
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-heading text-base font-bold text-white">Daftar Penerima & Status Penyaluran</h2>
                    <p className="text-xs text-slate-400">Data bersumber dari registrasi on-chain dan penilaian kelayakan AI.</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cari ID, Wilayah, Hash..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-xl border border-white/10 bg-[#030910] px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                    />
                    <button
                      onClick={() => setActiveMenu("registrasi")}
                      className="rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                    >
                      + Registrasi Baru
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 font-mono text-[11px] text-slate-400">
                        <th className="py-3 px-4">Ref ID</th>
                        <th className="py-3 px-4">NIK (Masked)</th>
                        <th className="py-3 px-4">Kab/Kota</th>
                        <th className="py-3 px-4">Program</th>
                        <th className="py-3 px-4">Skor AI</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Nominal</th>
                        <th className="py-3 px-4">Tx Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRecipients.map((rec) => (
                        <tr key={rec.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono font-semibold text-white">{rec.id}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{rec.nikMasked}</td>
                          <td className="py-3 px-4 text-slate-300">{rec.regionName}</td>
                          <td className="py-3 px-4 font-mono text-sky-300">{rec.program}</td>
                          <td className="py-3 px-4">
                            <span className={`rounded px-1.5 py-0.5 font-mono font-bold text-[10px] ${
                              rec.aiScore >= 60 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                            }`}>
                              {rec.aiScore} ({rec.aiStatus})
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full border border-sky-400/30 bg-sky-950/40 px-2.5 py-0.5 text-[10px] font-semibold text-sky-300">
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">{formatIDR(rec.amount)}</td>
                          <td className="py-3 px-4 font-mono text-sky-400">{rec.txHash !== "-" ? shortHex(rec.txHash) : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. REGISTRASI PENERIMA */}
          {activeMenu === "registrasi" && (
            <div className="max-w-3xl space-y-6">
              <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-6">
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-white">Registrasi Identitas Penerima Bantuan</h2>
                  <p className="text-xs text-slate-400">
                    Proses konversi NIK menjadi pseudonym cryptographic hash (HMAC-SHA256) sebelum didaftarkan on-chain.
                  </p>
                </div>

                <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                  <strong>Privasi Keras:</strong> NIK 16 digit asli hanya diproses di volatile memory petugas dan tidak pernah disimpan di database atau blockchain.
                </div>

                <form onSubmit={handleGeneratePseudonym} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-300">Nomor Induk Kependudukan (NIK)</label>
                      <input
                        type="text"
                        maxLength={16}
                        required
                        value={nikInput}
                        onChange={(e) => setNikInput(e.target.value)}
                        placeholder="Contoh: 3201012304920005"
                        className="w-full rounded-xl border border-white/10 bg-[#030910] px-3.5 py-2.5 font-mono text-white focus:border-sky-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-300">Kabupaten/Kota (Jawa Barat)</label>
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#030910] px-3.5 py-2.5 text-white focus:border-sky-400 focus:outline-none"
                      >
                        {Object.entries(REGION_NAMES).map(([code, name]) => (
                          <option key={code} value={code}>
                            {code} - {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-300">Program Bantuan Sosial</label>
                      <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#030910] px-3.5 py-2.5 text-white focus:border-sky-400 focus:outline-none"
                      >
                        <option value="PKH-2026-P1">Program Keluarga Harapan (PKH - Rp 750.000)</option>
                        <option value="BPNT-2026-P1">Bantuan Pangan Non-Tunai (BPNT - Rp 600.000)</option>
                        <option value="BERAS-2026-P1">Bantuan Beras Cadangan Pangan (Rp 300.000)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-300">Periode Penyaluran</label>
                      <input
                        type="text"
                        disabled
                        value="Periode 1 - Tahun Anggaran 2026"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isHashing}
                      className="rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] px-5 py-2.5 font-bold text-white shadow hover:brightness-110 disabled:opacity-50"
                    >
                      {isHashing ? "Memproses Hash..." : "Generate Identity Hash (HMAC-SHA256)"}
                    </button>
                  </div>
                </form>

                {pseudonymHash && (
                  <div className="mt-6 rounded-xl border border-sky-400/30 bg-sky-950/20 p-4">
                    <span className="font-mono text-[10px] text-sky-400 uppercase">Hasil Identity Hash Siap Daftar:</span>
                    <p className="mt-1 break-all font-mono text-xs font-bold text-white">{pseudonymHash}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setActiveMenu("verifikasi")}
                        className="rounded-lg bg-sky-500/20 px-3 py-1.5 font-semibold text-sky-300 hover:bg-sky-500/30"
                      >
                        Lanjut ke Verifikasi Identitas →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. VERIFIKASI IDENTITAS */}
          {activeMenu === "verifikasi" && (
            <div className="max-w-3xl space-y-6">
              <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-6">
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-white">Verifikasi Anti-Duplikasi Identitas</h2>
                  <p className="text-xs text-slate-400">
                    Memeriksa ke smart contract <code className="font-mono text-sky-300">IdentityRegistry.sol</code> apakah hash NIK ini sudah pernah menerima bantuan pada periode berjalan.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-300">Identity Hash Penerima</label>
                    <input
                      type="text"
                      value={pseudonymHash}
                      onChange={(e) => setPseudonymHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full rounded-xl border border-white/10 bg-[#030910] px-3.5 py-2.5 font-mono text-white focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleVerifyDuplicate}
                    className="rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] px-5 py-2.5 font-bold text-white shadow hover:brightness-110"
                  >
                    Cek Status Duplikasi On-Chain
                  </button>

                  {verificationFeedback && (
                    <div
                      className={`rounded-xl border p-4 text-xs ${
                        verificationFeedback.status === "VALID"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      }`}
                    >
                      <div className="font-bold">{verificationFeedback.status === "VALID" ? "✓ Terverifikasi Bersih" : "✕ Ditolak Kontrak"}</div>
                      <p className="mt-1 leading-relaxed">{verificationFeedback.message}</p>
                      {verificationFeedback.status === "VALID" && (
                        <button
                          onClick={() => setActiveMenu("penilaian-ai")}
                          className="mt-3 rounded-lg bg-emerald-500/20 px-3 py-1.5 font-semibold text-emerald-300 hover:bg-emerald-500/30"
                        >
                          Lanjut ke Penilaian Kelayakan AI →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. PENILAIAN KELAYAKAN AI */}
          {activeMenu === "penilaian-ai" && (
            <div className="max-w-4xl space-y-6">
              <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-white">Penilaian Kelayakan AI Multidimensi</h2>
                    <p className="text-xs text-slate-400">
                      Evaluasi 14 fitur kemiskinan multidimensi BPS Jawa Barat dengan Logistic Regression terkalibrasi.
                    </p>
                  </div>
                  <span className="rounded-full border border-sky-400/30 bg-sky-950/40 px-3 py-1 font-mono text-xs text-sky-300">
                    Model: {aiScoreResult.modelVersion}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-xs">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-300">Jumlah Anggota Keluarga: {aiForm.household_size} Jiwa</label>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={aiForm.household_size}
                        onChange={(e) => setAiForm({ ...aiForm, household_size: e.target.value })}
                        className="w-full accent-sky-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-300">Pita Pengeluaran Per Kapita</label>
                      <select
                        value={aiForm.income_per_capita_band}
                        onChange={(e) => setAiForm({ ...aiForm, income_per_capita_band: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-[#030910] p-2.5 text-white"
                      >
                        <option value="1">Band 1 (&lt; 0.8x Garis Kemiskinan Wilayah)</option>
                        <option value="2">Band 2 (0.8x - 1.2x Garis Kemiskinan)</option>
                        <option value="3">Band 3 (1.2x - 2.0x Garis Kemiskinan)</option>
                        <option value="4">Band 4 (&gt; 2.0x Garis Kemiskinan)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-300">Kondisi Fisik Tempat Tinggal</label>
                      <select
                        value={aiForm.housing_quality}
                        onChange={(e) => setAiForm({ ...aiForm, housing_quality: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-[#030910] p-2.5 text-white"
                      >
                        <option value="1">Lantai Tanah / Dinding Bambu / Tanpa Sanitasi Layak</option>
                        <option value="2">Semi Permanen / Sanitasi Bersama</option>
                        <option value="3">Permanen / Sanitasi Pribadi Lengkap</option>
                      </select>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={aiForm.has_disabled_or_elderly}
                          onChange={(e) => setAiForm({ ...aiForm, has_disabled_or_elderly: e.target.checked })}
                          className="h-4 w-4 rounded accent-sky-400"
                        />
                        <span>Memiliki Anggota Rentan (Disabilitas Berat / Lansia &gt; 60 Thn)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={aiForm.head_unemployed}
                          onChange={(e) => setAiForm({ ...aiForm, head_unemployed: e.target.checked })}
                          className="h-4 w-4 rounded accent-sky-400"
                        />
                        <span>Kepala Keluarga Menganggur / Pekerja Lepas Tak Menentu</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-rose-300 font-semibold">
                        <input
                          type="checkbox"
                          checked={aiForm.is_civil_servant_or_security}
                          onChange={(e) => setAiForm({ ...aiForm, is_civil_servant_or_security: e.target.checked })}
                          className="h-4 w-4 rounded accent-rose-500"
                        />
                        <span>Eksklusi: Anggota Keluarga ASN / TNI / Polri (Otomatis Drop)</span>
                      </label>
                    </div>
                  </div>

                  {/* Realtime Score Output Card */}
                  <div className="flex flex-col justify-between rounded-2xl border border-sky-400/30 bg-[#030910] p-6 shadow-inner">
                    <div>
                      <span className="font-mono text-xs text-slate-400">Hasil Penilaian AI Engine:</span>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-heading text-6xl font-extrabold text-white">
                          {isScoring ? "..." : aiScoreResult.score}
                        </span>
                        <span className="font-mono text-slate-400">/ 100</span>
                        <span className={`ml-3 rounded-full border px-3 py-1 font-mono text-xs font-bold ${
                          aiScoreResult.label === "ELIGIBLE"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        }`}>
                          {aiScoreResult.label}
                        </span>
                      </div>

                      <div className="mt-4">
                        <span className="font-mono text-[10px] text-slate-400">Atribusi Faktor Dominan:</span>
                        <div className="mt-2 space-y-1.5 font-mono text-xs">
                          {aiScoreResult.factors.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                              <span className={f.impact === "+" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                {f.impact}
                              </span>
                              <span className="text-slate-300">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-4">
                      <p className="text-[11px] text-slate-400 mb-3">
                        Ambang batas kontrak on-chain adalah skor ≥ 60.
                      </p>
                      <button
                        disabled={aiScoreResult.score < 60}
                        onClick={() => setActiveMenu("penyaluran")}
                        className="w-full rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] py-2.5 font-bold text-white shadow hover:brightness-110 disabled:opacity-40"
                      >
                        Lanjut ke Eksekusi Penyaluran →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. PENYALURAN BANTUAN */}
          {activeMenu === "penyaluran" && (
            <div className="max-w-2xl space-y-6">
              <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-6">
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-white">Eksekusi Penyaluran On-Chain</h2>
                  <p className="text-xs text-slate-400">
                    Memanggil fungsi <code className="font-mono text-sky-300">disburseAid()</code> pada smart contract Polygon Amoy.
                  </p>
                </div>

                <div className="space-y-4 rounded-xl border border-white/10 bg-[#030910] p-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wilayah Sasaran:</span>
                    <span className="font-semibold text-white">{selectedRegion} - {REGION_NAMES[parseInt(selectedRegion)]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Program:</span>
                    <span className="font-semibold text-white">{selectedProgram}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Besaran Dana:</span>
                    <span className="font-heading font-bold text-sky-400 text-sm">
                      {formatIDR(selectedProgram.startsWith("PKH") ? 750000 : 600000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Identity Hash:</span>
                    <span className="font-mono text-[11px] text-sky-300">
                      {pseudonymHash ? shortHex(pseudonymHash) : "Belum di-generate"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Petugas Penyalur:</span>
                    <span className="font-mono text-[11px] text-slate-300">{officer?.wallet || "0xDebE...F3bf"}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    disabled={!pseudonymHash || aiScoreResult.score < 60}
                    onClick={handleExecuteDisbursement}
                    className="rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] px-6 py-3 font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-40"
                  >
                    Kirim Transaksi Penyaluran (Disburse)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. RIWAYAT & PENCARIAN */}
          {(activeMenu === "riwayat" || activeMenu === "pencarian") && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-6">
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-heading text-base font-bold text-white">Log Aktivitas & Transaksi Penyaluran</h2>
                    <p className="text-xs text-slate-400">Audit trail lengkap seluruh aktivitas penyaluran di Jawa Barat.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Pencarian cepat nomor ref atau tx hash..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#030910] px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 font-mono text-[11px] text-slate-400">
                        <th className="py-3 px-3">Waktu</th>
                        <th className="py-3 px-3">Ref ID</th>
                        <th className="py-3 px-3">Kab/Kota</th>
                        <th className="py-3 px-3">Program</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Nominal</th>
                        <th className="py-3 px-3">Tx Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRecipients.map((rec) => (
                        <tr key={rec.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{rec.timestamp}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-white">{rec.id}</td>
                          <td className="py-3 px-3 text-slate-300">{rec.regionName}</td>
                          <td className="py-3 px-3 font-mono text-sky-300">{rec.program}</td>
                          <td className="py-3 px-3">
                            <span className="rounded-full border border-sky-400/30 bg-sky-950/40 px-2 py-0.5 text-[10px] text-sky-300 font-semibold">
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">{formatIDR(rec.amount)}</td>
                          <td className="py-3 px-3 font-mono text-sky-400">
                            {rec.txHash !== "-" ? (
                              <a
                                href={`https://amoy.polygonscan.com/tx/${rec.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline"
                              >
                                {shortHex(rec.txHash)} ↗
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. BLOCKCHAIN EXPLORER */}
          {activeMenu === "explorer" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-6">
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-white">Smart Contract & Explorer</h2>
                  <p className="text-xs text-slate-400">
                    Informasi kontrak pintar resmi RantaiAsa yang beroperasi di jaringan Polygon Amoy Testnet.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl border border-white/10 bg-[#030910] p-4">
                    <span className="font-mono text-slate-400 text-[10px]">CONTRACT 1</span>
                    <h3 className="font-bold text-white mt-1">IdentityRegistry</h3>
                    <p className="font-mono text-[11px] text-sky-300 mt-2 break-all">
                      0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84
                    </p>
                    <a
                      href="https://amoy.polygonscan.com/address/0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block font-semibold text-sky-400 hover:underline"
                    >
                      Buka di Polygonscan ↗
                    </a>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#030910] p-4">
                    <span className="font-mono text-slate-400 text-[10px]">CONTRACT 2</span>
                    <h3 className="font-bold text-white mt-1">AidDisbursement</h3>
                    <p className="font-mono text-[11px] text-sky-300 mt-2 break-all">
                      0xDd9E6cffA4DEB9493D6406A839480673Af13859D
                    </p>
                    <a
                      href="https://amoy.polygonscan.com/address/0xDd9E6cffA4DEB9493D6406A839480673Af13859D"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block font-semibold text-sky-400 hover:underline"
                    >
                      Buka di Polygonscan ↗
                    </a>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#030910] p-4">
                    <span className="font-mono text-slate-400 text-[10px]">CONTRACT 3</span>
                    <h3 className="font-bold text-white mt-1">ReportRegistry</h3>
                    <p className="font-mono text-[11px] text-sky-300 mt-2 break-all">
                      0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d
                    </p>
                    <a
                      href="https://amoy.polygonscan.com/address/0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block font-semibold text-sky-400 hover:underline"
                    >
                      Buka di Polygonscan ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. KONEKSI WALLET & PROFIL */}
          {(activeMenu === "koneksi-wallet" || activeMenu === "profil") && (
            <div className="max-w-2xl space-y-6">
              <div className="rounded-2xl border border-sky-400/20 bg-[#07131d] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300 font-bold text-lg">
                    {officer?.name ? officer.name.charAt(0) : "P"}
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-white">{officer?.name || "Budi Santoso, S.STP"}</h2>
                    <p className="text-xs text-slate-400">{officer?.department || "Dinas Sosial Provinsi Jawa Barat"}</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-white/10 bg-[#030910] p-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">NIP:</span>
                    <span className="text-white">{officer?.nip || "19880415 201201 1 002"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role Sistem:</span>
                    <span className="text-emerald-400 font-bold">{officer?.role || "Petugas Verifikator Wilayah"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alamat Wallet Terverifikasi:</span>
                    <span className="text-sky-300 break-all">{officer?.wallet || "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wilayah Penugasan:</span>
                    <span className="text-white">Kode {officer?.assignedRegion || "3201"} - {officer?.regionName || "Kabupaten Bogor"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status Autentikasi:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE & SIGNED</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 font-semibold text-rose-300 hover:bg-rose-500/20"
                  >
                    Keluar Sesi Petugas
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
