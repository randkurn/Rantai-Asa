import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [officer, setOfficer] = useState(() => {
    try {
      const saved = localStorage.getItem("rantaiasa_officer_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("rantaiasa_officer_token") || null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync token & profile to local storage
  useEffect(() => {
    if (officer && token) {
      localStorage.setItem("rantaiasa_officer_session", JSON.stringify(officer));
      localStorage.setItem("rantaiasa_officer_token", token);
    } else {
      localStorage.removeItem("rantaiasa_officer_session");
      localStorage.removeItem("rantaiasa_officer_token");
    }
  }, [officer, token]);

  // Login via Web3 Wallet Signature
  const loginWithWallet = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask atau browser wallet Web3 tidak ditemukan.");
      }
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("Tidak ada akun wallet yang dipilih.");
      }
      const walletAddr = accounts[0];
      const signer = await provider.getSigner();

      const nonceRes = await fetch("http://localhost:4000/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddr }),
      });
      const nonceData = await nonceRes.json();
      if (!nonceRes.ok) throw new Error(nonceData.detail || "Gagal membuat nonce autentikasi.");

      const messageToSign = `RantaiAsa login: ${nonceData.nonce}`;
      const signature = await signer.signMessage(messageToSign);
      const verifyRes = await fetch("http://localhost:4000/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddr, signature }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.detail || "Verifikasi wallet gagal.");

      const profileResponse = await fetch("http://localhost:4000/auth/me", {
        headers: { Authorization: `Bearer ${verifyData.token}` },
      });
      const profile = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profile.detail || "Profil petugas tidak ditemukan.");
      const officerProfile = {
        id: profile.id,
        name: profile.display_name,
        role: profile.role_name,
        nip: profile.nip,
        department: profile.department,
        assignedRegion: profile.region_code,
        wallet: profile.wallet_address,
        status: profile.status,
        loginAt: new Date().toISOString(),
      };
      setOfficer(officerProfile);
      setToken(verifyData.token);
      setIsAuthenticating(false);
      return { success: true, officer: officerProfile };
    } catch (err) {
      const errMsg = err?.message || "Gagal melakukan autentikasi wallet.";
      setAuthError(errMsg);
      setIsAuthenticating(false);
      return { success: false, error: errMsg };
    }
  };

  // Login via Demo NIP (Bypass untuk Pengujian Lapangan/Cepat)
  const loginWithCredentials = async (nipInput, passwordInput) => {
    setIsAuthenticating(true);
    setAuthError(null);
    if (!nipInput || !passwordInput) {
      setIsAuthenticating(false);
      const msg = "NIP Petugas dan Kata Sandi wajib diisi.";
      setAuthError(msg);
      return { success: false, error: msg };
    }
    try {
      const response = await fetch("http://localhost:4000/auth/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip: nipInput, password: passwordInput }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Autentikasi petugas gagal.");
      const profileResponse = await fetch("http://localhost:4000/auth/me", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const profile = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profile.detail || "Profil petugas tidak ditemukan.");
      const officerProfile = {
        id: profile.id,
        name: profile.display_name,
        role: profile.role_name,
        nip: profile.nip,
        department: profile.department,
        assignedRegion: profile.region_code,
        wallet: profile.wallet_address,
        status: profile.status,
        loginAt: new Date().toISOString(),
      };
      setOfficer(officerProfile);
      setToken(data.token);
      setIsAuthenticating(false);
      return { success: true, officer: officerProfile };
    } catch (err) {
      setAuthError(err.message);
      setIsAuthenticating(false);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setOfficer(null);
    setToken(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        officer,
        token,
        isAuthenticated: !!officer,
        isAuthenticating,
        authError,
        loginWithWallet,
        loginWithCredentials,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
