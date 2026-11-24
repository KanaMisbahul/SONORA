-- Skema SONORA. Idempoten: aman dijalankan berulang.
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  category    TEXT        NOT NULL CHECK (category IN ('Gitar','Keyboard','Ukulele','Aksesoris')),
  sub         TEXT        NOT NULL CHECK (char_length(sub) BETWEEN 1 AND 40),
  price       INTEGER     NOT NULL CHECK (price BETWEEN 0 AND 1000000000),
  stock       INTEGER     NOT NULL CHECK (stock BETWEEN 0 AND 100000),
  tag         TEXT        NOT NULL DEFAULT '' CHECK (char_length(tag) <= 24),
  image       TEXT        NOT NULL DEFAULT '' CHECK (char_length(image) <= 500),
  cutout      BOOLEAN     NOT NULL DEFAULT FALSE,
  description TEXT        NOT NULL CHECK (char_length(description) BETWEEN 1 AND 500),
  spec        TEXT        NOT NULL DEFAULT '' CHECK (char_length(spec) <= 120),
  model       TEXT        NOT NULL DEFAULT '' CHECK (char_length(model) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
