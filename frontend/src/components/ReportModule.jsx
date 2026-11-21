import { useState } from "react";
import { REGION_NAMES } from "../geoConfig.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const CATEGORIES = [
  { value: "DUGAAN_GANDA",  label: "Dugaan penerima ganda" },
  { value: "TIDAK_LAYAK",  label: "Penerima tidak layak" },
  { value: "TIDAK_TERIMA", label: "Bantuan tidak diterima" },
  { value: "TERLAMBAT",    label: "Bantuan terlambat" },
  { value: "SALAH_DATA",   label: "Kesalahan data" }
];

function StatusBadge({ status }) {
  const map = {
    PENDING:    "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    VERIFIED:   "bg-[#5fd7a0]/15 text-[#5fd7a0] border border-[#5fd7a0]/30",
    REJECTED:   "bg-[#ff8a8a]/15 text-[#ff8a8a] border border-[#ff8a8a]/30",
    NEEDS_INFO: "bg-[#479ece]/15 text-[#479ece] border border-[#479ece]/30"
  };
  const labels = { PENDING: "Menunggu", VERIFIED: "Terverifikasi", REJECTED: "Ditolak", NEEDS_INFO: "Butuh Info" };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || ""}`}>{labels[status] || status}</span>;
}

export default function ReportModule() {
  const [tab, setTab] = useState("submit"); // submit | check
  const [form, setForm] = useState({ region_code: "", category: "", description: "", is_anonymous: false });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);
  const [checkId, setCheckId]       = useState("");
  const [checkToken, setCheckToken] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking]       = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault(); setErr(null); setResult(null); setSubmitting(true);
    try {
      const r = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || j.error);
      setResult(j);
      setForm({ region_code: "", category: "", description: "", is_anonymous: false });
    } catch (e) { setErr(e.message); }
    setSubmitting(false);
  }

  async function handleCheck(e) {
    e.preventDefault(); setErr(null); setCheckResult(null); setChecking(true);
    try {
      const r = await fetch(`${API}/reports/status/${checkId}`, {
        headers: checkToken ? { "X-Reporter-Token": checkToken } : {}
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || j.error);
      setCheckResult(j);
    } catch (e) { setErr(e.message); }
    setChecking(false);
  }

  return (
    <div className="bg-[#050f18] rounded-2xl border border-[rgba(71,158,206,0.25)] p-6 text-white shadow-xl">
      <h2 className="font-heading text-lg font-bold text-white mb-1">Pelaporan Warga / Sukarelawan Jabar</h2>
      <p className="text-xs text-[#9fb8c9] mb-4">Laporkan dugaan penyimpangan program bansos di 27 Kabupaten/Kota Jawa Barat. Identitas dapat dirahasiakan.</p>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[["submit","Kirim Laporan"],["check","Cek Status"]].map(([t,l]) => (
          <button
            key={t}
            onClick={() => { setTab(t); setErr(null); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              tab === t
                ? "bg-[#479ece] text-[#050f18] font-bold"
                : "bg-white/5 text-[#9fb8c9] hover:text-white border border-white/10"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {err && <div className="mb-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl p-3">{err}</div>}

      {tab === "submit" && !result && (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-white mb-1">Kabupaten/Kota <span className="text-rose-400">*</span></label>
            <select
              value={form.region_code}
              onChange={e => setForm(f => ({...f, region_code: e.target.value}))}
              className="w-full bg-[#0a1b2a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#479ece]"
              required
            >
              <option value="">— Pilih wilayah —</option>
              {Object.entries(REGION_NAMES).map(([kode, nama]) => (
                <option key={kode} value={kode}>{nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-white mb-1">Jenis Laporan <span className="text-rose-400">*</span></label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({...f, category: e.target.value}))}
              className="w-full bg-[#0a1b2a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#479ece]"
              required
            >
              <option value="">— Pilih kategori —</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-white mb-1">Deskripsi <span className="text-rose-400">*</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
              rows={4}
              required
              minLength={10}
              maxLength={2000}
              placeholder="Jelaskan permasalahan tanpa menyebut NIK atau data pribadi penerima…"
              className="w-full bg-[#0a1b2a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#479ece] resize-none"
            />
            <p className="text-[10px] text-[#9fb8c9] mt-1">*Aturan Privasi: Jangan sertakan NIK atau data pribadi (PII).</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anon"
              checked={form.is_anonymous}
              onChange={e => setForm(f => ({...f, is_anonymous: e.target.checked}))}
              className="accent-[#479ece]"
            />
            <label htmlFor="anon" className="text-xs text-[#9fb8c9] cursor-pointer">Kirim secara anonim</label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-[#479ece] to-[#2c7fb0] hover:brightness-110 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition cursor-pointer shadow-md"
          >
            {submitting ? "Mengirim…" : "Kirim Laporan"}
          </button>
        </form>
      )}

      {tab === "submit" && result && (
        <div className="bg-[#5fd7a0]/15 border border-[#5fd7a0]/30 rounded-xl p-5 text-xs space-y-2">
          <p className="font-bold text-[#5fd7a0] text-sm">✓ Laporan berhasil dikirim!</p>
          <p className="text-white">ID Laporan: <code className="bg-black/40 px-2 py-0.5 rounded text-[#bfe6f8] font-mono">{result.id}</code></p>
          <p className="text-white">Status: <StatusBadge status={result.status} /></p>
          {result.reporter_token && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-200">
              <p className="font-bold text-[11px] mb-1">⚠ Simpan token ini untuk cek status:</p>
              <code className="text-xs break-all text-[#bfe3f6] font-mono">{result.reporter_token}</code>
            </div>
          )}
          <button onClick={() => setResult(null)} className="mt-3 text-[#479ece] hover:underline text-xs block cursor-pointer">
            ← Kirim laporan lain
          </button>
        </div>
      )}

      {tab === "check" && (
        <form onSubmit={handleCheck} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-white mb-1">ID Laporan</label>
            <input
              type="number"
              value={checkId}
              onChange={e => setCheckId(e.target.value)}
              required
              min={1}
              className="w-full bg-[#0a1b2a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#479ece]"
              placeholder="Contoh: 1"
            />
          </div>
          <div>
            <label className="block font-semibold text-white mb-1">Token Pelapor (opsional)</label>
            <input
              type="text"
              value={checkToken}
              onChange={e => setCheckToken(e.target.value)}
              className="w-full bg-[#0a1b2a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#479ece]"
              placeholder="Token yang diterima saat submit"
            />
          </div>
          <button
            type="submit"
            disabled={checking}
            className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition cursor-pointer"
          >
            {checking ? "Memeriksa…" : "Cek Status Laporan"}
          </button>
          {checkResult && (
            <div className="bg-[#0a1b2a] border border-[rgba(71,158,206,0.3)] rounded-xl p-4 text-xs space-y-1.5 mt-3">
              <p><span className="text-[#9fb8c9]">Status:</span> <StatusBadge status={checkResult.status} /></p>
              <p><span className="text-[#9fb8c9]">Kategori:</span> <strong className="text-white">{checkResult.category}</strong></p>
              <p><span className="text-[#9fb8c9]">Wilayah:</span> <strong className="text-white">{REGION_NAMES[parseInt(checkResult.region_code)] || checkResult.region_code}</strong></p>
              {checkResult.reviewed_at && (
                <p><span className="text-[#9fb8c9]">Ditinjau pada:</span> <span className="font-mono text-slate-300">{checkResult.reviewed_at}</span></p>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
