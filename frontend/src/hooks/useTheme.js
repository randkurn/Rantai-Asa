import { useState, useEffect, useCallback } from "react";

export function useTheme() {
  // Selalu default ke lightmode sesuai instruksi pengguna
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("rantaiasa_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("rantaiasa_theme", "light");
  }, []);

  // Switch mode dinonaktifkan sementara (tetap lightmode)
  const toggleTheme = useCallback(() => {
    // Mode dikunci ke lightmode
  }, []);

  return { theme: "light", toggleTheme, isDark: false };
}
