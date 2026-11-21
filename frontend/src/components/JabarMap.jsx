import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { REGION_NAMES } from "../geoConfig.js";

function getRedToGreenColor(value, min, max) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "#22c55e";
  }
  const ratio =
    max === min ? 0.5 : Math.max(0, Math.min(1, (value - min) / (max - min)));

  if (ratio < 0.25) return "#22c55e";
  if (ratio < 0.5) return "#eab308";
  if (ratio < 0.75) return "#f97316";
  return "#ef4444";
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

  // 1. Static Leaflet dengan zoomSnap desimal agar ukuran Jabar pas memenuhi box
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-6.95, 107.6],
      zoom: 8.4,
      zoomSnap: 0.1,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render GeoJSON Jawa Barat
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

    const renderGeoJson = (data, shouldFitBounds = false) => {
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
          fillOpacity: isSelected ? 0.95 : 0.88,
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

          const getTooltipSummary = () => {
            const miskinText = `${Number(stat?.penduduk_miskin_k ?? 0).toLocaleString("id-ID")} ribu jiwa`;

            if (metric === "poor") {
              return `Warga Miskin: <b>${miskinText}</b>`;
            }

            if (metric === "p1") {
              const val = stat?.p1_terkini ?? 0.97;
              const label =
                val >= 1.5
                  ? "Sangat Jauh dari Layak"
                  : val >= 1.0
                    ? "Cukup Jauh dari Layak"
                    : "Mendekati Layak";
              return `Jarak Layak: <b>${label}</b> • Miskin: <b>${stat?.penduduk_miskin_k ?? "-"} rb</b>`;
            }

            if (metric === "trend") {
              const val = stat?.tren ?? -0.22;
              const label =
                val <= -0.25
                  ? "Membaik Pesat"
                  : val <= -0.15
                    ? "Mulai Membaik"
                    : "Penurunan Melambat";
              return `Tren 3 Tahun: <b>${label}</b> • Miskin: <b>${stat?.penduduk_miskin_k ?? "-"} rb</b>`;
            }

            const val = stat?.p2_terkini ?? 0.23;
            const urgency =
              val >= 0.4
                ? "Sangat Tinggi"
                : val >= 0.3
                  ? "Tinggi"
                  : val >= 0.2
                    ? "Sedang"
                    : "Rendah";
            return `Tingkat Urgensi: <b>${urgency}</b> • Miskin: <b>${stat?.penduduk_miskin_k ?? "-"} rb</b>`;
          };

          layer.bindTooltip(
            `<div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
              <strong>${nama}</strong><br/>
              <span>${getTooltipSummary()}</span>
            </div>`,
            { sticky: true },
          );

          layer.on({
            click: (e) => {
              if (e.originalEvent?.target) e.originalEvent.target.blur();
              onSelectRegion?.(stat || { kode, nama });
            },
            mouseover: (e) => {
              e.target.setStyle({ fillOpacity: 1, weight: 2 });
            },
            mouseout: (e) => {
              e.target.setStyle(getStyle(feature));
            },
          });
        },
      }).addTo(map);

      if (shouldFitBounds) {
        map.invalidateSize();
        map.fitBounds(geoLayerRef.current.getBounds(), { padding: [8, 8] });
      }
    };

    if (geoDataRef.current) {
      renderGeoJson(geoDataRef.current, false);
    } else {
      fetch("/jabar.geojson")
        .then((res) => res.json())
        .then((data) => {
          geoDataRef.current = data;
          renderGeoJson(data, true);
        })
        .catch((err) => console.error("Gagal memuat /jabar.geojson:", err));
    }
  }, [regionStats, selectedRegion, metric]);

  return (
    <div
      className="relative h-[400px] w-full"
      style={{ background: "transparent" }}
    >
      <style>{`
        .leaflet-container,
        .leaflet-pane,
        .leaflet-map-pane {
          background: transparent !important;
          cursor: default !important;
        }
        .leaflet-container path.leaflet-interactive {
          cursor: pointer !important;
        }
        .leaflet-container path.leaflet-interactive:focus,
        .leaflet-container svg:focus {
          outline: none !important;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        className="h-full w-full z-0"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
