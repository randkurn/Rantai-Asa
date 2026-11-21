# RantaiAsa — Sistem Audit & Verifikasi Bansos Anti-Fraud Berbasis Blockchain & AI

> **COMPSPHERE 2026 — HACKSPHERE (Kategori National)**  
> **Tim LFT (Universitas Pendidikan Indonesia)**: Randy (Project Lead) · Riyan · Jonathan  
> *Fokus Wilayah: 27 Kabupaten/Kota Provinsi Jawa Barat (Kode 3201–3279)*

---

## 1. Ringkasan & Tautan Demo / Explorer

RantaiAsa adalah lapisan verifikasi independen (*verification plug-in*) berbasis blockchain dan AI untuk mencegah penerima bantuan sosial ganda, meningkatkan transparansi penyaluran, dan menyediakan jejak audit publik tanpa izin (*permissionless audit*). RantaiAsa bukan pengganti DTSEN/Dukcapil, melainkan melengkapi proses distribusi agar setiap transaksi bantuan sosial dapat dipertanggungjawabkan secara matematis dan kriptografis.

### Tautan Smart Contract (Polygon Amoy Testnet — Chain ID: 80002)
- **IdentityRegistry**: [`0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84`](https://amoy.polygonscan.com/address/0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84)
- **AidDisbursement**: [`0xDd9E6cffA4DEB9493D6406A839480673Af13859D`](https://amoy.polygonscan.com/address/0xDd9E6cffA4DEB9493D6406A839480673Af13859D)
- **ReportRegistry**: [`0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d`](https://amoy.polygonscan.com/address/0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d)

---

## 2. Arsitektur Sistem

```text
               ┌────────────────────────────────────────────────────────┐
               │         PENGGUNA (Petugas / Warga / Auditor)           │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
         ┌────────────────────────┐                ┌────────────────────────┐
         │ Public Audit Dashboard │                │   Officer Operations   │
         │ (React + Vite + Carto) │                │  (Web3 Wallet / Auth)  │
         └───────────┬────────────┘                └───────────┬────────────┘
                     │                                         │
                     │                 REST API                │
                     └────────────────────┬────────────────────┘
                                          ▼
                      ┌──────────────────────────────────────┐
                      │    Express API Gateway & Oracle      │
                      │  (HMAC Pseudonym, JWT, Audit Log)    │
                      └───────────┬──────────────┬───────────┘
                                  │              │
                   POST /score    │              │ attestScore / verify
                                  ▼              ▼
           ┌────────────────────────────┐  ┌────────────────────────────────────┐
           │     FastAPI AI Engine      │  │     Polygon Amoy Smart Contracts   │
           │  (lr-jabar-multidim-2.0)   │  │  - IdentityRegistry.sol           │
           │  ROC-AUC 0.934 | 14 Fitur  │  │  - AidDisbursement.sol (≥60)      │
           │  Data BPS Jabar 2004–2025  │  │  - ReportRegistry.sol             │
           └────────────────────────────┘  └────────────────────────────────────┘
```

---

## 3. Cara Menjalankan Aplikasi (Lokal)

### Prasyarat
- Node.js v20+ LTS
- Python 3.10+ / 3.11+ / 3.12+
- Browser Web3 (MetaMask) terhubung ke Polygon Amoy (Chain ID 80002)

### 1. Smart Contract & Hardhat (Testing)
```powershell
cd blockchain
npm install
npx hardhat test
```
*Hasil: 18 passing unit tests (IdentityRegistry, AidDisbursement, ReportRegistry).*

### 2. AI Engine (FastAPI)
```powershell
cd ai-engine
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python train.py
uvicorn main:app --port 8000
```
*API docs interaktif tersedia di: `http://localhost:8000/docs`.*

### 3. Backend (Express Gateway)
```powershell
cd backend
npm install
npm start
```
*Backend berjalan di: `http://localhost:4000`.*

### 4. Frontend Web (React + Vite + Tailwind)
```powershell
cd frontend
npm install
npm run dev
```
*Buka browser di: `http://localhost:5173`.*

---

## 4. Variabel Lingkungan (`.env`)

Salin konfigurasi dari `.env.example`:
```ini
RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
CHAIN_ID=80002
PRIVATE_KEY_DEPLOYER=0x...
PRIVATE_KEY_ORACLE=0x...
HMAC_SECRET=kunci_rahasia_hmac_server_rantaiasa
JWT_SECRET=kunci_jwt_sesi_petugas
AI_SERVICE_URL=http://localhost:8000
REGISTRY_ADDRESS=0x964C5ACaEf0FFb0866bb0a0EFF55cA87BF39dD84
DISBURSE_ADDRESS=0xDd9E6cffA4DEB9493D6406A839480673Af13859D
REPORT_REGISTRY_ADDRESS=0x8b6aEf6e43B5e028af2d1b606Ec2Ee14837D291d
PORT=4000
```

---

## 5. Catatan Data SIMULASI & Keterbatasan

- **Prinsip Privasi Keras**: NIK asli (16 digit) diproses dalam volatile memory backend menggunakan `HMAC-SHA256(NIK, SERVER_SECRET)`. NIK mentah **TIDAK PERNAH** disimpan di basis data, logs, maupun di blockchain.
- **Label Data Rumah Tangga**: Seluruh data nama, NIK, dan rumah tangga penerima dalam demonstrasi adalah **DATA SIMULASI** terlabel resmi.
- **Data Makro Wilayah Nyata**: Menggunakan data resmi Badan Pusat Statistik (BPS) Jawa Barat 2004–2025 melalui Portal Data Terbuka Jabar (Galura) untuk 27 Kabupaten/Kota (P2 Keparahan, P1 Kedalaman, Garis Kemiskinan, Jumlah Penduduk Miskin).
- **Keterbatasan MVP**:
  1. Berjalan pada testnet publik Polygon Amoy (tanpa transfer mata uang riil/fiat).
  2. Menggunakan model linear Logistic Regression terkalibrasi agar bobot faktor dominan dapat diaudit secara transparan oleh publik (*explainable AI*).

---

## 6. Penggunaan AI & Atribusi Open-Source

- **OpenZeppelin Contracts v5**: AccessControl untuk RBAC (`ADMIN`, `OFFICER`, `ORACLE`).
- **Scikit-Learn & Joblib**: Training pipeline, scaling, dan inferensi model `lr-jabar-multidim-2.0`.
- **Ethers.js v6**: Interaksi blockchain, cryptographic signature verification (EIP-191), dan event log parsing.
- **CARTO Basemaps & Leaflet**: Visualisasi spasial choropleth 27 Kabupaten/Kota Jawa Barat dengan Carto Voyager / Dark Matter.

---

## 7. Tim Pengembang & Lisensi

- **Tim LFT (UPI Bandung)**:
  - **Muhammad Randy Kurniawan** — Project Lead, AI/ML, Backend & Oracle
  - **Riyan** — Smart Contract, Hardhat, Security & QA
  - **Jonathan** — Frontend Dashboard, UI/UX & Web3 Integration

Lisensi: **MIT License**.
