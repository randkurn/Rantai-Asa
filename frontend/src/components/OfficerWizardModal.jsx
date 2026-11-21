import React, { useState, useEffect } from "react";
import { REGION_NAMES } from "../geoConfig.js";
import { formatIDR, shortHex } from "../constants/auditData.js";

export default function OfficerWizardModal({
  isOpen,
  onClose,
  auditCount,
  walletAddress,
  onSubmitRecord,
  onModelVersionChange,
}) {
  const [wizardStep, setWizardStep] = useState(1);
  const [simNik, setSimNik] = useState("3201012304920005");
  const [simProgram, setSimProgram] = useState("PKH-2026-P1");
  const [simTargetRegion, setSimTargetRegion] = useState("3201");
  const [duplicateAlert, setDuplicateAlert] = useState(false);
  const [generatedHash] = useState(
    "0x7d91c4e28b30a6f194c82d7e51a039b4f6c28e10d5a73b94c1f08e26a4d91b3c"
  );

  // Multidimensional AI Inputs
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
        head_unemployed: aiUnemployed ? 1 : 0,
      },
    };

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
    fetch(`${API_URL}/public/score-simulasi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((res) => {
        if (!isMounted) return;
        setAiLiveScore(res.score);
        setAiLabel(res.label);
        if (res.top_factors) setAiFactors(res.top_factors);
        if (res.model_version) {
          setAiModelVersion(res.model_version);
          onModelVersionChange?.(res.model_version);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        let score =
          52 +
          (5 - aiIncomeBand) * 8 +
          (aiHousehold - 3) * 3 +
          (4 - aiHousing) * 7 -
          aiEduLevel * 3;
        if (aiVulnerable) score += 12;
        if (aiUnemployed) score += 8;
        if (!aiLandOwner) score += 6;
        if (aiCivilServant) score -= 50;
        score = Math.max(5, Math.min(99, Math.round(score)));
        setAiLiveScore(score);
        setAiLabel(score >= 60 ? "ELIGIBLE" : score >= 45 ? "REVIEW" : "NOT_ELIGIBLE");
      });

    return () => {
      isMounted = false;
    };
  }, [
    simTargetRegion,
    aiIncomeBand,
    aiHousehold,
    aiEduLevel,
    aiHousing,
    aiVulnerable,
    aiCivilServant,
    aiLandOwner,
    aiHasBpjs,
    aiUnemployed,
    onModelVersionChange,
  ]);

  if (!isOpen) return null;

  const handleFinalSubmit = () => {
    const newRef = `RCP-${simTargetRegion}-0${auditCount + 1}`;
    const randHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const now = new Date();
    const tsStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")} WIB`;
    const amt = simProgram.startsWith("PKH") ? 750000 : 600000;

    onSubmitRecord({
      timestamp: tsStr,
      block: 14892250 + auditCount,
      refId: newRef,
      identityHash: generatedHash,
      program: simProgram,
      period: "P1-2026",
      kodeWilayah: parseInt(simTargetRegion),
      province: REGION_NAMES[parseInt(simTargetRegion)] || `Kab/Kota ${simTargetRegion}`,
      aiScore: aiLiveScore,
      aiLabel,
      status: "TERCATAT",
      factors:
        aiFactors.length > 0
          ? aiFactors
          : [
              { name: `Pita Pengeluaran (Band ${aiIncomeBand})`, impact: "+" },
              { name: `Jumlah Anggota (${aiHousehold} Jiwa)`, impact: "+" },
              { name: aiVulnerable ? "Anggota Rentan (Ada)" : "Kualitas Hunian Rendah", impact: "+" },
            ],
      amount: amt,
      txHash: "0x" + randHex,
      officer: walletAddress || "0xDebE39681c91F60C010d7C66e443770cf85dF3bf",
    });

    setWizardStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050f18]/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0a1b2a] rounded-2xl border border-[rgba(71,158,206,0.35)] max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-[#050f18] border-b border-[rgba(71,158,206,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="RantaiAsa" className="w-5 h-5 object-contain" />
            <h3 className="font-heading font-bold text-base text-white">Portal Petugas &amp; Auditor Bansos</h3>
          </div>
          <button onClick={onClose} className="text-[#9fb8c9] hover:text-white p-1 rounded-lg cursor-pointer">
            ✕
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
            {[
              [1, "1. Registrasi NIK"],
              [2, `2. Skor AI (${aiModelVersion})`],
              [3, "3. Eksekusi Penyaluran"],
            ].map(([step, label]) => (
              <div
                key={step}
                className={`p-2.5 rounded-xl border text-center transition ${
                  wizardStep === step
                    ? "bg-[#479ece] text-[#050f18] font-bold border-[#479ece]"
                    : "bg-white/[0.04] text-[#9fb8c9] border-white/10"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* STEP 1 */}
          {wizardStep === 1 && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <strong>Prinsip Privasi Keras:</strong> NIK 16 digit simulasi hanya diproses di volatile memory melalui{" "}
                <code className="font-mono text-[#bfe3f6]">HMAC-SHA256</code>. NIK asli dibuang dan tidak pernah disimpan di blockchain/database.
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
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
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
                    value={`RCP-${simTargetRegion}-0${auditCount + 1}`}
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
                    Duplikasi terdeteksi pada periode <strong>P1-2026</strong>. Kontrak{" "}
                    <code className="font-mono text-[#bfe3f6]">IdentityRegistry.sol</code> secara otomatis menggagalkan transaksi pendaftaran ganda lintas program.
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

          {/* STEP 2 */}
          {wizardStep === 2 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase">Model Multidimensional Poverty ({aiModelVersion})</span>
                <span className="font-mono text-[#9fb8c9]">Ambang Batas Kelayakan ≥ 60</span>
              </div>

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

                <div className="sm:col-span-2 p-3 rounded-xl bg-[#050f18] border border-white/10 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={aiVulnerable} onChange={(e) => setAiVulnerable(e.target.checked)} className="accent-[#479ece]" />
                      <span>Anggota Rentan (Disabilitas / Lansia)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={aiUnemployed} onChange={(e) => setAiUnemployed(e.target.checked)} className="accent-[#479ece]" />
                      <span>Kepala Keluarga Menganggur</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={aiLandOwner} onChange={(e) => setAiLandOwner(e.target.checked)} className="accent-[#479ece]" />
                      <span>Memiliki Lahan / Rumah Sendiri</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={aiHasBpjs} onChange={(e) => setAiHasBpjs(e.target.checked)} className="accent-[#479ece]" />
                      <span>Akses BPJS Kesehatan Mandiri</span>
                    </label>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#ff8a8a] pt-1 border-t border-white/10">
                    <input type="checkbox" checked={aiCivilServant} onChange={(e) => setAiCivilServant(e.target.checked)} className="accent-rose-500" />
                    <span>Berstatus ASN / TNI / Polri Aktif (Otomatis Tidak Layak)</span>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#050f18] border border-[rgba(71,158,206,0.3)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#9fb8c9] uppercase">Hasil Evaluasi AI Scoring</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={`text-3xl font-extrabold font-heading ${aiLiveScore >= 60 ? "text-[#5fd7a0]" : "text-[#ff8a8a]"}`}>
                      {aiLiveScore}
                    </span>
                    <span className="text-sm font-mono text-[#9fb8c9]">/ 100</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        aiLabel === "ELIGIBLE"
                          ? "bg-[#5fd7a0]/15 text-[#5fd7a0] border border-[#5fd7a0]/30"
                          : "bg-[#ff8a8a]/15 text-[#ff8a8a] border border-[#ff8a8a]/30"
                      }`}
                    >
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
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
                    aiLiveScore >= 60
                      ? "bg-[#479ece] text-[#050f18] hover:bg-[#bfe6f8] cursor-pointer"
                      : "bg-white/10 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Oracle attestScore() →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {wizardStep === 3 && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#5fd7a0]/15 border border-[#5fd7a0]/30 text-[#5fd7a0] flex items-center gap-2">
                <span className="text-base font-bold">✓</span>
                <span>
                  <strong>Lolos Validasi:</strong> Hash NIK unik dan skor kelayakan AI ({aiLiveScore}) memenuhi ambang batas ≥ 60.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#050f18] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#9fb8c9]">Penerima &amp; Wilayah:</span>
                  <span className="font-semibold text-white">
                    RCP-{simTargetRegion}-0{auditCount + 1} ({REGION_NAMES[parseInt(simTargetRegion)]})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9fb8c9]">Program &amp; Periode:</span>
                  <span className="font-semibold text-white">{simProgram} (P1-2026)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9fb8c9]">Besaran Bantuan Tunai:</span>
                  <span className="font-heading font-extrabold text-white text-sm">
                    {formatIDR(simProgram.startsWith("PKH") ? 750000 : 600000)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9fb8c9]">Petugas Penyalur:</span>
                  <span className="font-mono text-[#bfe3f6]">{walletAddress ? shortHex(walletAddress) : "0xDebE...F3bf"}</span>
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
                  onClick={handleFinalSubmit}
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
  );
}