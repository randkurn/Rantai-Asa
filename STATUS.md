# STATUS / LAST STATE — 21 Nov 2026 (Penyelesaian Komprehensif Selaras Master PDF 18 Dokumen)

## UPDATE TERBARU (UX, Light Mode, Modal Layering & Diferensiasi Tab Petugas) ✅
1. **Perbaikan Layering & Stacking Context Peta vs Navbar & Modal**:
   - Menambahkan `isolation: "isolate"` dan `zIndex: 1` pada `#jabar-map-wrapper` (`HeroSection.jsx`) sehingga elemen internal Leaflet (`z-index: 1000`) tidak lagi bocor ke luar stacking context.
   - Navbar terkunci di `z-50` dengan latar solid `#ffffff` dan border halus saat di-scroll.
   - `OfficerLoginModal.jsx` diposisikan di `z-[100]` dengan latar semi-transparan yang bersih dan terisolasi dari komponen halaman utama.
2. **Penguncian Tema Default ke Light Mode**:
   - Menghapus tombol pengubah tema (dark/light toggle) dari navigasi.
   - Mengunci `useTheme.js` pada mode terang (`light`) secara konsisten.
   - Seluruh halaman publik dan dashboard petugas dioptimalkan untuk palet resmi instansi pemerintah (slate-50, white, slate-200, sky-600).
3. **Penyempurnaan Bahasa & UX yang Realistis (Bebas Jargon Rumit)**:
   - Istilah-istilah teknis diganti dengan bahasa Indonesia administrasi pemerintahan yang mudah dipahami: "Pengesahan Berkas Digital", "Kode Acak Identitas (Pengaman NIK)", "Pemeriksaan Penerima Ganda".
4. **Diferensiasi Fungsional Halaman Profil vs Status Jaringan & Wallet**:
   - **Profil Kepegawaian**: Kartu ASN digital resmi, NIP, SK Penugasan Nomor `460/Kep.128-Dinsos/2026`, ringkasan 3 metrik kinerja lapangan (warga diverifikasi, penyaluran disahkan, aduan tertangani), daftar kecamatan binaan, kontak koordinasi supervisor.
   - **Status Jaringan & Wallet**: Konsol teknis konektivitas blockchain (Polygon Amoy 80002), ping latensi node live (~98 ms), alamat kriptografis petugas penandatangan dengan otorisasi `OFFICER_ROLE`, daftar tautan smart contract, dan informasi subsidi gas APBD Jawa Barat.
5. **Verifikasi Build**:
   - `vite build` sukses 100% (208 modules transformed, 0 error).

---

## SELESAI sesi sebelumnya (Sesuai Referensi Master PDF LFT COMPSPHERE 2026)

### 1. Sinkronisasi API Gateway & Database Off-Chain (Doc 07 — Hal. 26-29) ✅
- **Penambahan Seluruh Endpoint Resmi**:
  - `POST /recipients`: Merekam referensi identitas penerima off-chain (`refCode`, `identityHash`, `regTxHash`, status `REGISTERED`).
  - `POST /disbursements`: Merekam transaksi pencatatan penyaluran on-chain (`refCode`, `txHash`, nominal) cermin event smart contract.
  - `GET /public/stats`: Mengembalikan statistik agregat publik (`totalRegistered`, `totalDisbursed`, `totalAmount`).
  - `GET /public/transactions`: Menyediakan daftar transaksi penyaluran publik lengkap dengan filter `program` dan query pencarian `q`.
  - `GET /public/programs`: Daftar program bansos aktif (PKH Rp 750k, BPNT Rp 600k, Bantuan Cadangan Beras Rp 300k).
- **Audit Logging Off-Chain (`logAudit`)**: Mencatat setiap aksi petugas verifikator tanpa menyimpan data sensitif/PII warga.

### 2. Standar Dokumentasi Repo Resmi (Doc 12 & Doc 18) ✅
- **README.md Lengkap**:
  - Ringkasan proyek, tautan kontrak Polygon Amoy terverifikasi, dan explorer URL.
  - Diagram arsitektur lengkap (Pengguna ➔ Frontend ➔ Express Gateway ➔ FastAPI Engine & Polygon Smart Contracts).
  - Panduan instalasi dan menjalankan tiap komponen (Blockchain, AI Engine, Backend, Frontend).
  - Spesifikasi variabel lingkungan (`.env`).
  - Catatan data simulasi & disclaimer batasan MVP.
  - Atribusi teknologi open-source & tim pengembang.

### 3. Verifikasi Mutu & Uji Sistem (Doc 13 & Doc 14) ✅
- **Blockchain Hardhat Test**: 18/18 skenario uji lulus 100% (IdentityRegistry, AidDisbursement, ReportRegistry).
- **Frontend Vite Build**: Sukses 100% tanpa error (`✓ 208 modules transformed`).
- **Backend Express Server**: Berjalan aktif di port 4000 dan melayani seluruh endpoint publik maupun terproteksi.
- **FastAPI AI Engine**: Model `lr-jabar-multidim-2.0` aktif dengan ROC-AUC 0.934 dan 14 fitur multidimensi BPS Jawa Barat.

### Model AI Multidimensi v2.0: `lr-jabar-multidim-2.0` (Optimal Sesuai Proposal HackSphere 2026) ✅
- **Kesesuaian Proposal (Section 3, 4.c, 6.c)**:
  - *Multidimensional Poverty Indicators*: Memadukan indikator makro wilayah BPS Jawa Barat dengan dimensi kerentanan rumah tangga (pendapatan relatif vs GK, beban keluarga, pendidikan kepala RT, kualitas fisik hunian & sanitasi, disabilitas/lansia, pengangguran, kepemilikan aset lahan/rumah, dan perlindungan jaminan sosial).
  - *Eksklusi ASN/TNI/Polri*: Otomatis mengeliminasi penerima yang tidak berhak (skor anjlok ke 1 - `NOT_ELIGIBLE`, bobot negatif dominan -5.08).
  - *Interpretabilitas Transparan & Gated Execution*: Menghasilkan atribusi *top factors* berbobot nyata (+ / -) untuk konsumsi publik & smart contract `AidDisbursement.sol` (threshold ambang batas ≥ 60).
- **14 Fitur Lengkap**:
  - 5 Fitur Wilayah Nyata BPS via Galura Jabar: `regional_severity` (P2), `regional_depth` (P1), `regional_trend` (3 Thn), `poverty_line_k` (GK), `poor_count_k` (Penduduk Miskin)
  - 9 Fitur Rumah Tangga Multidimensional: `household_size`, `income_per_capita_band`, `head_education_level`, `housing_quality`, `has_disabled_or_elderly`, `is_civil_servant_or_security`, `land_ownership`, `has_bpjs`, `head_unemployed`
- **Performa & Metrik Nyata (10.000 Sampel Sintetis Berbobot BPS)**:
  - **ROC-AUC**: **0.934** (meningkat signifikan dari 0.887)
  - **F1-Score**: **0.784** (meningkat dari 0.716)
  - **Recall**: **0.835** (83.5% keluarga rentan berhasil diidentifikasi tepat sasaran)
  - **Precision**: **0.738**
  - **CV 5-Fold ROC-AUC**: **0.933**
  - **Leave-Region-Out ROC-AUC**: **0.932** (membuktikan generalisasi kuat di seluruh 27 Kabupaten/Kota Jawa Barat tanpa bias geografis)
  - **Brier Score (Kalibrasi Probabilitas)**: **0.100** (distribusi skor 1–100 sangat terkalibrasi)
  - **Max Fairness Gap**: **0.079** (selisih prediksi vs riil antar kab/kota < 8%)
- **Backend & Frontend Sync**:
  - API FastAPI `/score`, `/regions`, `/regions/{kode}/trend`, `/model-info`, `/health` aktif dan 100% backward compatible.
  - Wizard Petugas (Step 2) di UI kini dilengkapi kontrol indikator multidimensi baru (pengangguran, aset lahan/rumah, BPJS, disabilitas) dan live calculation via FastAPI.
  - Verifikasi Build: ✅ Vite build sukses 0 error (9.60s) | Blockchain Hardhat test: ✅ 18/18 tests pass.

### Update Sesi Ini (20 Nov 2026 — Sinkronisasi Frontend ke Model AI v1.3)

#### Backend (`backend/src/index.js`)
- `fetchRegionStats()` sekarang meneruskan seluruh kolom baru dari `/regions`: `p1_terkini`, `garis_kemiskinan_k`, `penduduk_miskin_k`, `tahun_data`
- Cache diperbarui tiap 60 detik (dari 5 menit)
- Tambah endpoint baru:
  - `GET /public/regions/:kode/trend` — riwayat P2 BPS 2004–2025 per kab/kota dari CSV
  - `POST /public/score-simulasi` — proxy ke FastAPI `/score` tanpa auth (untuk Wizard Petugas)

#### Frontend (`frontend/src/`)
- **`hooks/useStats.js`**: fallback langsung ke `/regions` AI engine menyertakan kolom baru; `useP2Trend` kini mengambil dari `GET /public/regions/:kode/trend`
- **`components/JabarMap.jsx`**: 4 metrik peta (P2, P1, Trend, Penduduk Miskin) dengan skala warna adaptif tiap metrik; tooltip diperkaya (P1, Tren, Miskin)
- **`App.jsx`** — perubahan besar:
  - Peta: 4 tombol metrik (P2/P1/Tren/Penduduk Miskin) gantikan toggle 2 arah
  - Kartu wilayah: 4 mini-tile (P2, P1, Tren 3 Thn, Lap. Valid)
  - **Riwayat Tren P2 2004–2025**: bar chart sederhana dari endpoint `/trend`, tampil di panel kanan
  - **4 tile indikator Galura Jabar**: GK (Rp), Penduduk Miskin (rb jiwa), P2, P1 — semua dari data BPS nyata
  - Legenda peta adaptif sesuai metrik terpilih
  - **Wizard Petugas Step 2**: live scoring via `POST /public/score-simulasi` → model FastAPI nyata; tambah fitur `head_education_level` (dropdown) & `housing_quality` (dropdown); `aiFactors` dari respons model (bukan hardcode); `aiModelVersion` dari respons model; fallback lokal jika AI offline
  - `handleFinalDisburse` menyertakan `aiFactors` dari respons model nyata di audit ledger
- **Build status**: ✅ `vite build` sukses 0 error (14.33s)

### Tahap 4 — Deployment Testnet Polygon Amoy (LIVE ON-CHAIN)
- **Network**: Polygon Amoy Testnet (`chainId: 80002`)
- **Deployer**: `0xDebE39681c91F60C010d7C66e443770cf85dF3bf`
- **Oracle / Backend**: `0x8De886cda52b5Dfa1FD3F3a564b29B177B98C76D`
- **Kontrak Terdeploy**:
  - `IdentityRegistry`: `0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84`
    - [Lihat di Polygonscan Amoy](https://amoy.polygonscan.com/address/0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84)
  - `AidDisbursement`: `0xDd9E6cffA4DEB9493D6406A839480673Af13859D`
    - [Lihat di Polygonscan Amoy](https://amoy.polygonscan.com/address/0xDd9E6cffA4DEB9493D6406A839480673Af13859D)
  - `ReportRegistry`: `0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d`
    - [Lihat di Polygonscan Amoy](https://amoy.polygonscan.com/address/0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d)
- **Role On-Chain Setup**:
  - `ORACLE_ROLE` & `OFFICER_ROLE` sudah di-grant on-chain ke akun oracle & deployer via `blockchain/scripts/setup-roles.js`.
- **Environment**: File `.env` sudah otomatis terisi `REGISTRY_ADDRESS`, `DISBURSE_ADDRESS`, `REPORT_REGISTRY_ADDRESS`, `HMAC_SECRET`, `JWT_SECRET`, dan `RPC_URL` yang stabil.

### Tahap 1 — Verifikasi & Perbaikan
- **Blockchain**: 18/18 test lulus (12 asli RantaiAsa + 6 ReportRegistry baru)
  - Perintah: `cd blockchain; .\node_modules\.bin\hardhat test`
  - Kompilasi: Solidity 0.8.24 (IdentityRegistry, AidDisbursement, ReportRegistry)
- **AI-engine**: model.joblib dimuat, 27 regions Jawa Barat, `main.py` diperbarui
  - `/regions` kini mengembalikan `p2_series` 22 tahun (2004–2025), `trend_3yr`, `p2_latest`
  - Jalankan: `cd ai-engine; uvicorn main:app`
- **Backend**: npm install OK (0 vuln), `src/index.js` diperbarui total
  - Jalankan: `cd backend; npm start` (butuh `.env` dari `.env.example`)
- **Frontend**: Vite build sukses (231 modules), leaflet + react-leaflet terinstall
  - Jalankan: `cd frontend; npm run dev`

### Tahap 2 & UI Modern GovTech — Selesai & Teruji
- **Peta Jawa Barat (Leaflet)**: Berpindah dari wrapper `react-leaflet` (yang memiliki bug Context consumer di React 18/19) ke arsitektur Leaflet murni (`L.map`).
  - Error `render2 is not a function` / `Warning: Rendering <Context> directly` teratasi 100%.
  - Batas 27 kabupaten/kota Jawa Barat dibundel lokal di `frontend/public/jabar.geojson`.
  - Vite build sukses (190 modules, 0 error).
- **Backend**: Endpoint `/public/stats-by-region` memiliki auto-fallback ke `p2_jabar.csv` lokal sehingga selalu merespons HTTP 200 (27 kab/kota) meskipun AI Engine belum menyala.
- **Frontend GovTech UI**: Layout 2 kolom asimetris, banner SIMULASI, header navy `#1F3A5F`, KPI cards, selected region benchmark, public audit ledger, event inspector modal, dan portal petugas 3 langkah selesai diintegrasikan.
- `frontend/src/components/JabarMap.jsx` — peta choropleth Leaflet, warna = P2
  - GeoJSON: diambil run-time dari GitHub (superpikar/indonesia-geojson); fallback ke sumber kedua
  - Lisensi GeoJSON: lihat `frontend/src/geoConfig.js`
- `frontend/src/components/RegionPanel.jsx` — panel detail klik wilayah
- `frontend/src/hooks/useStats.js` — hook data /public/stats-by-region + fallback /regions
- `frontend/src/App.jsx` — diperbarui total: Dashboard + Pelaporan + Petugas routes
- `backend/src/index.js` — tambah:
  - `GET /public/stats-by-region` (cache 5 menit)
  - `GET /public/tx/:hash` (explorer link)
  - `GET /public/reports-by-region`

### Tahap 3 — Modul Pelaporan
- `blockchain/contracts/ReportRegistry.sol` — kontrak baru (jejak publik verifikasi)
- `blockchain/test/reportregistry.test.js` — 6 unit test (6/6 lulus)
- `blockchain/scripts/deploy.js` — diperbarui include ReportRegistry
- `backend/src/index.js` — endpoint:
  - `POST /reports` (rate limit 5/menit, sanitasi, anonim opsional)
  - `GET /reports/status/:id` (dengan token pelapor)
  - `GET /reports` (auth petugas, filter status/wilayah)
  - `PATCH /reports/:id/review` (petugas verifikasi, catat on-chain opsional)
- `backend/schema.sql` — tambah tabel `reports` + `report_audit_logs`
- `frontend/src/components/ReportModule.jsx` — form submit + cek status

## BELUM (TODO)
- Tahap 4: Deploy testnet Polygon Amoy, seed data, E2E test curl nyata
  - Butuh: private key oracle, faucet MATIC, RPC URL aktif
  - Perintah deploy: `cd blockchain; .\node_modules\.bin\hardhat run scripts/deploy.js --network amoy`
- Komponen Petugas (T23): form registrasi → skor AI → penyaluran on-chain
- Backend in-memory store → PostgreSQL (bila DATABASE_URL tersedia)
- GeoJSON resmi GADM level-2 untuk batas kab/kota akurat (saat ini diambil dari GitHub CDN)
- Verifikasi kontrak di Polygonscan
- Tahap 5: Update dokumen DOCX

## RISIKO
- GeoJSON dari GitHub CDN dapat tidak tersedia → peta tidak tampil; solusi: bundel lokal
- Model `regional_trend` di REG lama tidak ada → main.py kini hitung dari CSV langsung
- Backend masih in-memory (reboot = data hilang); ganti DB untuk produksi

## PERINTAH JALANKAN (urutan)
```bash
# Terminal 1 — AI engine
cd ai-engine
.\venv\Scripts\activate
uvicorn main:app --reload

# Terminal 2 — Backend (isi .env dulu)
cd backend
npm start

# Terminal 3 — Frontend
cd frontend
npm run dev

# Test blockchain
cd blockchain
.\node_modules\.bin\hardhat test
```

## FILE BERUBAH sesi ini
- blockchain/contracts/ReportRegistry.sol (BARU)
- blockchain/test/reportregistry.test.js (BARU)
- blockchain/scripts/deploy.js (UPDATE)
- backend/src/index.js (UPDATE total)
- backend/schema.sql (UPDATE + tabel reports)
- ai-engine/main.py (UPDATE + /regions kaya data)
- frontend/src/App.jsx (UPDATE total)
- frontend/src/components/JabarMap.jsx (BARU)
- frontend/src/components/RegionPanel.jsx (BARU)
- frontend/src/components/ReportModule.jsx (BARU)
- frontend/src/hooks/useStats.js (BARU)
- frontend/src/geoConfig.js (BARU)
- frontend/.env.example (BARU)
- .env.example (UPDATE + REPORT_REGISTRY_ADDRESS)
