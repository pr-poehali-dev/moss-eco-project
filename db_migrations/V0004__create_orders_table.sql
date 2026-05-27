CREATE TABLE t_p6422742_moss_eco_project.orders (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  message     TEXT,
  items       JSONB,
  total       INTEGER,
  discount    INTEGER DEFAULT 0,
  final_total INTEGER,
  status      TEXT NOT NULL DEFAULT 'new',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);