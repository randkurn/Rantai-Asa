import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
      setError(e.message);
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
