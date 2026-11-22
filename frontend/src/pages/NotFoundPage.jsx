import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="max-w-md text-center">
        <div className="font-heading text-7xl font-extrabold text-sky-500">404</div>
        <h1 className="mt-3 text-2xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
        </p>
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="mt-6 cursor-pointer rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
        >
          Kembali ke Beranda
        </button>
      </div>
    </main>
  );
}
