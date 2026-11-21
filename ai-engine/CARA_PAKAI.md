1. Unduh 3 CSV dari Galura Jabar (halaman /doc tiap dataset: jumlah penduduk miskin, indeks kedalaman, garis kemiskinan) dan taruh di folder data/.
   Nama file harus memuat kata: "jumlah_penduduk_miskin", "kedalaman", "garis" (P2 "keparahan" sudah ada). Kolom wajib: kode_kabupaten_kota, tahun, + 1 kolom nilai numerik.
2. python train.py   (jika error kolom/nama file, pesan menjelaskan; kirim 3 baris awal tiap CSV ke asisten)
3. uvicorn main:app --port 8000
Catatan: ketiga CSV belum diuji dengan data asli (hanya dengan data tiruan berformat sama).
