'use client';

import { useState } from 'react';
import { GAMES, CATEGORIES } from '@/lib/data';
import GameCard from '@/components/game-card';
import styles from '@/styles/arcade.module.css';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('TODOS');

  const filtered = GAMES.filter((game) => {
    const matchesQuery = game.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'TODOS' || game.cat === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <>
      <div className={styles['av-hero']}>
        <h1 className={styles.flicker}>ARCADE VAULT</h1>
        <p className={styles.sub}>
          INSERTA UNA MONEDA PARA JUGAR<span className={styles.blink}> _</span>
        </p>
      </div>

      <div className={styles['av-filters']}>
        <div className={styles['av-search']}>
          <span className={styles.ico}>⌕</span>
          <input
            type="text"
            placeholder="Buscar un juego por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles['av-chips']}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.chip} ${category === cat ? styles.active : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles['av-grid']}>
        {filtered.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', color: 'var(--ink-faint)' }}>
            <div className={`${styles.pixel} ${styles['neon-magenta']}`} style={{ fontSize: '14px', marginBottom: '12px' }}>
              NO HAY RESULTADOS
            </div>
            <div>Intenta otra búsqueda o categoría.</div>
          </div>
        )}
      </div>
    </>
  );
}
