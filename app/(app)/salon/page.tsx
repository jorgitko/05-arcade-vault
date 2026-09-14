'use client';

import { useState, useEffect } from 'react';
import { GAMES } from '@/lib/data';
import { seededScores } from '@/lib/data';
import { getUser } from '@/lib/storage';
import type { User } from '@/lib/types';
import Link from 'next/link';
import styles from '@/styles/arcade.module.css';

export default function HallOfFamePage() {
  const [selectedGame, setSelectedGame] = useState(GAMES[0].id);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = getUser();
    setUser(stored);
  }, []);

  const game = GAMES.find((g) => g.id === selectedGame) || GAMES[0];
  const scores = seededScores(selectedGame, 12);

  const top3 = scores.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]]; // silver, gold, bronze

  return (
    <div className={styles['av-hall']}>
      <div className={styles['hall-head']}>
        <h1>SALÓN DE LA FAMA</h1>
        <p>Los mejores jugadores de Arcade Vault</p>
      </div>

      <div className={styles['hall-tabs']}>
        {GAMES.map((g) => (
          <button
            key={g.id}
            className={`${styles.chip} ${selectedGame === g.id ? styles.active : ''}`}
            onClick={() => setSelectedGame(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className={styles.podium}>
        {podiumOrder.map((entry, idx) => {
          const slotClass =
            idx === 1
              ? styles.gold
              : idx === 0
              ? styles.silver
              : styles.bronze;

          return (
            <div key={entry.rank} className={`${styles['podium-slot']} ${slotClass}`}>
              <div className={styles['rank-num']}>
                #{entry.rank.toString().padStart(2, '0')}
              </div>
              <div className={styles.name}>{entry.name}</div>
              <div className={styles.score}>{entry.score.toLocaleString()}</div>
              <div className={styles.date}>{entry.date}</div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className={styles['hall-table']}>
        <div className={styles.th}>
          <span>RANGO</span>
          <span>JUGADOR</span>
          <span>PUNTUACIÓN</span>
          <span>FECHA</span>
        </div>

        {scores.map((entry) => {
          const topClass =
            entry.rank === 1
              ? styles.top1
              : entry.rank === 2
              ? styles.top2
              : entry.rank === 3
              ? styles.top3
              : '';

          return (
            <div
              key={entry.rank}
              className={`${styles.tr} ${topClass}`}
              style={{ animationDelay: `${entry.rank * 40}ms` }}
            >
              <span className={styles.rk}>#{entry.rank.toString().padStart(2, '0')}</span>
              <span className={styles.pl}>{entry.name}</span>
              <span className={styles.sc}>{entry.score.toLocaleString()}</span>
              <span className={styles.dt}>{entry.date}</span>
            </div>
          );
        })}

        {user && (
          <>
            <div className={`${styles.tr} ${styles['you-label']}`}>
              TU MEJOR MARCA
            </div>
            <div className={`${styles.tr} ${styles.you}`}>
              <span className={styles.rk}>#--</span>
              <span className={styles.pl}>{user.name}</span>
              <span className={styles.sc}>12,340</span>
              <span className={styles.dt}>2026-09-14</span>
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Link href="/" className={`${styles.btn} ${styles.ghost} ${styles.lg}`}>
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
