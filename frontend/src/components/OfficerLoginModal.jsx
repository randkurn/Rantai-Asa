import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function OfficerLoginModal({ isOpen, onClose, onSuccess }) {
  const { loginWithWallet, loginWithCredentials, isAuthenticating, authError } = useAuth();
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState("wallet"); // "wallet" | "nip"
  const [nip, setNip] = useState("19880415 201201 1 002");
  const [password, setPassword] = useState("petugas2026");

  if (!isOpen) return null;

  const handleWalletLogin = async () => {
    const res = await loginWithWallet();
    if (res.success) {
      if (onSuccess) onSuccess(res.officer);
      onClose();
      navigate("/officer");
    }
  };

  const handleNipLogin = async (e) => {
    e.preventDefault();
    const res = await loginWithCredentials(nip, password);
    if (res.success) {
      if (onSuccess) onSuccess(res.officer);
      onClose();
      navigate("/officer");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 text-slate-800">

        {/* Glow corner */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          title="Tutup"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 p-2.5 shadow-xs">
            <img src="/logo-icon.png" alt="RantaiAsa" className="h-full w-full object-contain" />
          </div>
          <h2 className="font-heading text-xl font-bold text-slate-900">Portal Petugas & Auditor</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sistem Operasional Bantuan Sosial Terpadu Jawa Barat
          </p>
        </div>

        {/* Method Toggle */}
        <div className="mb-6 flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMethod("wallet")}
            className={`flex-1 rounded-lg py-2 transition ${authMethod === "wallet"
              ? "bg-white text-sky-700 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Tanda Tangan Digital (Wallet)
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod("nip")}
            className={`flex-1 rounded-lg py-2 transition ${authMethod === "nip"
              ? "bg-white text-sky-700 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            NIP Petugas (Kredensial)
          </button>
        </div>

        {authError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <strong>Gagal Masuk:</strong> {authError}
          </div>
        )}

        {authMethod === "wallet" ? (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 text-slate-700">
              <span className="font-semibold text-sky-800">Autentikasi Aman:</span>
              <p className="mt-1 leading-relaxed text-[11px] text-slate-600">
                Masuk menggunakan akun petugas terdaftar (Role: OFFICER) melalui tanda tangan digital tanpa memungut biaya apapun.
              </p>
            </div>

            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleWalletLogin}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-sky-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{isAuthenticating ? "Memverifikasi Tanda Tangan..." : "Hubungkan & Tanda Tangani Masuk"}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleNipLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="mb-1 block font-medium text-slate-700">NIP Petugas Lapangan</label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="19880415 201201 1 002"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-700">Kata Sandi Petugas</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full cursor-pointer rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-sky-700 disabled:opacity-50"
              >
                {isAuthenticating ? "Memverifikasi Kredensial..." : "Masuk ke Dashboard Operasional"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-500">
          <span>Hanya untuk personil Dinsos Jawa Barat terdaftar. </span>
          <button
            onClick={() => {
              onClose();
              navigate("/");
            }}
            className="text-sky-600 font-semibold hover:underline"
          >
            Kembali ke Portal Publik
          </button>
        </div>

      </div>
    </div>
  );
}
