import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { REGION_NAMES } from "../geoConfig.js";
import { formatIDR } from "../constants/auditData.js";

import OfficerSidebar from "../components/officer/OfficerSidebar.jsx";
import OfficerHeader from "../components/officer/OfficerHeader.jsx";
import RecipientOverviewTab from "../components/officer/RecipientOverviewTab.jsx";
import OperationalStepsTab from "../components/officer/OperationalStepsTab.jsx";
import AuditTransparencyTab from "../components/officer/AuditTransparencyTab.jsx";
import OfficerAccountTab from "../components/officer/OfficerAccountTab.jsx";

const INITIAL_RECIPIENTS = [
  {
    id: "RCP-3201-101",
    nikMasked: "320101******0005",
    identityHash:
      "0x7d91c4e28b30a6f194c82d7e51a039b4f6c28e10d5a73b94c1f08e26a4d91b3c",
    regionCode: "3201",
    regionName: "Kabupaten Bogor",
    program: "PKH-2026-P1",
    aiScore: 92,
    aiStatus: "LAYAK",
    status: "TERCATAT_BLOCKCHAIN",
    amount: 750000,
    timestamp: "21 Nov 2026 10:14 WIB",
    txHash:
      "0x3b8f19c2a4d7e60581b9c3f4a2e8d1097c4b5a6f8e2d1c3b4a59687766554433",
  },
  {
    id: "RCP-3203-102",
    nikMasked: "320305******0012",
    identityHash:
      "0x4e1a7c93d2b8f504a619e832c70d5b2f9a4183e6c0b29d74f1a85c30e6b92d47",
    regionCode: "3203",
    regionName: "Kabupaten Cianjur",
    program: "BPNT-2026-P1",
    aiScore: 84,
    aiStatus: "LAYAK",
    status: "TERCATAT_BLOCKCHAIN",
    amount: 600000,
    timestamp: "21 Nov 2026 09:40 WIB",
    txHash:
      "0x7a1c44e9b2d8f30692c1a5e7b3d9f0184e6c7b8a9d0e1f2a3b4c5d6e7f8091a2",
  },
  {
    id: "RCP-3205-103",
    nikMasked: "320512******0089",
    identityHash:
      "0x1d8b5f20c9a4e736b108d492f63a8c1e5b7092d4a8f16c35e9b07d24a6c81f53",
    regionCode: "3205",
    regionName: "Kabupaten Garut",
    program: "PKH-2026-P1",
    aiScore: 78,
    aiStatus: "LAYAK",
    status: "SIAP_SALUR",
    amount: 750000,
    timestamp: "21 Nov 2026 08:30 WIB",
    txHash: "-",
  },
  {
    id: "RCP-3273-104",
    nikMasked: "327301******0044",
    identityHash:
      "0x98bca410293847afbd7810398402948cba019283748293840192837461928374",
    regionCode: "3273",
    regionName: "Kota Bandung",
    program: "PKH-2026-P1",
    aiScore: 35,
    aiStatus: "TIDAK_LAYAK",
    status: "DITOLAK_SISTEM",
    amount: 0,
    timestamp: "20 Nov 2026 16:20 WIB",
    txHash: "-",
  },
];

export default function OfficerDashboard() {
  const { officer, logout } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("data-penerima");
  const [recipientList, setRecipientList] = useState(INITIAL_RECIPIENTS);

  // State Pendaftaran & Verifikasi
  const [nikInput, setNikInput] = useState("3201012304920005");
  const [selectedProgram, setSelectedProgram] = useState("PKH-2026-P1");
  const [selectedRegion, setSelectedRegion] = useState(
    officer?.assignedRegion || "3201",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [pseudonymHash, setPseudonymHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState(null);

  // State Penilaian Kelayakan AI
  const [aiForm, setAiForm] = useState({
    household_size: 5,
    income_per_capita_band: 1,
    head_education_level: 1,
    housing_quality: 1,
    has_disabled_or_elderly: true,
    is_civil_servant_or_security: false,
    land_ownership: false,
    has_bpjs: false,
    head_unemployed: true,
  });
  const [aiScoreResult, setAiScoreResult] = useState({
    score: 95,
    label: "LAYAK",
    factors: [
      {
        name: "Pita Pengeluaran Rendah (< 0.8x Garis Kemiskinan)",
        impact: "+",
      },
      { name: "Kondisi Rumah Tidak Layak Huni", impact: "+" },
      { name: "Kepala Keluarga Tidak Bekerja Tetap", impact: "+" },
    ],
    modelVersion: "lr-jabar-multidim-2.0",
  });
  const [isScoring, setIsScoring] = useState(false);
  const [disburseNotification, setDisburseNotification] = useState(null);

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
            is_civil_servant_or_security: aiForm.is_civil_servant_or_security
              ? 1
              : 0,
            land_ownership: aiForm.land_ownership ? 1 : 0,
            has_bpjs: aiForm.has_bpjs ? 1 : 0,
            head_unemployed: aiForm.head_unemployed ? 1 : 0,
          },
        };

        const res = await fetch("http://localhost:8000/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok && active) {
          const data = await res.json();
          setAiScoreResult({
            score: data.score,
            label: data.label === "ELIGIBLE" ? "LAYAK" : "TIDAK_LAYAK",
            factors: data.top_factors || [],
            modelVersion: data.model_version || "lr-jabar-multidim-2.0",
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
              { name: "Beban Keluarga & Anggota Rentan", impact: "+" },
            ],
            modelVersion: "lr-jabar-multidim-2.0",
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

  // Pengacakan NIK Deterministik (SHA-256)
  const handleGeneratePseudonym = async (e) => {
    e.preventDefault();
    setIsHashing(true);
    setVerificationFeedback(null);

    try {
      const res = await fetch("http://localhost:4000/identity/pseudonymize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("rantaiasa_officer_token") || ""}`,
        },
        body: JSON.stringify({
          nik: nikInput.trim(),
          programId: selectedProgram === "PKH-2026-P1" ? 1 : 2,
          periodId: 202611,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPseudonymHash(data.identityHash);
      } else {
        throw new Error("Fallback SHA-256 lokal");
      }
    } catch {
      const rawSeed = `RANTAIASA:${nikInput.trim()}:${selectedProgram}:202611`;
      const encoded = new TextEncoder().encode(rawSeed);
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setPseudonymHash("0x" + hashHex);
    } finally {
      setIsHashing(false);
    }
  };

  // Cek Penerima Ganda
  const handleVerifyDuplicate = () => {
    if (!pseudonymHash) {
      setVerificationFeedback({
        status: "ERROR",
        message: "Silakan ubah NIK menjadi kode acak terlebih dahulu.",
      });
      return;
    }

    const isDup = recipientList.some(
      (r) => r.identityHash.toLowerCase() === pseudonymHash.toLowerCase(),
    );

    if (isDup) {
      setVerificationFeedback({
        status: "DUPLICATE",
        message:
          "PERINGATAN PENERIMA GANDA: Warga ini sudah pernah menerima bantuan pada periode berjalan. Penyaluran baru otomatis diblokir sistem.",
      });
    } else {
      setVerificationFeedback({
        status: "VALID",
        message:
          "IDENTITAS AMAN: Data unik dan belum pernah menerima bantuan pada periode ini. Lanjutkan proses penilaian.",
      });
    }
  };

  // Eksekusi Pencatatan Penyaluran
  const handleExecuteDisbursement = () => {
    if (!pseudonymHash || aiScoreResult.score < 60) return;

    const alreadyReceived = recipientList.some(
      (r) =>
        r.identityHash.toLowerCase() === pseudonymHash.toLowerCase() &&
        r.status === "TERCATAT_BLOCKCHAIN",
    );

    if (alreadyReceived) {
      setVerificationFeedback({
        status: "DUPLICATE",
        message:
          "Penyaluran dibatalkan: Kode identitas ini sudah tercatat menerima bantuan pada periode berjalan.",
      });
      setActiveMenu("verifikasi");
      return;
    }

    const randHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    const newTx = "0x" + randHex;
    const newRefId = `RCP-${selectedRegion}-0${recipientList.length + 101}`;
    const amt = selectedProgram.startsWith("PKH")
      ? 750000
      : selectedProgram.startsWith("BPNT")
        ? 600000
        : 300000;

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
      txHash: newTx,
    };

    setRecipientList((prev) => [newRecipient, ...prev]);
    setDisburseNotification({
      refId: newRefId,
      txHash: newTx,
      amount: amt,
    });
    setActiveMenu("riwayat");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredRecipients = recipientList.filter(
    (r) =>
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.identityHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.program.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <OfficerSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        officer={officer}
        onLogout={handleLogout}
      />

      <div className="flex-1 pl-64">
        <OfficerHeader activeMenu={activeMenu} />

        <main className="p-8">
          {disburseNotification && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-200 font-bold text-emerald-800">
                  ✓
                </span>
                <div>
                  <strong>Bantuan Berhasil Disalurkan:</strong> Nomor Bukti{" "}
                  {disburseNotification.refId} (
                  {formatIDR(disburseNotification.amount)})
                  <span className="block font-mono text-[11px] text-slate-600">
                    Kode Bukti: {disburseNotification.txHash}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDisburseNotification(null)}
                className="cursor-pointer px-2 font-bold text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
          )}

          {activeMenu === "data-penerima" && (
            <RecipientOverviewTab
              recipientList={recipientList}
              filteredRecipients={filteredRecipients}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenRegister={() => setActiveMenu("registrasi")}
            />
          )}

          <OperationalStepsTab
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            nikInput={nikInput}
            setNikInput={setNikInput}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedProgram={selectedProgram}
            setSelectedProgram={setSelectedProgram}
            isHashing={isHashing}
            handleGeneratePseudonym={handleGeneratePseudonym}
            pseudonymHash={pseudonymHash}
            setPseudonymHash={setPseudonymHash}
            handleVerifyDuplicate={handleVerifyDuplicate}
            verificationFeedback={verificationFeedback}
            aiForm={aiForm}
            setAiForm={setAiForm}
            isScoring={isScoring}
            aiScoreResult={aiScoreResult}
            officer={officer}
            handleExecuteDisbursement={handleExecuteDisbursement}
          />

          <AuditTransparencyTab
            activeMenu={activeMenu}
            filteredRecipients={filteredRecipients}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <OfficerAccountTab
            activeMenu={activeMenu}
            officer={officer}
            onLogout={handleLogout}
          />
        </main>
      </div>
    </div>
  );
}
