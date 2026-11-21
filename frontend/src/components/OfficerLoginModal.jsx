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
    <div className="fixed inset-0 flex items-start justify-center bg-[#030910]/85 p-4 pt-20 backdrop-blur-md" style={{ zIndex: 40 }}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-sky-400/30 bg-[#07131d] p-6 shadow-2xl sm:p-8">
        
        {/* Glow corner */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-sky-500/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-950/40 p-2.5 shadow-inner">
            <img src="/logo-icon.png" alt="RantaiAsa" className="h-full w-full object-contain" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">Portal Petugas & Auditor</h2>
          <p className="mt-1 text-xs text-slate-400">
            Sistem Operasional Bansos & Verifikasi Terdesentralisasi
          </p>
        </div>

        {/* Method Toggle */}
        <div className="mb-6 flex rounded-xl border border-white/10 bg-white/[0.03] p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMethod("wallet")}
            className={`flex-1 rounded-lg py-2 transition ${
              authMethod === "wallet"
                ? "bg-[#479ece] text-[#050f18] shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Web3 Wallet (Signature)
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod("nip")}
            className={`flex-1 rounded-lg py-2 transition ${
              authMethod === "nip"
                ? "bg-[#479ece] text-[#050f18] shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            NIP Petugas (Kredensial)
          </button>
        </div>

        {authError && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <strong>Gagal Masuk:</strong> {authError}
          </div>
        )}

        {authMethod === "wallet" ? (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-sky-400/20 bg-sky-950/20 p-3.5 text-slate-300">
              <span className="font-semibold text-sky-400">Autentikasi Kriptografis:</span>
              <p className="mt-1 leading-relaxed text-[11px] text-slate-400">
                Masuk menggunakan alamat wallet terotorisasi (*Role: OFFICER/OPERATOR*) melalui tanda tangan pesan kriptografis EIP-191 tanpa memungut biaya gas.
              </p>
            </div>

            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleWalletLogin}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
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
              <label className="mb-1 block font-medium text-slate-300">NIP Petugas Lapangan</label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="19880415 201201 1 002"
                className="w-full rounded-xl border border-white/10 bg-[#050f18] px-3.5 py-2.5 font-mono text-white placeholder-slate-600 focus:border-[#479ece] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-300">Kata Sandi Petugas</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#050f18] px-3.5 py-2.5 font-mono text-white placeholder-slate-600 focus:border-[#479ece] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#479ece] to-[#2c7fb0] py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
              >
                {isAuthenticating ? "Memverifikasi Kredensial..." : "Masuk ke Dashboard Operasional"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-[11px] text-slate-400">
          <span>Hanya untuk personil Dinsos Jawa Barat terdaftar. </span>
          <button
            onClick={() => {
              onClose();
              navigate("/");
            }}
            className="text-sky-400 hover:underline"
          >
            Kembali ke Portal Publik
          </button>
        </div>

      </div>
    </div>
  );
}
