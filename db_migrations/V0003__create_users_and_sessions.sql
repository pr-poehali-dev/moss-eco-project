CREATE TABLE t_p6422742_moss_eco_project.users (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p6422742_moss_eco_project.sessions (
  token      TEXT PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES t_p6422742_moss_eco_project.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);