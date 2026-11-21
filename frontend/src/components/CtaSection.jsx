import React from "react";

export default function CtaSection({ onOpenOfficerModal }) {
  return (
    <section className="py-20 px-4 text-center bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(71,158,206,0.32),transparent_70%),#050f18]">
      <div className="max-w-[640px] mx-auto space-y-4">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
          Siap membuat bantuan sosial yang bisa diaudit siapa saja?
        </h2>
        <p className="text-[#9fb8c9] text-sm leading-relaxed">
          Mulai dari satu kecamatan, satu kohort PKH, lalu perluas ke PKH, BPNT, dan bantuan beras di seluruh 27 Kabupaten/Kota Jawa Barat.
        </p>
        <div className="pt-2">
          <button
            onClick={onOpenOfficerModal}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#479ece] to-[#2c7fb0] hover:brightness-110 shadow-[0_10px_30px_rgba(71,158,206,0.35)] transition cursor-pointer"
          >
            Buka Portal Verifikasi Petugas
          </button>
        </div>
      </div>
    </section>
  );
}