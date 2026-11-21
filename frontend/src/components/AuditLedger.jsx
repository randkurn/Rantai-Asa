import React, { useState, useMemo } from "react";
import { shortHex } from "../constants/auditData.js";

export default function AuditLedger({ auditRecords = [], onSelectTx }) {
  const [ledgerFilter, setLedgerFilter] = useState("all"); // all | ok | no
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLedger = useMemo(() => {
    return auditRecords.filter((r) => {
      const matchFilter =
        ledgerFilter === "all" ||
        (ledgerFilter === "ok"
          ? r.status === "TERCATAT"
          : r.status !== "TERCATAT");
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.txHash.toLowerCase().includes(q) ||
        r.refId.toLowerCase().includes(q) ||
        r.identityHash.toLowerCase().includes(q) ||
        r.province.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [auditRecords, ledgerFilter, searchQuery]);

  return (
    <section id="ledger" className="bg-[#0a1b2a] px-4 pt-8 pb-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="mx-auto mb-10 max-w-[680px] text-center">
          <h2 className="font-heading mt-3.5 mb-2.5 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Pantau langsung setiap{" "}
            <em className="not-italic text-[#479ece]">
              bantuan yang tersalurkan
            </em>
          </h2>
          <p className="text-sm text-[#9fb8c9]">
            Transparansi penuh pencatatan bansos warga Jawa Barat yang
            transparan, adil, dan tercatat permanen.
          </p>
        </div>

        {/* Filter Status */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setLedgerFilter("all")}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                ledgerFilter === "all"
                  ? "bg-[#479ece] font-bold !text-white"
                  : "border border-[rgba(71,158,206,0.28)] text-[#9fb8c9] hover:text-white"
              }`}
            >
              Semua ({auditRecords.length})
            </button>
            <button
              onClick={() => setLedgerFilter("ok")}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                ledgerFilter === "ok"
                  ? "bg-[#479ece] font-bold !text-white"
                  : "border border-[rgba(71,158,206,0.28)] text-[#9fb8c9] hover:text-white"
              }`}
            >
              Tersalurkan (
              {auditRecords.filter((r) => r.status === "TERCATAT").length})
            </button>
            <button
              onClick={() => setLedgerFilter("no")}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                ledgerFilter === "no"
                  ? "bg-[#479ece] font-bold !text-white"
                  : "border border-[rgba(71,158,206,0.28)] text-[#9fb8c9] hover:text-white"
              }`}
            >
              Ditolak (
              {auditRecords.filter((r) => r.status !== "TERCATAT").length})
            </button>
          </div>
        </div>

        {/* Kolom Pencarian */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Cari berdasarkan kode bukti, kode identitas warga, nomor referensi, atau kabupaten/kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[rgba(71,158,206,0.2)] bg-white/[0.04] px-3.5 py-2 text-xs text-white placeholder-[#9fb8c9]/50 focus:border-[#479ece] focus:outline-none"
          />
        </div>

        {/* Tabel Riwayat Penyaluran */}
        <div className="overflow-x-auto rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[rgba(71,158,206,0.07)] text-[11px] font-medium text-[#9fb8c9]">
                <th className="px-4 py-3">Waktu (WIB)</th>
                <th className="px-4 py-3">No. Arsip</th>
                <th className="px-4 py-3">Kode Identitas</th>
                <th className="px-4 py-3">Jenis Bantuan</th>
                <th className="px-4 py-3">Kab/Kota Jabar</th>
                <th className="px-4 py-3">Nilai Layak</th>
                <th className="px-4 py-3">Status Pencairan</th>
                <th className="px-4 py-3">Bukti Digital</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredLedger.length > 0 ? (
                filteredLedger.map((row, idx) => {
                  const isIneligible =
                    row.status === "TIDAK_LAYAK" ||
                    (row.status !== "TERCATAT" &&
                      row.aiScore > 0 &&
                      row.aiScore < 60);

                  return (
                    <tr
                      key={row.txHash || idx}
                      onClick={() => onSelectTx(row)}
                      className="cursor-pointer transition hover:bg-white/[0.04]"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-[#9fb8c9]">
                        {row.timestamp}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-white">
                        #{row.block}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#bfe3f6]">
                        {shortHex(row.identityHash)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-white">
                        {row.program}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-white">
                        {row.province}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {row.aiScore > 0 ? (
                          <span
                            className={
                              row.aiScore >= 60
                                ? "text-[#5fd7a0]"
                                : "text-amber-400"
                            }
                          >
                            {row.aiScore}/100
                          </span>
                        ) : (
                          <span className="text-[#9fb8c9]">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {row.status === "TERCATAT" ? (
                            <span className="rounded-full border border-[#5fd7a0]/30 bg-[#5fd7a0]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#5fd7a0]">
                              Tersalurkan
                            </span>
                          ) : isIneligible ? (
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                              Ditolak: Tidak Layak
                            </span>
                          ) : (
                            <span className="rounded-full border border-[#ff8a8a]/30 bg-[#ff8a8a]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#ff8a8a]">
                              Ditolak: Sudah Terdaftar
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#479ece]">
                        <span className="hover:underline">
                          {shortHex(row.txHash)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-xs text-[#9fb8c9]"
                  >
                    Data penyaluran tidak ditemukan untuk kata kunci tersebut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
