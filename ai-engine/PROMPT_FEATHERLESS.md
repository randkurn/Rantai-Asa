# Prompt lanjutan (tempel ke agen). Model: moonshotai/Kimi-K3.1-Pro @ https://api.featherless.ai/v1
Konteks: RantaiAsa (Tim LFT, COMPSPHERE 2026), fokus Jawa Barat. Baca AGENTS.md, STATUS.md, ai-engine/API_CONTRACT.md (v1.3), docs/ (Doc 02,04,05,06,07).
Frontend dikerjakan rekan tim: JANGAN ubah kontrak API; hanya tambah, tidak menghapus.
Aturan: tanpa PII/NIK; AI bukan penentu tunggal; data rumah tangga = SIMULASI; jangan mengarang sumber. Singkat, bertahap, jalankan tes, lapor hasil nyata.

TAHAP 1 (AI, prioritas): jalankan python train.py; tinjau metrics.json & fairness_by_region.csv; usulkan perbaikan (kalibrasi probabilitas,
 uji sensitivitas ambang 60/45, cek selisih prediksi vs label per wilayah); perbarui Doc 06 (fitur: P2 + tren Jabar, CV 5-fold, keterbatasan).
TAHAP 2 (blockchain/backend): npx hardhat test (12 lolos); backend /assessments memakai kode_kabupaten_kota; uji alur curl.
TAHAP 3 (opsional, Should): modul pelaporan warga/sukarelawan diverifikasi petugas (PENDING→VERIFIED/REJECTED/NEEDS_INFO; isi laporan off-chain;
 event ReportVerified opsional) + endpoint /public/stats-by-region untuk peta Jabar. Hanya tambahkan endpoint baru.
TAHAP 4: integrasi dgn frontend rekan, deploy (Amoy, Render, Vercel), seed data SIMULASI.
OUTPUT tiap tahap: ringkasan, hasil tes, file berubah, risiko. Jika konteks hampir habis: LAST STATE di STATUS.md.
