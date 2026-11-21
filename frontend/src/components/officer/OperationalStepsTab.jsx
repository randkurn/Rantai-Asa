import React, { useState } from "react";
import { REGION_NAMES } from "../../geoConfig.js";
import { formatIDR, shortHex } from "../../constants/auditData.js";

export default function OperationalStepsTab({
  nikInput,
  setNikInput,
  selectedRegion,
  setSelectedRegion,
  selectedProgram,
  setSelectedProgram,
  isHashing,
  handleGeneratePseudonym,
  pseudonymHash,
  setPseudonymHash,
  handleVerifyDuplicate,
  verificationFeedback,
  aiForm,
  setAiForm,
  isScoring,
  aiScoreResult,
  officer,
  handleExecuteDisbursement,
}) {
  const [currentStep, setCurrentStep] = useState(1);

  const programAmount = selectedProgram.startsWith("PKH")
    ? 750000
    : selectedProgram.startsWith("BPNT")
      ? 600000
      : 300000;

  // Nama tahapan dibuat lebih ramah dan mudah dipahami
  const steps = [
    { number: 1, title: "1. Data Warga" },
    { number: 2, title: "2. Cek Ganda" },
    { number: 3, title: "3. Cek Layak" },
    { number: 4, title: "4. Penyaluran" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Indikator Langkah */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex flex-1 items-center">
              <button
                onClick={() => setCurrentStep(step.number)}
                className={`group flex items-center gap-2 text-left cursor-pointer ${
                  currentStep === step.number
                    ? "opacity-100"
                    : currentStep > step.number
                      ? "opacity-80"
                      : "opacity-40 hover:opacity-70"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    currentStep === step.number
                      ? "bg-sky-600 text-white shadow-sm"
                      : currentStep > step.number
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-300 bg-slate-100 text-slate-600"
                  }`}
                >
                  {currentStep > step.number ? "✓" : step.number}
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs font-bold text-slate-800">
                    {step.title}
                  </span>
                </div>
              </button>
              {idx < steps.length - 1 && (
                <div className="mx-2 hidden h-0.5 flex-1 bg-slate-200 sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Langkah 1: Data Warga */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4 border-slate-100 pb-2">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Tahap 1 dari 4
              </span>
              <h2 className="font-heading mt-1 text-xl font-bold text-slate-900">
                Pendaftaran Data Warga
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Masukkan NIK warga secara teliti. Sistem akan otomatis
                menyamarkannya menjadi kode acak demi menjaga privasi dan
                keamanan data pribadi.
              </p>
            </div>
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGeneratePseudonym(e);
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={nikInput}
                  onChange={(e) => setNikInput(e.target.value)}
                  placeholder="Masukkan 16 digit NIK"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-slate-900 shadow-2xs transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">
                  Kabupaten / Kota di Jawa Barat
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-medium text-slate-900 shadow-2xs transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                >
                  {Object.entries(REGION_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} - {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">
                  Jenis Program Bantuan
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-medium text-slate-900 shadow-2xs transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                >
                  <option value="PKH-2026-P1">
                    Program Keluarga Harapan (Rp 750.000)
                  </option>
                  <option value="BPNT-2026-P1">
                    Bantuan Pangan Non-Tunai (Rp 600.000)
                  </option>
                  <option value="BERAS-2026-P1">
                    Bantuan Cadangan Beras (Rp 300.000)
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">
                  Jadwal Penyaluran
                </label>
                <input
                  type="text"
                  disabled
                  value="Tahap 1 - Tahun 2026"
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium text-slate-500"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isHashing}
                className="cursor-pointer rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white shadow-xs transition hover:bg-sky-700 disabled:opacity-50"
              >
                {isHashing
                  ? "Memproses Keamanan NIK..."
                  : "Amankan NIK & Buat Kode Unik"}
              </button>
            </div>
          </form>

          {/* Hasil Kode Unik Warga */}
          {pseudonymHash && (
            <div className="rounded-xl space-y-3">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  ✓ Berhasil Dibuat — Kode Unik Warga:
                </span>
                <p className="mt-1 break-all rounded-lg border border-emerald-200/80 bg-white p-2.5 font-mono text-xs font-bold text-slate-800 shadow-2xs">
                  {pseudonymHash}
                </p>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-sky-700"
                >
                  Lanjut ke Pengecekan Ganda →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Langkah 2: Cek Ganda */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Pengecekan Penerima Ganda
            </h2>
            <p className="text-xs text-slate-500">
              Sistem secara otomatis memverifikasi riwayat penerima untuk
              memastikan tidak ada warga yang menerima bantuan lebih dari satu
              kali pada periode yang sama.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">
                Kode Unik Warga yang Dicek
              </label>
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
              className="cursor-pointer rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-sky-700"
            >
              Cek Status Duplikat
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
                  {verificationFeedback.status === "VALID"
                    ? "Aman, Belum Pernah Menerima Bantuan"
                    : "Sudah Terdaftar"}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Kembali
            </button>
            <button
              disabled={
                !verificationFeedback || verificationFeedback.status !== "VALID"
              }
              onClick={() => setCurrentStep(3)}
              className="cursor-pointer rounded-xl bg-sky-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-sky-700 disabled:opacity-40"
            >
              Lanjut ke Cek Layak →
            </button>
          </div>
        </div>
      )}

      {/* Langkah 3: Skor Kelayakan */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Tahap 3 dari 4
              </span>
              <h2 className="font-heading mt-1 text-xl font-bold text-slate-900">
                Penilaian Kelayakan Warga
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Penilaian kelayakan keluarga dihitung otomatis berdasarkan 14
                indikator resmi BPS Jawa Barat agar bantuan tepat sasaran.
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 text-xs md:grid-cols-12">
            {/* Kolom Kiri: Form 14 Indikator BPS (7 kolom) */}
            <div className="space-y-4 md:col-span-7">
              {/* Baris 1: Jumlah Anggota & Pendidikan Kepala Keluarga */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="household-size"
                    className="mb-1.5 block font-semibold text-slate-700"
                  >
                    1. Jumlah Anggota Keluarga
                  </label>
                  <div className="relative">
                    <input
                      id="household-size"
                      type="number"
                      min="1"
                      max="25"
                      value={aiForm.household_size}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAiForm({
                          ...aiForm,
                          household_size:
                            val === "" ? "" : Math.max(1, Number(val)),
                        });
                      }}
                      placeholder="Masukkan jumlah"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-16 pl-3.5 font-mono font-medium text-slate-900 shadow-2xs transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-slate-400">
                      Orang
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-semibold text-slate-700">
                    2. Pendidikan Kepala Keluarga
                  </label>
                  <select
                    value={aiForm.head_education_level}
                    onChange={(e) =>
                      setAiForm({
                        ...aiForm,
                        head_education_level: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-medium text-slate-900 shadow-2xs transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                  >
                    <option value={1}>
                      Tidak Sekolah / Tidak Tamat SD / Tamat SD
                    </option>
                    <option value={2}>Tamat SMP / Sederajat</option>
                    <option value={3}>Tamat SMA / Perguruan Tinggi</option>
                  </select>
                </div>
              </div>

              {/* Baris 2: Pengeluaran & Kondisi Fisik Rumah */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-semibold text-slate-700">
                    3. Tingkat Pengeluaran Per Bulan
                  </label>
                  <select
                    value={aiForm.income_per_capita_band}
                    onChange={(e) =>
                      setAiForm({
                        ...aiForm,
                        income_per_capita_band: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-medium text-slate-900 shadow-2xs transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                  >
                    <option value={1}>
                      Sangat Rendah (Di Bawah Garis Kemiskinan)
                    </option>
                    <option value={2}>
                      Pas-pasan (Mendekati Garis Kemiskinan)
                    </option>
                    <option value={3}>Menengah Cukup</option>
                    <option value={4}>Mampu / Sejahtera</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block font-semibold text-slate-700">
                    4. Kondisi Lantai, Dinding & Atap
                  </label>
                  <select
                    value={aiForm.housing_quality}
                    onChange={(e) =>
                      setAiForm({
                        ...aiForm,
                        housing_quality: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-medium text-slate-900 shadow-2xs transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                  >
                    <option value={1}>
                      Lantai Tanah / Dinding Bambu / Rumbia
                    </option>
                    <option value={2}>Semi Permanen / Kayu Murah</option>
                    <option value={3}>Permanen Layak Huni</option>
                  </select>
                </div>
              </div>

              {/* Kelompok 5-14: Indikator Kriteria BPS */}
              <div className="pt-1">
                <span className="mb-2 block font-semibold text-slate-700">
                  5–14. Kriteria Kondisi Rumah Tangga (Centang yang sesuai):
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    {
                      key: "ind_luas_lantai",
                      label: "Luas lantai < 8 m² per orang",
                    },
                    {
                      key: "ind_mck",
                      label: "Tidak memiliki fasilitas MCK sendiri",
                    },
                    {
                      key: "ind_listrik",
                      label: "Penerangan rumah bukan listrik PLN",
                    },
                    {
                      key: "ind_air_minum",
                      label: "Air minum dari sumur tak terlindung / sungai",
                    },
                    {
                      key: "ind_bahan_bakar",
                      label: "Memasak pakai kayu bakar / arang / minyak tanah",
                    },
                    {
                      key: "ind_konsumsi_protein",
                      label: "Konsumsi daging/susu/ayam hanya 1x seminggu",
                    },
                    {
                      key: "ind_pakaian",
                      label: "Hanya mampu beli 1 stel pakaian baru/tahun",
                    },
                    {
                      key: "ind_makan",
                      label: "Hanya sanggup makan 1–2 kali sehari",
                    },
                    {
                      key: "ind_berobat",
                      label: "Tidak sanggup bayar biaya berobat di puskesmas",
                    },
                    {
                      key: "head_unemployed",
                      label:
                        "Kepala keluarga tidak bekerja / penghasilan < Rp 600rb",
                    },
                    {
                      key: "has_disabled_or_elderly",
                      label: "Terdapat anggota keluarga lansia / disabilitas",
                    },
                    {
                      key: "ind_aset",
                      label: "Tidak punya tabungan/aset bernilai > Rp 500rb",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200/80 p-2.5 text-[11px] text-slate-700 transition hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(aiForm[item.key])}
                        onChange={(e) =>
                          setAiForm({
                            ...aiForm,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-sky-600"
                      />
                      <span className="leading-snug">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Syarat Gugur Otomatis */}
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50/40 p-3 font-medium text-rose-800 transition hover:bg-rose-50/80">
                <input
                  type="checkbox"
                  checked={aiForm.is_civil_servant_or_security}
                  onChange={(e) =>
                    setAiForm({
                      ...aiForm,
                      is_civil_servant_or_security: e.target.checked,
                    })
                  }
                  className="mt-0.5 h-4 w-4 rounded accent-rose-600"
                />
                <span>
                  Anggota keluarga berstatus ASN / TNI / Polri (otomatis tidak
                  memenuhi syarat)
                </span>
              </label>
            </div>

            {/* Kolom Kanan: Kotak Skor Hasil (5 kolom) */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-6 md:col-span-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">
                    Nilai Kelayakan Bantuan
                  </span>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                    Penilaian Otomatis
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-heading text-6xl font-extrabold text-slate-900">
                    {isScoring ? "..." : aiScoreResult.score}
                  </span>
                  <span className="font-mono font-bold text-slate-400">
                    / 100
                  </span>
                  <span
                    className={`ml-auto rounded-full border px-3 py-1 font-mono text-xs font-bold ${
                      aiScoreResult.label === "LAYAK"
                        ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                        : "border-rose-200 bg-rose-100 text-rose-800"
                    }`}
                  >
                    {aiScoreResult.label === "LAYAK"
                      ? "MEMENUHI SYARAT"
                      : "TIDAK LAYAK"}
                  </span>
                </div>

                {/* Faktor Pertimbangan */}
                {aiScoreResult.factors?.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <span className="block text-[11px] font-semibold text-slate-500">
                      Faktor Pertimbangan Utama:
                    </span>
                    {aiScoreResult.factors.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs shadow-2xs"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            f.impact === "+"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {f.impact}
                        </span>
                        <span className="font-medium text-slate-700">
                          {f.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-slate-200/80 pt-4">
                <p className="text-[11px] leading-relaxed text-slate-500">
                  <strong>Ketentuan:</strong> Warga dinyatakan layak menerima
                  bantuan apabila nilai kelayakan minimal{" "}
                  <strong>60 poin</strong> dan bukan merupakan keluarga
                  ASN/TNI/Polri.
                </p>
              </div>
            </div>
          </div>

          {/* Navigasi Bawah */}
          <div className="flex justify-between border-t border-slate-100 pt-5 text-xs">
            <button
              onClick={() => setCurrentStep(2)}
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Kembali ke Cek Ganda
            </button>
            <button
              disabled={aiScoreResult.score < 60}
              onClick={() => setCurrentStep(4)}
              className="cursor-pointer rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white shadow-xs transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lanjut ke Penyaluran →
            </button>
          </div>
        </div>
      )}

      {/* Langkah 4: Penyaluran */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Konfirmasi & Catat Penyaluran
            </h2>
            <p className="text-xs text-slate-500">
              Pastikan data di bawah sudah benar. Penyaluran ini bakal langsung
              dicatat permanen ke sistem.
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Wilayah:</span>
              <span className="font-semibold text-slate-800">
                {selectedRegion} - {REGION_NAMES[parseInt(selectedRegion)]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Program Bantuan:</span>
              <span className="font-semibold text-slate-800">
                {selectedProgram}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nominal:</span>
              <span className="font-heading text-sm font-bold text-sky-700">
                {formatIDR(programAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kode Unik Warga:</span>
              <span className="font-mono text-[11px] font-bold text-slate-700">
                {pseudonymHash ? shortHex(pseudonymHash) : "Belum dibuat"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Petugas Bertugas:</span>
              <span className="font-semibold text-slate-800">
                {officer?.name || "-"}
              </span>
            </div>
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-4">
            <button
              onClick={() => setCurrentStep(3)}
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Kembali
            </button>
            <button
              disabled={!pseudonymHash || aiScoreResult.score < 60}
              onClick={handleExecuteDisbursement}
              className="cursor-pointer rounded-xl bg-sky-600 px-6 py-3 font-bold text-white shadow-xs hover:bg-sky-700 disabled:opacity-40"
            >
              Simpan & Catat Penyaluran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
