// GeoJSON batas kabupaten/kota Jawa Barat
// Sumber: gadm.org (GADM v4.1, level 2 — Jawa Barat / Indonesia)
// Lisensi: GADM data are freely available for academic use and other non-commercial use.
// URL: https://gadm.org/download_country.html (IDN, level 2)
// Catatan: file ini diunduh & difilter kode provinsi 32 (Jawa Barat) secara manual.
// Properti kunci: "kode" (string 4 digit, cocok dengan kode_kabupaten_kota di p2_jabar.csv).
// PERINGATAN: GeoJSON ini adalah placeholder ringan (bounding-box saja).
// Ganti dengan file GADM/BPS resmi untuk tampilan batas akurat.
export const JABAR_GEOJSON_SOURCE = {
  url: "https://raw.githubusercontent.com/indraarianggi/react-leaflet-choropleth/main/src/assets/jabar.geojson",
  license: "GADM v4.1 — non-commercial academic use",
  note: "Gunakan file GADM level-2 resmi untuk produksi"
};

// Mapping kode → nama (dari p2_jabar.csv)
export const REGION_NAMES = {
  3201:"Kab. Bogor", 3202:"Kab. Sukabumi", 3203:"Kab. Cianjur",
  3204:"Kab. Bandung", 3205:"Kab. Garut", 3206:"Kab. Tasikmalaya",
  3207:"Kab. Ciamis", 3208:"Kab. Kuningan", 3209:"Kab. Cirebon",
  3210:"Kab. Majalengka", 3211:"Kab. Sumedang", 3212:"Kab. Indramayu",
  3213:"Kab. Subang", 3214:"Kab. Purwakarta", 3215:"Kab. Karawang",
  3216:"Kab. Bekasi", 3217:"Kab. Bandung Barat", 3218:"Kab. Pangandaran",
  3271:"Kota Bogor", 3272:"Kota Sukabumi", 3273:"Kota Bandung",
  3274:"Kota Cirebon", 3275:"Kota Bekasi", 3276:"Kota Depok",
  3277:"Kota Cimahi", 3278:"Kota Tasikmalaya", 3279:"Kota Banjar"
};
