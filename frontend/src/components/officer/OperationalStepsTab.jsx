import React from "react";
import { REGION_NAMES } from "../../geoConfig.js";
import { formatIDR, shortHex } from "../../constants/auditData.js";

export default function OperationalStepsTab({
  activeMenu,
  setActiveMenu,
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
  const programAmount = selectedProgram.startsWith("PKH")
    ? 750000
    : selectedProgram.startsWith("BPNT")
      ? 600000
      : 300000;

  return (
    <>
      {/* 1. PENDAFTARAN WARGA BARU */}
      {activeMenu === "registrasi" && (
        <div className="max-w-3xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-6">
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Pendaftaran Penerima Bantuan
              </h2>
              <p className="text-xs text-slate-500">
                Sistem akan mengamankan NIK warga menjadi kode acak sehingga
                identitas asli tetap terlindungi.
              </p>
            </div>

            <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900">
              <strong>Jaminan Privasi Warga:</strong> NIK 16 digit asli hanya
              diproses sementara di perangkat petugas untuk dicek keunikannya
              dan tidak pernah dibagikan ke pihak luar.
            </div>

            <form
              onSubmit={handleGeneratePseudonym}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Nomor Induk Kependudukan (NIK)
                  </label>
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
                  <label className="mb-1 block font-semibold text-slate-700">
                    Kabupaten/Kota (Jawa Barat)
                  </label>
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
                  <label className="mb-1 block font-semibold text-slate-700">
                    Pilihan Program Bantuan
                  </label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
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
                  <label className="mb-1 block font-semibold text-slate-700">
                    Periode Bantuan
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Tahap 1 - Tahun 2026"
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-slate-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isHashing}
                  className="cursor-pointer rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-sky-700 disabled:opacity-50"
                >
                  {isHashing
                    ? "Mengamankan NIK..."
                    : "Amankan NIK & Buat Kode Acak"}
                </button>
              </div>
            </form>

            {pseudonymHash && (
              <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <span className="font-mono text-[10px] font-bold uppercase text-sky-700">
                  Kode Identitas Acak Warga:
                </span>
                <p className="mt-1 break-all font-mono text-xs font-bold text-slate-900">
                  {pseudonymHash}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setActiveMenu("verifikasi")}
                    className="cursor-pointer rounded-lg bg-sky-600 px-3.5 py-1.5 font-semibold text-white shadow-xs hover:bg-sky-700"
                  >
                    Lanjut ke Pengecekan Penerima Ganda →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CEK PENERIMA GANDA */}
      {activeMenu === "verifikasi" && (
        <div className="max-w-3xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-6">
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Pemeriksaan Pencegah Penerima Ganda
              </h2>
              <p className="text-xs text-slate-500">
                Sistem otomatis mencocokkan kode acak ke buku digital bersama
                untuk memastikan warga belum menerima bansos periode ini.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Kode Acak Warga yang Akan Dicek
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
                Periksa Keaslian &amp; Duplikasi
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
                      ? "✓ Pemeriksaan Bersih"
                      : "✕ Terdeteksi Duplikat"}
                  </div>
                  <p className="mt-1 leading-relaxed">
                    {verificationFeedback.message}
                  </p>
                  {verificationFeedback.status === "VALID" && (
                    <button
                      onClick={() => setActiveMenu("penilaian-ai")}
                      className="mt-3 cursor-pointer rounded-lg bg-emerald-600 px-3.5 py-1.5 font-semibold text-white shadow-xs hover:bg-emerald-700"
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

      {/* 3. PENILAIAN KELAYAKAN SKOR */}
      {activeMenu === "penilaian-ai" && (
        <div className="max-w-4xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  Penilaian Skor Kelayakan
                </h2>
                <p className="text-xs text-slate-500">
                  Menggunakan standar resmi BPS Jawa Barat untuk menilai tingkat
                  kerentanan keluarga secara adil.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
                Model Penilai: Otomatis
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 text-xs md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Jumlah Anggota Keluarga:{" "}
                    <span className="font-bold text-sky-600">
                      {aiForm.household_size} Orang
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={aiForm.household_size}
                    onChange={(e) =>
                      setAiForm({ ...aiForm, household_size: e.target.value })
                    }
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Tingkat Pengeluaran Keluarga
                  </label>
                  <select
                    value={aiForm.income_per_capita_band}
                    onChange={(e) =>
                      setAiForm({
                        ...aiForm,
                        income_per_capita_band: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900"
                  >
                    <option value="1">
                      Kategori 1 (Sangat Rendah di Bawah Garis Kemiskinan)
                    </option>
                    <option value="2">
                      Kategori 2 (Pas-pasan Mendekati Garis Kemiskinan)
                    </option>
                    <option value="3">Kategori 3 (Menengah Cukup)</option>
                    <option value="4">Kategori 4 (Mampu / Sejahtera)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Kondisi Rumah Tempat Tinggal
                  </label>
                  <select
                    value={aiForm.housing_quality}
                    onChange={(e) =>
                      setAiForm({ ...aiForm, housing_quality: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900"
                  >
                    <option value="1">
                      Lantai Tanah / Dinding Bambu / Belum Ada Jamban Sendiri
                    </option>
                    <option value="2">
                      Semi Permanen / Kamar Mandi Bersama
                    </option>
                    <option value="3">Permanen Layak Huni</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex cursor-pointer items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={aiForm.has_disabled_or_elderly}
                      onChange={(e) =>
                        setAiForm({
                          ...aiForm,
                          has_disabled_or_elderly: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded accent-sky-600"
                    />
                    <span>
                      Ada Anggota Keluarga Rentan (Lansia / Disabilitas)
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={aiForm.head_unemployed}
                      onChange={(e) =>
                        setAiForm({
                          ...aiForm,
                          head_unemployed: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded accent-sky-600"
                    />
                    <span>
                      Kepala Keluarga Belum Bekerja Tetap / Menganggur
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 font-semibold text-rose-700">
                    <input
                      type="checkbox"
                      checked={aiForm.is_civil_servant_or_security}
                      onChange={(e) =>
                        setAiForm({
                          ...aiForm,
                          is_civil_servant_or_security: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded accent-rose-600"
                    />
                    <span>
                      Anggota Keluarga Merupakan ASN / TNI / Polri (Otomatis
                      Tidak Berhak)
                    </span>
                  </label>
                </div>
              </div>

              {/* Kartu Skor Hasil Penilaian */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
                <div>
                  <span className="text-xs font-semibold text-slate-500">
                    Nilai Kelayakan Bantuan:
                  </span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-heading text-6xl font-extrabold text-slate-900">
                      {isScoring ? "..." : aiScoreResult.score}
                    </span>
                    <span className="font-mono font-bold text-slate-500">
                      / 100
                    </span>
                    <span
                      className={`ml-3 rounded-full border px-3 py-1 font-mono text-xs font-bold ${
                        aiScoreResult.label === "LAYAK"
                          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                          : "border-rose-200 bg-rose-100 text-rose-800"
                      }`}
                    >
                      {aiScoreResult.label}
                    </span>
                  </div>

                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Faktor Utama yang Mempengaruhi:
                    </span>
                    <div className="mt-2 space-y-1.5 text-xs">
                      {aiScoreResult.factors.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-2xs"
                        >
                          <span
                            className={
                              f.impact === "+"
                                ? "text-sm font-bold text-emerald-700"
                                : "text-sm font-bold text-rose-700"
                            }
                          >
                            {f.impact}
                          </span>
                          <span className="font-medium text-slate-700">
                            {f.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="mb-3 text-[11px] text-slate-500">
                    Syarat penyaluran: Warga berhak menerima jika nilai
                    kelayakan &ge; 60.
                  </p>
                  <button
                    disabled={aiScoreResult.score < 60}
                    onClick={() => setActiveMenu("penyaluran")}
                    className="w-full cursor-pointer rounded-xl bg-sky-600 py-2.5 font-bold text-white shadow-xs hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Lanjut ke Penyaluran Bantuan →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PENYALURAN BANTUAN */}
      {activeMenu === "penyaluran" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-6">
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Serahkan &amp; Catat Penyaluran
              </h2>
              <p className="text-xs text-slate-500">
                Penyaluran ini akan dicatat ke buku digital terpadu agar tidak
                dapat diubah atau disalahgunakan.
              </p>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Wilayah Target:</span>
                <span className="font-semibold text-slate-800">
                  {selectedRegion} - {REGION_NAMES[parseInt(selectedRegion)]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Program Bansos:</span>
                <span className="font-semibold text-slate-800">
                  {selectedProgram}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal yang Diserahkan:</span>
                <span className="font-heading text-sm font-bold text-sky-700">
                  {formatIDR(programAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kode Identitas Acak:</span>
                <span className="font-mono text-[11px] font-bold text-slate-700">
                  {pseudonymHash ? shortHex(pseudonymHash) : "Belum dibuat"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Petugas yang Bertanggung Jawab:
                </span>
                <span className="font-semibold text-slate-800">
                  {officer?.name || "Budi Santoso, S.STP"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                disabled={!pseudonymHash || aiScoreResult.score < 60}
                onClick={handleExecuteDisbursement}
                className="cursor-pointer rounded-xl bg-sky-600 px-6 py-3 font-bold text-white shadow-xs hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Simpan Bukti Penyaluran
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
