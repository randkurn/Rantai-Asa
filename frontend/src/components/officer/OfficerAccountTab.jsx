import React, { useState } from "react";

const CONNECTED_CONTRACTS = [
  {
    label: "1. Pendaftaran Identitas (IdentityRegistry):",
    short: "0x964C...dD84",
    address: "0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84",
  },
  {
    label: "2. Penyaluran Bantuan (AidDisbursement):",
    short: "0xDd9E...859D",
    address: "0xDd9E6cffA4DEB9493D6406A839480673Af13859D",
  },
  {
    label: "3. Laporan Aduan Warga (ReportRegistry):",
    short: "0x8b6a...291d",
    address: "0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d",
  },
];

export default function OfficerAccountTab({ activeMenu, officer, onLogout }) {
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  const walletAddress =
    officer?.wallet || "0xDebE39681c91F60C010d7C66e443770cf85dF3bf";

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
                      {officer?.name || "Budi Santoso, S.STP"}
                    </h2>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      ASN Aktif
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {officer?.department || "Dinas Sosial Provinsi Jawa Barat"}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400">
                    NIP: {officer?.nip || "19880415 201201 1 002"}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="block text-[11px] text-slate-400">
                  Surat Keputusan (SK) Tugas
                </span>
                <strong className="block text-xs font-semibold text-slate-800">
                  460/Kep.128-Dinsos/2026
                </strong>
                <span className="text-[10px] font-medium text-sky-600">
                  Berlaku s.d. 31 Des 2026
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
                  48
                </strong>
                <span className="text-[10px] font-medium text-emerald-600">
                  ↑ 12 keluarga minggu ini
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <span className="block text-[11px] text-slate-500">
                  Penyaluran Disahkan
                </span>
                <strong className="font-heading mt-1 block text-2xl font-bold text-sky-600">
                  36
                </strong>
                <span className="text-[10px] text-slate-500">
                  Total Rp 27.000.000,-
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <span className="block text-[11px] text-slate-500">
                  Aduan Warga Ditangani
                </span>
                <strong className="font-heading mt-1 block text-2xl font-bold text-slate-900">
                  4
                </strong>
                <span className="text-[10px] font-medium text-emerald-600">
                  100% selesai ditindaklanjuti
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
                    Verifikator Bantuan Sosial Madya
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 py-1">
                  <span className="text-slate-500">Pangkat/Golongan:</span>
                  <span className="font-semibold text-slate-800">
                    Penata Muda Tk. I (III/b)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Unit Satuan Kerja:</span>
                  <span className="font-semibold text-slate-800">
                    Bidang Perlindungan &amp; Jaminan Sosial
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
                    Kabupaten Bogor (Kode 3201)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 py-1">
                  <span className="text-slate-500">Kecamatan Prioritas:</span>
                  <span className="font-semibold text-slate-800">
                    Cibinong, Citeureup, Sukaraja
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Posko Lapangan:</span>
                  <span className="font-semibold text-slate-800">
                    Kantor Dinsos Kab. Bogor Jl. Bersih No. 1
                  </span>
                </div>
              </div>
            </div>

            {/* Saluran Koordinasi */}
            <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/60 p-4 text-xs sm:flex-row sm:items-center">
              <div>
                <strong className="block text-slate-800">
                  Butuh Koordinasi dengan Supervisor?
                </strong>
                <span className="text-[11px] text-slate-600">
                  Hubungi Koordinator Wilayah Bogor: Bp. Hendra Kusuma, M.Si
                  (Kasie Linjamsos)
                </span>
              </div>
              <a
                href="mailto:linjamsos@dinsos.jabarprov.go.id"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
              >
                Kirim Pesan Resmi
              </a>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">
                Selesai bertugas pada perangkat ini?
              </span>
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
                Node Terhubung (Online)
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
                    Polygon Amoy (80002)
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
                    98 ms (Sangat Cepat)
                  </strong>
                  <span className="text-[10px] text-emerald-600">
                    Sinkron blok #18,452,910
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="block text-[11px] text-slate-500">
                    Biaya Transaksi Petugas
                  </span>
                  <strong className="mt-1 block text-xs font-bold text-sky-700">
                    Gratis (Disubsidi APBD)
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    Paymaster Relayer Pemprov
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
                  {CONNECTED_CONTRACTS.map((item, index) => (
                    <div
                      key={item.address}
                      className={`flex items-center justify-between py-1.5 ${
                        index < CONNECTED_CONTRACTS.length - 1
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
                        {item.short} ↗
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
