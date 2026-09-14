import type { Game, ScoreEntry } from './types';

export const GAMES: Game[] = [
  {
    id: 'bloque-buster',
    title: 'Bloque Buster',
    short: 'Rompe todos los bloques con la pelota',
    long: 'Controla la paleta para mantener la pelota en juego. Destruye todos los bloques de colores sin dejar que la pelota caiga. Cada nivel aumenta la velocidad y añade bloques más resistentes.',
    cat: 'ARCADE',
    cover: 'cover-bricks',
    color: 'cyan',
    best: 45820,
    plays: '12.4K',
  },
  {
    id: 'caida',
    title: 'Caída',
    short: 'Encaja piezas que caen del cielo',
    long: 'Las piezas caen sin parar. Gíralas y colócalas para formar líneas completas que desaparecerán. La velocidad aumenta cada 10 líneas. ¿Cuánto aguantarás?',
    cat: 'PUZZLE',
    cover: 'cover-tetris',
    color: 'magenta',
    best: 98340,
    plays: '18.2K',
  },
  {
    id: 'serpentina',
    title: 'Serpentina',
    short: 'Come, crece y no te muerdas la cola',
    long: 'Guía la serpiente para comer puntos brillantes. Cada punto la hace crecer. Evita chocar con las paredes o con tu propia cola. Simple pero adictivo.',
    cat: 'ARCADE',
    cover: 'cover-snake',
    color: 'green',
    best: 23450,
    plays: '9.8K',
  },
  {
    id: 'gloton',
    title: 'Glotón',
    short: 'Escapa de los fantasmas en el laberinto',
    long: 'Recorre el laberinto comiendo todos los puntos. Los fantasmas te persiguen con patrones únicos. Come las píldoras de poder para voltear la situación y cazarlos temporalmente.',
    cat: 'ARCADE',
    cover: 'cover-pacman',
    color: 'yellow',
    best: 67890,
    plays: '15.6K',
  },
  {
    id: 'invasores',
    title: 'Invasores',
    short: 'Defiende la tierra de alienígenas',
    long: 'Oleadas de alienígenas descienden en formación. Dispara desde tu nave protegida por barricadas. Evita sus disparos y el platillo sorpresa que cruza el cielo.',
    cat: 'SHOOTER',
    cover: 'cover-invaders',
    color: 'green',
    best: 54320,
    plays: '11.3K',
  },
  {
    id: 'rocas',
    title: 'Rocas',
    short: 'Destruye asteroides en el espacio',
    long: 'Tu nave flota en el espacio profundo rodeada de asteroides. Dispara para destruirlos, pero cada uno se divide en fragmentos más pequeños y rápidos. Usa el hiperespacio con cuidado.',
    cat: 'SHOOTER',
    cover: 'cover-asteroids',
    color: 'cyan',
    best: 41200,
    plays: '8.9K',
  },
  {
    id: 'ranaria',
    title: 'Ranaria',
    short: 'Cruza el río sin caerte al agua',
    long: 'Lleva la rana hasta la meta en la orilla opuesta. Salta sobre troncos flotantes y tortugas. Evita los coches en la carretera y no caigas al agua. Cada cruce exitoso aumenta la dificultad.',
    cat: 'ARCADE',
    cover: 'cover-frogger',
    color: 'green',
    best: 31560,
    plays: '7.2K',
  },
  {
    id: 'duelo-pixel',
    title: 'Duelo Pixel',
    short: 'Tenis arcade de dos jugadores',
    long: 'El clásico para dos jugadores. Controla la paleta, golpea la pelota y anota en la portería contraria. El primero en llegar a 11 puntos gana. La pelota acelera con cada golpe.',
    cat: 'VERSUS',
    cover: 'cover-pong',
    color: 'cyan',
    best: 11,
    plays: '14.7K',
  },
];

export const CATEGORIES: string[] = ['TODOS', 'ARCADE', 'PUZZLE', 'SHOOTER', 'VERSUS'];

export const PLAYERS: string[] = [
  'ACE',
  'NOVA',
  'ZEX',
  'LYNX',
  'BOLT',
  'NEON',
  'HAWK',
  'FURY',
  'VEGA',
  'BLITZ',
  'FROST',
  'APEX',
  'CIPHER',
  'ECHO',
  'STORM',
  'NEXUS',
  'PULSE',
  'RAZOR',
];

export function seededScores(seed: string | number, count: number = 12): ScoreEntry[] {
  const seedNum = typeof seed === 'string'
    ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : seed;

  const rng = (n: number) => {
    const x = Math.sin(n) * 10000;
    return x - Math.floor(x);
  };

  const entries: ScoreEntry[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      const nameIndex = Math.floor(rng(seedNum + i * 7) * PLAYERS.length);
      name = PLAYERS[nameIndex];
    } while (usedNames.has(name) && usedNames.size < PLAYERS.length);

    usedNames.add(name);

    const baseScore = 100000 - (i * 5000);
    const variance = Math.floor(rng(seedNum + i * 13) * 3000);
    const score = baseScore + variance;

    const daysAgo = Math.floor(rng(seedNum + i * 19) * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];

    entries.push({
      rank: i + 1,
      name,
      score,
      date: dateStr,
    });
  }

  return entries.sort((a, b) => b.score - a.score).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}
