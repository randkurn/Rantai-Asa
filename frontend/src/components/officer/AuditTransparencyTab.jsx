import React from "react";
import { formatIDR, shortHex } from "../../constants/auditData.js";

const SMART_CONTRACTS = [
  {
    code: "BUKU KONTRAK 1",
    title: "Registri Identitas Warga",
    address: "0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84",
  },
  {
    code: "BUKU KONTRAK 2",
    title: "Penyaluran Bantuan Sosial",
    address: "0xDd9E6cffA4DEB9493D6406A839480673Af13859D",
  },
  {
    code: "BUKU KONTRAK 3",
    title: "Registri Laporan Warga",
    address: "0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d",
  },
];

export default function AuditTransparencyTab({
  activeMenu,
  filteredRecipients = [],
  searchQuery,
  setSearchQuery,
}) {
  return (
    <>
      {/* 6. RIWAYAT & PENCARIAN BUKTI TRANSAKSI */}
      {(activeMenu === "riwayat" || activeMenu === "pencarian") && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-heading text-base font-bold text-slate-900">
                  Catatan Bukti Penyaluran
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar rekam jejak penyaluran yang sudah berhasil dicatat.
                </p>
              </div>
              <input
                type="text"
                placeholder="Ketik nomor bukti atau wilayah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-semibold">
                      Waktu Penyaluran
                    </th>
                    <th className="px-3 py-3 font-semibold">Nomor Bukti</th>
                    <th className="px-3 py-3 font-semibold">Kabupaten/Kota</th>
                    <th className="px-3 py-3 font-semibold">Program</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Nominal</th>
                    <th className="px-3 py-3 font-semibold">
                      Kode Bukti Digital
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecipients.length > 0 ? (
                    filteredRecipients.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="px-3 py-3 text-[11px] text-slate-500">
                          {rec.timestamp}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-slate-900">
                          {rec.id}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {rec.regionName}
                        </td>
                        <td className="px-3 py-3 font-medium text-sky-700">
                          {rec.program}
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            ✓ Tersalurkan
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-900">
                          {formatIDR(rec.amount)}
                        </td>
                        <td className="px-3 py-3 font-mono text-sky-600">
                          {rec.txHash !== "-" ? shortHex(rec.txHash) : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-8 text-center text-xs text-slate-500"
                      >
                        Tidak ada bukti transaksi yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. BUKU BESAR DIGITAL (SMART CONTRACT EXPLORER) */}
      {activeMenu === "explorer" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-6">
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Buku Besar Bersama (Blockchain)
              </h2>
              <p className="text-xs text-slate-500">
                Seluruh transaksi dicatat pada jaringan publik terbuka sehingga
                siapa pun bisa ikut mengawasi secara transparan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
              {SMART_CONTRACTS.map((contract) => (
                <div
                  key={contract.code}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="font-mono text-[10px] text-slate-400">
                    {contract.code}
                  </span>
                  <h3 className="mt-1 font-bold text-slate-900">
                    {contract.title}
                  </h3>
                  <p className="mt-2 break-all font-mono text-[11px] text-sky-700">
                    {contract.address}
                  </p>
                  <a
                    href={`https://amoy.polygonscan.com/address/${contract.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block font-semibold text-sky-600 hover:underline"
                  >
                    Buka di Penjelajah Transaksi ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
