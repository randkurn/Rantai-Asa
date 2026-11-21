import React, { useState, useMemo } from "react";
import { shortHex } from "../constants/auditData.js";

export default function AuditLedger({
  auditRecords,
  onSimulateDisburse,
  onSimulateDuplicate,
  onSelectTx,
}) {
  const [ledgerFilter, setLedgerFilter] = useState("all"); // all | ok | no
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLedger = useMemo(() => {
    return auditRecords.filter((r) => {
      const matchFilter =
        ledgerFilter === "all" ||
        (ledgerFilter === "ok" ? r.status === "TERCATAT" : r.status !== "TERCATAT");
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
    <section id="ledger" className="py-20 px-4 bg-[#0a1b2a]">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center max-w-[680px] mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(71,158,206,0.14)] border border-[rgba(71,158,206,0.28)] text-xs ">
            Ledger Audit Publik
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-3.5 mb-2.5 leading-tight">
            Setiap penyaluran, <em className="text-[#479ece] not-italic">terverifikasi</em> siapa pun
          </h2>
          <p className="text-[#9fb8c9] text-sm">
            Coba simulasikan penyaluran atau pendaftaran ganda dan amati bagaimana smart contract menolaknya tanpa kompromi.
          </p>
        </div>

        {/* Tools & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLedgerFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                ledgerFilter === "all"
                  ? "bg-[#479ece] text-[#04121c] font-bold"
                  : "border border-[rgba(71,158,206,0.28)] text-[#9fb8c9] hover:text-white"
              }`}
            >
              Semua ({auditRecords.length})
            </button>
            <button
              onClick={() => setLedgerFilter("ok")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                ledgerFilter === "ok"
                  ? "bg-[#479ece] text-[#04121c] font-bold"
                  : "border border-[rgba(71,158,206,0.28)] text-[#9fb8c9] hover:text-white"
              }`}
            >
              Tersalurkan ({auditRecords.filter((r) => r.status === "TERCATAT").length})
            </button>
            <button
              onClick={() => setLedgerFilter("no")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                ledgerFilter === "no"
                  ? "bg-[#479ece] text-[#04121c] font-bold"
                  : "border border-[rgba(71,158,206,0.28)] text-[#9fb8c9] hover:text-white"
              }`}
            >
              Ditolak ({auditRecords.filter((r) => r.status !== "TERCATAT").length})
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onSimulateDisburse}
              className="px-3.5 py-1.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#479ece] to-[#2c7fb0] hover:brightness-110 shadow-sm transition cursor-pointer"
            >
              + Simulasikan penyaluran
            </button>
            <button
              onClick={onSimulateDuplicate}
              className="px-3.5 py-1.5 rounded-xl font-semibold text-xs text-[#ff8a8a] bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition cursor-pointer"
            >
              Uji pendaftaran ganda
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Cari berdasarkan Tx Hash, Hash Identitas, Kode Referensi, atau Kabupaten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-[rgba(71,158,206,0.2)] text-xs text-white placeholder-[#9fb8c9]/50 focus:outline-none focus:border-[#479ece]"
          />
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-[rgba(71,158,206,0.18)] bg-white/[0.04]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[rgba(71,158,206,0.07)] text-[#9fb8c9] text-[11px] font-medium border-b border-white/[0.06]">
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Blok</th>
                <th className="py-3 px-4">Hash Identitas</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Kab/Kota Jabar</th>
                <th className="py-3 px-4">Skor AI</th>
                <th className="py-3 px-4">Status Smart Contract</th>
                <th className="py-3 px-4">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredLedger.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => onSelectTx(row)}
                  className="hover:bg-white/[0.04] cursor-pointer transition"
                >
                  <td className="py-3 px-4 text-[#9fb8c9] font-mono text-[11px] whitespace-nowrap">{row.timestamp}</td>
                  <td className="py-3 px-4 font-mono text-white text-[11px]">#{row.block}</td>
                  <td className="py-3 px-4 font-mono text-[#bfe3f6] text-[11px]">{shortHex(row.identityHash)}</td>
                  <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">{row.program}</td>
                  <td className="py-3 px-4 text-white whitespace-nowrap">{row.province}</td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {row.aiScore > 0 ? (
                      <span className={row.aiScore >= 60 ? "text-[#5fd7a0]" : "text-[#ff8a8a]"}>{row.aiScore}</span>
                    ) : (
                      <span className="text-[#9fb8c9]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {row.status === "TERCATAT" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5fd7a0]/15 text-[#5fd7a0] border border-[#5fd7a0]/30">
                        Tersalurkan
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff8a8a]/15 text-[#ff8a8a] border border-[#ff8a8a]/30">
                        Ditolak: Duplikat
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#479ece] text-[11px]">
                    <span className="hover:underline">{shortHex(row.txHash)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[#9fb8c9] mt-3">
          *Data demo adalah simulasi interaktif. Pada mode produksi, setiap baris dibaca langsung dari event smart contract di Polygon Amoy Testnet.
        </p>
      </div>
    </section>
  );
}