import React from "react";
import { CONTRACTS, formatIDR, shortHex } from "../constants/auditData.js";

export default function VerificationFlow({
  totalRegistered,
  totalDisbursed,
  totalRejected,
  totalSimulatedAid,
}) {
  return (
    <section id="alur" className="bg-[#0a1b2a] px-4 pt-8 pb-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="mx-auto mb-12 max-w-[680px] text-center">
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
          <div className="space-y-2.5 lg:col-span-6">
            <div className="flex items-center gap-3 rounded-xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-3.5">
              <div>
                <b className="block text-xs text-white sm:text-sm">
                  1. Petugas Mengajukan Data Warga
                </b>
                <small className="text-[11px] text-[#9fb8c9]">
                  Petugas lapangan masuk dengan akun resmi yang terverifikasi
                </small>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[rgba(71,158,206,0.18)]  bg-white/[0.04] p-3.5 ">
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

            <div className="flex items-center gap-3 rounded-xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-3.5">
              <div>
                <b className="block text-xs text-white sm:text-sm">
                  3. Penilaian Kelayakan Otomatis
                </b>
                <small className="text-[11px] text-[#9fb8c9]">
                  Menghitung 9 indikator rumah tangga dan 5 indikator makro
                  wilayah BPS secara otomatis berdasarkan kabupaten/kota
                </small>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[rgba(71,158,206,0.18)]  bg-white/[0.04] p-3.5 ">
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
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-4 text-center">
                <b className="font-heading block text-2xl font-extrabold text-[#479ece] sm:text-3xl">
                  {totalRegistered.toLocaleString("id-ID")}
                </b>
                <span className="mt-1 block text-xs text-[#9fb8c9]">
                  Warga terdaftar
                </span>
              </div>

              <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-4 text-center">
                <b className="font-heading block text-2xl font-extrabold text-[#479ece] sm:text-3xl">
                  {totalDisbursed.toLocaleString("id-ID")}
                </b>
                <span className="mt-1 block text-xs text-[#9fb8c9]">
                  Bantuan tersalurkan
                </span>
              </div>

              <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-4 text-center">
                <b className="font-heading block text-xl font-extrabold text-[#479ece] sm:text-2xl">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
