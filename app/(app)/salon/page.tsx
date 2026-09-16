'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GAMES } from '@/lib/data';
import { getLeaderboard, getUserBest } from '@/lib/queries';
import { useAuth } from '@/lib/auth-context';
import { rankClass } from '@/components/game-leaderboard';
import type { LeaderboardEntry } from '@/lib/types';
import styles from '@/styles/arcade.module.css';

type UserBest = { score: number; date: string } | null;

interface LoadedBoard {
  gameId: string;
  entries: LeaderboardEntry[];
}

export default function HallOfFamePage() {
  const [selectedGame, setSelectedGame] = useState(GAMES[0].id);
  const [board, setBoard] = useState<LoadedBoard | null>(null);
  const [userBest, setUserBest] = useState<UserBest>(null);
  const { user } = useAuth();

  // El tablero cargado lleva su gameId, así el cambio de pestaña muestra
  // "cargando" sin necesidad de un setState extra dentro del effect.
  const loading = board?.gameId !== selectedGame;
  const entries = loading ? [] : board!.entries;

  useEffect(() => {
    let active = true;

    const load = async () => {
      const entries = await getLeaderboard(selectedGame).catch(() => []);
      if (active) setBoard({ gameId: selectedGame, entries });
    };
    load();

    return () => {
      active = false;
    };
  }, [selectedGame]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const best = user
        ? await getUserBest(selectedGame, user.id).catch(() => null)
        : null;
      if (active) setUserBest(best);
    };
    load();

    return () => {
      active = false;
    };
  }, [selectedGame, user]);

  // El podio solo tiene sentido con los tres primeros puestos cubiertos.
  const podium =
    entries.length >= 3
      ? [entries[1], entries[0], entries[2]] // plata, oro, bronce
      : [];

  const podiumClass = (slot: number) => {
    if (slot === 1) return styles.gold;
    return slot === 0 ? styles.silver : styles.bronze;
  };

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

      {podium.length > 0 && (
        <div className={styles.podium}>
          {podium.map((entry, idx) => (
            <div
              key={entry.rank}
              className={`${styles['podium-slot']} ${podiumClass(idx)}`}
            >
              <div className={styles['rank-num']}>
                #{entry.rank.toString().padStart(2, '0')}
              </div>
              <div className={styles.name}>{entry.user_name}</div>
              <div className={styles.score}>{entry.score.toLocaleString()}</div>
              <div className={styles.date}>{entry.date}</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles['hall-table']}>
        <div className={styles.th}>
          <span>RANGO</span>
          <span>JUGADOR</span>
          <span>PUNTUACIÓN</span>
          <span>FECHA</span>
        </div>

        {loading && <p className={styles['lb-empty']}>CARGANDO...</p>}

        {!loading && entries.length === 0 && (
          <p className={styles['lb-empty']}>
            AÚN NO HAY PUNTUACIONES PARA ESTE JUEGO.
          </p>
        )}

        {!loading &&
          entries.map((entry) => (
            <div
              key={entry.rank}
              className={`${styles.tr} ${rankClass(entry.rank)}`}
              style={{ animationDelay: `${entry.rank * 40}ms` }}
            >
              <span className={styles.rk}>
                #{entry.rank.toString().padStart(2, '0')}
              </span>
              <span className={styles.pl}>{entry.user_name}</span>
              <span className={styles.sc}>{entry.score.toLocaleString()}</span>
              <span className={styles.dt}>{entry.date}</span>
            </div>
          ))}

        {user && userBest && (
          <>
            <div className={`${styles.tr} ${styles['you-label']}`}>
              TU MEJOR MARCA
            </div>
            <div className={`${styles.tr} ${styles.you}`}>
              <span className={styles.rk}>#--</span>
              <span className={styles.pl}>{user.name}</span>
              <span className={styles.sc}>
                {userBest.score.toLocaleString()}
              </span>
              <span className={styles.dt}>{userBest.date}</span>
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
