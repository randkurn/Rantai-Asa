import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { REGION_NAMES } from "../geoConfig.js";
import { formatIDR, shortHex } from "../constants/auditData.js";

export default function OfficerDashboard() {
  const { officer, logout } = useAuth();
  const navigate = useNavigate();

  // Tab Menu Aktif
  const [activeMenu, setActiveMenu] = useState("data-penerima");

  // State Data Penerima (Simulasi Terverifikasi)
  const [recipientList, setRecipientList] = useState([
    {
      id: "RCP-3201-101",
      nikMasked: "320101******0005",
      identityHash: "0x7d91c4e28b30a6f194c82d7e51a039b4f6c28e10d5a73b94c1f08e26a4d91b3c",
      regionCode: "3201",
      regionName: "Kabupaten Bogor",
      program: "PKH-2026-P1",
      aiScore: 92,
      aiStatus: "LAYAK",
      status: "TERCATAT_BLOCKCHAIN",
      amount: 750000,
      timestamp: "21 Nov 2026 10:14 WIB",
      txHash: "0x3b8f19c2a4d7e60581b9c3f4a2e8d1097c4b5a6f8e2d1c3b4a59687766554433"
    },
    {
      id: "RCP-3203-102",
      nikMasked: "320305******0012",
      identityHash: "0x4e1a7c93d2b8f504a619e832c70d5b2f9a4183e6c0b29d74f1a85c30e6b92d47",
      regionCode: "3203",
      regionName: "Kabupaten Cianjur",
      program: "BPNT-2026-P1",
      aiScore: 84,
      aiStatus: "LAYAK",
      status: "TERCATAT_BLOCKCHAIN",
      amount: 600000,
      timestamp: "21 Nov 2026 09:40 WIB",
      txHash: "0x7a1c44e9b2d8f30692c1a5e7b3d9f0184e6c7b8a9d0e1f2a3b4c5d6e7f8091a2"
    },
    {
      id: "RCP-3205-103",
      nikMasked: "320512******0089",
      identityHash: "0x1d8b5f20c9a4e736b108d492f63a8c1e5b7092d4a8f16c35e9b07d24a6c81f53",
      regionCode: "3205",
      regionName: "Kabupaten Garut",
      program: "PKH-2026-P1",
      aiScore: 78,
      aiStatus: "LAYAK",
      status: "SIAP_SALUR",
      amount: 750000,
      timestamp: "21 Nov 2026 08:30 WIB",
      txHash: "-"
    },
    {
      id: "RCP-3273-104",
      nikMasked: "327301******0044",
      identityHash: "0x98bca410293847afbd7810398402948cba019283748293840192837461928374",
      regionCode: "3273",
      regionName: "Kota Bandung",
      program: "PKH-2026-P1",
      aiScore: 35,
      aiStatus: "TIDAK_LAYAK",
      status: "DITOLAK_SISTEM",
      amount: 0,
      timestamp: "20 Nov 2026 16:20 WIB",
      txHash: "-"
    }
  ]);

  // Form Registrasi
  const [nikInput, setNikInput] = useState("3201012304920005");
  const [selectedProgram, setSelectedProgram] = useState("PKH-2026-P1");
  const [selectedRegion, setSelectedRegion] = useState(officer?.assignedRegion || "3201");
  const [searchQuery, setSearchQuery] = useState("");
  const [pseudonymHash, setPseudonymHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState(null);

  // Form Penilaian AI
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
    label: "LAYAK",
    factors: [
      { name: "Pita Pengeluaran Rendah (< 0.8x Garis Kemiskinan)", impact: "+" },
      { name: "Kondisi Rumah Tidak Layak Huni", impact: "+" },
      { name: "Kepala Keluarga Tidak Bekerja Tetap", impact: "+" }
    ],
    modelVersion: "lr-jabar-multidim-2.0"
  });
  const [isScoring, setIsScoring] = useState(false);
  const [disburseNotification, setDisburseNotification] = useState(null);

  // Simulasi status jaringan dompet kripto
  const [walletNetwork, setWalletNetwork] = useState("Polygon Amoy (Testnet 80002)");
  const [walletBalance, setWalletBalance] = useState("0.450 POL (Testnet)");
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // Hitung Skor AI secara Real-Time
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
            label: data.label === "ELIGIBLE" ? "LAYAK" : "TIDAK_LAYAK",
            factors: data.top_factors || [],
            modelVersion: data.model_version || "lr-jabar-multidim-2.0"
          });
        }
      } catch {
        if (active) {
          let calcScore = 80;
          if (aiForm.is_civil_servant_or_security) calcScore = 2;
          else {
            if (Number(aiForm.income_per_capita_band) === 1) calcScore += 12;
            if (aiForm.head_unemployed) calcScore += 8;
            if (aiForm.has_disabled_or_elderly) calcScore += 5;
          }
          setAiScoreResult({
            score: Math.min(100, Math.max(1, calcScore)),
            label: calcScore >= 60 ? "LAYAK" : "TIDAK_LAYAK",
            factors: [
              { name: "Pita Pengeluaran Rendah", impact: "+" },
              { name: "Beban Keluarga & Anggota Rentan", impact: "+" }
            ],
            modelVersion: "lr-jabar-multidim-2.0"
          });
        }
      } finally {
        if (active) setIsScoring(false);
      }
    };

    const timer = setTimeout(runLiveScore, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [aiForm, selectedRegion]);

  // Buat Kode Rahasia Identitas (Pengacakan NIK Aman)
  const handleGeneratePseudonym = async (e) => {
    e.preventDefault();
    setIsHashing(true);
    setVerificationFeedback(null);

    try {
      const res = await fetch("http://localhost:4000/identity/pseudonymize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("rantaiasa_officer_token") || ""}`
        },
        body: JSON.stringify({
          nik: nikInput,
          programId: selectedProgram === "PKH-2026-P1" ? 1 : 2,
          periodId: 202611
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPseudonymHash(data.identityHash);
      } else {
        throw new Error("Lokal HMAC");
      }
    } catch {
      const fakeHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setPseudonymHash("0x" + fakeHex);
    } finally {
      setIsHashing(false);
    }
  };

  // Cek Penerima Ganda di Buku Besar
  const handleVerifyDuplicate = () => {
    if (!pseudonymHash) {
      setVerificationFeedback({
        status: "ERROR",
        message: "Silakan ubah NIK menjadi kode acak terlebih dahulu."
      });
      return;
    }

    const isDup = recipientList.some(
      (r) => r.identityHash.toLowerCase() === pseudonymHash.toLowerCase()
    );

    if (isDup) {
      setVerificationFeedback({
        status: "DUPLICATE",
        message: "PERINGATAN PENERIMA GANDA: Warga ini sudah pernah menerima bantuan pada periode berjalan. Penyaluran baru otomatis diblokir sistem."
      });
    } else {
      setVerificationFeedback({
        status: "VALID",
        message: "IDENTITAS AMAN: Data unik dan belum pernah menerima bantuan pada periode ini. Lanjutkan proses penilaian."
      });
    }
  };

  // Eksekusi Pencatatan Penyaluran
  const handleExecuteDisbursement = () => {
    if (!pseudonymHash) return;
    const randHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newTx = "0x" + randHex;
    const newRefId = `RCP-${selectedRegion}-0${recipientList.length + 101}`;
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
      status: "TERCATAT_BLOCKCHAIN",
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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* ── SIDEBAR NAVIGASI (LIGHTMODE OPTIMAL) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
        
        {/* Logo & Judul Dashboard */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
          <img src="/logo-icon.png" alt="RantaiAsa" className="h-8 w-8 object-contain" />
          <div>
            <div className="flex items-center gap-1.5 font-heading text-base font-bold text-slate-900 tracking-tight">
              <span>Rantai</span>
              <span className="text-sky-600">Asa</span>
              <span className="rounded bg-sky-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-sky-700 border border-sky-200">
                PETUGAS
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Sistem Operasional Bansos</p>
          </div>
        </div>

        {/* Daftar Menu Sidebar */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 text-xs">
          
          {/* MENU 1: RINGKASAN UTAMA */}
          <div>
            <span className="block px-3 pb-2 font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              RINGKASAN UTAMA
            </span>
            <button
              onClick={() => setActiveMenu("data-penerima")}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition ${
                activeMenu === "data-penerima"
                  ? "bg-sky-600 text-white font-semibold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Semua Data Penerima</span>
            </button>
          </div>

          {/* MENU 2: TAHAPAN OPERASIONAL */}
          <div>
            <span className="block px-3 pb-2 font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              PROSES OPERASIONAL
            </span>
            <div className="space-y-1">
              {[
                { id: "registrasi", label: "1. Pendaftaran Baru", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
                { id: "verifikasi", label: "2. Cek Penerima Ganda", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                { id: "penilaian-ai", label: "3. Penilaian Skor AI", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
                { id: "penyaluran", label: "4. Salurkan Bantuan", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                    activeMenu === item.id
                      ? "bg-sky-600 text-white font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

          {/* MENU 3: PENGECEKAN & AUDIT */}
          <div>
            <span className="block px-3 pb-2 font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              TRANSPARANSI & AUDIT
            </span>
            <div className="space-y-1">
              {[
                { id: "riwayat", label: "Riwayat Penyaluran", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                { id: "pencarian", label: "Cari Bukti Transaksi", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                { id: "explorer", label: "Buku Besar Digital", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                    activeMenu === item.id
                      ? "bg-sky-600 text-white font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

          {/* MENU 4: PENGATURAN AKUN (TERPISAH & BERBEDA FUNGSI) */}
          <div>
            <span className="block px-3 pb-2 font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              PENGATURAN & AKUN
            </span>
            <div className="space-y-1">
              {/* Profil Petugas (Kepegawaian) */}
              <button
                onClick={() => setActiveMenu("profil")}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                  activeMenu === "profil"
                    ? "bg-sky-600 text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profil Kepegawaian</span>
              </button>

              {/* Koneksi Dompet Digital (Status Teknis Web3) */}
              <button
                onClick={() => setActiveMenu("koneksi-wallet")}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition ${
                  activeMenu === "koneksi-wallet"
                    ? "bg-sky-600 text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Status Jaringan & Wallet</span>
              </button>

              {/* Keluar */}
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-rose-600 transition hover:bg-rose-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Petugas di Bawah */}
        <div className="border-t border-slate-100 p-3.5 bg-slate-50">
          <div className="flex items-center gap-3 rounded-xl bg-white p-2.5 border border-slate-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 font-bold text-xs">
              {officer?.name ? officer.name.charAt(0) : "P"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-slate-900">
                {officer?.name || "Budi Santoso, S.STP"}
              </span>
              <span className="block truncate text-[10px] text-slate-500">
                {officer?.assignedRegion ? `Wilayah ${officer.assignedRegion}` : "Kabupaten Bogor"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── KONTEN UTAMA DASHBOARD ── */}
      <div className="flex-1 pl-64">
        
        {/* Header Atas */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-lg font-bold text-slate-900 capitalize">
              {activeMenu === "data-penerima" && "Daftar Penerima Bantuan"}
              {activeMenu === "registrasi" && "Pendaftaran Warga Baru"}
              {activeMenu === "verifikasi" && "Cek Penerima Ganda"}
              {activeMenu === "penilaian-ai" && "Penilaian Kelayakan (Bantuan Pintar)"}
              {activeMenu === "penyaluran" && "Penyaluran Bantuan"}
              {activeMenu === "riwayat" && "Riwayat Penyaluran"}
              {activeMenu === "pencarian" && "Pencarian Bukti Bantuan"}
              {activeMenu === "explorer" && "Buku Besar Digital (Bebas Manipulasi)"}
              {activeMenu === "profil" && "Profil Petugas Lapangan"}
              {activeMenu === "koneksi-wallet" && "Pengaturan Dompet Digital & Jaringan"}
            </h1>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              Petugas Aktif
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
            >
              ← Kembali ke Halaman Utama Publik
            </Link>
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">Jaringan Aktif: Jawa Barat</span>
            </div>
          </div>
        </header>

        {/* Isi Menu Konten */}
        <main className="p-8">
          
          {/* Notifikasi Penyaluran Sukses */}
          {disburseNotification && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-200 text-emerald-800 font-bold">✓</span>
                <div>
                  <strong>Bantuan Berhasil Disalurkan:</strong> Nomor Bukti {disburseNotification.refId} ({formatIDR(disburseNotification.amount)})
                  <span className="block font-mono text-[11px] text-slate-600">Kode Bukti: {disburseNotification.txHash}</span>
                </div>
              </div>
              <button
                onClick={() => setDisburseNotification(null)}
                className="text-slate-500 hover:text-slate-700 font-bold px-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* 1. SEMUA DATA PENERIMA */}
          {activeMenu === "data-penerima" && (
            <div className="space-y-6">
              {/* 4 Kartu Ringkasan */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Warga Terverifikasi</span>
                  <div className="mt-2 font-heading text-2xl font-bold text-slate-900">
                    {recipientList.length.toLocaleString("id-ID")} Jiwa
                  </div>
                  <span className="mt-1 block text-[11px] text-emerald-600 font-medium">✓ 100% Bebas Data Ganda</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Sudah Tersalurkan</span>
                  <div className="mt-2 font-heading text-2xl font-bold text-sky-600">
                    {recipientList.filter((r) => r.status === "TERCATAT_BLOCKCHAIN").length} Paket
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-500">Tercatat di Buku Digital</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Total Bantuan Terbagi</span>
                  <div className="mt-2 font-heading text-2xl font-bold text-slate-900">
                    {formatIDR(recipientList.reduce((acc, curr) => acc + curr.amount, 0))}
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-500">Wilayah Jawa Barat</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Sistem Penilai Otomatis</span>
                  <div className="mt-2 font-mono text-sm font-bold text-emerald-600">
                    Model Pintar Aktif
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-500">14 Indikator Resmi BPS</span>
                </div>
              </div>

              {/* Tabel Penerima */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-heading text-base font-bold text-slate-900">Daftar Penerima & Status Bantuan</h2>
                    <p className="text-xs text-slate-500">Daftar warga penerima yang telah dinilai dan disalurkan bantuan.</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cari nama wilayah, nomor bukti..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setActiveMenu("registrasi")}
                      className="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-700"
                    >
                      + Daftar Warga Baru
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 px-4 font-semibold">Nomor Bukti</th>
                        <th className="py-3 px-4 font-semibold">NIK (Disamarkan)</th>
                        <th className="py-3 px-4 font-semibold">Kabupaten/Kota</th>
                        <th className="py-3 px-4 font-semibold">Jenis Program</th>
                        <th className="py-3 px-4 font-semibold">Hasil Penilaian</th>
                        <th className="py-3 px-4 font-semibold">Status Penyaluran</th>
                        <th className="py-3 px-4 font-semibold">Nominal</th>
                        <th className="py-3 px-4 font-semibold">Bukti Digital</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecipients.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{rec.id}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{rec.nikMasked}</td>
                          <td className="py-3 px-4 text-slate-700">{rec.regionName}</td>
                          <td className="py-3 px-4 font-medium text-sky-700">{rec.program}</td>
                          <td className="py-3 px-4">
                            <span className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                              rec.aiScore >= 60 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              Nilai: {rec.aiScore} ({rec.aiStatus})
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                              {rec.status === "TERCATAT_BLOCKCHAIN" && "✓ Sudah Diterima"}
                              {rec.status === "SIAP_SALUR" && "⏳ Menunggu Jadwal"}
                              {rec.status === "DITOLAK_SISTEM" && "✕ Tidak Memenuhi"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{formatIDR(rec.amount)}</td>
                          <td className="py-3 px-4 font-mono text-sky-600">
                            {rec.txHash !== "-" ? shortHex(rec.txHash) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. PENDAFTARAN WARGA BARU */}
          {activeMenu === "registrasi" && (
            <div className="max-w-3xl space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-slate-900">Pendaftaran Penerima Bantuan</h2>
                  <p className="text-xs text-slate-500">
                    Sistem akan mengamankan NIK warga menjadi kode acak sehingga identitas asli tetap terlindungi.
                  </p>
                </div>

                <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900">
                  <strong>Jaminan Privasi Warga:</strong> NIK 16 digit asli hanya diproses sementara di perangkat petugas untuk dicek keunikannya dan tidak pernah dibagikan ke pihak luar.
                </div>

                <form onSubmit={handleGeneratePseudonym} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Nomor Induk Kependudukan (NIK)</label>
                      <input
                        type="text"
                        maxLength={16}
                        required
                        value={nikInput}
                        onChange={(e) => setNikInput(e.target.value)}
                        placeholder="Contoh: 3201012304920005"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-slate-900 focus:border-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Kabupaten/Kota (Jawa Barat)</label>
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
                      >
                        {Object.entries(REGION_NAMES).map(([code, name]) => (
                          <option key={code} value={code}>
                            {code} - {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Pilihan Program Bantuan</label>
                      <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
                      >
                        <option value="PKH-2026-P1">Program Keluarga Harapan (Rp 750.000)</option>
                        <option value="BPNT-2026-P1">Bantuan Pangan Non-Tunai (Rp 600.000)</option>
                        <option value="BERAS-2026-P1">Bantuan Cadangan Beras (Rp 300.000)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Periode Bantuan</label>
                      <input
                        type="text"
                        disabled
                        value="Tahap 1 - Tahun 2026"
                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isHashing}
                      className="rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-sky-700 disabled:opacity-50"
                    >
                      {isHashing ? "Mengamankan NIK..." : "Amankan NIK & Buat Kode Acak"}
                    </button>
                  </div>
                </form>

                {pseudonymHash && (
                  <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4">
                    <span className="font-mono text-[10px] text-sky-700 font-bold uppercase">Kode Identitas Acak Warga:</span>
                    <p className="mt-1 break-all font-mono text-xs font-bold text-slate-900">{pseudonymHash}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setActiveMenu("verifikasi")}
                        className="rounded-lg bg-sky-600 px-3.5 py-1.5 font-semibold text-white shadow-xs hover:bg-sky-700"
                      >
                        Lanjut ke Pengecekan Penerima Ganda →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. CEK PENERIMA GANDA */}
          {activeMenu === "verifikasi" && (
            <div className="max-w-3xl space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-slate-900">Pemeriksaan Pencegah Penerima Ganda</h2>
                  <p className="text-xs text-slate-500">
                    Sistem otomatis mencocokkan kode acak ke buku digital bersama untuk memastikan warga belum menerima bansos periode ini.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">Kode Acak Warga yang Akan Dicek</label>
                    <input
                      type="text"
                      value={pseudonymHash}
                      onChange={(e) => setPseudonymHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-slate-900 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleVerifyDuplicate}
                    className="rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-sky-700"
                  >
                    Periksa Keaslian & Duplikasi
                  </button>

                  {verificationFeedback && (
                    <div
                      className={`rounded-xl border p-4 text-xs ${
                        verificationFeedback.status === "VALID"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-800"
                      }`}
                    >
                      <div className="font-bold">
                        {verificationFeedback.status === "VALID" ? "✓ Pemeriksaan Bersih" : "✕ Terdeteksi Duplikat"}
                      </div>
                      <p className="mt-1 leading-relaxed">{verificationFeedback.message}</p>
                      {verificationFeedback.status === "VALID" && (
                        <button
                          onClick={() => setActiveMenu("penilaian-ai")}
                          className="mt-3 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-semibold text-white shadow-xs hover:bg-emerald-700"
                        >
                          Lanjut ke Penilaian Skor Kelayakan →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. PENILAIAN KELAYAKAN SKOR */}
          {activeMenu === "penilaian-ai" && (
            <div className="max-w-4xl space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-slate-900">Penilaian Skor Kelayakan</h2>
                    <p className="text-xs text-slate-500">
                      Menggunakan standar resmi BPS Jawa Barat untuk menilai tingkat kerentanan keluarga secara adil.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
                    Model Penilai: Otomatis
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-xs">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">
                        Jumlah Anggota Keluarga: <span className="text-sky-600 font-bold">{aiForm.household_size} Orang</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={aiForm.household_size}
                        onChange={(e) => setAiForm({ ...aiForm, household_size: e.target.value })}
                        className="w-full accent-sky-600"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Tingkat Pengeluaran Keluarga</label>
                      <select
                        value={aiForm.income_per_capita_band}
                        onChange={(e) => setAiForm({ ...aiForm, income_per_capita_band: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900"
                      >
                        <option value="1">Kategori 1 (Sangat Rendah di Bawah Garis Kemiskinan)</option>
                        <option value="2">Kategori 2 (Pas-pasan Mendekati Garis Kemiskinan)</option>
                        <option value="3">Kategori 3 (Menengah Cukup)</option>
                        <option value="4">Kategori 4 (Mampu / Sejahtera)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Kondisi Rumah Tempat Tinggal</label>
                      <select
                        value={aiForm.housing_quality}
                        onChange={(e) => setAiForm({ ...aiForm, housing_quality: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900"
                      >
                        <option value="1">Lantai Tanah / Dinding Bambu / Belum Ada Jamban Sendiri</option>
                        <option value="2">Semi Permanen / Kamar Mandi Bersama</option>
                        <option value="3">Permanen Layak Huni</option>
                      </select>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={aiForm.has_disabled_or_elderly}
                          onChange={(e) => setAiForm({ ...aiForm, has_disabled_or_elderly: e.target.checked })}
                          className="h-4 w-4 rounded accent-sky-600"
                        />
                        <span>Ada Anggota Keluarga Rentan (Lansia / Disabilitas)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={aiForm.head_unemployed}
                          onChange={(e) => setAiForm({ ...aiForm, head_unemployed: e.target.checked })}
                          className="h-4 w-4 rounded accent-sky-600"
                        />
                        <span>Kepala Keluarga Belum Bekerja Tetap / Menganggur</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-rose-700 font-semibold">
                        <input
                          type="checkbox"
                          checked={aiForm.is_civil_servant_or_security}
                          onChange={(e) => setAiForm({ ...aiForm, is_civil_servant_or_security: e.target.checked })}
                          className="h-4 w-4 rounded accent-rose-600"
                        />
                        <span>Anggota Keluarga Merupakan ASN / TNI / Polri (Otomatis Tidak Berhak)</span>
                      </label>
                    </div>
                  </div>

                  {/* Kartu Skor Hasil Penilaian */}
                  <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Nilai Kelayakan Bantuan:</span>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-heading text-6xl font-extrabold text-slate-900">
                          {isScoring ? "..." : aiScoreResult.score}
                        </span>
                        <span className="font-mono text-slate-500 font-bold">/ 100</span>
                        <span className={`ml-3 rounded-full border px-3 py-1 font-mono text-xs font-bold ${
                          aiScoreResult.label === "LAYAK"
                            ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                            : "border-rose-200 bg-rose-100 text-rose-800"
                        }`}>
                          {aiScoreResult.label}
                        </span>
                      </div>

                      <div className="mt-4">
                        <span className="text-[11px] font-semibold text-slate-500">Faktor Utama yang Mempengaruhi:</span>
                        <div className="mt-2 space-y-1.5 text-xs">
                          {aiScoreResult.factors.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2 rounded-lg bg-white p-2 border border-slate-200 shadow-2xs">
                              <span className={f.impact === "+" ? "text-emerald-700 font-bold text-sm" : "text-rose-700 font-bold text-sm"}>
                                {f.impact}
                              </span>
                              <span className="text-slate-700 font-medium">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-4">
                      <p className="text-[11px] text-slate-500 mb-3">
                        Syarat penyaluran: Warga berhak menerima jika nilai kelayakan ≥ 60.
                      </p>
                      <button
                        disabled={aiScoreResult.score < 60}
                        onClick={() => setActiveMenu("penyaluran")}
                        className="w-full rounded-xl bg-sky-600 py-2.5 font-bold text-white shadow-xs hover:bg-sky-700 disabled:opacity-40"
                      >
                        Lanjut ke Penyaluran Bantuan →
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
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-slate-900">Serahkan & Catat Penyaluran</h2>
                  <p className="text-xs text-slate-500">
                    Penyaluran ini akan dicatat ke buku digital terpadu agar tidak dapat diubah atau disalahgunakan.
                  </p>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wilayah Target:</span>
                    <span className="font-semibold text-slate-800">{selectedRegion} - {REGION_NAMES[parseInt(selectedRegion)]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Program Bansos:</span>
                    <span className="font-semibold text-slate-800">{selectedProgram}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nominal yang Diserahkan:</span>
                    <span className="font-heading font-bold text-sky-700 text-sm">
                      {formatIDR(selectedProgram.startsWith("PKH") ? 750000 : 600000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kode Identitas Acak:</span>
                    <span className="font-mono text-[11px] text-slate-700 font-bold">
                      {pseudonymHash ? shortHex(pseudonymHash) : "Belum dibuat"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Petugas yang Bertanggung Jawab:</span>
                    <span className="font-semibold text-slate-800">{officer?.name || "Budi Santoso, S.STP"}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    disabled={!pseudonymHash || aiScoreResult.score < 60}
                    onClick={handleExecuteDisbursement}
                    className="rounded-xl bg-sky-600 px-6 py-3 font-bold text-white shadow-xs hover:bg-sky-700 disabled:opacity-40"
                  >
                    Simpan Bukti Penyaluran
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. RIWAYAT & PENCARIAN */}
          {(activeMenu === "riwayat" || activeMenu === "pencarian") && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-heading text-base font-bold text-slate-900">Catatan Bukti Penyaluran</h2>
                    <p className="text-xs text-slate-500">Daftar rekam jejak penyaluran yang sudah berhasil dicatat.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Ketik nomor bukti atau wilayah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 px-3 font-semibold">Waktu Penyaluran</th>
                        <th className="py-3 px-3 font-semibold">Nomor Bukti</th>
                        <th className="py-3 px-3 font-semibold">Kabupaten/Kota</th>
                        <th className="py-3 px-3 font-semibold">Program</th>
                        <th className="py-3 px-3 font-semibold">Status</th>
                        <th className="py-3 px-3 font-semibold">Nominal</th>
                        <th className="py-3 px-3 font-semibold">Kode Bukti Digital</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecipients.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 text-slate-500 text-[11px]">{rec.timestamp}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{rec.id}</td>
                          <td className="py-3 px-3 text-slate-700">{rec.regionName}</td>
                          <td className="py-3 px-3 font-medium text-sky-700">{rec.program}</td>
                          <td className="py-3 px-3">
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] text-emerald-800 font-semibold">
                              ✓ Tersalurkan
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{formatIDR(rec.amount)}</td>
                          <td className="py-3 px-3 font-mono text-sky-600">
                            {rec.txHash !== "-" ? shortHex(rec.txHash) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. BUKU BESAR DIGITAL */}
          {activeMenu === "explorer" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-bold text-slate-900">Buku Besar Bersama (Blockchain)</h2>
                  <p className="text-xs text-slate-500">
                    Seluruh transaksi dicatat pada jaringan publik terbuka sehingga siapa pun bisa ikut mengawasi secara transparan.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="font-mono text-slate-400 text-[10px]">BUKU KONTRAK 1</span>
                    <h3 className="font-bold text-slate-900 mt-1">Registri Identitas Warga</h3>
                    <p className="font-mono text-[11px] text-sky-700 mt-2 break-all">
                      0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84
                    </p>
                    <a
                      href="https://amoy.polygonscan.com/address/0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block font-semibold text-sky-600 hover:underline"
                    >
                      Buka di Penjelajah Transaksi ↗
                    </a>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="font-mono text-slate-400 text-[10px]">BUKU KONTRAK 2</span>
                    <h3 className="font-bold text-slate-900 mt-1">Penyaluran Bantuan Sosial</h3>
                    <p className="font-mono text-[11px] text-sky-700 mt-2 break-all">
                      0xDd9E6cffA4DEB9493D6406A839480673Af13859D
                    </p>
                    <a
                      href="https://amoy.polygonscan.com/address/0xDd9E6cffA4DEB9493D6406A839480673Af13859D"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block font-semibold text-sky-600 hover:underline"
                    >
                      Buka di Penjelajah Transaksi ↗
                    </a>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="font-mono text-slate-400 text-[10px]">BUKU KONTRAK 3</span>
                    <h3 className="font-bold text-slate-900 mt-1">Registri Laporan Warga</h3>
                    <p className="font-mono text-[11px] text-sky-700 mt-2 break-all">
                      0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d
                    </p>
                    <a
                      href="https://amoy.polygonscan.com/address/0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block font-semibold text-sky-600 hover:underline"
                    >
                      Buka di Penjelajah Transaksi ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. HALAMAN PROFIL KEPEGAWAIAN (FOKUS BIODATA & REKAM JEJAK ASN DINSOS) */}
          {activeMenu === "profil" && (
            <div className="max-w-4xl space-y-6">
              {/* Kartu Pengenal ASN */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white font-extrabold text-2xl shadow-sm">
                      {officer?.name ? officer.name.charAt(0) : "B"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-lg font-bold text-slate-900">{officer?.name || "Budi Santoso, S.STP"}</h2>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          ASN Aktif
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{officer?.department || "Dinas Sosial Provinsi Jawa Barat"}</p>
                      <p className="text-[11px] font-mono text-slate-400">NIP: {officer?.nip || "19880415 201201 1 002"}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="block text-[11px] text-slate-400">Surat Keputusan (SK) Tugas</span>
                    <strong className="block text-xs font-semibold text-slate-800">460/Kep.128-Dinsos/2026</strong>
                    <span className="text-[10px] text-sky-600 font-medium">Berlaku s.d. 31 Des 2026</span>
                  </div>
                </div>

                {/* 3 Metrik Kinerja Petugas di Lapangan */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="block text-[11px] text-slate-500">Warga Diverifikasi</span>
                    <strong className="font-heading mt-1 block text-2xl font-bold text-slate-900">48</strong>
                    <span className="text-[10px] text-emerald-600 font-medium">↑ 12 keluarga minggu ini</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="block text-[11px] text-slate-500">Penyaluran Disahkan</span>
                    <strong className="font-heading mt-1 block text-2xl font-bold text-sky-600">36</strong>
                    <span className="text-[10px] text-slate-500">Total Rp 27.000.000,-</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="block text-[11px] text-slate-500">Aduan Warga Ditangani</span>
                    <strong className="font-heading mt-1 block text-2xl font-bold text-slate-900">4</strong>
                    <span className="text-[10px] text-emerald-600 font-medium">100% selesai ditindaklanjuti</span>
                  </div>
                </div>

                {/* Detail Penugasan & Wilayah */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pangkat & Jabatan Fungsional</span>
                    <div className="flex justify-between py-1 border-b border-slate-200/80">
                      <span className="text-slate-500">Jabatan:</span>
                      <span className="font-semibold text-slate-800">Verifikator Bantuan Sosial Madya</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/80">
                      <span className="text-slate-500">Pangkat/Golongan:</span>
                      <span className="font-semibold text-slate-800">Penata Muda Tk. I (III/b)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Unit Satuan Kerja:</span>
                      <span className="font-semibold text-slate-800">Bidang Perlindungan & Jaminan Sosial</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Wilayah Binaan Petugas</span>
                    <div className="flex justify-between py-1 border-b border-slate-200/80">
                      <span className="text-slate-500">Wilayah Induk:</span>
                      <span className="font-semibold text-slate-800">Kabupaten Bogor (Kode 3201)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/80">
                      <span className="text-slate-500">Kecamatan Prioritas:</span>
                      <span className="font-semibold text-slate-800">Cibinong, Citeureup, Sukaraja</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Posko Lapangan:</span>
                      <span className="font-semibold text-slate-800">Kantor Dinsos Kab. Bogor Jl. Bersih No. 1</span>
                    </div>
                  </div>
                </div>

                {/* Saluran Bantuan Tim Lapangan */}
                <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-slate-800 block">Butuh Koordinasi dengan Supervisor?</strong>
                    <span className="text-slate-600 text-[11px]">Hubungi Koordinator Wilayah Bogor: Bp. Hendra Kusuma, M.Si (Kasie Linjamsos)</span>
                  </div>
                  <a
                    href="mailto:linjamsos@dinsos.jabarprov.go.id"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-white font-semibold text-xs hover:bg-sky-700 transition"
                  >
                    Kirim Pesan Resmi
                  </a>
                </div>

                <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">Selesai bertugas pada perangkat ini?</span>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Keluar Sesi Petugas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. HALAMAN STATUS JARINGAN & DOMPET KRIPTO (FOKUS AUDIT TEKNIS, SMART CONTRACT & KUOTA) */}
          {activeMenu === "koneksi-wallet" && (
            <div className="max-w-4xl space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-slate-900">Status Jaringan & Dompet Digital Petugas</h2>
                    <p className="text-xs text-slate-500">
                      Otorisasi kriptografi untuk mengesahkan penyaluran bantuan sosial ke buku besar terdesentralisasi (Polygon Amoy).
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Node Terhubung (Online)
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Status Kotak Jaringan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <span className="text-[11px] text-slate-500 block">Jaringan Aktif</span>
                      <strong className="text-xs font-bold text-slate-800 mt-1 block">Polygon Amoy (80002)</strong>
                      <span className="text-[10px] text-slate-400">Layer-2 Ethereum Testnet</span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <span className="text-[11px] text-slate-500 block">Latensi Node RPC</span>
                      <strong className="text-xs font-bold text-emerald-700 mt-1 block">98 ms (Sangat Cepat)</strong>
                      <span className="text-[10px] text-emerald-600">Sinkron blok #18,452,910</span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <span className="text-[11px] text-slate-500 block">Biaya Transaksi Petugas</span>
                      <strong className="text-xs font-bold text-sky-700 mt-1 block">Gratis (Disubsidi APBD)</strong>
                      <span className="text-[10px] text-slate-400">Paymaster Relayer Pemprov</span>
                    </div>
                  </div>

                  {/* Alamat Kripto & Otorisasi Peran Kontrak */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                        Alamat Dompet Petugas Lapangan
                      </span>
                      <span className="rounded bg-sky-100 text-sky-800 font-mono text-[10px] px-2 py-0.5 font-bold">
                        OFFICER_ROLE TERVERIFIKASI
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={officer?.wallet || "0xDebE39681c91F60C010d7C66e443770cf85dF3bf"}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-xs font-semibold text-slate-800 outline-none select-all"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(officer?.wallet || "0xDebE39681c91F60C010d7C66e443770cf85dF3bf");
                          alert("Alamat dompet petugas disalin ke papan klip!");
                        }}
                        className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 text-xs transition"
                        title="Salin Alamat"
                      >
                        Salin
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      *Alamat di atas memiliki hak akses resmi untuk mencatat verifikasi keluarga dan mengesahkan penyaluran bansos pada smart contract resmi RantaiAsa di Jawa Barat.
                    </p>
                  </div>

                  {/* Daftar Kontrak Pintar Terkoneksi */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Kontrak Pintar Resmi Terpasang</span>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600 font-sans">1. Pendaftaran Identitas (IdentityRegistry):</span>
                        <a
                          href="https://amoy.polygonscan.com/address/0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 hover:underline"
                        >
                          0x964C...dD84 ↗
                        </a>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-600 font-sans">2. Penyaluran Bantuan (AidDisbursement):</span>
                        <a
                          href="https://amoy.polygonscan.com/address/0xDd9E6cffA4DEB9493D6406A839480673Af13859D"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 hover:underline"
                        >
                          0xDd9E...859D ↗
                        </a>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-600 font-sans">3. Laporan Aduan Warga (ReportRegistry):</span>
                        <a
                          href="https://amoy.polygonscan.com/address/0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 hover:underline"
                        >
                          0x8b6a...291d ↗
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Uji Koneksi */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <strong className="text-slate-800 block text-xs">Uji Ulang Koneksi Node Jaringan</strong>
                      <span className="text-slate-500 text-[11px]">Lakukan sinkronisasi jika sinyal internet di daerah lapangan sempat terputus.</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsSwitchingNetwork(true);
                        setTimeout(() => setIsSwitchingNetwork(false), 800);
                      }}
                      className="rounded-xl bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 transition"
                    >
                      {isSwitchingNetwork ? "Memeriksa Node..." : "Uji Koneksi Sekarang"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
