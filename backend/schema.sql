CREATE TABLE users(id SERIAL PRIMARY KEY, wallet_address TEXT UNIQUE NOT NULL, role TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE officers(id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), display_name TEXT, region_code TEXT, active BOOL DEFAULT true);
CREATE TABLE aid_programs(id SERIAL PRIMARY KEY, code TEXT, name TEXT, period_id INT, amount_unit TEXT, threshold INT, active BOOL DEFAULT true);
CREATE TABLE recipient_refs(id SERIAL PRIMARY KEY, ref_code TEXT UNIQUE, identity_hash TEXT NOT NULL, program_id INT REFERENCES aid_programs(id), period_id INT, officer_id INT REFERENCES officers(id), reg_tx_hash TEXT, status TEXT, region_code TEXT, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE(identity_hash, period_id));
CREATE TABLE eligibility_assessments(id SERIAL PRIMARY KEY, recipient_id INT REFERENCES recipient_refs(id), score INT, label TEXT, review_required BOOL, top_factors JSONB, model_version TEXT, attest_tx_hash TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE disbursement_refs(id SERIAL PRIMARY KEY, recipient_id INT REFERENCES recipient_refs(id), program_id INT, period_id INT, amount NUMERIC, tx_hash TEXT UNIQUE, block_number BIGINT, status TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE audit_logs(id SERIAL PRIMARY KEY, officer_id INT REFERENCES officers(id), action TEXT, entity TEXT, entity_id TEXT, tx_hash TEXT, ip_hash TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- Tahap 3: Modul pelaporan warga/sukarelawan
CREATE TABLE reports (
  id          SERIAL PRIMARY KEY,
  region_code TEXT NOT NULL,          -- kode kab/kota 4 digit (3201–3279)
  category    TEXT NOT NULL           CHECK (category IN ('DUGAAN_GANDA','TIDAK_LAYAK','TIDAK_TERIMA','TERLAMBAT','SALAH_DATA')),
  description TEXT NOT NULL,
  photo_url   TEXT,                   -- S3/Cloudinary path; opsional
  status      TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','VERIFIED','REJECTED','NEEDS_INFO')),
  submitter_token_hash TEXT,          -- hash token pelapor (anonim opsional)
  is_anonymous BOOL DEFAULT false,
  report_hash TEXT UNIQUE,            -- keccak256 on-chain hash (isi tetap off-chain)
  officer_id  INT REFERENCES officers(id),
  officer_note TEXT,
  chain_tx_hash TEXT,                 -- tx ReportRegistry (opsional)
  created_at  TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE report_audit_logs (
  id         SERIAL PRIMARY KEY,
  report_id  INT REFERENCES reports(id),
  officer_id INT REFERENCES officers(id),
  action     TEXT NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index utilitas
CREATE INDEX idx_reports_region  ON reports(region_code);
CREATE INDEX idx_reports_status  ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at);
