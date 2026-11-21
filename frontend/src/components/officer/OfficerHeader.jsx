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
      </div>
    </header>
  );
}
