import React, { useState, useEffect, Suspense, lazy } from "react";
import { useTheme } from "../hooks/useTheme.js";

const JabarMap = lazy(() => import("./JabarMap.jsx"));

const METRICS = [
  {
    key: "poor",
    button: "Warga Miskin",
    title: "Jumlah Warga Kurang Mampu",
    desc: "Total warga yang hidup di bawah garis kemiskinan.",
  },
  {
    key: "p2",
    button: "Tingkat Urgensi",
    title: "Tingkat Urgensi Bantuan",
    desc: "Seberapa berat ketimpangan ekonomi warga di wilayah ini.",
  },
  {
    key: "p1",
    button: "Jarak Layak",
    title: "Jarak ke Hidup Layak",
    desc: "Seberapa jauh penghasilan warga dari standar hidup layak.",
  },
  {
    key: "trend",
    button: "Tren 3 Tahun",
    title: "Perubahan 3 Tahun Terakhir",
    desc: "Menunjukkan apakah kondisi kemiskinan membaik atau naik.",
  },
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
  const { isDark } = useTheme();
  const [typedText, setTypedText] = useState("");
  const tagline =
    "Wujudkan bantuan sosial yang transparan dan bebas penerima ganda";

  // Warna target gradasi mengikuti tema aktif (#050f18 di mode gelap, #ffffff di mode terang)
  const fadeRgb = isDark ? "5, 15, 24" : "255, 255, 255";

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
    if (mapMetric === "poor") {
      const total = Number(activeRegion.penduduk_miskin_k || 401.8);
      return `${total.toLocaleString("id-ID")} ribu jiwa`;
    }
    if (mapMetric === "p1") {
      const val = activeRegion.p1_terkini ?? 0.97;
      if (val >= 1.5) return "Sangat Jauh dari Layak";
      if (val >= 1.0) return "Cukup Jauh dari Layak";
      return "Mendekati Layak";
    }
    if (mapMetric === "trend") {
      const val = activeRegion.tren ?? -0.22;
      if (val <= -0.25) return "Membaik Pesat";
      if (val <= -0.15) return "Mulai Membaik";
      return "Penurunan Melambat";
    }
    // Untuk tab "Tingkat Urgensi" (p2)
    const val = activeRegion.p2_terkini ?? 0.23;
    if (val >= 0.4) return "Prioritas Sangat Tinggi";
    if (val >= 0.3) return "Prioritas Tinggi";
    if (val >= 0.2) return "Prioritas Sedang";
    return "Prioritas Rendah";
  };

  return (
    <section
      id="top"
      className="hero-section relative overflow-hidden bg-[radial-gradient(ellipse_70%_90%_at_50%_0%,rgba(71,158,206,0.45),transparent_70%),linear-gradient(180deg,#0b2a40,#050f18)] px-4 pt-24 pb-36 text-center"
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/50 bg-sky-950/40 px-4 py-1.5 text-xs"
          style={{
            color: "#e0f2fe",
            textShadow: "0 1px 3px rgba(0,0,0,.65)",
          }}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span style={{ color: "#f0f9ff", fontWeight: 700 }}>
            Pengawasan Bantuan Sosial Jawa Barat yang Terbuka untuk Publik
          </span>
        </div>

        <h1
          className="font-heading my-3 text-4xl font-extrabold leading-none tracking-wider sm:text-5xl lg:text-6xl"
          style={{
            color: "#ffffff",
            textShadow:
              "0 2px 8px rgba(0,0,0,0.55), 0 8px 32px rgba(71,158,206,0.65)",
          }}
        >
          RantaiAsa
        </h1>

        <p
          className="mb-4 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
          style={{
            color: "#dbeafe",
            textShadow: "0 2px 8px rgba(0,0,0,.85)",
          }}
        >
          SISTEM PENGAWASAN &amp; PENCEGAH PENERIMA GANDA BANTUAN SOSIAL
        </p>

        {/* Peta Interaktif Jawa Barat */}
        <div
          id="jabar-map-wrapper"
          className="relative mx-auto mb-8 w-full max-w-4xl overflow-hidden rounded-2xl text-left"
          style={{
            background: "transparent",
            border: "none",
            boxShadow: "none",
            isolation: "isolate",
            zIndex: 1,
          }}
        >
          <style>{`
            #jabar-map-wrapper,
            #jabar-map-wrapper > div,
            #jabar-map-wrapper .leaflet-container {
              background: transparent !important;
              background-color: transparent !important;
              box-shadow: none !important;
            }
          `}</style>

          <Suspense
            fallback={
              <div className="flex h-[420px] items-center justify-center text-xs text-slate-300">
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
          <div className="pointer-events-none absolute top-3 left-3 z-10 max-w-[230px] rounded-xl border border-sky-400/30 bg-[#050f18]/85 p-3 text-xs shadow-lg backdrop-blur-md">
            <small className="block font-mono text-[10px] text-sky-300">
              {currentMetric.title}
            </small>
            <span className="mt-0.5 block truncate text-sm font-bold text-white">
              {activeRegion.nama}
            </span>
            <b className="font-heading mt-1 block text-lg font-extrabold text-[#479ece]">
              {getMetricValue()}
            </b>
            <p className="mt-1 text-[11px] text-slate-300">
              Total warga miskin:{" "}
              <strong className="text-white">
                {Number(activeRegion.penduduk_miskin_k || 0).toLocaleString(
                  "id-ID",
                )}{" "}
                ribu jiwa
              </strong>
            </p>
          </div>

          {/* Pilihan Tampilan Peta (Kanan Atas) */}
          <div className="absolute top-3 right-3 z-10 flex flex-wrap gap-1 rounded-xl border border-sky-400/30 bg-[#050f18]/85 p-1.5 shadow-lg backdrop-blur-md">
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
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden rounded-xl border border-sky-400/30 bg-[#050f18]/85 px-3 py-2 text-xs shadow-lg backdrop-blur-md sm:block">
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
        <div
          className="font-heading type-cursor flex min-h-[30px] items-center justify-center gap-1 text-lg font-bold sm:text-xl"
          style={{
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0,0,0,.8)",
          }}
        >
          {typedText}
        </div>

        {/* Tombol Utama */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#alur"
            className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            style={{ color: "#f8fafc", borderColor: "rgba(255,255,255,.45)" }}
          >
            Cara Kerja
          </a>
          <a
            href="#ledger"
            className="cursor-pointer rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            style={{
              color: "#ffffff",
              textShadow: "0 1px 3px rgba(0,0,0,.45)",
            }}
          >
            Lihat Riwayat Penyaluran
          </a>
        </div>
      </div>

      {/* Gradasi pudar bertahap di batas bawah HeroSection */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 transition-all duration-300"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(${fadeRgb}, 0) 0%,
            rgba(${fadeRgb}, 0.08) 25%,
            rgba(${fadeRgb}, 0.28) 50%,
            rgba(${fadeRgb}, 0.62) 75%,
            rgba(${fadeRgb}, 0.88) 90%,
            rgba(${fadeRgb}, 1) 100%
          )`,
        }}
      />
    </section>
  );
}
