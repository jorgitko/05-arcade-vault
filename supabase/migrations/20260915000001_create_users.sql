-- Perfil público de cada usuario. El id es el mismo de auth.users.
-- El email no se duplica aquí: vive en auth.users y se lee desde la sesión.
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- SELECT público: el leaderboard necesita el name de cualquier usuario.
-- Seguro porque la tabla no contiene datos sensibles.
CREATE POLICY "Users readable by all"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
