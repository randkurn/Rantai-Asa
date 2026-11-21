import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const AI  = import.meta.env.VITE_AI_URL  || "http://localhost:8000";

// Hook: ambil stats per wilayah dari backend /public/stats-by-region
export function useRegionStats() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${API}/public/stats-by-region`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setData(j.data || []);
      setLastUpdated(j.generated_at);
    } catch (e) {
      // Fallback: langsung ke ai-engine /regions
      try {
        const r2 = await fetch(`${AI}/regions`);
        if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
        const regions = await r2.json();
        setData(regions.map(reg => ({
          kode: reg.kode_kabupaten_kota,
          nama: reg.nama || reg.nama_kabupaten_kota || "",
          p2_terkini: reg.regional_severity ?? reg.p2_latest ?? 0,
          p1_terkini: reg.regional_depth ?? 0,
          tren: reg.regional_trend ?? reg.trend_3yr ?? 0,
          garis_kemiskinan_k: reg.poverty_line_k ?? 0,
          penduduk_miskin_k: reg.poor_count_k ?? 0,
          tahun_data: reg.tahun_data ?? 2025,
          registrasi: 0, penyaluran: 0, laporan_verified: 0
        })));
        setLastUpdated(new Date().toISOString());
      } catch (e2) { setError(e2.message); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh, lastUpdated };
}

// Hook: ambil laporan verified per wilayah
export function useReportsByRegion() {
  const [data, setData]       = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API}/public/reports-by-region`)
      .then(r => r.json())
      .then(j => setData(j.data || {}))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

// Hook: ambil tren P2 2004–2025 dari endpoint riwayat BPS
export function useP2Trend(kode) {
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!kode) return;
    setLoading(true);
    fetch(`${API}/public/regions/${kode}/trend`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => setTrend(j.data || []))
      .catch(() => setTrend([]))
      .finally(() => setLoading(false));
  }, [kode]);
  return { trend, loading };
}
