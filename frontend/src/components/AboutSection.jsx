import React from "react";

export default function AboutSection({ aiModelVersion }) {
  return (
    <section id="tentang" className="py-20 px-4">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(71,158,206,0.14)] border border-[rgba(71,158,206,0.28)] text-xs text-[#d6ecf8]">
            Tentang RantaiAsa
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-3.5 mb-2.5 leading-tight">
            Bukti publik bahwa bantuan <em className="text-[#479ece] not-italic">sampai sekali</em> ke orang yang tepat
          </h2>
          <p className="text-[#9fb8c9] text-sm leading-relaxed">
            Setiap penyaluran tercatat di blockchain Polygon Amoy. Siapa pun bisa memeriksanya tanpa izin dan tanpa login.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4 text-sm text-[#9fb8c9] leading-relaxed">
            <h3 className="font-heading font-bold text-xl text-white">Mengapa perlu lapisan audit independen?</h3>
            <p>
              Pada 2021 Kemensos menonaktifkan 21.000.156 data ganda DTKS. Data terpusat rentan diubah oleh pemegang hak tulis. RantaiAsa mengamankan hash NIK secara terdesentralisasi, bukan NIK mentah, sehingga duplikasi langsung ditolak oleh kontrak pintar secara matematis.
            </p>
            <ul className="space-y-2.5 pt-2 text-xs text-white">
              <li className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full border border-[#479ece] text-[#479ece] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                <span>Duplikasi ditolak otomatis oleh IdentityRegistry.sol</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full border border-[#479ece] text-[#479ece] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                <span>Skor kelayakan AI multidimensi BPS Jawa Barat ({aiModelVersion})</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full border border-[#479ece] text-[#479ece] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                <span>Setiap transaksi bisa dicek di block explorer secara independen</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full border border-[#479ece] text-[#479ece] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                <span>Zero raw NIK di blockchain (HMAC-SHA256 volatile memory)</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] shadow-lg hover:border-[#479ece]/50 transition">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#479ece] to-[#2c7fb0] flex items-center justify-center text-white mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-base text-white">Anti-duplikasi</h3>
              <p className="text-xs text-[#9fb8c9] mt-1">Hash NIK yang sama ditolak oleh smart contract bila terdaftar pada periode berjalan.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] shadow-lg hover:border-[#479ece]/50 transition">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#479ece] to-[#2c7fb0] flex items-center justify-center text-white mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-base text-white">Transparan</h3>
              <p className="text-xs text-[#9fb8c9] mt-1">Ledger terbuka untuk warga, LSM, jurnalis investigasi, dan Ombudsman RI tanpa izin khusus.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] shadow-lg hover:border-[#479ece]/50 transition">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#479ece] to-[#2c7fb0] flex items-center justify-center text-white mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V9M10 19V5M16 19v-8M22 19H2" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-base text-white">Skor AI Multidimensi</h3>
              <p className="text-xs text-[#9fb8c9] mt-1">14 Indikator kemiskinan multidimensi BPS Jabar menentukan kelayakan (Ambang batas ≥ 60).</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] shadow-lg hover:border-[#479ece]/50 transition">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#479ece] to-[#2c7fb0] flex items-center justify-center text-white mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-base text-white">Tak Bisa Diubah</h3>
              <p className="text-xs text-[#9fb8c9] mt-1">Koreksi hanya dapat dilakukan lewat transaksi baru on-chain yang ikut terekam abadi.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}