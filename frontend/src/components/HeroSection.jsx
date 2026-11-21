import React, { useState, useEffect, Suspense, lazy } from "react";

const JabarMap = lazy(() => import("./JabarMap.jsx"));

const METRICS = [
  { key: "p2", button: "Tingkat Parah", title: "Tingkat Keparahan Kemiskinan" },
  { key: "p1", button: "Kedalaman", title: "Tingkat Kedalaman Kemiskinan" },
  { key: "trend", button: "Perubahan", title: "Perubahan 3 Tahun Terakhir" },
  { key: "poor", button: "Warga Miskin", title: "Jumlah Warga Kurang Mampu" },
];

export default function HeroSection({
  enrichedRegions,
  selectedRegionCode,
  onSelectRegion,
  activeRegion,
  mapMetric,
  setMapMetric,
  onOpenOfficerModal,
}) {
  const [typedText, setTypedText] = useState("");
  const tagline =
    "Wujudkan bantuan sosial yang transparan dan bebas penerima ganda";

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      setTypedText(tagline.slice(0, idx++));
      if (idx > tagline.length) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, []);

  const currentMetric = METRICS.find((m) => m.key === mapMetric) || METRICS[0];

  const getMetricValue = () => {
    if (mapMetric === "p1")
      return activeRegion.p1_terkini?.toFixed(3) ?? "0.970";
    if (mapMetric === "trend") {
      const val = activeRegion.tren ?? -0.22;
      return val > 0 ? `+${val.toFixed(3)}` : val.toFixed(3);
    }
    if (mapMetric === "poor") {
      const total = Number(activeRegion.penduduk_miskin_k || 401.8);
      return `${total.toLocaleString("id-ID")} ribu jiwa`;
    }
    return activeRegion.p2_terkini?.toFixed(3) ?? "0.230";
  };

  return (
    <section
      id="top"
      className="relative bg-[radial-gradient(ellipse_70%_90%_at_50%_0%,rgba(71,158,206,0.45),transparent_70%),linear-gradient(180deg,#0b2a40,#050f18)] px-4 pt-8 pb-16 text-center"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/15 px-4 py-1.5 text-xs text-sky-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>
            Pengawasan Bantuan Sosial Jawa Barat yang Terbuka untuk Publik
          </span>
        </div>

        <h1 className="font-heading my-3 text-5xl font-extrabold leading-none tracking-wider text-white drop-shadow-[0_8px_30px_rgba(71,158,206,0.4)] sm:text-7xl lg:text-8xl">
          RantaiAsa
        </h1>

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:text-sm">
          SISTEM PENGAWASAN &amp; PENCEGAH PENERIMA GANDA BANTUAN SOSIAL
        </p>

        {/* Peta Interaktif Jawa Barat */}
        <div className="relative mx-auto mb-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-sky-400/30 bg-[#07131d] text-left shadow-2xl">
          <Suspense
            fallback={
              <div className="flex h-[380px] items-center justify-center text-xs text-slate-300">
                Memuat peta wilayah Jawa Barat...
              </div>
            }
          >
            <JabarMap
              regionStats={enrichedRegions}
              selectedRegion={selectedRegionCode}
              onSelectRegion={(reg) => onSelectRegion(reg.kode)}
              metric={mapMetric}
            />
          </Suspense>

          {/* Info Wilayah Terpilih (Kiri Atas) */}
          <div className="pointer-events-none absolute top-3 left-3 z-[500] min-w-[180px] rounded-xl border border-sky-400/30 bg-[#050f18]/85 p-3 text-xs shadow-lg backdrop-blur-md">
            <small className="block font-mono text-[10px] text-slate-300">
              {currentMetric.title}
            </small>
            <span className="mt-0.5 block max-w-[190px] truncate text-sm font-semibold text-white">
              {activeRegion.nama}
            </span>
            <b className="font-heading mt-0.5 block text-xl font-extrabold text-[#479ece]">
              {getMetricValue()}
            </b>
          </div>

          {/* Pilihan Tampilan Peta (Kanan Atas) */}
          <div className="absolute top-3 right-3 z-[500] flex flex-wrap gap-1 rounded-xl border border-sky-400/30 bg-[#050f18]/85 p-1.5 shadow-lg backdrop-blur-md">
            {METRICS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMapMetric(item.key)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  mapMetric === item.key
                    ? "bg-[#479ece] font-bold text-[#04121c]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.button}
              </button>
            ))}
          </div>

          {/* Keterangan Warna Peta (Kiri Bawah) */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-[500] hidden rounded-xl border border-sky-400/30 bg-[#050f18]/85 px-3 py-2 text-xs shadow-lg backdrop-blur-md sm:block">
            <small className="block text-[10.5px] text-slate-300">
              Tingkat Kebutuhan Bantuan Wilayah
            </small>
            <div className="my-1.5 h-2 w-36 rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500" />
            <div className="flex justify-between font-mono text-[10px] text-slate-300">
              <span>Rendah (Hijau)</span>
              <span>Tinggi (Merah)</span>
            </div>
          </div>
        </div>

        {/* Tagline Animasi */}
        <div className="font-heading type-cursor flex min-h-[30px] items-center justify-center gap-1 text-lg font-semibold text-white sm:text-xl">
          {typedText}
        </div>

        {/* Tombol Utama */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#ledger"
            className="cursor-pointer rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            Lihat Riwayat Penyaluran
          </a>
          <a
            href="#alur"
            className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cara Kerja
          </a>
          <button
            type="button"
            onClick={onOpenOfficerModal}
            className="cursor-pointer rounded-xl border border-sky-400/35 bg-sky-400/15 px-5 py-2.5 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/25"
          >
            Coba Cek Kelayakan Penerima
          </button>
        </div>
      </div>
    </section>
  );
}
