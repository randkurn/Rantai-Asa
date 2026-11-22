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
import ReportManagementTab from "../components/officer/ReportManagementTab.jsx";

export default function OfficerDashboard() {
  const { officer, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("data-penerima");
  const [recipientList, setRecipientList] = useState([]);

  // State Pendaftaran & Verifikasi
  const [nikInput, setNikInput] = useState("");
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
    score: 0,
    label: "TIDAK_LAYAK",
    factors: [],
    modelVersion: "Menunggu penilaian AI",
  });
  const [isScoring, setIsScoring] = useState(false);
  const [disburseNotification, setDisburseNotification] = useState(null);

  useEffect(() => {
    if (!token) return;
    const loadRecipients = async () => {
      try {
        const response = await fetch("http://localhost:4000/recipients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const rows = await response.json();
        setRecipientList(rows.map((row) => ({
          id: row.ref_code,
          nikMasked: "************" + String(row.ref_code).slice(-4),
          identityHash: row.identity_hash,
          regionCode: row.region_code,
          regionName: REGION_NAMES[parseInt(row.region_code)] || "Jawa Barat",
          program: row.program,
          aiScore: row.score ?? 0,
          aiStatus: row.label || "BELUM_DINILAI",
          status: row.disbursement_status === "DISBURSED"
            ? "TERCATAT_BLOCKCHAIN"
            : "SIAP_SALUR",
          amount: Number(row.disbursement_amount || 0),
          timestamp: new Date(row.disbursement_created_at || row.created_at).toLocaleString("id-ID") + " WIB",
          txHash: row.disbursement_tx_hash || "-",
        })));
      } catch (error) {
        console.error("Gagal memuat penerima:", error);
      }
    };
    loadRecipients();
  }, [token]);

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

        const res = await fetch("http://localhost:4000/public/score-simulasi", {
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
        } else if (active) {
          setAiScoreResult({
            score: 0,
            label: "TIDAK_LAYAK",
            factors: [],
            modelVersion: "AI_UNAVAILABLE",
          });
        }
      } catch {
        if (active) {
          setAiScoreResult({
            score: 0,
            label: "TIDAK_LAYAK",
            factors: [],
            modelVersion: "AI_UNAVAILABLE",
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
  const handleVerifyDuplicate = async () => {
    if (!pseudonymHash) {
      setVerificationFeedback({
        status: "ERROR",
        message: "Silakan ubah NIK menjadi kode acak terlebih dahulu.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("rantaiasa_officer_token") || "";
      const response = await fetch("http://localhost:4000/recipients/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          identityHash: pseudonymHash,
          periodId: 202611,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.duplicate) {
          setVerificationFeedback({
            status: "DUPLICATE",
            message: "PERINGATAN PENERIMA GANDA: Warga ini sudah pernah menerima bantuan pada periode berjalan.",
          });
        } else {
          setVerificationFeedback({
            status: "VALID",
            message: "IDENTITAS AMAN: Data unik dan belum pernah menerima bantuan pada periode ini.",
          });
        }
      } else {
        const data = await response.json();
        throw new Error(data.detail || "Pengecekan penerima gagal.");
      }
    } catch (error) {
      setVerificationFeedback({
        status: "ERROR",
        message: error.message,
      });
    }
  };

  // Eksekusi Pencatatan Penyaluran
  const handleExecuteDisbursement = async () => {
    if (!pseudonymHash || aiScoreResult.score < 60) return;

    const newTx = null;
    const newRefId = `RCP-${selectedRegion}-0${recipientList.length + 101}`;
    const amt = selectedProgram.startsWith("PKH")
      ? 750000
      : selectedProgram.startsWith("BPNT")
        ? 600000
        : 300000;

    try {
      const token = localStorage.getItem("rantaiasa_officer_token") || "";
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const checkResponse = await fetch("http://localhost:4000/recipients/check", {
        method: "POST",
        headers,
        body: JSON.stringify({ identityHash: pseudonymHash, periodId: 202611 }),
      });
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.duplicate) throw new Error("DUPLICATE");
      } else {
        const error = await checkResponse.json();
        throw new Error(error.detail || "Pengecekan penerima gagal.");
      }

      const programId = selectedProgram.startsWith("PKH")
        ? 1
        : selectedProgram.startsWith("BPNT")
          ? 2
          : 3;
      const recipientResponse = await fetch("http://localhost:4000/recipients", {
        method: "POST",
        headers,
        body: JSON.stringify({
          refCode: newRefId,
          identityHash: pseudonymHash,
          regTxHash: newTx,
          programId,
          periodId: 202611,
          regionCode: selectedRegion,
        }),
      });
      if (!recipientResponse.ok) {
        const error = await recipientResponse.json();
        throw new Error(error.error === "DUPLICATE" ? "DUPLICATE" : "RECIPIENT_SAVE_FAILED");
      }

      const assessmentResponse = await fetch("http://localhost:4000/assessments", {
        method: "POST",
        headers,
        body: JSON.stringify({
          identityHash: pseudonymHash,
          refCode: newRefId,
          periodId: 202611,
          features: {
            kode_kabupaten_kota: parseInt(selectedRegion),
            household_size: Number(aiForm.household_size),
            income_per_capita_band: Number(aiForm.income_per_capita_band),
            head_education_level: Number(aiForm.head_education_level),
            housing_quality: Number(aiForm.housing_quality),
            has_disabled_or_elderly: aiForm.has_disabled_or_elderly ? 1 : 0,
            is_civil_servant_or_security: aiForm.is_civil_servant_or_security ? 1 : 0,
            land_ownership: aiForm.land_ownership ? 1 : 0,
            has_bpjs: aiForm.has_bpjs ? 1 : 0,
            head_unemployed: aiForm.head_unemployed ? 1 : 0,
          },
        }),
      });
      if (!assessmentResponse.ok) throw new Error("ASSESSMENT_SAVE_FAILED");

      const disbursementResponse = await fetch("http://localhost:4000/disbursements", {
        method: "POST",
        headers,
        body: JSON.stringify({
          refCode: newRefId,
          txHash: newTx,
          amount: amt,
          programId,
          periodId: 202611,
        }),
      });
      if (!disbursementResponse.ok) throw new Error("DISBURSEMENT_SAVE_FAILED");
    } catch (error) {
      if (error.message === "DUPLICATE") {
        setVerificationFeedback({
          status: "DUPLICATE",
          message:
            "Penyaluran dibatalkan: Kode identitas ini sudah tercatat menerima bantuan pada periode berjalan.",
        });
        setActiveMenu("verifikasi");
        return;
      }
      setDisburseNotification({
        refId: "GAGAL",
        txHash: error.message,
        amount: 0,
      });
      return;
    }

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
      txHash: newTx || "-",
    };

    setRecipientList((prev) => [newRecipient, ...prev]);
    setDisburseNotification({
      refId: newRefId,
      txHash: newTx || null,
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
                  {/^0x[0-9a-fA-F]{64}$/.test(disburseNotification.txHash || "") ? (
                    <span className="block font-mono text-[11px] text-slate-600">
                      Tx Blockchain: {disburseNotification.txHash}
                    </span>
                  ) : (
                    <span className="block text-[11px] text-amber-700">
                      Tercatat pada database, belum ada transaksi blockchain.
                    </span>
                  )}
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

          {activeMenu === "registrasi" && (
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
          )}

          <ReportManagementTab
            activeMenu={activeMenu}
            token={token}
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
            token={token}
            onLogout={handleLogout}
          />
        </main>
      </div>
    </div>
  );
}
