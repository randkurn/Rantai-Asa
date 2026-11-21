import React, { useState, useEffect } from "react";
import { shortHex } from "../constants/auditData.js";

const NAV_LINKS = [
  { href: "#tentang", label: "Tentang" },
  { href: "#alur", label: "Cara Kerja" },
  { href: "#wilayah", label: "Wilayah" },
  { href: "#ledger", label: "Riwayat Penyaluran" },
  { href: "#report", label: "Laporan Warga" },
];

export default function Navbar({
  activeTab,
  onToggleReports,
  wallet,
  onOpenOfficerModal,
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useLightText = !isScrolled;
  const textColor = useLightText ? "#f8fafc" : "#1e293b";

  return (
    <header
      data-navbar-state={isScrolled ? "scrolled" : "top"}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        isScrolled ? "border-b shadow-sm backdrop-blur-md" : "border-0"
      }`}
      style={{
        borderBottomColor: isScrolled
          ? "rgba(44, 127, 176, 0.2)"
          : "transparent",
        backgroundColor: isScrolled ? "#ffffff" : "transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="shrink-0 flex items-center gap-2">
          <img
            src={
              useLightText ? "/logo-rantaiasa.png" : "/logo-rantaiasa-light.png"
            }
            alt="RantaiAsa"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:opacity-80"
              style={{ color: textColor }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Tombol Portal Petugas */}
          <button
            type="button"
            onClick={onOpenOfficerModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold !text-white shadow-md transition hover:brightness-110 sm:text-sm"
            style={{
              background: "linear-gradient(to right, #479ece, #2c7fb0)",
              color: "#ffffff",
            }}
          >
            <span className="!text-white">
              {wallet.address ? shortHex(wallet.address) : "Portal Petugas"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
