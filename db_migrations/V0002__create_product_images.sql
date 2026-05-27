CREATE TABLE t_p6422742_moss_eco_project.product_images (
  product_id  INT PRIMARY KEY,
  image_url   TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);