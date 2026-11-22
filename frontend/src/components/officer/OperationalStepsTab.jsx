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
                className={`group flex cursor-pointer items-center gap-2 text-left ${
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
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Tahap 1 dari 4
              </span>
              <h2 className="font-heading mt-1 text-xl font-bold text-slate-900">
                Pendaftaran Data Warga
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Masukkan NIK warga secara teliti. Sistem akan otomatis
                menyamarkannya menjadi kode acak demi menjaga privasi dan
                keamanan data pribadi.
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>

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
                  inputMode="numeric"
                  pattern="[0-9]{16}"
                  maxLength={16}
                  required
                  value={nikInput}
                  onChange={(e) => setNikInput(e.target.value.replace(/\D/g, "").slice(0, 16))}
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
                className="cursor-pointer rounded-xl bg-sky-600 px-5 py-2.5 font-bold !text-white shadow-xs transition hover:bg-sky-700 disabled:opacity-50"
              >
                {isHashing
                  ? "Memproses Keamanan NIK..."
                  : "Amankan NIK & Buat Kode Unik"}
              </button>
            </div>
          </form>

          {pseudonymHash && (
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
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
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Tahap 2 dari 4
              </span>
              <h2 className="font-heading mt-1 text-xl font-bold text-slate-900">
                Pengecekan Penerima Ganda
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Sistem akan memeriksa riwayat pencairan pada buku digital
                terpadu untuk memastikan warga belum pernah menerima bantuan
                pada periode yang sama.
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="mb-1.5 block font-semibold text-slate-700">
                Kode Unik Warga yang Diperiksa
              </label>
              <input
                type="text"
                value={pseudonymHash}
                onChange={(e) => setPseudonymHash(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 font-mono text-slate-900 shadow-2xs transition focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/15"
              />
            </div>

            <div>
              <button
                onClick={handleVerifyDuplicate}
                className="cursor-pointer rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white shadow-xs transition hover:bg-sky-700"
              >
                Periksa Riwayat Penerima
              </button>
            </div>

            {verificationFeedback && (
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 text-xs ${
                  verificationFeedback.status === "VALID"
                    ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                    : "border-rose-200 bg-rose-50/70 text-rose-900"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    verificationFeedback.status === "VALID"
                      ? "bg-emerald-600"
                      : "bg-rose-600"
                  }`}
                >
                  {verificationFeedback.status === "VALID" ? "✓" : "✕"}
                </span>
                <div className="leading-relaxed">
                  <div className="font-bold">
                    {verificationFeedback.status === "VALID"
                      ? "Data Terverifikasi — Belum Pernah Menerima Bantuan"
                      : "Peringatan — Data Sudah Terdaftar pada Periode Ini"}
                  </div>
                  {verificationFeedback.message && (
                    <p className="mt-1 text-slate-700">
                      {verificationFeedback.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-5 text-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Kembali ke Data Warga
            </button>
            <button
              disabled={
                !verificationFeedback || verificationFeedback.status !== "VALID"
              }
              onClick={() => setCurrentStep(3)}
              className="cursor-pointer rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white shadow-xs transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lanjut ke Penilaian Kelayakan →
            </button>
          </div>
        </div>
      )}

      {/* Langkah 3: Skor Kelayakan (9 Indikator Rumah Tangga + 5 Indikator Wilayah BPS) */}
      {currentStep === 3 && (
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Tahap 3 dari 4
              </span>
              <h2 className="font-heading mt-1 text-xl font-bold text-slate-900">
                Penilaian Kelayakan Warga
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Penilaian menghitung 14 indikator resmi: 9 indikator kondisi
                rumah tangga yang diisi petugas dan 5 indikator ekonomi wilayah
                BPS Jawa Barat secara otomatis.
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
            {/* Kolom Kiri: 9 Indikator Rumah Tangga */}
            <div className="space-y-4 md:col-span-7">
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
                    <option value={1}>Tidak Sekolah / Tamat SD</option>
                    <option value={2}>Tamat SMP / Sederajat</option>
                    <option value={3}>Tamat SMA / Perguruan Tinggi</option>
                  </select>
                </div>
              </div>

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
                    4. Kondisi Rumah Tempat Tinggal
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
                      Tidak Layak (Lantai Tanah / Bambu / Tanpa Jamban)
                    </option>
                    <option value={2}>
                      Semi Permanen / Kamar Mandi Bersama
                    </option>
                    <option value={3}>Permanen Layak Huni</option>
                  </select>
                </div>
              </div>

              {/* Indikator 5–8 */}
              <div className="pt-1">
                <span className="mb-2 block font-semibold text-slate-700">
                  5–8. Kondisi Sosial &amp; Kepemilikan Aset Keluarga:
                </span>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200/80 p-3 text-slate-700 transition hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={Boolean(aiForm.has_disabled_or_elderly)}
                      onChange={(e) =>
                        setAiForm({
                          ...aiForm,
                          has_disabled_or_elderly: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-sky-600"
                    />
                    <span className="leading-snug">
                      5. Ada anggota lansia atau penyandang disabilitas
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200/80 p-3 text-slate-700 transition hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={Boolean(aiForm.head_unemployed)}
                      onChange={(e) =>
                        setAiForm({
                          ...aiForm,
                          head_unemployed: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-sky-600"
                    />
                    <span className="leading-snug">
                      6. Kepala keluarga tidak bekerja / tanpa penghasilan tetap
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200/80 p-3 text-slate-700 transition hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={Boolean(aiForm.land_ownership)}
                      onChange={(e) =>
                        setAiForm({
                          ...aiForm,
                          land_ownership: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-sky-600"
                    />
                    <span className="leading-snug">
                      7. Memiliki aset lahan / tanah produktif
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200/80 p-3 text-slate-700 transition hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={Boolean(aiForm.has_bpjs)}
                      onChange={(e) =>
                        setAiForm({
                          ...aiForm,
                          has_bpjs: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-sky-600"
                    />
                    <span className="leading-snug">
                      8. Terdaftar sebagai peserta jaminan kesehatan (BPJS)
                    </span>
                  </label>
                </div>
              </div>

              {/* Indikator 9: Syarat Gugur Otomatis */}
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50/40 p-3 font-medium text-rose-800 transition hover:bg-rose-50/80">
                <input
                  type="checkbox"
                  checked={Boolean(aiForm.is_civil_servant_or_security)}
                  onChange={(e) =>
                    setAiForm({
                      ...aiForm,
                      is_civil_servant_or_security: e.target.checked,
                    })
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 rounded accent-rose-600"
                />
                <span>
                  9. Anggota keluarga berstatus ASN / TNI / Polri (otomatis
                  tidak memenuhi syarat)
                </span>
              </label>
            </div>

            {/* Kolom Kanan: Kotak Skor Hasil & 5 Indikator Wilayah */}
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

                <div className="mt-5 rounded-xl border border-sky-200/70 bg-sky-50/70 p-3 text-[11px] text-sky-900">
                  <span className="font-bold">
                    +5 Indikator Wilayah Otomatis (BPS):
                  </span>
                  <p className="mt-0.5 leading-relaxed text-sky-800">
                    Indeks Keparahan (P2), Kedalaman Kemiskinan (P1), Tren 3
                    Tahun, Garis Kemiskinan Lokal, dan Jumlah Penduduk Miskin di{" "}
                    <strong>{REGION_NAMES[parseInt(selectedRegion)]}</strong>.
                  </p>
                </div>

                {aiScoreResult.factors?.length > 0 && (
                  <div className="mt-5 space-y-2">
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
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Tahap 4 dari 4
              </span>
              <h2 className="font-heading mt-1 text-xl font-bold text-slate-900">
                Konfirmasi &amp; Catat Penyaluran
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Periksa kembali seluruh rincian di bawah ini sebelum menyimpan.
                Data penyaluran yang telah dicatat bersifat permanen dan tidak
                dapat diubah.
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-3.5 rounded-xl border border-slate-200 bg-slate-50/80 p-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500">Wilayah Penyaluran</span>
              <span className="font-semibold text-slate-800">
                {selectedRegion} - {REGION_NAMES[parseInt(selectedRegion)]}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500">Program Bantuan</span>
              <span className="font-semibold text-slate-800">
                {selectedProgram}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500">Nominal Bantuan</span>
              <span className="font-heading text-sm font-bold text-sky-700">
                {formatIDR(programAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500">Kode Unik Warga</span>
              <span className="font-mono text-[11px] font-bold text-slate-700">
                {pseudonymHash ? shortHex(pseudonymHash) : "Belum dibuat"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Petugas Penanggung Jawab</span>
              <span className="font-semibold text-slate-800">
                {officer?.name || "-"}
              </span>
            </div>
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-5 text-xs">
            <button
              onClick={() => setCurrentStep(3)}
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Kembali ke Cek Layak
            </button>
            <button
              disabled={!pseudonymHash || aiScoreResult.score < 60}
              onClick={handleExecuteDisbursement}
              className="cursor-pointer rounded-xl bg-sky-600 px-6 py-2.5 font-bold text-white shadow-xs transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Simpan &amp; Catat Penyaluran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
