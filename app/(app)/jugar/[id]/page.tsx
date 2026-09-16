'use client';

import { useState, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { GAMES } from '@/lib/data';
import { saveScore } from '@/lib/queries';
import { useAuth } from '@/lib/auth-context';
import styles from '@/styles/arcade.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerPage({ params }: PageProps) {
  const { id } = use(params);
  const game = GAMES.find((g) => g.id === id);
  const router = useRouter();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!game) {
    notFound();
  }

  const mockScore = 42680;

  const handleSave = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await saveScore(game.id, user.id, mockScore);
      setSaved(true);
      setTimeout(() => {
        router.push(`/juego/${game.id}`);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar el score'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePlayAgain = () => {
    setShowModal(false);
    setSaved(false);
    setError('');
  };

  return (
    <div className={styles['av-player']}>
      {/* HUD */}
      <div className={styles['player-hud']}>
        <div className={styles['hud-stat']}>
          <span className={styles.l}>Score</span>
          <span className={styles.v}>042680</span>
        </div>
        <div className={`${styles['hud-stat']} ${styles.lives}`}>
          <span className={styles.l}>Vidas</span>
          <span className={styles.v}>03</span>
        </div>
        <div className={`${styles['hud-stat']} ${styles.level}`}>
          <span className={styles.l}>Nivel</span>
          <span className={styles.v}>05</span>
        </div>

        <div style={{ flex: 1 }} />

        <div className={styles['hud-actions']}>
          <button
            className={`${styles.btn} ${styles.ghost}`}
            onClick={() => setShowModal(true)}
          >
            SIMULAR GAME OVER
          </button>
          <button className={`${styles.btn} ${styles.ghost}`}>PAUSA</button>
          <button
            className={`${styles.btn} ${styles.magenta}`}
            onClick={() => router.push(`/juego/${game.id}`)}
          >
            SALIR
          </button>
        </div>
      </div>

      {/* CRT */}
      <div className={styles.crt}>
        <div className={styles['crt-screen']}>
          <div className={styles['crt-content']}>
            <div className={`${styles.pixel} ${styles['neon-cyan']}`}>
              JUEGO NO IMPLEMENTADO
            </div>
          </div>
        </div>

        <div className={styles['crt-bottom']}>
          <span className={styles.led}>POWER</span>
          <span>AV-2600</span>
        </div>
      </div>

      {/* Modal Game Over */}
      {showModal && (
        <div className={styles['modal-bd']}>
          <div className={styles.modal}>
            <h2>GAME OVER</h2>

            <div className={styles['final-label']}>PUNTUACIÓN FINAL</div>
            <div className={styles.final}>{mockScore.toLocaleString()}</div>

            {!saved ? (
              <>
                <div className={styles['input-row']}>
                  {user ? (
                    <p className={styles['modal-player']}>
                      JUGADOR: {user.name.toUpperCase()}
                    </p>
                  ) : (
                    <p className={styles['modal-player']}>
                      INICIA SESIÓN PARA GUARDAR TU PUNTUACIÓN
                    </p>
                  )}
                </div>

                {error && (
                  <p className={styles['auth-error']} role="alert">
                    {error}
                  </p>
                )}

                <div className={styles.actions}>
                  <button
                    className={`${styles.btn} ${styles.magenta} ${styles.lg}`}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'GUARDANDO...' : 'GUARDAR Y SALIR'}
                  </button>
                  <button
                    className={`${styles.btn} ${styles.ghost}`}
                    onClick={handlePlayAgain}
                  >
                    JUGAR DE NUEVO
                  </button>
                </div>
              </>
            ) : (
              <div className={styles['toast-saved']}>✓ SCORE GUARDADO</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
