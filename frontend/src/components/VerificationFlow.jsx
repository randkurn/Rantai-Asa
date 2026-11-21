import React from "react";
import { CONTRACTS, formatIDR, shortHex } from "../constants/auditData.js";

export default function VerificationFlow({
  totalRegistered,
  totalDisbursed,
  totalRejected,
  totalSimulatedAid,
}) {
  return (
    <section id="alur" className="py-20 px-4 bg-[#0a1b2a]">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(71,158,206,0.14)] border border-[rgba(71,158,206,0.28)] text-xs text-[#d6ecf8]">
            Alur Verifikasi
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-3.5 mb-2.5 leading-tight">
            Dari pendaftaran hingga <em className="text-[#479ece] not-italic">ledger publik</em>
          </h2>
          <p className="text-[#9fb8c9] text-sm">
            Tiga gerbang verifikasi harus lolos sebelum satu penyaluran dicatat permanen on-chain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kiri: Flow Diagram Interaktif */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#479ece]/20 text-[#479ece] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" />
                </svg>
              </div>
              <div>
                <b className="text-xs sm:text-sm text-white block">1. Petugas Mengajukan Registrasi</b>
                <small className="text-[#9fb8c9] text-[11px]">Autentikasi dompet petugas lapangan (MetaMask / Ethers.js)</small>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#479ece] flex items-center gap-3 shadow-[0_0_15px_rgba(71,158,206,0.2)]">
              <div className="w-8 h-8 rounded-lg bg-[#479ece] text-[#050f18] flex items-center justify-center shrink-0 font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
                </svg>
              </div>
              <div>
                <b className="text-xs sm:text-sm text-white block">2. IdentityRegistry (On-Chain Check)</b>
                <small className="text-[#9fb8c9] text-[11px]">Verifikasi keunikan hash NIK pada periode bersangkutan</small>
              </div>
            </div>

            <div className="ml-7 p-2.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff8a8a] shrink-0"></span>
              <span><strong>Ditolak: Duplikat</strong> — Revert transaksi jika hash sudah terdaftar</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#479ece]/20 text-[#479ece] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V9M10 19V5M16 19v-8M22 19H2" />
                </svg>
              </div>
              <div>
                <b className="text-xs sm:text-sm text-white block">3. Skor Kebutuhan AI (FastAPI Multidimensi)</b>
                <small className="text-[#9fb8c9] text-[11px]">Model scikit-learn evaluasi 14 fitur (P2, GK, hunian, disabilitas, ASN)</small>
              </div>
            </div>

            <div className="ml-7 p-2.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff8a8a] shrink-0"></span>
              <span><strong>Ditolak: Di Bawah Ambang</strong> — Skor &lt; 60 tidak dapat dieksekusi penyaluran</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#479ece] flex items-center gap-3 shadow-[0_0_15px_rgba(71,158,206,0.2)]">
              <div className="w-8 h-8 rounded-lg bg-[#479ece] text-[#050f18] flex items-center justify-center shrink-0 font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12M7 10l5 5 5-5M4 21h16" />
                </svg>
              </div>
              <div>
                <b className="text-xs sm:text-sm text-white block">4. AidDisbursement (On-Chain Event)</b>
                <small className="text-[#9fb8c9] text-[11px]">Oracle meng-attest skor, event AidDisbursed dipancarkan permanen</small>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#479ece]/20 text-[#479ece] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 14h8" />
                </svg>
              </div>
              <div>
                <b className="text-xs sm:text-sm text-white block">5. Dashboard Audit Publik Terverifikasi</b>
                <small className="text-[#9fb8c9] text-[11px]">Muncul di ledger real-time dengan link transaksi explorer</small>
              </div>
            </div>
          </div>

          {/* Kanan: 4 Kartu KPI & Info Security */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] text-center">
                <b className="font-heading font-extrabold text-2xl sm:text-3xl text-[#479ece] block">
                  {totalRegistered.toLocaleString("id-ID")}
                </b>
                <span className="text-xs text-[#9fb8c9] mt-1 block">Penerima terdaftar</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] text-center">
                <b className="font-heading font-extrabold text-2xl sm:text-3xl text-[#5fd7a0] block">
                  {totalDisbursed.toLocaleString("id-ID")}
                </b>
                <span className="text-xs text-[#9fb8c9] mt-1 block">Penyaluran tercatat</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] text-center">
                <b className="font-heading font-extrabold text-2xl sm:text-3xl text-[#ff8a8a] block">
                  {totalRejected.toLocaleString("id-ID")}
                </b>
                <span className="text-xs text-[#9fb8c9] mt-1 block">Duplikat ditolak</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] text-center">
                <b className="font-heading font-extrabold text-xl sm:text-2xl text-[#bfe6f8] block">
                  {formatIDR(totalSimulatedAid)}
                </b>
                <span className="text-xs text-[#9fb8c9] mt-1 block">Dana tersalurkan</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] space-y-2">
              <h3 className="font-heading font-bold text-sm text-white">Jaringan &amp; Keamanan Data</h3>
              <p className="text-xs text-[#9fb8c9] leading-relaxed">
                Polygon Amoy Testnet (Chain ID 80002). Hanya hash NIK <code className="text-[#bfe3f6] font-mono">bytes32</code> yang disimpan on-chain, tanpa identitas pribadi mentah (PII).
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[rgba(71,158,206,0.15)] text-[#479ece] border border-[rgba(71,158,206,0.3)]">
                  IdentityRegistry: {shortHex(CONTRACTS.IdentityRegistry)}
                </span>
                <span className="px-2 py-0.5 rounded bg-[rgba(71,158,206,0.15)] text-[#5fd7a0] border border-[rgba(71,158,206,0.3)]">
                  AidDisbursement: {shortHex(CONTRACTS.AidDisbursement)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}