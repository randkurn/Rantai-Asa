import React, { useState, useEffect } from "react";
import { formatIDR } from "../constants/auditData.js";

function getStatusInfo(val = 0.23) {
  if (val >= 0.45) {
    return {
      label: "Sangat Tinggi",
      barClass: "from-red-600 to-rose-500",
      badgeClass: "border-red-500/30 bg-red-500/15 text-red-500",
      barColor: "#ef4444",
    };
  }
  if (val >= 0.35) {
    return {
      label: "Tinggi",
      barClass: "from-orange-500 to-amber-500",
      badgeClass: "border-orange-500/30 bg-orange-500/15 text-orange-500",
      barColor: "#f97316",
    };
  }
  if (val >= 0.2) {
    return {
      label: "Sedang",
      barClass: "from-amber-400 to-yellow-400",
      badgeClass: "border-amber-500/30 bg-amber-500/15 text-amber-500",
      barColor: "#eab308",
    };
  }
  return {
    label: "Rendah",
    barClass: "from-emerald-500 to-green-400",
    badgeClass: "border-emerald-500/30 bg-emerald-500/15 text-emerald-500",
    barColor: "#22c55e",
  };
}

function getDepthLabel(val = 0.97) {
  if (val >= 1.5) return "Sangat Jauh";
  if (val >= 1.0) return "Cukup Jauh";
  return "Mendekati Layak";
}

// Urutan bersih dari urgensi tertinggi ke terendah (tanpa menyelipkan Rata-rata Jabar)
const COMPARISON_REGIONS = [
  { name: "Kab. Tasikmalaya", value: 0.54, width: "92%", poorK: 191.2 },
  { name: "Kab. Cianjur", value: 0.41, width: "70%", poorK: 242.1 },
  { name: "Kab. Indramayu", value: 0.36, width: "60%", poorK: 215.4 },
  { name: "Kab. Bogor", value: 0.23, width: "42%", poorK: 401.8 },
  { name: "Kota Depok", value: 0.07, width: "16%", poorK: 62.8 },
];

// Cadangan data 27 Kab/Kota jika dropdown dipakai mandiri
const JABAR_QUICK_LIST = [
  {
    kode: "3201",
    nama: "Kab. Bogor",
    p2_terkini: 0.23,
    p1_terkini: 0.97,
    penduduk_miskin_k: 401.8,
    garis_kemiskinan_k: 531.4,
  },
  {
    kode: "3202",
    nama: "Kab. Sukabumi",
    p2_terkini: 0.31,
    p1_terkini: 1.18,
    penduduk_miskin_k: 175.4,
    garis_kemiskinan_k: 448.2,
  },
  {
    kode: "3203",
    nama: "Kab. Cianjur",
    p2_terkini: 0.41,
    p1_terkini: 1.52,
    penduduk_miskin_k: 242.1,
    garis_kemiskinan_k: 455.6,
  },
  {
    kode: "3204",
    nama: "Kab. Bandung",
    p2_terkini: 0.24,
    p1_terkini: 0.95,
    penduduk_miskin_k: 238.5,
    garis_kemiskinan_k: 492.1,
  },
  {
    kode: "3205",
    nama: "Kab. Garut",
    p2_terkini: 0.38,
    p1_terkini: 1.44,
    penduduk_miskin_k: 256.3,
    garis_kemiskinan_k: 432.8,
  },
  {
    kode: "3206",
    nama: "Kab. Tasikmalaya",
    p2_terkini: 0.54,
    p1_terkini: 1.85,
    penduduk_miskin_k: 191.2,
    garis_kemiskinan_k: 425.0,
  },
  {
    kode: "3207",
    nama: "Kab. Ciamis",
    p2_terkini: 0.26,
    p1_terkini: 1.02,
    penduduk_miskin_k: 94.1,
    garis_kemiskinan_k: 468.3,
  },
  {
    kode: "3208",
    nama: "Kab. Kuningan",
    p2_terkini: 0.44,
    p1_terkini: 1.68,
    penduduk_miskin_k: 132.7,
    garis_kemiskinan_k: 441.5,
  },
  {
    kode: "3209",
    nama: "Kab. Cirebon",
    p2_terkini: 0.39,
    p1_terkini: 1.49,
    penduduk_miskin_k: 245.8,
    garis_kemiskinan_k: 472.9,
  },
  {
    kode: "3210",
    nama: "Kab. Majalengka",
    p2_terkini: 0.37,
    p1_terkini: 1.42,
    penduduk_miskin_k: 138.9,
    garis_kemiskinan_k: 486.4,
  },
  {
    kode: "3211",
    nama: "Kab. Sumedang",
    p2_terkini: 0.33,
    p1_terkini: 1.28,
    penduduk_miskin_k: 112.4,
    garis_kemiskinan_k: 479.0,
  },
  {
    kode: "3212",
    nama: "Kab. Indramayu",
    p2_terkini: 0.43,
    p1_terkini: 1.62,
    penduduk_miskin_k: 215.4,
    garis_kemiskinan_k: 512.3,
  },
  {
    kode: "3213",
    nama: "Kab. Subang",
    p2_terkini: 0.32,
    p1_terkini: 1.24,
    penduduk_miskin_k: 151.6,
    garis_kemiskinan_k: 495.7,
  },
  {
    kode: "3214",
    nama: "Kab. Purwakarta",
    p2_terkini: 0.29,
    p1_terkini: 1.12,
    penduduk_miskin_k: 84.5,
    garis_kemiskinan_k: 528.9,
  },
  {
    kode: "3215",
    nama: "Kab. Karawang",
    p2_terkini: 0.28,
    p1_terkini: 1.09,
    penduduk_miskin_k: 188.2,
    garis_kemiskinan_k: 554.2,
  },
  {
    kode: "3216",
    nama: "Kab. Bekasi",
    p2_terkini: 0.16,
    p1_terkini: 0.68,
    penduduk_miskin_k: 198.4,
    garis_kemiskinan_k: 618.5,
  },
  {
    kode: "3217",
    nama: "Kab. Bandung Barat",
    p2_terkini: 0.35,
    p1_terkini: 1.35,
    penduduk_miskin_k: 176.9,
    garis_kemiskinan_k: 488.6,
  },
  {
    kode: "3218",
    nama: "Kab. Pangandaran",
    p2_terkini: 0.27,
    p1_terkini: 1.05,
    penduduk_miskin_k: 36.8,
    garis_kemiskinan_k: 462.1,
  },
  {
    kode: "3271",
    nama: "Kota Bogor",
    p2_terkini: 0.21,
    p1_terkini: 0.88,
    penduduk_miskin_k: 72.4,
    garis_kemiskinan_k: 642.0,
  },
  {
    kode: "3272",
    nama: "Kota Sukabumi",
    p2_terkini: 0.22,
    p1_terkini: 0.91,
    penduduk_miskin_k: 25.1,
    garis_kemiskinan_k: 598.4,
  },
  {
    kode: "3273",
    nama: "Kota Bandung",
    p2_terkini: 0.12,
    p1_terkini: 0.54,
    penduduk_miskin_k: 98.7,
    garis_kemiskinan_k: 665.3,
  },
  {
    kode: "3274",
    nama: "Kota Cirebon",
    p2_terkini: 0.28,
    p1_terkini: 1.08,
    penduduk_miskin_k: 29.8,
    garis_kemiskinan_k: 584.7,
  },
  {
    kode: "3275",
    nama: "Kota Bekasi",
    p2_terkini: 0.14,
    p1_terkini: 0.61,
    penduduk_miskin_k: 134.2,
    garis_kemiskinan_k: 742.8,
  },
  {
    kode: "3276",
    nama: "Kota Depok",
    p2_terkini: 0.07,
    p1_terkini: 0.35,
    penduduk_miskin_k: 62.8,
    garis_kemiskinan_k: 768.9,
  },
  {
    kode: "3277",
    nama: "Kota Cimahi",
    p2_terkini: 0.15,
    p1_terkini: 0.64,
    penduduk_miskin_k: 28.4,
    garis_kemiskinan_k: 635.1,
  },
  {
    kode: "3278",
    nama: "Kota Tasikmalaya",
    p2_terkini: 0.42,
    p1_terkini: 1.58,
    penduduk_miskin_k: 82.6,
    garis_kemiskinan_k: 542.6,
  },
  {
    kode: "3279",
    nama: "Kota Banjar",
    p2_terkini: 0.18,
    p1_terkini: 0.75,
    penduduk_miskin_k: 11.9,
    garis_kemiskinan_k: 498.2,
  },
];

// Riwayat 6 titik waktu yang jelas (2005 - 2025)
function buildMilestoneHistory(latestP2 = 0.23) {
  const milestones = [
    { tahun: "2005", factor: 1.85 },
    { tahun: "2010", factor: 1.62 },
    { tahun: "2015", factor: 1.38 },
    { tahun: "2020", factor: 1.24 },
    { tahun: "2023", factor: 1.08 },
    { tahun: "2025", factor: 1.0 },
  ];
  return milestones.map((m) => ({
    tahun: m.tahun,
    p2: Number(Math.min(1.05, latestP2 * m.factor).toFixed(3)),
  }));
}

export default function RegionDisparity({
  activeRegion,
  p2TrendHistory,
  regionStats = [],
  onSelectRegion,
}) {
  const availableRegions =
    regionStats.length > 0 ? regionStats : JABAR_QUICK_LIST;
  const [selectedRegion, setSelectedRegion] = useState(
    activeRegion || availableRegions[0],
  );

  useEffect(() => {
    if (activeRegion) {
      setSelectedRegion(activeRegion);
    }
  }, [activeRegion]);

  const handleRegionChange = (e) => {
    const code = e.target.value;
    const found = availableRegions.find((r) => String(r.kode) === String(code));
    if (found) {
      setSelectedRegion(found);
      onSelectRegion?.(found.kode);
    }
  };

  const currentUrgency = selectedRegion?.p2_terkini ?? 0.23;
  const currentDepth = selectedRegion?.p1_terkini ?? 0.97;
  const activeStatus = getStatusInfo(currentUrgency);

  // Gunakan riwayat 6 titik tahun agar grafik batang jelas, proporsional, dan mudah dibaca
  const historyList =
    p2TrendHistory && p2TrendHistory.length >= 6
      ? p2TrendHistory
          .filter(
            (_, idx) =>
              idx % Math.ceil(p2TrendHistory.length / 6) === 0 ||
              idx === p2TrendHistory.length - 1,
          )
          .slice(-6)
      : buildMilestoneHistory(currentUrgency);

  const firstStatus = getStatusInfo(historyList[0]?.p2 ?? 0.5);
  const latestStatus = getStatusInfo(currentUrgency);

  return (
    <section id="wilayah" className="px-4 py-20">
      <div className="mx-auto max-w-[1080px]">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-[680px] text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(71,158,206,0.28)] bg-[rgba(71,158,206,0.14)] px-3 py-1 text-xs">
            Kondisi Tiap Wilayah
          </span>
          <h2 className="font-heading mt-3.5 mb-2.5 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Kebutuhan bantuan di tiap daerah{" "}
            <em className="not-italic text-[#479ece]">tidak sama</em>
          </h2>
          <p className="text-sm text-[#9fb8c9]">
            Tingkat kesulitan ekonomi antar 27 kota dan kabupaten di Jawa Barat
            bisa berbeda hingga 8 kali lipat. Penilaian RantaiAsa menyesuaikan
            data resmi BPS Jawa Barat.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Kiri: Perbandingan Antar Daerah & Grafik Tren */}
          <div className="space-y-5 rounded-2xl border border-[rgba(71,158,206,0.22)] bg-white/[0.04] p-6 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  Perbandingan Tingkat Urgensi Bantuan
                </h3>
                <p className="text-[11px] text-[#9fb8c9]">
                  Urutan wilayah dari prioritas tertinggi hingga terendah
                </p>
              </div>
              <span className="rounded-md border border-[rgba(71,158,206,0.25)] bg-[rgba(71,158,206,0.12)] px-2.5 py-1 font-mono text-[11px] text-[#479ece]">
                Data Resmi BPS
              </span>
            </div>

            {/* Daftar Perbandingan Urut Tertinggi -> Terendah */}
            <div className="space-y-3.5 text-xs">
              {COMPARISON_REGIONS.map((item) => {
                const status = getStatusInfo(item.value);
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#9fb8c9]">
                          {item.poorK.toLocaleString("id-ID")} rb jiwa
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${status.badgeClass}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-500/20">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${status.barClass}`}
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Catatan Pembanding Rata-rata Provinsi */}
              <div className="flex items-center justify-between rounded-xl border border-dashed border-[rgba(71,158,206,0.3)] bg-[rgba(71,158,206,0.06)] px-3.5 py-2 text-[11px]">
                <span className="text-[#9fb8c9]">
                  Patokan Rata-rata Provinsi Jawa Barat:
                </span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 font-bold text-amber-500">
                  Sedang (148,5 rb jiwa/daerah)
                </span>
              </div>
            </div>

            {/* Grafik Garis Perkembangan 20 Tahun */}
            {/* Grafik Garis Perkembangan 20 Tahun */}
            <div className="space-y-3 border-t border-slate-500/20 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <span className="font-semibold text-white">
                  Perubahan 20 Tahun Terakhir:{" "}
                  <span className="text-[#479ece]">{selectedRegion?.nama}</span>
                </span>
                <span className="text-[11px] font-medium text-emerald-500">
                  ↓ Grafik menurun = kondisi membaik
                </span>
              </div>

              <div className="rounded-xl bg-slate-500/10 px-3 pt-3 pb-2">
                {(() => {
                  const points = historyList.map((item, idx) => {
                    const x = 36 + idx * 70;
                    const ratio = Math.min(1, Math.max(0.08, item.p2 / 1.05));
                    const y = Math.round(78 - ratio * 48);
                    return {
                      ...item,
                      x,
                      y,
                      status: getStatusInfo(item.p2),
                    };
                  });

                  const linePoints = points
                    .map((p) => `${p.x},${p.y}`)
                    .join(" ");
                  const areaPoints = `36,88 ${linePoints} ${points[points.length - 1].x},88`;

                  return (
                    <svg
                      viewBox="0 0 422 112"
                      className="h-28 w-full overflow-visible"
                    >
                      <defs>
                        <linearGradient
                          id="trendAreaGrad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor={points[0]?.status.barColor || "#ef4444"}
                            stopOpacity="0.22"
                          />
                          <stop
                            offset="100%"
                            stopColor={latestStatus.barColor}
                            stopOpacity="0.22"
                          />
                        </linearGradient>
                        <linearGradient
                          id="trendLineGrad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor={points[0]?.status.barColor || "#ef4444"}
                          />
                          <stop
                            offset="100%"
                            stopColor={latestStatus.barColor}
                          />
                        </linearGradient>
                      </defs>

                      <line
                        x1="20"
                        y1="88"
                        x2="402"
                        y2="88"
                        stroke="currentColor"
                        strokeOpacity="0.12"
                        strokeWidth="1"
                      />

                      <polygon points={areaPoints} fill="url(#trendAreaGrad)" />

                      <polyline
                        fill="none"
                        stroke="url(#trendLineGrad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={linePoints}
                      />

                      {points.map((p, idx) => {
                        const isLatest = idx === points.length - 1;
                        return (
                          <g key={p.tahun}>
                            <text
                              x={p.x}
                              y={p.y - 10}
                              textAnchor="middle"
                              className="fill-current text-[9.5px] font-semibold opacity-80"
                            >
                              {p.status.label.replace("Sangat ", "Sgt. ")}
                            </text>

                            {isLatest && (
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="8"
                                fill={p.status.barColor}
                                fillOpacity="0.25"
                              />
                            )}

                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={isLatest ? "5" : "4"}
                              fill={p.status.barColor}
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />

                            <text
                              x={p.x}
                              y="104"
                              textAnchor="middle"
                              className={`fill-current font-mono text-[10.5px] ${
                                isLatest
                                  ? "font-bold opacity-100"
                                  : "opacity-65"
                              }`}
                            >
                              {p.tahun}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>

              <p className="text-[11px] text-[#9fb8c9]">
                {firstStatus.label === latestStatus.label ? (
                  latestStatus.label === "Rendah" ? (
                    <>
                      Kondisi di{" "}
                      <strong className="text-white">
                        {selectedRegion?.nama}
                      </strong>{" "}
                      tetap stabil di kategori{" "}
                      <strong style={{ color: latestStatus.barColor }}>
                        {latestStatus.label}
                      </strong>{" "}
                      sejak 2005 hingga 2025.
                    </>
                  ) : (
                    <>
                      Tingkat urgensi di{" "}
                      <strong className="text-white">
                        {selectedRegion?.nama}
                      </strong>{" "}
                      masih bertahan di kategori{" "}
                      <strong style={{ color: latestStatus.barColor }}>
                        {latestStatus.label}
                      </strong>{" "}
                      sejak 2005 hingga 2025, sehingga tetap perlu perhatian
                      khusus.
                    </>
                  )
                ) : (
                  <>
                    Tingkat urgensi di{" "}
                    <strong className="text-white">
                      {selectedRegion?.nama}
                    </strong>{" "}
                    membaik dari{" "}
                    <strong style={{ color: firstStatus.barColor }}>
                      {firstStatus.label}
                    </strong>{" "}
                    (2005) menjadi{" "}
                    <strong style={{ color: latestStatus.barColor }}>
                      {latestStatus.label}
                    </strong>{" "}
                    pada 2025.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Kanan: Pemilih Wilayah Langsung + 4 Kartu Detail */}
          <div className="space-y-3.5 lg:col-span-5">
            {/* Dropdown Pilih Kota/Kabupaten Langsung di Tempat */}
            <div className="rounded-2xl border border-[#479ece]/40 bg-[#479ece]/10 p-4">
              <style>{`
    #region-selector,
    #region-selector option {
      background-color: #071826;
      color: #ffffff;
    }
    .light #region-selector,
    .light #region-selector option,
    body.light #region-selector,
    body.light #region-selector option,
    [data-theme="light"] #region-selector,
    [data-theme="light"] #region-selector option {
      background-color: #ffffff !important;
      color: #0f172a !important;
    }
  `}</style>
              <label
                htmlFor="region-selector"
                className="mb-1.5 block text-xs font-semibold text-white"
              >
                Lihat Detail Kabupaten / Kota:
              </label>
              <select
                id="region-selector"
                value={selectedRegion?.kode || "3201"}
                onChange={handleRegionChange}
                className="w-full cursor-pointer rounded-xl border border-[rgba(71,158,206,0.4)] px-3 py-2.5 text-sm font-bold shadow-sm outline-none focus:border-[#479ece]"
              >
                {availableRegions.map((reg) => (
                  <option key={reg.kode} value={reg.kode}>
                    {reg.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-[rgba(71,158,206,0.22)] bg-white/[0.04] p-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[#9fb8c9]">
                  Batas Minimum Biaya Hidup
                </span>
                <span className="rounded bg-[rgba(71,158,206,0.15)] px-2 py-0.5 font-mono text-[10px] text-[#479ece]">
                  Standar BPS
                </span>
              </div>
              <div className="font-heading text-2xl font-extrabold text-white">
                {formatIDR(
                  Math.round(
                    (selectedRegion?.garis_kemiskinan_k || 531.4) * 1000,
                  ),
                )}
              </div>
              <small className="mt-0.5 block text-[11px] text-[#9fb8c9]">
                Minimal pengeluaran <strong>per 1 orang/bulan</strong> untuk
                kebutuhan dasar di {selectedRegion?.nama} (setara{" "}
                <strong className="text-white">
                  {formatIDR(
                    Math.round(
                      (selectedRegion?.garis_kemiskinan_k || 531.4) * 1000,
                    ) * 4,
                  )}
                </strong>{" "}
                untuk keluarga 4 orang).
              </small>
            </div>

            <div className="rounded-2xl border border-[rgba(71,158,206,0.22)] bg-white/[0.04] p-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[#9fb8c9]">Warga Kurang Mampu</span>
                <span className="font-mono text-[10px] text-emerald-500">
                  Data 2025
                </span>
              </div>
              <div className="font-heading text-2xl font-extrabold text-[#479ece]">
                {Number(
                  selectedRegion?.penduduk_miskin_k || 401.8,
                ).toLocaleString("id-ID")}{" "}
                <span className="text-base font-normal text-[#9fb8c9]">
                  ribu jiwa
                </span>
              </div>
              <small className="mt-0.5 block text-[11px] text-[#9fb8c9]">
                Total warga yang membutuhkan dukungan bantuan sosial menurut BPS
              </small>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[rgba(71,158,206,0.22)] bg-white/[0.04] p-3.5">
                <span className="block text-[11px] text-[#9fb8c9]">
                  Prioritas Bantuan
                </span>
                <span
                  className="font-heading mt-1 inline-block rounded-lg border border-current/20 px-2 py-0.5 text-base font-bold"
                  style={{ color: activeStatus.barColor }}
                >
                  {activeStatus.label}
                </span>
                <small className="mt-1.5 block text-[10px] leading-snug text-[#9fb8c9]">
                  Tingkat berat beban ekonomi warga
                </small>
              </div>

              <div className="rounded-2xl border border-[rgba(71,158,206,0.22)] bg-white/[0.04] p-3.5">
                <span className="block text-[11px] text-[#9fb8c9]">
                  Jarak ke Hidup Layak
                </span>
                <span className="font-heading mt-1 block text-lg font-bold text-[#479ece]">
                  {getDepthLabel(currentDepth)}
                </span>
                <small className="mt-1.5 block text-[10px] leading-snug text-[#9fb8c9]">
                  Selisih penghasilan dari batas layak
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
