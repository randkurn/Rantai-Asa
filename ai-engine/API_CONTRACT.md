# Kontrak AI API v1.3 (kompatibel dengan v1.2; hanya menambah)
- GET /health, /model-info, /regions -> tiap wilayah kini juga punya regional_depth, poverty_line_k (Rp ribu/kapita/bln), poor_count_k.
- POST /score body TETAP: {"features":{"kode_kabupaten_kota":3212,"household_size":6,"income_per_capita_band":1,"head_education_level":1,"housing_quality":1,"has_disabled_or_elderly":1,"is_civil_servant_or_security":0}}
  income_per_capita_band kini relatif thd garis kemiskinan wilayah: 1:<0.8GK 2:0.8–1.0 3:1.0–1.5 4:1.5–2.5 5:>2.5. Tampilkan keterangan ini di form.
  Respons: {score, label ELIGIBLE(>=60)|REVIEW(45–59)|NOT_ELIGIBLE, threshold, review_required, top_factors[], model_version, data_notice}
Fitur rumah tangga & label = SIMULASI; fitur wilayah = data terbuka Galura Jabar.
