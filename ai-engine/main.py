import os, joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

M = joblib.load(os.path.join(os.path.dirname(__file__), "model.joblib"))
PIPE, FEATS, VER, REG = M["pipe"], M["features"], M["version"], M["regions"]
THRESHOLD = int(os.getenv("THRESHOLD", 60))
REVIEW_LOW = int(os.getenv("REVIEW_LOW", 45))

LABEL = {
    # Fitur Wilayah Nyata BPS
    "regional_severity": "Tingkat keparahan kemiskinan wilayah (P2 BPS)",
    "regional_depth": "Indeks kedalaman kemiskinan wilayah (P1 BPS)",
    "regional_trend": "Tren keparahan kemiskinan wilayah (3 tahun)",
    "poverty_line_k": "Garis kemiskinan wilayah (ribu Rp/kapita/bulan)",
    "poor_count_k": "Jumlah penduduk miskin wilayah (ribu jiwa)",
    # Fitur Rumah Tangga Multidimensional Poverty
    "household_size": "Jumlah anggota keluarga / tanggungan",
    "income_per_capita_band": "Pita pengeluaran per kapita terhadap GK",
    "head_education_level": "Pendidikan kepala keluarga",
    "housing_quality": "Kualitas fisik hunian & sanitasi",
    "has_disabled_or_elderly": "Anggota rentan (disabilitas / lansia / balita)",
    "is_civil_servant_or_security": "Status ASN / TNI / Polri (kriteria eksklusi)",
    "land_ownership": "Kepemilikan lahan atau rumah tinggal",
    "has_bpjs": "Akses jaminan kesehatan (BPJS Kesehatan)",
    "head_unemployed": "Status kepala keluarga tidak bekerja / menganggur"
}

# Nilai default untuk memastikan backward compatibility 100%
DEFAULTS = {
    "land_ownership": 1,
    "has_bpjs": 1,
    "head_unemployed": 0,
    "head_education_level": 1,
    "housing_quality": 2,
    "has_disabled_or_elderly": 0,
    "is_civil_servant_or_security": 0,
    "household_size": 4,
    "income_per_capita_band": 3
}

class Req(BaseModel):
    features: dict

app = FastAPI(
    title="RantaiAsa AI Engine — Multidimensional Poverty Scoring",
    description="Sistem Verifikasi Kelayakan Bantuan Sosial Berbasis AI & Blockchain (Jawa Barat 27 Kab/Kota)",
    version=VER
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_version": VER,
        "features_count": len(FEATS),
        "target_province": "Jawa Barat (3201-3279)"
    }

@app.get("/model-info")
def info():
    import json
    metrics_path = os.path.join(os.path.dirname(__file__), "metrics.json")
    metrics_data = json.load(open(metrics_path)) if os.path.exists(metrics_path) else {}
    return {
        "version": VER,
        "features": FEATS,
        "threshold": THRESHOLD,
        "review_low": REVIEW_LOW,
        "feature_labels": LABEL,
        "metrics": metrics_data
    }

@app.get("/regions")
def regions():
    # Mengembalikan 27 kab/kota dengan key lengkap dan alias ramah frontend
    return [
        {
            "kode_kabupaten_kota": k,
            "nama": v.get("nama"),
            "nama_kabupaten_kota": v.get("nama"),
            "tahun_data": v.get("tahun_data", 2025),
            "regional_severity": v.get("regional_severity"),
            "regional_depth": v.get("regional_depth"),
            "regional_trend": v.get("regional_trend"),
            "poverty_line_k": v.get("poverty_line_k"),
            "poor_count_k": v.get("poor_count_k"),
            "p2_latest": v.get("regional_severity"),
            "trend_3yr": v.get("regional_trend")
        }
        for k, v in sorted(REG.items())
    ]

@app.get("/regions/{kode}/trend")
def region_trend(kode: int):
    # Mengembalikan riwayat tren P2 BPS 2004–2025
    import pandas as pd
    csv_file = os.path.join(os.path.dirname(__file__), "data", "p2_jabar.csv")
    if not os.path.exists(csv_file):
        return {"kode": kode, "data": []}
    try:
        df = pd.read_csv(csv_file)
        df.columns = [c.strip().lower() for c in df.columns]
        sub = df[df["kode_kabupaten_kota"] == kode].sort_values("tahun")
        res = [
            {"tahun": int(r["tahun"]), "p2": float(r["indeks_keparahan_kemiskinan"])}
            for _, r in sub.iterrows()
        ]
        return {"kode": kode, "data": res}
    except Exception as e:
        return {"kode": kode, "error": str(e), "data": []}

@app.post("/score")
def score(req: Req):
    f = dict(req.features)
    
    # 1. Lookup indikator makro wilayah otomatis dari data terbuka BPS
    if "kode_kabupaten_kota" in f:
        try:
            reg_code = int(f["kode_kabupaten_kota"])
            if reg_code not in REG:
                raise KeyError
            for k in FEATS:
                if k in REG[reg_code]:
                    f.setdefault(k, REG[reg_code][k])
        except (KeyError, ValueError, TypeError):
            raise HTTPException(
                422,
                {"error": "INVALID_INPUT", "detail": "kode_kabupaten_kota tidak dikenal (Jawa Barat 3201–3279)"}
            )

    # 2. Isi default jika ada fitur rumah tangga tambahan yang belum dikirim
    for k in FEATS:
        if k not in f and k in DEFAULTS:
            f[k] = DEFAULTS[k]

    # 3. Validasi fitur lengkap
    miss = [k for k in FEATS if k not in f]
    if miss:
        raise HTTPException(422, {"error": "INVALID_FEATURES", "detail": f"fitur hilang: {miss}"})

    try:
        import pandas as pd
        x_df = pd.DataFrame([[float(f[k]) for k in FEATS]], columns=FEATS)
    except (TypeError, ValueError):
        raise HTTPException(422, {"error": "INVALID_FEATURES", "detail": "seluruh nilai fitur harus numerik"})

    # 4. Kalkulasi skor probabilitas 1–100
    prob = PIPE.predict_proba(x_df)[0, 1]
    s = max(1, min(100, int(round(prob * 100))))

    # 5. Hitung atribusi faktor (Linear Feature Impact: z = x_scaled * coef)
    scaler = PIPE.named_steps["sc"]
    lr_model = PIPE.named_steps["lr"]
    x_scaled = scaler.transform(x_df)[0]
    z = x_scaled * lr_model.coef_[0]

    # Top 3 faktor dominan yang mempengaruhi skor
    top_indices = sorted(range(len(FEATS)), key=lambda i: -abs(z[i]))[:3]
    top_factors = [
        {
            "feature": FEATS[i],
            "name": LABEL.get(FEATS[i], FEATS[i]),
            "impact": "+" if z[i] > 0 else "-",
            "weight": round(float(z[i]), 3)
        }
        for i in top_indices
    ]

    # 6. Tentukan status kelayakan (gated execution smart contract)
    if s >= THRESHOLD:
        label = "ELIGIBLE"
    elif s >= REVIEW_LOW:
        label = "REVIEW"
    else:
        label = "NOT_ELIGIBLE"

    return {
        "score": s,
        "label": label,
        "threshold": THRESHOLD,
        "review_required": label == "REVIEW",
        "top_factors": top_factors,
        "model_version": VER,
        "data_notice": "Indikator wilayah: data terbuka BPS Provinsi Jawa Barat (nyata). Karakteristik rumah tangga & label: SIMULASI."
    }
