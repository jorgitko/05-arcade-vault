export type GameCategory = 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS';

export interface Game {
  id: string;
  title: string;
  short: string; // descripción breve
  long: string; // descripción larga
  cat: GameCategory;
  cover: string; // clase CSS cover (ej: 'cover-bricks')
  color: 'cyan' | 'magenta' | 'yellow' | 'green';
  best: number; // mejor puntuación
  plays: string; // ej: '12.4K'
}

/** Fila de la tabla `users`. El email vive en auth.users, no aquí. */
export interface User {
  id: string; // UUID, mismo id que auth.users
  name: string;
  created_at: string;
}

/** Fila de la tabla `scores`. */
export interface DbScore {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  created_at: string;
}

/** Entrada ya rankeada, lista para pintar en un leaderboard. */
export interface LeaderboardEntry {
  rank: number;
  user_name: string;
  score: number;
  date: string;
}

export interface ScoreEntry {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export interface SavedScore {
  gameId: string;
  score: number;
  at: number; // timestamp
}
