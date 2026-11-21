import React, { useState, useEffect } from "react";
import { shortHex } from "../constants/auditData.js";
import { useTheme } from "../hooks/useTheme.js";

const NAV_LINKS = [
  { href: "#tentang", label: "Tentang" },
  { href: "#alur", label: "Alur" },
  { href: "#wilayah", label: "Wilayah" },
  { href: "#ledger", label: "Riwayat Penyaluran" },
];

export default function Navbar({
  activeTab,
  onToggleReports,
  wallet,
  onOpenOfficerModal,
}) {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useLightText = !isScrolled || isDark;
  const textColor = useLightText ? "#f8fafc" : "#1e293b";

  return (
    <header
      data-navbar-state={isScrolled ? "scrolled" : "top"}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        isScrolled
          ? "border-b shadow-sm backdrop-blur-md"
          : "border-0"
      }`}
      style={{
        borderBottomColor: isScrolled ? "var(--card-border)" : "transparent",
        backgroundColor: isScrolled
          ? isDark
            ? "#050f18"
            : "#ffffff"
          : "transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="shrink-0">
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
          <button
            type="button"
            onClick={onToggleReports}
            className="cursor-pointer transition"
            style={{
              color:
                activeTab === "reports"
                  ? useLightText
                    ? "#7dd3fc"
                    : "#2c7fb0"
                  : textColor,
              fontWeight: activeTab === "reports" ? 700 : 500,
            }}
          >
            Laporan Warga
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            style={
              !isScrolled
                ? {
                    color: "#ffffff",
                    borderColor: "rgba(255,255,255,0.3)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }
                : undefined
            }
            title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            aria-label="Toggle tema"
          >
            {isDark ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenOfficerModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:brightness-110 sm:text-sm"
            style={{
              background: "linear-gradient(to right, #479ece, #2c7fb0)",
            }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <span>
              {wallet.address ? shortHex(wallet.address) : "Portal Petugas"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
