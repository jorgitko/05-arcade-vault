-- Puntuaciones. game_id es texto porque los juegos siguen hardcoded en lib/data.ts.
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para queries de leaderboard
CREATE INDEX idx_scores_game_id ON scores (game_id);
CREATE INDEX idx_scores_game_score ON scores (game_id, score DESC);
CREATE INDEX idx_scores_user_id ON scores (user_id);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Leaderboards públicos: cualquiera puede leer.
CREATE POLICY "Scores readable by all"
  ON scores FOR SELECT
  USING (true);

CREATE POLICY "Users insert own scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);
