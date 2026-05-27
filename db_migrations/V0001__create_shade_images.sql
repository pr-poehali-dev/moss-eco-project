CREATE TABLE t_p6422742_moss_eco_project.shade_images (
  shade_name TEXT PRIMARY KEY,
  image_url  TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);