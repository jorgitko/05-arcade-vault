export type GameCategory = 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS';

export interface Game {
  id: string;
  title: string;
  short: string;      // descripción breve
  long: string;       // descripción larga
  cat: GameCategory;
  cover: string;      // clase CSS cover (ej: 'cover-bricks')
  color: 'cyan' | 'magenta' | 'yellow' | 'green';
  best: number;       // mejor puntuación
  plays: string;      // ej: '12.4K'
}

export interface User {
  name: string;
  email: string;
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
  at: number;         // timestamp
}
