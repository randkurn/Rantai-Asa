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

// Data perbandingan lengkap dengan persentase lebar batang
const COMPARISON_REGIONS = [
  { name: "Kab. Tasikmalaya", value: 0.54, width: "92%", poorK: 191.2 },
  { name: "Kab. Cianjur", value: 0.41, width: "70%", poorK: 242.1 },
  { name: "Kab. Indramayu", value: 0.36, width: "60%", poorK: 215.4 },
  { name: "Kab. Bogor", value: 0.23, width: "42%", poorK: 401.8 },
  { name: "Kota Depok", value: 0.07, width: "16%", poorK: 62.8 },
];

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

export default function RegionDisparity({
  activeRegion,
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

  return (
    <section id="wilayah" className="px-4 pt-8 pb-20">
      <div className="mx-auto max-w-[1080px]">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-[680px] text-center">
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
          {/* Kiri: Grafik Batang Urgensi Antar Daerah */}
          <div className="space-y-5 rounded-2xl border border-[rgba(71,158,206,0.22)] bg-white/[0.04] p-6 lg:col-span-7">
            <div>
              <h3 className="font-heading text-base font-bold text-white">
                Perbandingan Tingkat Urgensi Bantuan
              </h3>
              <p className="text-[11px] text-[#9fb8c9]">
                Urutan wilayah dari prioritas tertinggi hingga terendah
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {COMPARISON_REGIONS.map((item) => {
                const status = getStatusInfo(item.value);
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">
                        {item.name}
                      </span>
                        {status.label}
                    </div>
                    {/* Progress Bar Interaktif */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${status.barClass} transition-all duration-500`}
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kanan: Dropdown Wilayah & Detail Kartu */}
          <div className="space-y-3.5 lg:col-span-5">
            <div className="rounded-2xl border border-[#479ece]/40  p-4">
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
