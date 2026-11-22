import React from "react";

const OPERATIONAL_MENUS = [
  {
    id: "registrasi",
    label: "Pendaftaran Bansos",
    icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
  },
];

const AUDIT_MENUS = [
  {
    id: "riwayat",
    label: "Riwayat Penyaluran",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "pencarian",
    label: "Cari Bukti Transaksi",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    id: "explorer",
    label: "Buku Besar Digital",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  },
];

export default function OfficerSidebar({
  activeMenu,
  setActiveMenu,
  officer,
  onLogout,
}) {
  const navBtnClass = (id) =>
    `flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition ${
      activeMenu === id
        ? "bg-sky-600 !text-white font-semibold shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
      {/* Logo & Judul Dashboard */}
      <a
        href="/"
        className="flex h-16 items-center gap-3 border-b border-slate-100 px-6"
      >
        <img
          src="/logo-rantaiasa-light.png"
          alt="RantaiAsa"
          className="w-48 object-contain"
        />
      </a>

      {/* Daftar Menu Sidebar */}
      <div
        className="flex-1 space-y-6 overflow-y-auto px-4 py-5 text-xs"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 transparent",
        }}
      >
        {/* MENU 1: RINGKASAN UTAMA */}
        <div>
          <span className="block px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            RINGKASAN UTAMA
          </span>
          <button
            onClick={() => setActiveMenu("data-penerima")}
            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition ${
              activeMenu === "data-penerima"
                ? "bg-sky-600 font-semibold !text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <span>Daftar Penerima Bantuan</span>
          </button>
        </div>

        {/* MENU 2: TAHAPAN OPERASIONAL */}
        <div>
          <span className="block px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            PROSES OPERASIONAL
          </span>
          <div className="space-y-1">
            {OPERATIONAL_MENUS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={navBtnClass(item.id)}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={item.icon}
                  />
                </svg>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MENU 3: PENGECEKAN & AUDIT */}
        <div>
          <span className="block px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            TRANSPARANSI & AUDIT
          </span>
          <div className="space-y-1">
            {AUDIT_MENUS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={navBtnClass(item.id)}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={item.icon}
                  />
                </svg>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MENU 4: PENGATURAN AKUN */}
        <div>
          <span className="block px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            PENGATURAN & AKUN
          </span>
          <div className="space-y-1">
            <button
              onClick={() => setActiveMenu("profil")}
              className={navBtnClass("profil")}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Profil Kepegawaian</span>
            </button>

            <button
              onClick={() => setActiveMenu("koneksi-wallet")}
              className={navBtnClass("koneksi-wallet")}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span>Status Jaringan & Wallet</span>
            </button>

            <button
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-rose-600 transition hover:bg-rose-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Keluar Aplikasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Petugas di Bawah */}
      <div className="border-t border-slate-100 bg-slate-50 p-3.5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700">
            {officer?.name ? officer.name.charAt(0) : "-"}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-slate-900">
              {officer?.name || "-"}
            </span>
            <span className="block truncate text-[10px] text-slate-500">
              {officer?.assignedRegion
                ? `Wilayah ${officer.assignedRegion}`
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
