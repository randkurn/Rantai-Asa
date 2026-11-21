import React from "react";
import { formatIDR } from "../constants/auditData.js";

export default function RegionDisparity({ activeRegion, p2TrendHistory, trendLoading }) {
  return (
    <section id="wilayah" className="py-20 px-4">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(71,158,206,0.14)] border border-[rgba(71,158,206,0.28)] text-xs text-[#d6ecf8]">
            Kesenjangan Wilayah
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-3.5 mb-2.5 leading-tight">
            Audit harus bekerja di skala yang <em className="text-[#479ece] not-italic">berbeda-beda</em>
          </h2>
          <p className="text-[#9fb8c9] text-sm">
            Disparitas kemiskinan antar 27 Kabupaten/Kota di Jawa Barat mencapai 8x lipat. Sistem RantaiAsa mengintegrasikan data terbuka resmi BPS Jawa Barat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kiri: Bar Disparitas Wilayah */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white">Benchmark Keparahan Kemiskinan (P2) Jabar</h3>
              <span className="text-[11px] font-mono text-[#9fb8c9]">Data Terbuka BPS</span>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                <span className="font-semibold text-white truncate">{activeRegion.nama}</span>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2c7fb0] to-[#ffffff] transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, ((activeRegion.p2_terkini || 0.23) / 0.6) * 100))}%` }}
                  />
                </div>
                <b className="font-mono text-right text-white font-bold">{activeRegion.p2_terkini?.toFixed(3) ?? "0.230"}</b>
              </div>

              <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                <span className="text-[#9fb8c9]">Kab. Tasikmalaya</span>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#2c7fb0] to-[#bfe6f8]" style={{ width: "90%" }} />
                </div>
                <b className="font-mono text-right text-[#bfe6f8]">0.540</b>
              </div>

              <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                <span className="text-[#9fb8c9]">Kab. Cianjur</span>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#2c7fb0] to-[#479ece]" style={{ width: "68%" }} />
                </div>
                <b className="font-mono text-right text-[#479ece]">0.410</b>
              </div>

              <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                <span className="text-[#9fb8c9]">Rata-rata Jabar</span>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0b3a5a] to-[#2c7fb0]" style={{ width: "55%" }} />
                </div>
                <b className="font-mono text-right text-[#9fb8c9]">0.330</b>
              </div>

              <div className="grid grid-cols-[130px_1fr_60px] gap-3 items-center">
                <span className="text-[#9fb8c9]">Kota Depok</span>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#0b3a5a]" style={{ width: "12%" }} />
                </div>
                <b className="font-mono text-right text-[#479ece]">0.070</b>
              </div>
            </div>

            {/* Riwayat Tren 2004-2025 */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Riwayat Tren P2 2004–2025: <span className="text-[#479ece]">{activeRegion.nama}</span>
                </span>
                <span className="text-[10px] font-mono text-[#9fb8c9]">BPS Jawa Barat</span>
              </div>
              {p2TrendHistory && p2TrendHistory.length > 0 ? (
                <div>
                  <div className="flex items-end gap-1 h-16 pt-2 pb-1 overflow-x-auto">
                    {p2TrendHistory.map((item, idx) => {
                      const maxP2 = 1.2;
                      const heightPct = Math.min(100, Math.max(10, (item.p2 / maxP2) * 100));
                      const isLatest = idx === p2TrendHistory.length - 1;
                      return (
                        <div
                          key={item.tahun}
                          className="flex-1 min-w-[12px] flex flex-col items-center group relative cursor-pointer"
                          title={`${item.tahun}: P2 ${item.p2.toFixed(3)}`}
                        >
                          <div
                            className={`w-full rounded-t transition-all ${
                              isLatest ? "bg-white shadow-[0_0_8px_#ffffff]" : "bg-[#479ece]/60 group-hover:bg-[#bfe6f8]"
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-[8px] font-mono text-[#9fb8c9] mt-1 scale-90">
                            {String(item.tahun).slice(-2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#9fb8c9] mt-0.5">
                    <span>2004 ({p2TrendHistory[0]?.p2.toFixed(2)})</span>
                    <span className="text-[#5fd7a0] font-bold">
                      2025 ({p2TrendHistory[p2TrendHistory.length - 1]?.p2.toFixed(2)})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-[#9fb8c9]">
                  {trendLoading ? "Memuat riwayat tren..." : "Memuat data riwayat BPS..."}
                </div>
              )}
            </div>
          </div>

          {/* Kanan: 4 Card Indikator BPS Nyata */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#9fb8c9]">Garis Kemiskinan (GK BPS)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(71,158,206,0.15)] text-[#479ece]">
                  Kode: {activeRegion.kode}
                </span>
              </div>
              <div className="font-heading font-extrabold text-2xl text-white">
                {formatIDR(Math.round((activeRegion.garis_kemiskinan_k || 531.4) * 1000))}
              </div>
              <small className="text-[#9fb8c9] text-[11px] block mt-0.5">
                Rupiah per kapita per bulan di {activeRegion.nama}
              </small>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#9fb8c9]">Jumlah Penduduk Miskin</span>
                <span className="text-[10px] font-mono text-[#5fd7a0]">Tahun {activeRegion.tahun_data || 2025}</span>
              </div>
              <div className="font-heading font-extrabold text-2xl text-[#bfe6f8]">
                {Number(activeRegion.penduduk_miskin_k || 401.8).toLocaleString("id-ID")}{" "}
                <span className="text-base font-normal text-slate-300">ribu jiwa</span>
              </div>
              <small className="text-[#9fb8c9] text-[11px] block mt-0.5">
                Berdasarkan sensus data terbuka Galura Jabar BPS
              </small>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)]">
                <span className="text-[#9fb8c9] text-[11px] block">Indeks Keparahan (P2)</span>
                <span className="font-heading font-bold text-xl text-white mt-0.5 block">
                  {activeRegion.p2_terkini?.toFixed(3) ?? "0.230"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-[rgba(71,158,206,0.18)]">
                <span className="text-[#9fb8c9] text-[11px] block">Indeks Kedalaman (P1)</span>
                <span className="font-heading font-bold text-xl text-[#479ece] mt-0.5 block">
                  {activeRegion.p1_terkini?.toFixed(3) ?? "0.970"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}