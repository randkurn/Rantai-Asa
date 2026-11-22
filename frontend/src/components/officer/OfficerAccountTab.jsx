import React, { useEffect, useState } from "react";

export default function OfficerAccountTab({ activeMenu, officer, token, onLogout }) {
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [stats, setStats] = useState(null);
  const [network, setNetwork] = useState(null);
  const [contracts, setContracts] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:4000/officer/stats", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null).then(setStats).catch(() => setStats(null));
  }, [token]);

  useEffect(() => {
    fetch("http://localhost:4000/public/network")
      .then(r => r.json())
      .then(setNetwork)
      .catch(() => setNetwork({ connected: false, chain_id: 80002, block_number: null, latency_ms: null }));
    fetch("http://localhost:4000/public/contracts")
      .then(r => r.ok ? r.json() : null)
      .then(setContracts)
      .catch(() => setContracts(null));
  }, []);

  const walletAddress = officer?.wallet || "";

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <>
      {/* 8. PROFIL KEPEGAWAIAN ASN */}
      {activeMenu === "profil" && (
        <div className="max-w-4xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-2xl font-extrabold text-white shadow-sm">
                  {officer?.name ? officer.name.charAt(0) : "B"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-lg font-bold text-slate-900">
                      {officer?.name || "-"}
                    </h2>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      ASN Aktif
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {officer?.department || "-"}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400">
                    NIP: {officer?.nip || "-"}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="block text-[11px] text-slate-400">
                  Surat Keputusan (SK) Tugas
                </span>
                <strong className="block text-xs font-semibold text-slate-800">
                  Tidak tersedia
                </strong>
                <span className="text-[10px] font-medium text-sky-600">
                  Status kepegawaian terverifikasi
                </span>
              </div>
            </div>

            {/* 3 Metrik Kinerja Petugas */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <span className="block text-[11px] text-slate-500">
                  Warga Diverifikasi
                </span>
                <strong className="font-heading mt-1 block text-2xl font-bold text-slate-900">
                  {stats?.recipients_verified ?? 0}
                </strong>
                <span className="text-[10px] font-medium text-emerald-600">
                  Dari database penerima
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <span className="block text-[11px] text-slate-500">
                  Penyaluran Disahkan
                </span>
                <strong className="font-heading mt-1 block text-2xl font-bold text-sky-600">
                  {stats?.disbursements ?? 0}
                </strong>
                <span className="text-[10px] text-slate-500">
                  Total Rp {(stats?.disbursed_amount ?? 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <span className="block text-[11px] text-slate-500">
                  Aduan Warga Ditangani
                </span>
                <strong className="font-heading mt-1 block text-2xl font-bold text-slate-900">
                  {stats?.reports_handled ?? 0}
                </strong>
                <span className="text-[10px] font-medium text-emerald-600">
                  Ditangani melalui akun petugas
                </span>
              </div>
            </div>

            {/* Detail Penugasan & Wilayah */}
            <div className="mt-6 grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Pangkat &amp; Jabatan Fungsional
                </span>
                <div className="flex justify-between border-b border-slate-200/80 py-1">
                  <span className="text-slate-500">Jabatan:</span>
                  <span className="font-semibold text-slate-800">
                    {officer?.role || "-"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 py-1">
                  <span className="text-slate-500">Pangkat/Golongan:</span>
                  <span className="font-semibold text-slate-800">
                    Tidak tersedia
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Unit Satuan Kerja:</span>
                  <span className="font-semibold text-slate-800">
                    {officer?.department || "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Wilayah Binaan Petugas
                </span>
                <div className="flex justify-between border-b border-slate-200/80 py-1">
                  <span className="text-slate-500">Wilayah Induk:</span>
                  <span className="font-semibold text-slate-800">
                    Wilayah kode {officer?.assignedRegion || "-"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 py-1">
                  <span className="text-slate-500">Kecamatan Prioritas:</span>
                  <span className="font-semibold text-slate-800">
                    Tidak tersedia
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Posko Lapangan:</span>
                  <span className="font-semibold text-slate-800">
                    Tidak tersedia
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-4">
              <button
                onClick={onLogout}
                className="cursor-pointer rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Keluar Sesi Petugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. STATUS JARINGAN & DOMPET KRIPTO */}
      {activeMenu === "koneksi-wallet" && (
        <div className="max-w-4xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  Status Jaringan &amp; Dompet Digital Petugas
                </h2>
                <p className="text-xs text-slate-500">
                  Otorisasi kriptografi untuk mengesahkan penyaluran bantuan
                  sosial ke buku besar terdesentralisasi (Polygon Amoy).
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                {network?.connected ? "Node Terhubung (Online)" : "Node Tidak Terhubung"}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Status Kotak Jaringan */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="block text-[11px] text-slate-500">
                    Jaringan Aktif
                  </span>
                  <strong className="mt-1 block text-xs font-bold text-slate-800">
                    Polygon Amoy ({network?.chain_id ?? "-"})
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    Layer-2 Ethereum Testnet
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="block text-[11px] text-slate-500">
                    Latensi Node RPC
                  </span>
                  <strong className="mt-1 block text-xs font-bold text-emerald-700">
                    {network?.latency_ms != null ? `${network.latency_ms} ms` : "Tidak tersedia"}
                  </strong>
                  <span className="text-[10px] text-emerald-600">
                    {network?.block_number != null ? `Sinkron blok #${network.block_number}` : "Nomor blok tidak tersedia"}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="block text-[11px] text-slate-500">
                    Biaya Transaksi Petugas
                  </span>
                  <strong className="mt-1 block text-xs font-bold text-sky-700">
                    Tidak dipantau
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    Tidak tersedia
                  </span>
                </div>
              </div>

              {/* Alamat Dompet Petugas */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Alamat Dompet Petugas Lapangan
                  </span>
                  <span className="rounded bg-sky-100 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-800">
                    OFFICER_ROLE TERVERIFIKASI
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={walletAddress}
                    className="w-full select-all rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-xs font-semibold text-slate-800 outline-none"
                  />
                  <button
                    onClick={handleCopyWallet}
                    className="shrink-0 cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    title="Salin Alamat"
                  >
                    {copiedWallet ? "Tersalin ✓" : "Salin"}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  *Alamat di atas memiliki hak akses resmi untuk mencatat
                  verifikasi keluarga dan mengesahkan penyaluran bansos pada
                  smart contract resmi RantaiAsa di Jawa Barat.
                </p>
              </div>

              {/* Daftar Kontrak Pintar Terkoneksi */}
              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Kontrak Pintar Resmi Terpasang
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {(contracts ? [
                    { label: "IdentityRegistry:", address: contracts.contracts.identity_registry },
                    { label: "AidDisbursement:", address: contracts.contracts.aid_disbursement },
                    { label: "ReportRegistry:", address: contracts.contracts.report_registry },
                  ] : []).map((item, index, items) => (
                    <div
                      key={item.address}
                      className={`flex items-center justify-between py-1.5 ${
                        index < items.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <span className="font-sans text-slate-600">
                        {item.label}
                      </span>
                      <a
                        href={`https://amoy.polygonscan.com/address/${item.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:underline"
                      >
                        {item.address.slice(0, 8)}...{item.address.slice(-4)} ↗
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uji Koneksi */}
              <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div>
                  <strong className="block text-xs text-slate-800">
                    Uji Ulang Koneksi Node Jaringan
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Lakukan sinkronisasi jika sinyal internet di daerah lapangan
                    sempat terputus.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsSwitchingNetwork(true);
                    setTimeout(() => setIsSwitchingNetwork(false), 800);
                  }}
                  className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white transition hover:bg-sky-700"
                >
                  {isSwitchingNetwork
                    ? "Memeriksa Node..."
                    : "Uji Koneksi Sekarang"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
