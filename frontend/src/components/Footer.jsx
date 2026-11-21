import React from "react";

export default function Footer() {
  return (
    <footer
      className="border-t border-[rgba(71,158,206,0.16)] px-4 py-6 text-xs"
      style={{ backgroundColor: "#040d15" }}
    >
      <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-3 sm:flex-row">
        {/* Kiri: Logo & Identitas Tim */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
          <a href="#" className="inline-flex items-center gap-2 font-bold">
            <svg
              className="h-5 w-5 text-[#479ece]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="font-heading text-base tracking-tight">
              <span style={{ color: "#ffffff" }}>Rantai</span>
              <span style={{ color: "#479ece" }}>Asa</span>
            </span>
          </a>

          <span style={{ color: "rgba(159, 184, 201, 0.35)" }}>|</span>

          <span style={{ color: "#9fb8c9" }}>
            Tim LFT, Universitas Pendidikan Indonesia
          </span>
        </div>

        {/* Kanan: Event & Jaringan */}
        <div className="text-center sm:text-right" style={{ color: "#9fb8c9" }}>
          Hacksphere 2026 &middot; Kategori National
        </div>
      </div>
    </footer>
  );
}
