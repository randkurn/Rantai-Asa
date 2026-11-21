import React from "react";
import { shortHex } from "../constants/auditData.js";

const NAV_LINKS = [
  { href: "#tentang", label: "Tentang" },
  { href: "#alur", label: "Alur" },
  { href: "#wilayah", label: "Wilayah" },
  { href: "#ledger", label: "Riwayat Penyaluran" },
];

export default function Navbar({ activeTab, onToggleReports, wallet, onOpenOfficerModal }) {
  const handleOfficerClick = () => {
    if (!wallet.address) wallet.connect();
    onOpenOfficerModal();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sky-400/20 bg-[#050f18]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="shrink-0">
          <img
            src="/logo-rantaiasa.png"
            alt="RantaiAsa"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onToggleReports}
            className={`cursor-pointer transition ${
              activeTab === "reports" ? "font-bold text-sky-400" : "hover:text-white"
            }`}
          >
            Laporan Warga
          </button>
        </nav>

        <button
          type="button"
          onClick={handleOfficerClick}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:brightness-110 sm:text-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <span>{wallet.address ? shortHex(wallet.address) : "Portal Petugas"}</span>
        </button>
      </div>
    </header>
  );
}