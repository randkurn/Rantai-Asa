import json, os, joblib, numpy as np, pandas as pd
from sklearn.model_selection import train_test_split, cross_validate, GroupKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, brier_score_loss
)
from generate_data import make, regions

# ── Fitur Model RantaiAsa v2.0 (Indikator Multidimensi Sesuai Proposal) ──
FEATURES = [
    # 1. Konteks Wilayah Jawa Barat (Data Terbuka BPS via Galura Jabar - Nyata)
    "regional_severity",      # P2
    "regional_depth",         # P1
    "regional_trend",         # Tren 3 Thn
    "poverty_line_k",         # Garis Kemiskinan
    "poor_count_k",           # Jumlah Penduduk Miskin
    # 2. Kondisi Sosial Ekonomi Rumah Tangga (SIMULASI - Multidimensional Poverty)
    "household_size",             # Jumlah anggota keluarga
    "income_per_capita_band",     # Pita pengeluaran vs Garis Kemiskinan (1-5)
    "head_education_level",       # Pendidikan kepala keluarga (0-4)
    "housing_quality",            # Kualitas hunian & sanitasi (1-4)
    "has_disabled_or_elderly",    # Ada disabilitas / lansia (0/1)
    "is_civil_servant_or_security", # ASN / TNI / Polri (0/1 - Eksklusi)
    "land_ownership",             # Kepemilikan lahan/rumah (0/1)
    "has_bpjs",                   # Akses BPJS Kesehatan (0/1)
    "head_unemployed"             # Kepala keluarga menganggur (0/1)
]

print(f"[1/4] Membangkitkan 10.000 dataset simulasi rumah tangga Jawa Barat...")
df = make(n=10000, seed=42)
X = df[FEATURES]
y = df["eligible"]
grp = df["kode_kabupaten_kota"]

mk_pipe = lambda clf: Pipeline([("sc", StandardScaler()), ("m", clf)])

print("[2/4] Melakukan Cross-Validation (5-Fold & Leave-Region-Out GroupKFold)...")
models = {
    "logistic_regression": LogisticRegression(class_weight="balanced", max_iter=2000, random_state=42),
    "decision_tree": DecisionTreeClassifier(max_depth=4, class_weight="balanced", random_state=42),
    "gradient_boosting": GradientBoostingClassifier(n_estimators=80, max_depth=3, random_state=42)
}

cv_results = {}
for name, clf in models.items():
    res = cross_validate(mk_pipe(clf), X, y, cv=5, scoring=["roc_auc", "recall", "f1", "precision"])
    cv_results[name] = {
        "roc_auc": round(float(np.mean(res["test_roc_auc"])), 3),
        "recall": round(float(np.mean(res["test_recall"])), 3),
        "precision": round(float(np.mean(res["test_precision"])), 3),
        "f1": round(float(np.mean(res["test_f1"])), 3)
    }

# Leave-Region-Out (Generalisasi ke 27 Kab/Kota Jawa Barat)
g_cv = cross_validate(mk_pipe(models["logistic_regression"]), X, y, cv=GroupKFold(5), groups=grp, scoring=["roc_auc", "recall", "f1"])
cv_results["logistic_regression_leave_region_out"] = {
    "roc_auc": round(float(np.mean(g_cv["test_roc_auc"])), 3),
    "recall": round(float(np.mean(g_cv["test_recall"])), 3),
    "f1": round(float(np.mean(g_cv["test_f1"])), 3)
}

print("[3/4] Melatih Model Produksi RantaiAsa (Logistic Regression Terkalibrasi & Transparan)...")
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipe = Pipeline([
    ("sc", StandardScaler()),
    ("lr", LogisticRegression(class_weight="balanced", max_iter=2000, random_state=42))
]).fit(X_tr, y_tr)

pr = pipe.predict_proba(X_te)[:, 1]
p = (pr >= 0.5).astype(int)

# Sensitivitas Ambang Batas (Threshold Sensitivity)
sens = {}
for t in (45, 50, 55, 60, 65, 70):
    sens[str(t)] = {
        "precision": round(float(precision_score(y_te, pr >= t / 100)), 3),
        "recall": round(float(recall_score(y_te, pr >= t / 100)), 3)
    }

sc = pipe.predict_proba(X)[:, 1] * 100

# Analisis Keadilan Wilayah (Fairness Across 27 Regions)
fair = df.assign(score=sc).groupby("kode_kabupaten_kota").agg(
    mean_score=("score", "mean"),
    eligible_rate_pred=("score", lambda v: (v >= 60).mean()),
    eligible_rate_true=("eligible", "mean")
).round(3)
fair.to_csv(os.path.join(os.path.dirname(__file__), "fairness_by_region.csv"))

max_fair_gap = round(float((fair.eligible_rate_pred - fair.eligible_rate_true).abs().max()), 3)

metrics = {
    "model_version": "lr-jabar-multidim-2.0",
    "dataset_size": len(df),
    "eligible_rate_data": round(float(y.mean()), 3),
    "cv_5fold": cv_results,
    "threshold_sensitivity": sens,
    "brier": round(float(brier_score_loss(y_te, pr)), 3),
    "score_percentiles": {q: int(np.percentile(sc, q)) for q in (5, 25, 50, 75, 95)},
    "fairness_max_gap_pred_vs_true": max_fair_gap,
    "accuracy": round(float(accuracy_score(y_te, p)), 3),
    "precision": round(float(precision_score(y_te, p)), 3),
    "recall": round(float(recall_score(y_te, p)), 3),
    "f1": round(float(f1_score(y_te, p)), 3),
    "roc_auc": round(float(roc_auc_score(y_te, pr)), 3),
    "confusion_matrix": confusion_matrix(y_te, p).tolist(),
    "feature_weights": {feat: round(float(coef), 4) for feat, coef in zip(FEATURES, pipe.named_steps["lr"].coef_[0])},
    "note": "Fitur wilayah = data terbuka Galura Jabar BPS (nyata). Fitur rumah tangga & label = SIMULASI. Arsitektur sesuai Proposal RantaiAsa HackSphere 2026."
}

print("[4/4] Menyimpan Model & Metrik ke model.joblib dan metrics.json...")
reg = regions()
reg_cols = ["regional_severity", "regional_depth", "regional_trend", "poverty_line_k", "poor_count_k"]
region_dict = {
    int(k): {
        "nama": str(v.nama),
        "tahun_data": int(v.tahun_data),
        **{c: float(v[c]) for c in reg_cols}
    }
    for k, v in reg.iterrows()
}

joblib.dump({
    "pipe": pipe,
    "features": FEATURES,
    "version": "lr-jabar-multidim-2.0",
    "regions": region_dict
}, os.path.join(os.path.dirname(__file__), "model.joblib"))

with open(os.path.join(os.path.dirname(__file__), "metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)

print("\n" + "=" * 60)
print(f"TRAINING SELESAI: Model RantaiAsa {metrics['model_version']}")
print(f"ROC-AUC: {metrics['roc_auc']} | F1: {metrics['f1']} | Recall: {metrics['recall']} | Precision: {metrics['precision']}")
print(f"CV 5-Fold ROC-AUC: {cv_results['logistic_regression']['roc_auc']}")
print(f"Leave-Region-Out ROC-AUC: {cv_results['logistic_regression_leave_region_out']['roc_auc']}")
print(f"Brier Score (Kalibrasi): {metrics['brier']}")
print(f"Max Fairness Gap (27 Kab/Kota): {max_fair_gap}")
print("=" * 60)
