import React, { useState } from "react";
import { formatIDR, shortHex } from "../../constants/auditData.js";

export default function RecipientOverviewTab({
  recipientList = [],
  filteredRecipients = [],
  searchQuery,
  setSearchQuery,
  onOpenRegister,
}) {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const lolosCount = recipientList.filter(
    (r) => r.status !== "DITOLAK_SISTEM",
  ).length;
  const cairList = recipientList.filter(
    (r) => r.status === "TERCATAT_BLOCKCHAIN",
  );
  const totalDana = cairList.reduce((acc, curr) => acc + curr.amount, 0);

  const displayedRecipients = filteredRecipients.filter((rec) =>
    statusFilter === "ALL" ? true : rec.status === statusFilter,
  );

  return (
    <div className="space-y-6">
      {/* 4 Kartu Ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-xs text-slate-500">Penerima Lolos</span>
          <div className="font-heading mt-1.5 text-2xl font-bold text-slate-900">
            {lolosCount.toLocaleString("id-ID")} Warga
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-xs text-slate-500">Total Dana Cair</span>
          <div className="font-heading mt-1.5 text-2xl font-bold text-slate-900">
            {formatIDR(totalDana)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-xs text-slate-500">Sistem Penilai</span>
          <div className="font-heading mt-1.5 text-2xl font-bold text-emerald-600">
            9 + 5 Indikator
          </div>
        </div>
      </div>

      {/* Tabel Daftar Penerima dengan Lebar Terbatas */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="font-heading text-base font-bold text-slate-900">
            Daftar Penerima Bantuan
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Cari wilayah atau kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="TERCATAT_BLOCKCHAIN">Sudah Cair</option>
              <option value="SIAP_SALUR">Siap Disalurkan</option>
              <option value="DITOLAK_SISTEM">Ditolak</option>
            </select>

            <button
              onClick={onOpenRegister}
              className="cursor-pointer whitespace-nowrap rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-semibold !text-white hover:bg-sky-700"
            >
              + Tambah Warga
            </button>
          </div>
        </div>

        {/* Batasi lebar kontainer agar scrollbar horizontal langsung aktif */}
        <div
          className="w-full max-w-[850px]  overflow-x-auto pb-3"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 #f1f5f9",
          }}
        >
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Kode
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  NIK
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Wilayah
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Program
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Skor
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Status
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Nominal
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Bukti
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRecipients.length > 0 ? (
                displayedRecipients.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-slate-900">
                      {rec.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">
                      {rec.nikMasked}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {rec.regionName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-sky-700">
                      {rec.program}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-bold ${
                          rec.aiScore >= 60
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {rec.aiScore} (
                        {rec.aiStatus === "LAYAK" ? "Layak" : "Tidak"})
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          rec.status === "TERCATAT_BLOCKCHAIN"
                            ? "bg-emerald-50 text-emerald-700"
                            : rec.status === "SIAP_SALUR"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {rec.status === "TERCATAT_BLOCKCHAIN" && "Sudah Cair"}
                        {rec.status === "SIAP_SALUR" && "Siap Disalurkan"}
                        {rec.status === "DITOLAK_SISTEM" && "Ditolak"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                      {formatIDR(rec.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sky-600">
                      {rec.txHash !== "-" ? (
                        <a
                          href={`https://amoy.polygonscan.com/tx/${rec.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {shortHex(rec.txHash)} ↗
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-xs text-slate-500"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
