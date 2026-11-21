import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { REGION_NAMES } from "../geoConfig.js";

function getRedToGreenColor(value, min, max) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "#22c55e"; // Hijau default
  }
  const ratio = max === min ? 0.5 : Math.max(0, Math.min(1, (value - min) / (max - min)));

  if (ratio < 0.25) return "#22c55e"; // Hijau (Kebutuhan Rendah)
  if (ratio < 0.5) return "#eab308";  // Kuning
  if (ratio < 0.75) return "#f97316"; // Oranye
  return "#ef4444";                   // Merah (Kebutuhan Tinggi)
}

export default function JabarMap({
  regionStats = [],
  selectedRegion,
  onSelectRegion,
  metric = "p2",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);
  const geoDataRef = useRef(null);

  const getMetricValue = (stat) => {
    if (!stat) return null;
    if (metric === "p1") return stat.p1_terkini;
    if (metric === "trend") return stat.tren;
    if (metric === "poor") return stat.penduduk_miskin_k;
    return stat.p2_terkini;
  };

  // 1. Buat instance peta Leaflet sekali saja
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-6.92, 107.61],
      zoom: 8,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "&copy; Esri &copy; OpenStreetMap",
    maxZoom: 16,
  }
).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Gambar ulang warna GeoJSON setiap kali data, metrik, atau wilayah aktif berubah
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const statsMap = {};
    regionStats.forEach((item) => {
      statsMap[String(item.kode)] = item;
    });

    const values = regionStats
      .map((r) => getMetricValue(r))
      .filter((v) => typeof v === "number");
    const minVal = values.length ? Math.min(...values) : 0;
    const maxVal = values.length ? Math.max(...values) : 1;

    const renderGeoJson = (data) => {
      if (geoLayerRef.current) {
        geoLayerRef.current.remove();
      }

      const getStyle = (feature) => {
        const kode = String(feature.properties?.kode || "");
        const stat = statsMap[kode];
        const isSelected = String(selectedRegion) === kode;

        return {
          fillColor: getRedToGreenColor(getMetricValue(stat), minVal, maxVal),
          weight: isSelected ? 2.5 : 1,
          opacity: 1,
          color: isSelected ? "#ffffff" : "#09131d",
          fillOpacity: isSelected ? 0.92 : 0.78,
        };
      };

      geoLayerRef.current = L.geoJSON(data, {
        style: getStyle,
        onEachFeature: (feature, layer) => {
          const kode = String(feature.properties?.kode || "");
          const stat = statsMap[kode];
          const nama =
            stat?.nama ||
            REGION_NAMES[kode] ||
            feature.properties?.name ||
            `Wilayah ${kode}`;

          layer.bindTooltip(
            `<div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
              <strong>${nama}</strong><br/>
              <span>Tingkat Parah: <b>${stat?.p2_terkini?.toFixed(3) ?? "-"}</b></span> •
              <span>Miskin: <b>${stat?.penduduk_miskin_k ?? "-"} rb</b></span>
            </div>`,
            { sticky: true }
          );

          layer.on({
            click: (e) => {
              if (e.originalEvent?.target) e.originalEvent.target.blur();
              onSelectRegion?.(stat || { kode, nama });
            },
            mouseover: (e) => {
              e.target.setStyle({ fillOpacity: 0.95, weight: 2 });
            },
            mouseout: (e) => {
              e.target.setStyle(getStyle(feature));
            },
          });
        },
      }).addTo(map);
    };

    if (geoDataRef.current) {
      renderGeoJson(geoDataRef.current);
    } else {
      fetch("/jabar.geojson")
        .then((res) => res.json())
        .then((data) => {
          geoDataRef.current = data;
          renderGeoJson(data);
        })
        .catch((err) => console.error("Gagal memuat /jabar.geojson:", err));
    }
  }, [regionStats, selectedRegion, metric]);

  return (
    <div className="relative h-[380px] w-full">
      <style>{`
        .leaflet-container path.leaflet-interactive:focus,
        .leaflet-container svg:focus {
          outline: none !important;
        }
      `}</style>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
    </div>
  );
}