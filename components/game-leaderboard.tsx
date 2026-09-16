'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/queries';
import type { LeaderboardEntry } from '@/lib/types';
import styles from '@/styles/arcade.module.css';

interface GameLeaderboardProps {
  gameId: string;
  gameTitle: string;
}

export function rankClass(rank: number): string {
  if (rank === 1) return styles.top1;
  if (rank === 2) return styles.top2;
  if (rank === 3) return styles.top3;
  return '';
}

export default function GameLeaderboard({
  gameId,
  gameTitle,
}: GameLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getLeaderboard(gameId)
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch(() => {
        if (active) setEntries([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [gameId]);

  return (
    <div className={styles.leaderboard}>
      <h3>TOP JUGADORES — {gameTitle.toUpperCase()}</h3>

      {loading && <p className={styles['lb-empty']}>CARGANDO...</p>}

      {!loading && entries.length === 0 && (
        <p className={styles['lb-empty']}>
          AÚN NO HAY PUNTUACIONES. SÉ EL PRIMERO.
        </p>
      )}

      {!loading &&
        entries.map((entry) => (
          <div
            key={entry.rank}
            className={`${styles['lb-row']} ${rankClass(entry.rank)}`}
          >
            <span className={styles.rk}>
              #{entry.rank.toString().padStart(2, '0')}
            </span>
            <span className={styles.pl}>{entry.user_name}</span>
            <span className={styles.sc}>{entry.score.toLocaleString()}</span>
          </div>
        ))}
    </div>
  );
}
