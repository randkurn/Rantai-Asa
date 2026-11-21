import React from "react";
import ReportModule from "./ReportModule.jsx";

export default function ReportsSection({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <section id="laporan" className="py-12 px-4 bg-[#0a1b2a] border-b border-[rgba(71,158,206,0.18)]">
      <div className="max-w-[800px] mx-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-bold text-[#479ece] uppercase">
              Kanal Pengaduan Masyarakat
            </span>
            <h2 className="text-xl font-bold font-heading text-white">
              Modul Pelaporan Warga &amp; Relawan Jabar
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-white/20 text-xs text-[#9fb8c9] hover:text-white cursor-pointer"
          >
            ✕ Tutup
          </button>
        </div>
        <ReportModule />
      </div>
    </section>
  );
}