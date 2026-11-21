import React from "react";
import { Link } from "react-router-dom";

const MENU_TITLES = {
  "data-penerima": "Daftar Penerima Bantuan",
  registrasi: "Pendaftaran Warga Baru",
  verifikasi: "Cek Penerima Ganda",
  "penilaian-ai": "Penilaian Kelayakan (Bantuan Pintar)",
  penyaluran: "Penyaluran Bantuan",
  riwayat: "Riwayat Penyaluran",
  pencarian: "Pencarian Bukti Bantuan",
  explorer: "Buku Besar Digital (Bebas Manipulasi)",
  profil: "Profil Petugas Lapangan",
  "koneksi-wallet": "Pengaturan Dompet Digital & Jaringan",
};

export default function OfficerHeader({ activeMenu }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-xs">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-lg font-bold capitalize text-slate-900">
          {MENU_TITLES[activeMenu] || "Dashboard Petugas"}
        </h1>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
          Petugas Aktif
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
        >
          ← Kembali ke Halaman Utama Publik
        </Link>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="font-medium">Jaringan Aktif: Jawa Barat</span>
        </div>
      </div>
    </header>
  );
}
