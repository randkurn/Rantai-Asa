import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(71,158,206,0.18)] py-8 px-4 text-[#9fb8c9] text-xs">
      <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo-rantaiasa.png" alt="RantaiAsa" className="h-6 w-auto object-contain" />
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span>Tim LFT, Universitas Pendidikan Indonesia</span>
        </div>
        <div>
          <span>Hacksphere 2026 · Kategori National · Polygon Amoy (80002)</span>
        </div>
      </div>
    </footer>
  );
}