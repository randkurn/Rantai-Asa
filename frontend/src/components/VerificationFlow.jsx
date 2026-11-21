import React from "react";
import { CONTRACTS, formatIDR, shortHex } from "../constants/auditData.js";

export default function VerificationFlow({
  totalRegistered,
  totalDisbursed,
  totalRejected,
  totalSimulatedAid,
}) {
  return (
    <section id="alur" className="bg-[#0a1b2a] px-4 py-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="mx-auto mb-12 max-w-[680px] text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(71,158,206,0.28)] bg-[rgba(71,158,206,0.14)] px-3 py-1 text-xs">
            Alur Pemeriksaan
          </span>
          <h2 className="font-heading mt-3.5 mb-2.5 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Dari pendataan warga hingga{" "}
            <em className="not-italic text-[#479ece]">
              bantuan cair secara transparan
            </em>
          </h2>
          <p className="text-sm text-[#9fb8c9]">
            Setiap calon penerima wajib melewati tiga tahap pemeriksaan sebelum
            bantuan dicairkan dan dicatat secara permanen.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Kiri: Alur Pemeriksaan */}
          <div className="space-y-2.5 lg:col-span-7">
            <div className="flex items-center gap-3 rounded-xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#479ece]/20 text-[#479ece]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="6" width="18" height="13" rx="2" />
                  <path d="M3 10h18" />
                </svg>
              </div>
              <div>
                <b className="block text-xs text-white sm:text-sm">
                  1. Petugas Mengajukan Data Warga
                </b>
                <small className="text-[11px] text-[#9fb8c9]">
                  Petugas lapangan masuk dengan akun resmi yang terverifikasi
                </small>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#479ece] bg-white/[0.04] p-3.5 shadow-[0_0_15px_rgba(71,158,206,0.2)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#479ece] font-bold text-[#050f18]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"
                  />
                </svg>
              </div>
              <div>
                <b className="block text-xs text-white sm:text-sm">
                  2. Cek Riwayat Penerima
                </b>
                <small className="text-[11px] text-[#9fb8c9]">
                  Memastikan kode identitas warga belum pernah menerima bantuan
                  di periode ini
                </small>
              </div>
            </div>

            <div className="ml-7 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/[0.08] p-2.5 text-xs text-rose-300">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff8a8a]" />
              <span>
                <strong>Ditolak Otomatis</strong> — Proses dibatalkan jika warga
                sudah tercatat menerima bantuan
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#479ece]/20 text-[#479ece]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 19V9M10 19V5M16 19v-8M22 19H2"
                  />
                </svg>
              </div>
              <div>
                <b className="block text-xs text-white sm:text-sm">
                  3. Penilaian Kelayakan Otomatis
                </b>
                <small className="text-[11px] text-[#9fb8c9]">
                  Menghitung 14 kondisi ekonomi keluarga (pendapatan, tempat
                  tinggal, tanggungan, hingga status pekerjaan)
                </small>
              </div>
            </div>

            <div className="ml-7 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/[0.08] p-2.5 text-xs text-rose-300">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff8a8a]" />
              <span>
                <strong>Ditolak: Belum Memenuhi Syarat</strong> — Nilai
                kelayakan di bawah 60 tidak bisa dicairkan
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#479ece] bg-white/[0.04] p-3.5 shadow-[0_0_15px_rgba(71,158,206,0.2)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#479ece] font-bold text-[#050f18]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v12M7 10l5 5 5-5M4 21h16"
                  />
                </svg>
              </div>
              <div>
                <b className="block text-xs text-white sm:text-sm">
                  4. Pengesahan &amp; Penguncian Data
                </b>
                <small className="text-[11px] text-[#9fb8c9]">
                  Bantuan disahkan dan dikunci secara permanen agar tidak bisa
                  diubah lagi
                </small>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#479ece]/20 text-[#479ece]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 9h18M8 14h8" />
                </svg>
              </div>
              <div>
                <b className="block text-xs text-white sm:text-sm">
                  5. Tampil di Papan Riwayat Publik
                </b>
                <small className="text-[11px] text-[#9fb8c9]">
                  Langsung tercatat secara terbuka lengkap dengan bukti digital
                  yang bisa dicek siapa saja
                </small>
              </div>
            </div>
          </div>

          {/* Kanan: 4 Kartu Statistik & Info Keamanan */}
          <div className="space-y-4 lg:col-span-5">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-4 text-center">
                <b className="font-heading block text-2xl font-extrabold text-[#479ece] sm:text-3xl">
                  {totalRegistered.toLocaleString("id-ID")}
                </b>
                <span className="mt-1 block text-xs text-[#9fb8c9]">
                  Warga terdaftar
                </span>
              </div>

              <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-4 text-center">
                <b className="font-heading block text-2xl font-extrabold text-[#5fd7a0] sm:text-3xl">
                  {totalDisbursed.toLocaleString("id-ID")}
                </b>
                <span className="mt-1 block text-xs text-[#9fb8c9]">
                  Bantuan tersalurkan
                </span>
              </div>

              <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-4 text-center">
                <b className="font-heading block text-2xl font-extrabold text-[#ff8a8a] sm:text-3xl">
                  {totalRejected.toLocaleString("id-ID")}
                </b>
                <span className="mt-1 block text-xs text-[#9fb8c9]">
                  Pengajuan berulang ditolak
                </span>
              </div>

              <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-4 text-center">
                <b className="font-heading block text-xl font-extrabold text-[#bfe6f8] sm:text-2xl">
                  {formatIDR(totalSimulatedAid)}
                </b>
                <span className="mt-1 block text-xs text-[#9fb8c9]">
                  Total dana tersalurkan
                </span>
              </div>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-5">
              <h3 className="font-heading text-sm font-bold text-white">
                Cek Bantuan Tanpa Bocorkan Data Warga
              </h3>
              <p className="text-xs leading-relaxed text-[#9fb8c9]">
                Nomor KTP warga otomatis diubah menjadi kode acak rahasia
                sebelum dicatat. Masyarakat tetap bisa memastikan bantuan sampai
                ke tujuan, tanpa membuka nama, alamat, maupun NIK asli penerima.
              </p>
              <div className="flex flex-wrap gap-2 pt-1.5 font-mono text-[11px]">
                <span
                  title="Alamat sistem pengaman identitas"
                  className="rounded border border-[rgba(71,158,206,0.3)] bg-[rgba(71,158,206,0.15)] px-2.5 py-1 text-[#479ece]"
                >
                  Sistem Kunci NIK: {shortHex(CONTRACTS.IdentityRegistry)}
                </span>
                <span
                  title="Alamat buku catatan penyaluran digital"
                  className="rounded border border-[rgba(71,158,206,0.3)] bg-[rgba(71,158,206,0.15)] px-2.5 py-1 text-[#5fd7a0]"
                >
                  Buku Catatan Digital: {shortHex(CONTRACTS.AidDisbursement)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
