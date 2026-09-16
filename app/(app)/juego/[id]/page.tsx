import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GAMES } from '@/lib/data';
import GameLeaderboard from '@/components/game-leaderboard';
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
      <div
        style={{ maxWidth: '1320px', margin: '0 auto 80px', padding: '0 32px' }}
      >
        <GameLeaderboard gameId={game.id} gameTitle={game.title} />
      </div>
    </>
  );
}
