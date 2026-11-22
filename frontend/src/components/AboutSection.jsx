import React from "react";

const BENEFITS = [
  "Langsung menolak jika ada orang yang mendaftar bantuan dua kali di periode yang sama",
  "Menilai kelayakan penerima dari 9 indikator rumah tangga dan 5 indikator wilayah BPS Jawa Barat",
  "Semua bukti penyaluran bisa dicek langsung oleh masyarakat tanpa perlu mendaftar akun",
  "Nomor KTP (NIK) warga disamarkan menjadi kode acak agar data pribadi tetap aman",
];

const FEATURES = [
  {
    title: "Satu Nama Satu Bantuan",
    desc: "Sistem otomatis mengunci data penerima yang sudah cair, sehingga tidak bisa diajukan lagi pada periode yang sama.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"
      />
    ),
  },
  {
    title: "Bisa Diawasi Bersama",
    desc: "Warga, relawan, maupun media bisa ikut memantau setiap bantuan yang keluar kapan saja tanpa perlu izin khusus.",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
        />
      </>
    ),
  },
  {
    title: "Bantuan Tepat Sasaran",
    desc: "Menggabungkan 9 indikator keluarga dengan 5 indikator makro BPS Jawa Barat agar bantuan jatuh ke yang membutuhkan.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19V9M10 19V5M16 19v-8M22 19H2"
      />
    ),
  },
  {
    title: "Catatan Tidak Bisa Diubah",
    desc: "Sekali bantuan tercatat cair, datanya terkunci permanen dan tidak bisa dihapus atau diedit diam-diam oleh siapa pun.",
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  },
];

export default function AboutSection({ aiModelVersion }) {
  return (
    <section id="tentang" className="px-4 pt-8 pb-20">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading mt-3.5 mb-2.5 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Memastikan bantuan{" "}
            <em className="not-italic text-[#479ece]">cair sekali</em> ke
            keluarga yang benar-benar berhak
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Setiap bantuan yang disalurkan tercatat rapi di papan pengumuman
            yang terkunci permanen. Siapa saja bisa mengeceknya tanpa perlu
            login.
          </p>
        </div>

        {/* Konten Utama */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Penjelasan Kiri */}
          <div className="space-y-4 text-sm leading-relaxed text-slate-300 lg:col-span-5">
            <h3 className="font-heading text-xl font-bold text-white">
              Kenapa penyaluran bansos perlu diawasi bersama?
            </h3>
            <p>
              Pada tahun 2021, Kementerian Sosial menemukan lebih dari{" "}
              <strong>
                21 juta data penerima yang masuk lebih dari satu kali
              </strong>
              . Sistem biasa masih bisa diakali dengan memasukkan nama yang
              sama. Di RantaiAsa, nomor KTP disamarkan menjadi kode permanen
              agar bantuan tidak pernah cair dua kali ke orang yang sama.
            </p>

            <ul className="space-y-2.5 pt-2 text-xs text-white">
              {BENEFITS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#479ece] text-[10px] font-bold text-[#479ece]">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4 Kartu Fitur Kanan */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-sky-400/20 bg-white/[0.04] p-5 shadow-lg transition hover:border-sky-400/50"
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#479ece] to-[#2c7fb0] !text-white"
                  style={{ color: "#ffffff" }}
                >
                  <svg
                    className="h-5 w-5 !text-white"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    {feat.icon}
                  </svg>
                </div>
                <h3 className="font-heading text-base font-bold text-white">
                  {feat.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
