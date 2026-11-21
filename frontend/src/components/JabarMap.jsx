import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { REGION_NAMES } from "../geoConfig.js";

// Skala warna adaptif sesuai metrik terpilih (Palet Dark RantaiAsa)
function getColor(val, metric = "p2") {
  if (val === undefined || val === null) return "#1e293b";
  if (metric === "p2") {
    // Indeks Keparahan Kemiskinan (P2)
    if (val >= 0.50) return "#ffffff"; // Kritis (Puncak kontras putih)
    if (val >= 0.35) return "#bfe6f8"; // Sangat Parah (Cyan terang)
    if (val >= 0.22) return "#479ece"; // Parah (Biru Azure RantaiAsa)
    if (val >= 0.12) return "#2c7fb0"; // Sedang (Biru Tua)
    return "#0b3a5a";                  // Rendah / Terkendali (Deep Navy)
  } else if (metric === "p1") {
    // Indeks Kedalaman Kemiskinan (P1)
    if (val >= 2.0)  return "#ffffff";
    if (val >= 1.4)  return "#bfe6f8";
    if (val >= 0.9)  return "#479ece";
    if (val >= 0.6)  return "#2c7fb0";
    return "#0b3a5a";
  } else if (metric === "poor") {
    // Jumlah Penduduk Miskin (dalam ribuan jiwa)
    if (val >= 350)  return "#ffffff";
    if (val >= 240)  return "#bfe6f8";
    if (val >= 140)  return "#479ece";
    if (val >= 70)   return "#2c7fb0";
    return "#0b3a5a";
  } else {
    // Tren 3 tahun: positif = memburuk (merah/oranye), negatif = membaik (cyan/biru)
    if (val > 0.05)  return "#ff8a8a"; // Memburuk
    if (val > 0.0)   return "#f59e0b"; // Stagnan naik
    if (val > -0.05) return "#479ece"; // Stabil
    return "#5fd7a0";                  // Membaik (Hijau segar)
  }
}

export default function JabarMap({ regionStats, onSelectRegion, selectedRegion, metric = "p2" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);

  const [geoData, setGeoData]   = useState(null);
  const [geoError, setGeoError] = useState(null);

  // 1. Ambil data GeoJSON dari lokal public
  useEffect(() => {
    fetch("/jabar.geojson")
      .then(r => {
        if (!r.ok) throw new Error("Gagal memuat /jabar.geojson lokal");
        return r.json();
      })
      .then(setGeoData)
      .catch(e => setGeoError(e.message));
  }, []);

  // 2. Inisialisasi Map Leaflet murni (tanpa react-leaflet context bug)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-6.95, 107.6],
      zoom: 8,
      scrollWheelZoom: false,
      zoomControl: true
    });

    const cartoKey = import.meta.env.VITE_CARTO_API_KEY || "cb1_5ctb_1_37c71107b8547181a2e95060";
    L.tileLayer(`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${cartoKey}`, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Render / Update Layer GeoJSON saat data, metrik, atau wilayah terpilih berubah
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const statsByKode = {};
    (regionStats || []).forEach(s => { statsByKode[String(s.kode)] = s; });

    const getFeatureStyle = (feature) => {
      const rawKode = feature.properties?.kode || feature.properties?.code || "";
      const cleanKode = String(rawKode).replace(".", "");
      const stat = statsByKode[cleanKode];
      let val = stat?.p2_terkini;
      if (metric === "p1") val = stat?.p1_terkini;
      else if (metric === "trend") val = stat?.tren;
      else if (metric === "poor") val = stat?.penduduk_miskin_k;
      const isSelected = String(selectedRegion) === cleanKode;

      return {
        fillColor: getColor(val, metric),
        fillOpacity: isSelected ? 0.95 : 0.82,
        color: isSelected ? "#ffffff" : "rgba(71,158,206,0.35)",
        weight: isSelected ? 2.5 : 1,
        opacity: 1
      };
    };

    const layer = L.geoJSON(geoData, {
      style: getFeatureStyle,
      onEachFeature: (feature, l) => {
        const rawKode = feature.properties?.kode || feature.properties?.code || "";
        const cleanKode = String(rawKode).replace(".", "");
        const name = REGION_NAMES[parseInt(cleanKode)] || feature.properties?.name || cleanKode;
        const stat = statsByKode[cleanKode];
        const p2Str = stat?.p2_terkini !== undefined ? Number(stat.p2_terkini).toFixed(3) : "—";
        const p1Str = stat?.p1_terkini !== undefined ? Number(stat.p1_terkini).toFixed(3) : "—";
        const trenStr = stat?.tren !== undefined ? (stat.tren > 0 ? `+${Number(stat.tren).toFixed(3)}` : Number(stat.tren).toFixed(3)) : "—";
        const poorStr = stat?.penduduk_miskin_k !== undefined ? `${Number(stat.penduduk_miskin_k).toLocaleString("id-ID")} rb` : "—";

        l.bindTooltip(
          `<div class="font-sans text-xs p-1.5 leading-snug">
            <strong class="text-[#479ece] block text-sm font-semibold">${name}</strong>
            <span class="text-slate-400">Kode BPS: ${cleanKode}</span><br/>
            <div class="mt-1 pt-1 border-t border-slate-700/60 flex items-center gap-2">
              <span class="text-white font-mono font-bold">P2: ${p2Str}</span> • 
              <span class="text-[#bfe6f8] font-mono">P1: ${p1Str}</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">
              <span>Tren: ${trenStr}</span> | <span>Miskin: ${poorStr}</span>
            </div>
          </div>`,
          { sticky: true }
        );

        l.on({
          click: () => {
            if (onSelectRegion) onSelectRegion({ kode: cleanKode, name, stat });
          },
          mouseover: (e) => {
            e.target.setStyle({ fillOpacity: 0.98, weight: 2.2, color: "#ffffff" });
          },
          mouseout: (e) => {
            e.target.setStyle(getFeatureStyle(feature));
          }
        });
      }
    }).addTo(map);

    geoJsonLayerRef.current = layer;
  }, [geoData, regionStats, selectedRegion, metric, onSelectRegion]);

  if (geoError) return (
    <div className="flex items-center justify-center h-80 bg-[#0a1b2a] rounded-2xl text-slate-400 text-xs border border-rose-500/30 p-4">
      <div className="text-center">
        <p className="font-bold text-rose-400">GeoJSON tidak dapat dimuat</p>
        <p className="mt-1">{geoError}</p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[rgba(71,158,206,0.28)] shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
      <div
        ref={mapContainerRef}
        style={{ height: "420px", width: "100%", background: "#07131d" }}
        className="w-full"
      />
      {!geoData && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050f18]/85 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-2 text-[#9fb8c9] text-xs">
            <div className="w-6 h-6 border-2 border-[#479ece] border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat batas 27 Kabupaten/Kota Jawa Barat...</span>
          </div>
        </div>
      )}
    </div>
  );
}
