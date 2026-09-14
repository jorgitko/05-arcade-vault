import Link from 'next/link';
import type { Game } from '@/lib/types';
import styles from '@/styles/arcade.module.css';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/juego/${game.id}`} className={styles.card}>
      <div className={styles.cover}>
        <div className={`${styles['cover-bg']} ${styles[game.cover]}`} />
        <span className={styles.label}>{game.cat}</span>
      </div>

      <div className={styles.meta}>
        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.desc}>{game.short}</p>
      </div>

      <div className={styles.row}>
        <div className={styles['score-badge']}>
          <span>MEJOR PUNTUACIÓN</span>
          <b>{game.best.toLocaleString('es-ES')}</b>
        </div>

        <button className={`${styles.btn} ${styles[game.color]}`}>
          JUGAR
        </button>
      </div>
    </Link>
  );
}
