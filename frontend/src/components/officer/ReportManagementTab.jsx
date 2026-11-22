import React, { useEffect, useState } from "react";
import { REGION_NAMES } from "../../geoConfig.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const STATUS_LABEL = {
  PENDING: "Menunggu",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  NEEDS_INFO: "Butuh Informasi",
};

export default function ReportManagementTab({ activeMenu, token }) {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selected, setSelected] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("VERIFIED");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const params = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
      const response = await fetch(`${API}/reports${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || "Gagal memuat laporan");
      setReports(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "laporan-warga") loadReports();
  }, [activeMenu, statusFilter, token]);

  const review = async (event) => {
    event.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/reports/${selected.id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: reviewStatus, officer_note: note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || "Gagal meninjau laporan");
      setSelected(null);
      setNote("");
      await loadReports();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (activeMenu !== "laporan-warga") return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="font-heading text-lg font-bold text-slate-900">Peninjauan Laporan Warga</h2>
          <p className="text-xs text-slate-500">Kelola laporan dari warga dan sukarelawan Jabar.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Menunggu</option>
          <option value="NEEDS_INFO">Butuh Informasi</option>
          <option value="VERIFIED">Terverifikasi</option>
          <option value="REJECTED">Ditolak</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Memuat laporan...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">Tidak ada laporan pada status ini.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Wilayah</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => {
                      setSelected(report);
                      setReviewStatus(report.status === "NEEDS_INFO" ? "VERIFIED" : "VERIFIED");
                      setNote(report.officer_note || "");
                    }}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-mono font-bold">#{report.id}</td>
                    <td className="px-4 py-3">{REGION_NAMES[parseInt(report.region_code)] || report.region_code}</td>
                    <td className="px-4 py-3">{report.category}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold">
                        {STATUS_LABEL[report.status] || report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(report.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          {selected ? (
            <form onSubmit={review} className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-slate-900">Laporan #{selected.id}</h3>
                <p className="mt-1 text-slate-500">{selected.description}</p>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Keputusan</label>
                <select
                  value={reviewStatus}
                  onChange={(event) => setReviewStatus(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                >
                  <option value="VERIFIED">Verifikasi</option>
                  <option value="NEEDS_INFO">Minta Informasi</option>
                  <option value="REJECTED">Tolak</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Catatan petugas</label>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2"
                  placeholder="Tulis hasil peninjauan..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-sky-600 py-2.5 font-bold text-white disabled:opacity-50"
              >
                Simpan Tinjauan
              </button>
            </form>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Pilih laporan untuk melihat detail dan meninjau.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
