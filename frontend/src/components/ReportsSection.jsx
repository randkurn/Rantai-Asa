import React, { useEffect } from "react";
import ReportModule from "./ReportModule.jsx";

export default function ReportsSection({ isOpen, onClose }) {
  if (!isOpen) return null;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      id="laporan"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-6 w-full max-w-[800px] rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-sky-600">
              Kanal Pengaduan Masyarakat
            </span>
            <h2 id="report-modal-title" className="font-heading text-lg font-bold text-slate-900">
              Modul Pelaporan Warga &amp; Relawan Jabar
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            ✕ Tutup
          </button>
        </div>
        <div className="p-6">
          <ReportModule />
        </div>
      </div>
    </div>
  );
}