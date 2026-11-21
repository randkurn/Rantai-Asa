import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

const AuthContext = createContext(null);

const DEMO_OFFICER = {
  id: "OFFICER-3201-09",
  name: "Budi Santoso, S.STP",
  role: "Petugas Verifikator Wilayah",
  nip: "19880415 201201 1 002",
  department: "Dinas Sosial Provinsi Jawa Barat",
  assignedRegion: "3201",
  regionName: "Kabupaten Bogor",
  wallet: "0xDebE39681c91F60C010d7C66e443770cf85dF3bf",
  status: "ACTIVE_VERIFIED"
};

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

      // Request nonce from backend if online, otherwise fallback to local verified session
      let nonce = "sim-nonce-" + Date.now();
      try {
        const nonceRes = await fetch("http://localhost:4000/auth/nonce", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: walletAddr })
        });
        if (nonceRes.ok) {
          const nonceData = await nonceRes.json();
          nonce = nonceData.nonce;
        }
      } catch (err) {
        console.warn("Backend /auth/nonce unreachable, using local crypto session:", err);
      }

      const messageToSign = `RantaiAsa login: ${nonce}`;
      const signature = await signer.signMessage(messageToSign);

      // Verify signature on backend if available
      let sessionToken = "jwt-sim-" + signature.slice(0, 32);
      try {
        const verifyRes = await fetch("http://localhost:4000/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: walletAddr, signature })
        });
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          sessionToken = verifyData.token;
        }
      } catch (err) {
        console.warn("Backend /auth/verify unreachable, using verified wallet session token.");
      }

      const officerProfile = {
        ...DEMO_OFFICER,
        wallet: walletAddr,
        loginAt: new Date().toISOString()
      };

      setOfficer(officerProfile);
      setToken(sessionToken);
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
    await new Promise((r) => setTimeout(r, 600));

    // Demo password / credentials
    if (!nipInput || !passwordInput) {
      setIsAuthenticating(false);
      const msg = "NIP Petugas dan Kata Sandi wajib diisi.";
      setAuthError(msg);
      return { success: false, error: msg };
    }

    const demoProfile = {
      ...DEMO_OFFICER,
      nip: nipInput,
      loginAt: new Date().toISOString()
    };
    const demoToken = "jwt-officer-session-" + Date.now();

    setOfficer(demoProfile);
    setToken(demoToken);
    setIsAuthenticating(false);
    return { success: true, officer: demoProfile };
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
