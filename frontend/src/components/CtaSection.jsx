import React from "react";
import { useTheme } from "../hooks/useTheme.js";

export default function CtaSection({ onOpenReports }) {
  const { isDark } = useTheme();
  const fadeRgb = isDark ? "10, 27, 42" : "255, 255, 255";

  return (
    <section id="report"
      className="relative overflow-hidden px-4 pt-36 pb-20 text-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 25%, #0d2b42 0%, #071826 62%, #040d15 100%)",
      }}
    >
      {/* Gradasi pudar bertahap di batas atas CtaSection */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 transition-all duration-300"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(${fadeRgb}, 1) 0%,
            rgba(${fadeRgb}, 0.88) 12%,
            rgba(${fadeRgb}, 0.62) 28%,
            rgba(${fadeRgb}, 0.28) 52%,
            rgba(${fadeRgb}, 0.08) 76%,
            rgba(${fadeRgb}, 0) 100%
          )`,
        }}
      />

      <div className="relative z-10 mt-20 mx-auto max-w-[680px]">
        

        <h2
          className="font-heading mt-4 mb-3 text-3xl font-bold leading-tight sm:text-4xl"
          style={{ color: "#ffffff" }}
        >
          Lihat bantuan yang{" "}
          <span style={{ color: "#479ece" }}>tidak tepat sasaran</span> di
          lingkunganmu?
        </h2>

        <p
          className="mx-auto mb-7 max-w-[560px] text-sm leading-relaxed"
          style={{ color: "#9fb8c9" }}
        >
          Jangan diam saja. Sampaikan laporanmu agar penyaluran bantuan sosial
          di Jawa Barat benar-benar diterima oleh keluarga yang berhak.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenReports}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] px-6 py-3 text-sm font-bold shadow-lg shadow-[#479ece]/20 transition hover:brightness-110"
            style={{ color: "#ffffff" }}
          >
            Kirim Laporan Warga
          </button>

          <a
            href="#ledger"
            className="rounded-xl border border-[rgba(71,158,206,0.35)] bg-white/[0.05] px-6 py-3 text-sm font-semibold transition hover:border-[#479ece] hover:bg-[rgba(71,158,206,0.14)]"
            style={{ color: "#ffffff" }}
          >
            Cek Riwayat Penyaluran
          </a>
        </div>
      </div>
    </section>
  );
}
