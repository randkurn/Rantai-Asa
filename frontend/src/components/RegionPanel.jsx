import { useState } from "react";

// Panel detail wilayah saat diklik di peta
export default function RegionPanel({ region, onClose }) {
  if (!region) return null;
  const { kode, name, stat } = region;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{name}</h3>
          <p className="text-xs text-slate-400">Kode: {kode} · Jawa Barat</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="P2 Terkini" value={stat?.p2_terkini?.toFixed(3) ?? "—"} unit="poin" color="text-orange-600" />
        <StatCard label="Tren 3 Thn" value={stat?.tren !== undefined ? (stat.tren > 0 ? "▲" : stat.tren < 0 ? "▼" : "→") : "—"} sub={stat?.tren?.toFixed(3)} color={stat?.tren > 0 ? "text-red-600" : "text-green-600"} />
        <StatCard label="Registrasi" value={stat?.registrasi ?? "—"} unit="jiwa" color="text-blue-600" />
        <StatCard label="Penyaluran" value={stat?.penyaluran ?? "—"} unit="kali" color="text-teal-600" />
      </div>

      {stat?.laporan_verified > 0 && (
        <div className="bg-amber-50 rounded-lg p-3 text-sm">
          <span className="font-medium text-amber-800">⚠ {stat.laporan_verified} laporan terverifikasi</span>
          <p className="text-amber-700 text-xs mt-0.5">Lihat tab Pelaporan untuk detail.</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 italic">
          P2 = Indeks Keparahan Kemiskinan (data nyata BPS Jawa Barat).<br />
          Registrasi & penyaluran: SIMULASI.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, sub, color }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {unit && <p className="text-xs text-slate-400">{unit}</p>}
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
