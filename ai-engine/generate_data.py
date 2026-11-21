"""
Konteks wilayah NYATA (Galura Jabar BPS: P2, P1, Penduduk Miskin, Garis Kemiskinan)
+ Rumah Tangga SINTETIS (SIMULASI — wajib berlabel)

Model: RantaiAsa AI v2.0 (gbdt-jabar-sim-2.0)
Kriteria kelayakan mengacu pada indikator kemiskinan multidimensi BPS:
  - Pengeluaran per kapita vs. Garis Kemiskinan (GK) wilayah
  - Kondisi perumahan & sanitasi
  - Akses layanan dasar (BPJS, KIP)
  - Kerentanan (lansia/disabilitas, pengangguran, pertanian tanpa lahan)
  - Eksklusi: ASN/TNI/Polri aktif

CATATAN: Seluruh data rumah tangga & label adalah SIMULASI untuk keperluan demo.
Indikator wilayah bersumber dari data terbuka BPS Jawa Barat via Galura.
"""
import glob, os
import numpy as np
import pandas as pd

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

KEYS = {
    "severity": "keparahan",
    "depth":    "kedalaman",
    "count":    "jumlah_penduduk_miskin",
    "line":     "garis",
}

# ── Helpers ──────────────────────────────────────────────────────────────
def _load(key):
    fs = [f for f in glob.glob(os.path.join(D, "*.csv"))
          if KEYS[key] in os.path.basename(f).lower()]
    if not fs:
        raise FileNotFoundError(
            f"data/*{KEYS[key]}*.csv tidak ditemukan "
            f"(unduh dari Galura Jabar, taruh di folder data/)"
        )
    d = pd.read_csv(fs[0])
    d.columns = [c.strip().lower() for c in d.columns]
    val = [c for c in d.columns
           if c not in ("id", "tahun", "satuan")
           and not c.startswith(("kode", "nama"))
           and pd.api.types.is_numeric_dtype(d[c])]
    if not val:
        raise ValueError(
            f"{fs[0]}: kolom nilai numerik tidak ditemukan; "
            f"kolom={list(d.columns)}"
        )
    return d[["kode_kabupaten_kota", "tahun", val[0]]].rename(
        columns={val[0]: "v"}
    ).dropna()


def _latest(d):
    y = d.tahun.max()
    return d[d.tahun == y].set_index("kode_kabupaten_kota").v, y


def _trend(sev_df, years=3):
    """Tren P2 selama `years` tahun terakhir."""
    y = sev_df.tahun.max()
    s_now  = sev_df[sev_df.tahun == y].set_index("kode_kabupaten_kota").v
    s_prev = sev_df[sev_df.tahun == y - years].set_index("kode_kabupaten_kota").v
    return (s_now - s_prev).dropna()


# ── Region table (data terbuka BPS) ──────────────────────────────────────
def regions():
    sev_df = _load("severity")
    s, y   = _latest(sev_df)
    dep, _ = _latest(_load("depth"))
    cnt, _ = _latest(_load("count"))
    gk,  _ = _latest(_load("line"))
    tren   = _trend(sev_df, years=3)

    # nama kab/kota
    nm_file = [f for f in os.listdir(D) if KEYS["severity"] in f.lower()][0]
    nm_df = pd.read_csv(os.path.join(D, nm_file))
    nm_df.columns = [c.strip().lower() for c in nm_df.columns]
    nm = (nm_df.drop_duplicates("kode_kabupaten_kota")
              .set_index("kode_kabupaten_kota")
              .nama_kabupaten_kota)

    r = pd.DataFrame({
        "regional_severity": s,         # P2 — Indeks Keparahan Kemiskinan
        "regional_depth":    dep,       # P1 — Indeks Kedalaman Kemiskinan
        "regional_trend":    tren,      # Δ P2 (3 tahun), positif = memburuk
        "poor_count_k":      cnt,       # Penduduk Miskin (ribu jiwa)
        "poverty_line_k":    gk / 1000, # Garis Kemiskinan (ribu Rp/kap/bln)
    }).dropna()

    r.insert(0, "nama", nm.reindex(r.index))
    r["tahun_data"] = y
    return r


# ── Synthetic household data generator (SIMULASI) ────────────────────────
def make(n: int = 10_000, seed: int = 42) -> pd.DataFrame:
    """
    Bangkitkan dataset SINTETIS rumah tangga Jawa Barat.
    Label `eligible` = 1 jika terindikasi perlu bantuan sosial.

    Fitur:
      WILAYAH  (dari BPS nyata, otomatis di-inject via kode_kabupaten_kota):
        regional_severity, regional_depth, regional_trend,
        poor_count_k, poverty_line_k
      RUMAH TANGGA  (SIMULASI):
        household_size, income_per_capita_band,
        head_education_level, housing_quality,
        has_disabled_or_elderly, is_civil_servant_or_security,
        land_ownership,          # 1=punya tanah/rumah sendiri, 0=tidak
        has_bpjs,                # akses BPJS Kesehatan (0/1)
        head_unemployed,         # kepala RT menganggur (0/1)
    """
    rng = np.random.default_rng(seed)
    reg = regions()

    # Distribusi proporsional: kab/kota dengan P2 lebih tinggi → lebih banyak sampel
    weights = reg["regional_severity"].values
    weights = weights / weights.sum()
    kode = rng.choice(reg.index.values, size=n, p=weights)

    g   = reg.loc[kode]
    sev = ((g.regional_severity - g.regional_severity.mean()) /
           (g.regional_severity.std() + 1e-9)).values
    dep = ((g.regional_depth - g.regional_depth.mean()) /
           (g.regional_depth.std() + 1e-9)).values

    # Pengeluaran per kapita: rasio terhadap GK (1.0 = tepat di GK)
    # Wilayah lebih parah → distribusi lebih ke bawah GK
    ratio = np.exp(rng.normal(np.log(1.8) - 0.15 * sev, 0.60, n))
    band  = np.digitize(ratio, [0.7, 0.9, 1.3, 2.0]) + 1  # 1–5; 1=sangat miskin

    # Pendidikan kepala RT (0=tdk sekolah, 1=SD, 2=SMP, 3=SMA, 4=PT)
    # Wilayah lebih parah → cenderung pendidikan lebih rendah
    edu_base = np.clip(rng.normal(1.5 - 0.3 * sev, 1.0, n), 0, 4).astype(int)

    # Kualitas hunian (1=sangat buruk, 2=buruk, 3=sedang, 4=baik)
    hq_base = np.clip(rng.normal(2.0 - 0.25 * sev, 0.9, n), 1, 4).round().astype(int)

    # Kepemilikan lahan/rumah (0=tidak punya, 1=punya)
    land = (rng.random(n) > (0.30 + 0.10 * sev)).astype(int)

    # Akses BPJS Kesehatan (0=tidak, 1=ya)
    has_bpjs = (rng.random(n) < (0.65 - 0.08 * sev)).astype(int)

    # Kepala RT menganggur (0=tidak, 1=ya)
    head_unemployed = (rng.random(n) < (0.12 + 0.05 * sev)).astype(int)

    df = pd.DataFrame({
        "kode_kabupaten_kota":        kode,
        # Fitur wilayah (dari BPS)
        "regional_severity":          g.regional_severity.values,
        "regional_depth":             g.regional_depth.values,
        "regional_trend":             g.regional_trend.values,
        "poverty_line_k":             g.poverty_line_k.values,
        "poor_count_k":               g.poor_count_k.values,
        # Fitur rumah tangga SIMULASI
        "household_size":             rng.integers(1, 11, n),
        "income_per_capita_band":     band,
        "head_education_level":       edu_base,
        "housing_quality":            hq_base,
        "has_disabled_or_elderly":    (rng.random(n) < 0.27).astype(int),
        "is_civil_servant_or_security": (rng.random(n) < 0.05).astype(int),
        "land_ownership":             land,
        "has_bpjs":                   has_bpjs,
        "head_unemployed":            head_unemployed,
    })

    # ── Label kelayakan (SIMULASI) ───────────────────────────────────────
    # Logit gabungan: mirip formula BPS near-poor (120% GK) + dimensi kerentanan
    z = (
        -3.5  * (np.log(ratio + 1e-9) - np.log(1.15))  # pendapatan vs GK
        -0.20 * (df.head_education_level - 2)           # pendidikan
        -0.60 * (df.housing_quality - 2)                # hunian
        +0.18 * (df.household_size - 4)                 # beban tanggungan
        +0.55 * df.has_disabled_or_elderly              # kerentanan
        +0.40 * df.head_unemployed                      # pengangguran
        -0.35 * df.land_ownership                       # aset
        -0.25 * df.has_bpjs                             # sudah ada perlindungan
        +0.35 * sev                                     # konteks wilayah P2
        +0.25 * dep                                     # konteks wilayah P1
        -4.00 * df.is_civil_servant_or_security         # eksklusif ASN/TNI/Polri
        + rng.normal(0, 1.3, n)                         # noise realistis
    )
    df["eligible"] = (z > 0).astype(int)
    return df


if __name__ == "__main__":
    d = make()
    print(d.shape, "eligible rate", round(d.eligible.mean(), 3))
    print(d[["regional_severity", "income_per_capita_band", "eligible"]].describe())
