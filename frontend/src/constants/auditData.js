export const CONTRACTS = {
  IdentityRegistry: "0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84",
  AidDisbursement: "0xDd9E6cffA4DEB9493D6406A839480673Af13859D",
  ReportRegistry: "0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d",
  ChainId: 80002,
};

export const DEFAULT_OFFICER = "0xDebE39681c91F60C010d7C66e443770cf85dF3bf";
export const DEFAULT_PERIOD = "P1-2026";

export const INITIAL_AUDIT_RECORDS = [
  {
    timestamp: "2026-11-20 14:42:10 WIB",
    block: 14892218,
    refId: "RCP-3201-01",
    identityHash:
      "0x9f2c8b14a7d3e601c584f920b17e4a3d8c6190f2e4b71a83c5d09e12f4a86c31",
    program: "PKH-2026-P1",
    period: DEFAULT_PERIOD,
    kodeWilayah: 3201,
    province: "Kab. Bogor",
    aiScore: 84,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Pita Pengeluaran (Band 1)", impact: "+" },
      { name: "Kualitas Fisik Hunian Rendah", impact: "+" },
      { name: "Jumlah Anggota Keluarga (6 Jiwa)", impact: "+" },
    ],
    amount: 750000,
    txHash:
      "0x3b8f19c2a4d7e60581b9c3f4a2e8d1097c4b5a6f8e2d1c3b4a59687766554433",
    officer: DEFAULT_OFFICER,
  },
  {
    timestamp: "2026-11-20 14:28:04 WIB",
    block: 14892095,
    refId: "RCP-3203-02",
    identityHash:
      "0x4e1a7c93d2b8f504a619e832c70d5b2f9a4183e6c0b29d74f1a85c30e6b92d47",
    program: "BPNT-2026-P1",
    period: DEFAULT_PERIOD,
    kodeWilayah: 3203,
    province: "Kab. Cianjur",
    aiScore: 78,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Keparahan Wilayah P2 (0.41)", impact: "+" },
      { name: "Anggota Rentan (Disabilitas/Lansia)", impact: "+" },
      { name: "Pita Pengeluaran (Band 1)", impact: "+" },
    ],
    amount: 600000,
    txHash:
      "0x7a1c44e9b2d8f30692c1a5e7b3d9f0184e6c7b8a9d0e1f2a3b4c5d6e7f8091a2",
    officer: DEFAULT_OFFICER,
  },
  {
    timestamp: "2026-11-20 14:11:39 WIB",
    block: 14891912,
    refId: "RCP-3205-03",
    identityHash:
      "0x1d8b5f20c9a4e736b108d492f63a8c1e5b7092d4a8f16c35e9b07d24a6c81f53",
    program: "PKH-2026-P1",
    period: DEFAULT_PERIOD,
    kodeWilayah: 3205,
    province: "Kab. Garut",
    aiScore: 81,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Keparahan Wilayah P2 (0.39)", impact: "+" },
      { name: "Pita Pengeluaran (Band 1)", impact: "+" },
      { name: "Jumlah Anggota Keluarga (5 Jiwa)", impact: "+" },
    ],
    amount: 750000,
    txHash:
      "0x9e5d21a8c4f7b03912d6e8a4c0f2b5793a1d4c6e8b0a2f4d6c8e0a1b3d5f7981",
    officer: DEFAULT_OFFICER,
  },
  {
    timestamp: "2026-11-20 13:54:22 WIB",
    block: 14891744,
    refId: "RCP-3209-04",
    identityHash:
      "0x6c3f9a12e8b4d705c291a843f50e6b1d9c7284a0e3b51f96d2c84a07e5b93c68",
    program: "PKH-2026-P1",
    period: DEFAULT_PERIOD,
    kodeWilayah: 3209,
    province: "Kab. Cirebon",
    aiScore: 88,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Pita Pengeluaran (Band 1)", impact: "+" },
      { name: "Keparahan Wilayah P2 (0.35)", impact: "+" },
      { name: "Kualitas Fisik Hunian Rendah", impact: "+" },
    ],
    amount: 750000,
    txHash:
      "0x2f4b88d1e6a9c30754b2d8f0a6c4e9128b7d5f3a1c9e7b5d3f1a8c6e4b2d0975",
    officer: DEFAULT_OFFICER,
  },
  {
    timestamp: "2026-11-20 13:42:08 WIB",
    block: 14891620,
    refId: "DUP-3201-09",
    identityHash:
      "0x9f2c8b14a7d3e601c584f920b17e4a3d8c6190f2e4b71a83c5d09e12f4a86c31",
    program: "BPNT-2026-P1",
    period: DEFAULT_PERIOD,
    kodeWilayah: 3201,
    province: "Kab. Bogor",
    aiScore: 0,
    aiLabel: "REJECTED",
    status: "DITOLAK_DUPLIKAT",
    factors: [
      { name: "Smart Contract: IdentityAlreadyRegistered()", impact: "-" },
    ],
    amount: 0,
    txHash:
      "0x11223344556677889900aabbccddeeff00112233445566778899aabbccddeeff",
    officer: DEFAULT_OFFICER,
  },
  {
    timestamp: "2026-11-20 13:30:15 WIB",
    block: 14891510,
    refId: "RCP-3212-05",
    identityHash:
      "0x8b4e2d71f0a9c638e512b904d73f1a8c6e9025b7d4a83c19f6e02b58d7a94c12",
    program: "BPNT-2026-P1",
    period: DEFAULT_PERIOD,
    kodeWilayah: 3212,
    province: "Kab. Indramayu",
    aiScore: 69,
    aiLabel: "ELIGIBLE",
    status: "TERCATAT",
    factors: [
      { name: "Pita Pengeluaran (Band 2)", impact: "+" },
      { name: "Pendidikan Kepala RT (SD)", impact: "+" },
      { name: "Anggota Rentan (Ada)", impact: "+" },
    ],
    amount: 600000,
    txHash:
      "0x5c7a93f0d2e8b41683a9c5e1f7b3d9042c6e8a0b2d4f6a8c0e2b4d6f8a0c2e46",
    officer: DEFAULT_OFFICER,
  },
];

export const FALLBACK_JABAR_STATS = [
  {
    kode: 3201,
    nama: "Kab. Bogor",
    p2_terkini: 0.23,
    p1_terkini: 0.97,
    tren: -0.22,
    garis_kemiskinan_k: 531.4,
    penduduk_miskin_k: 401.8,
  },
  {
    kode: 3202,
    nama: "Kab. Sukabumi",
    p2_terkini: 0.28,
    p1_terkini: 1.05,
    tren: -0.15,
    garis_kemiskinan_k: 425.2,
    penduduk_miskin_k: 175.4,
  },
  {
    kode: 3203,
    nama: "Kab. Cianjur",
    p2_terkini: 0.41,
    p1_terkini: 1.48,
    tren: -0.18,
    garis_kemiskinan_k: 438.9,
    penduduk_miskin_k: 242.1,
  },
  {
    kode: 3204,
    nama: "Kab. Bandung",
    p2_terkini: 0.21,
    p1_terkini: 0.89,
    tren: -0.12,
    garis_kemiskinan_k: 472.5,
    penduduk_miskin_k: 245.6,
  },
  {
    kode: 3205,
    nama: "Kab. Garut",
    p2_terkini: 0.39,
    p1_terkini: 1.42,
    tren: -0.25,
    garis_kemiskinan_k: 412.8,
    penduduk_miskin_k: 256.3,
  },
  {
    kode: 3206,
    nama: "Kab. Tasikmalaya",
    p2_terkini: 0.54,
    p1_terkini: 1.85,
    tren: -0.19,
    garis_kemiskinan_k: 405.1,
    penduduk_miskin_k: 189.7,
  },
  {
    kode: 3207,
    nama: "Kab. Ciamis",
    p2_terkini: 0.26,
    p1_terkini: 0.98,
    tren: -0.11,
    garis_kemiskinan_k: 448.3,
    penduduk_miskin_k: 92.4,
  },
  {
    kode: 3208,
    nama: "Kab. Kuningan",
    p2_terkini: 0.48,
    p1_terkini: 1.69,
    tren: -0.21,
    garis_kemiskinan_k: 431.0,
    penduduk_miskin_k: 131.8,
  },
  {
    kode: 3209,
    nama: "Kab. Cirebon",
    p2_terkini: 0.35,
    p1_terkini: 1.34,
    tren: -0.17,
    garis_kemiskinan_k: 465.7,
    penduduk_miskin_k: 249.2,
  },
  {
    kode: 3210,
    nama: "Kab. Majalengka",
    p2_terkini: 0.44,
    p1_terkini: 1.56,
    tren: -0.24,
    garis_kemiskinan_k: 518.4,
    penduduk_miskin_k: 138.5,
  },
  {
    kode: 3211,
    nama: "Kab. Sumedang",
    p2_terkini: 0.33,
    p1_terkini: 1.25,
    tren: -0.16,
    garis_kemiskinan_k: 459.2,
    penduduk_miskin_k: 109.6,
  },
  {
    kode: 3212,
    nama: "Kab. Indramayu",
    p2_terkini: 0.46,
    p1_terkini: 1.62,
    tren: -0.28,
    garis_kemiskinan_k: 542.6,
    penduduk_miskin_k: 214.9,
  },
  {
    kode: 3213,
    nama: "Kab. Subang",
    p2_terkini: 0.31,
    p1_terkini: 1.18,
    tren: -0.14,
    garis_kemiskinan_k: 468.0,
    penduduk_miskin_k: 152.3,
  },
  {
    kode: 3214,
    nama: "Kab. Purwakarta",
    p2_terkini: 0.29,
    p1_terkini: 1.12,
    tren: -0.13,
    garis_kemiskinan_k: 512.7,
    penduduk_miskin_k: 84.5,
  },
  {
    kode: 3215,
    nama: "Kab. Karawang",
    p2_terkini: 0.27,
    p1_terkini: 1.04,
    tren: -0.15,
    garis_kemiskinan_k: 568.9,
    penduduk_miskin_k: 187.2,
  },
  {
    kode: 3216,
    nama: "Kab. Bekasi",
    p2_terkini: 0.16,
    p1_terkini: 0.68,
    tren: -0.09,
    garis_kemiskinan_k: 645.3,
    penduduk_miskin_k: 198.4,
  },
  {
    kode: 3217,
    nama: "Kab. Bandung Barat",
    p2_terkini: 0.37,
    p1_terkini: 1.38,
    tren: -0.2,
    garis_kemiskinan_k: 452.1,
    penduduk_miskin_k: 178.9,
  },
  {
    kode: 3218,
    nama: "Kab. Pangandaran",
    p2_terkini: 0.3,
    p1_terkini: 1.15,
    tren: -0.12,
    garis_kemiskinan_k: 441.8,
    penduduk_miskin_k: 36.2,
  },
  {
    kode: 3271,
    nama: "Kota Bogor",
    p2_terkini: 0.19,
    p1_terkini: 0.82,
    tren: -0.14,
    garis_kemiskinan_k: 632.5,
    penduduk_miskin_k: 72.1,
  },
  {
    kode: 3272,
    nama: "Kota Sukabumi",
    p2_terkini: 0.22,
    p1_terkini: 0.91,
    tren: -0.16,
    garis_kemiskinan_k: 598.4,
    penduduk_miskin_k: 24.8,
  },
  {
    kode: 3273,
    nama: "Kota Bandung",
    p2_terkini: 0.11,
    p1_terkini: 0.49,
    tren: -0.08,
    garis_kemiskinan_k: 615.2,
    penduduk_miskin_k: 102.3,
  },
  {
    kode: 3274,
    nama: "Kota Cirebon",
    p2_terkini: 0.25,
    p1_terkini: 0.96,
    tren: -0.19,
    garis_kemiskinan_k: 554.0,
    penduduk_miskin_k: 29.5,
  },
  {
    kode: 3275,
    nama: "Kota Bekasi",
    p2_terkini: 0.12,
    p1_terkini: 0.54,
    tren: -0.07,
    garis_kemiskinan_k: 712.8,
    penduduk_miskin_k: 134.6,
  },
  {
    kode: 3276,
    nama: "Kota Depok",
    p2_terkini: 0.07,
    p1_terkini: 0.32,
    tren: -0.05,
    garis_kemiskinan_k: 735.4,
    penduduk_miskin_k: 61.2,
  },
  {
    kode: 3277,
    nama: "Kota Cimahi",
    p2_terkini: 0.14,
    p1_terkini: 0.61,
    tren: -0.1,
    garis_kemiskinan_k: 589.1,
    penduduk_miskin_k: 28.4,
  },
  {
    kode: 3278,
    nama: "Kota Tasikmalaya",
    p2_terkini: 0.42,
    p1_terkini: 1.52,
    tren: -0.23,
    garis_kemiskinan_k: 521.6,
    penduduk_miskin_k: 79.3,
  },
  {
    kode: 3279,
    nama: "Kota Banjar",
    p2_terkini: 0.18,
    p1_terkini: 0.76,
    tren: -0.11,
    garis_kemiskinan_k: 462.3,
    penduduk_miskin_k: 11.4,
  },
];

export function formatIDR(val) {
  if (val >= 1e9)
    return "Rp " + (val / 1e9).toFixed(2).replace(".", ",") + " M";
  if (val >= 1e6)
    return "Rp " + (val / 1e6).toFixed(1).replace(".", ",") + " jt";
  return "Rp " + Number(val || 0).toLocaleString("id-ID");
}

export function shortHex(hex) {
  return hex && hex.length > 14 ? `${hex.slice(0, 6)}...${hex.slice(-4)}` : hex;
}

export function randomHex(length = 64) {
  return (
    "0x" +
    Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("")
  );
}

export function getWibTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours(),
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())} WIB`;
}
