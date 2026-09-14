import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GAMES } from '@/lib/data';
import { seededScores } from '@/lib/data';
import styles from '@/styles/arcade.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: PageProps) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);

  if (!game) {
    notFound();
  }

  const scores = seededScores(game.id, 12);

  return (
    <>
      <div className={styles['av-detail']}>
        {/* Left column: cover */}
        <div className={styles['detail-cover']}>
          <div className={`${styles['cover-bg']} ${styles[game.cover]}`} />
        </div>

        {/* Right column: info */}
        <div className={styles['detail-info']}>
          <h2 className={`${styles.pixel} ${styles['neon-cyan']}`}>
            {game.title}
          </h2>

          <div className={styles['detail-tags']}>
            <span>{game.cat}</span>
          </div>

          <p>{game.long}</p>

          <div className={styles['stat-strip']}>
            <div>
              <div className={styles.l}>Mejor Score</div>
              <div className={styles.v}>{game.best.toLocaleString()}</div>
            </div>
            <div>
              <div className={styles.l}>Jugadores</div>
              <div className={styles.v}>{game.plays}</div>
            </div>
            <div>
              <div className={styles.l}>Categoría</div>
              <div className={styles.v}>{game.cat}</div>
            </div>
          </div>

          <div className={styles['detail-actions']}>
            <Link
              href={`/jugar/${game.id}`}
              className={`${styles.btn} ${styles[game.color]} ${styles.lg} ${styles.pulse}`}
            >
              JUGAR AHORA
            </Link>
            <Link href="/salon" className={`${styles.btn} ${styles.ghost}`}>
              VER SALÓN
            </Link>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ maxWidth: '1320px', margin: '0 auto 80px', padding: '0 32px' }}>
        <div className={styles.leaderboard}>
          <h3>TOP JUGADORES — {game.title.toUpperCase()}</h3>
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
              <div key={entry.rank} className={`${styles['lb-row']} ${topClass}`}>
                <span className={styles.rk}>#{entry.rank.toString().padStart(2, '0')}</span>
                <span className={styles.pl}>{entry.name}</span>
                <span className={styles.sc}>{entry.score.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
