import React from "react";
import { formatIDR } from "../constants/auditData.js";

function getUrgencyLabel(val = 0.23) {
  if (val >= 0.45) return "Sangat Tinggi";
  if (val >= 0.35) return "Tinggi";
  if (val >= 0.2) return "Sedang";
  return "Rendah";
}

function getDepthLabel(val = 0.97) {
  if (val >= 1.5) return "Sangat Jauh";
  if (val >= 1.0) return "Cukup Jauh";
  return "Mendekati Layak";
}

const BENCHMARK_REGIONS = [
  {
    name: "Kab. Tasikmalaya",
    value: 0.54,
    width: "90%",
    color: "from-[#2c7fb0] to-[#bfe6f8]",
    textColor: "text-[#bfe6f8]",
  },
  {
    name: "Kab. Cianjur",
    value: 0.41,
    width: "68%",
    color: "from-[#2c7fb0] to-[#479ece]",
    textColor: "text-[#479ece]",
  },
  {
    name: "Rata-rata Jabar",
    value: 0.33,
    width: "55%",
    color: "from-[#0b3a5a] to-[#2c7fb0]",
    textColor: "text-[#9fb8c9]",
  },
  {
    name: "Kota Depok",
    value: 0.07,
    width: "12%",
    color: "from-[#0b3a5a] to-[#0b3a5a]",
    textColor: "text-[#479ece]",
  },
];

export default function RegionDisparity({
  activeRegion,
  p2TrendHistory,
  trendLoading,
}) {
  const currentUrgency = activeRegion.p2_terkini ?? 0.23;
  const currentDepth = activeRegion.p1_terkini ?? 0.97;

  const firstTrend = p2TrendHistory?.[0]?.p2;
  const latestTrend = p2TrendHistory?.[p2TrendHistory.length - 1]?.p2;
  const isImproving =
    typeof firstTrend === "number" &&
    typeof latestTrend === "number" &&
    latestTrend < firstTrend;

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
          {/* Kiri: Perbandingan Antar Wilayah */}
          <div className="space-y-4 rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-6 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-white">
                Perbandingan Tingkat Urgensi Bantuan
              </h3>
              <span className="font-mono text-[11px] text-[#9fb8c9]">
                Data Resmi BPS
              </span>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              {/* Wilayah yang sedang dipilih */}
              <div className="grid grid-cols-[130px_1fr_92px] items-center gap-3">
                <span className="truncate font-semibold text-white">
                  {activeRegion.nama}
                </span>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2c7fb0] to-white transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(10, (currentUrgency / 0.6) * 100))}%`,
                    }}
                  />
                </div>
                <b className="text-right font-semibold text-white">
                  {getUrgencyLabel(currentUrgency)}
                </b>
              </div>

              {/* Wilayah Pembanding */}
              {BENCHMARK_REGIONS.map((item) => (
                <div
                  key={item.name}
                  className="grid grid-cols-[130px_1fr_92px] items-center gap-3"
                >
                  <span className="text-[#9fb8c9]">{item.name}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      style={{ width: item.width }}
                    />
                  </div>
                  <b className={`text-right font-semibold ${item.textColor}`}>
                    {getUrgencyLabel(item.value)}
                  </b>
                </div>
              ))}
            </div>

            {/* Riwayat Perkembangan 2004–2025 */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Perkembangan Kondisi Warga (2004–2025):{" "}
                  <span className="text-[#479ece]">{activeRegion.nama}</span>
                </span>
                <span className="font-mono text-[10px] text-[#9fb8c9]">
                  BPS Jawa Barat
                </span>
              </div>

              {p2TrendHistory && p2TrendHistory.length > 0 ? (
                <div>
                  <div className="flex h-16 items-end gap-1 overflow-x-auto pt-2 pb-1">
                    {p2TrendHistory.map((item, idx) => {
                      const maxP2 = 1.2;
                      const heightPct = Math.min(
                        100,
                        Math.max(10, (item.p2 / maxP2) * 100),
                      );
                      const isLatest = idx === p2TrendHistory.length - 1;
                      return (
                        <div
                          key={item.tahun}
                          className="group relative flex min-w-[12px] flex-1 cursor-pointer flex-col items-center"
                          title={`Tahun ${item.tahun}: Urgensi ${getUrgencyLabel(item.p2)}`}
                        >
                          <div
                            className={`w-full rounded-t transition-all ${
                              isLatest
                                ? "bg-white shadow-[0_0_8px_#ffffff]"
                                : "bg-[#479ece]/60 group-hover:bg-[#bfe6f8]"
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="mt-1 scale-90 font-mono text-[8px] text-[#9fb8c9]">
                            {String(item.tahun).slice(-2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-0.5 flex justify-between text-[11px] text-[#9fb8c9]">
                    <span>
                      2004: <strong>{getUrgencyLabel(firstTrend)}</strong>
                    </span>
                    <span className="font-semibold text-[#5fd7a0]">
                      2025: {getUrgencyLabel(latestTrend)}
                      {isImproving ? " (Membaik)" : ""}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-xs text-[#9fb8c9]">
                  {trendLoading
                    ? "Memuat riwayat perkembangan..."
                    : "Memuat data riwayat BPS..."}
                </div>
              )}
            </div>
          </div>

          {/* Kanan: 4 Kartu Informasi Wilayah */}
          <div className="space-y-3.5 lg:col-span-5">
            <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-4">
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
                  Math.round((activeRegion.garis_kemiskinan_k || 531.4) * 1000),
                )}
              </div>
              <small className="mt-0.5 block text-[11px] text-[#9fb8c9]">
                Minimal pengeluaran per orang setiap bulan untuk kebutuhan dasar
                di {activeRegion.nama}
              </small>
            </div>

            <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[#9fb8c9]">Warga Kurang Mampu</span>
                <span className="font-mono text-[10px] text-[#5fd7a0]">
                  Data {activeRegion.tahun_data || 2025}
                </span>
              </div>
              <div className="font-heading text-2xl font-extrabold text-[#bfe6f8]">
                {Number(activeRegion.penduduk_miskin_k || 401.8).toLocaleString(
                  "id-ID",
                )}{" "}
                <span className="text-base font-normal text-slate-300">
                  ribu jiwa
                </span>
              </div>
              <small className="mt-0.5 block text-[11px] text-[#9fb8c9]">
                Total warga yang membutuhkan dukungan bantuan sosial menurut BPS
              </small>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-3.5">
                <span className="block text-[11px] text-[#9fb8c9]">
                  Prioritas Bantuan
                </span>
                <span className="font-heading mt-0.5 block text-lg font-bold text-white">
                  {getUrgencyLabel(currentUrgency)}
                </span>
                <small className="mt-1 block text-[10px] leading-snug text-[#9fb8c9]">
                  Tingkat berat beban ekonomi warga
                </small>
              </div>

              <div className="rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04] p-3.5">
                <span className="block text-[11px] text-[#9fb8c9]">
                  Jarak ke Hidup Layak
                </span>
                <span className="font-heading mt-0.5 block text-lg font-bold text-[#479ece]">
                  {getDepthLabel(currentDepth)}
                </span>
                <small className="mt-1 block text-[10px] leading-snug text-[#9fb8c9]">
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
