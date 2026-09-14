'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@/lib/types';
import styles from '@/styles/arcade.module.css';

interface NavProps {
  user: User | null;
  onSignOut: () => void;
}

export default function Nav({ user, onSignOut }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className={styles['av-nav']}>
        <Link href="/" className={styles.logo}>
          <div className={styles['logo-mark']} />
          <span className={`${styles['logo-text']} ${styles['neon-cyan']}`}>
            ARCADE VAULT
          </span>
        </Link>

        <div className={styles.links}>
          <Link
            href="/"
            className={isActive('/') ? styles.active : ''}
          >
            BIBLIOTECA
          </Link>
          <Link
            href="/salon"
            className={isActive('/salon') ? styles.active : ''}
          >
            SALÓN DE LA FAMA
          </Link>
        </div>

        <div className={styles.spacer} />

        <div className={styles['coin-counter']}>
          <div className={styles.coin} />
          <span>03</span>
        </div>

        <div className={styles['auth-btn']}>
          {user ? (
            <button className={styles.btn} onClick={onSignOut}>
              {user.name}
            </button>
          ) : (
            <button
              className={styles.btn}
              onClick={() => { window.location.href = '/auth'; }}
            >
              INICIAR SESIÓN
            </button>
          )}
        </div>

        <button
          className={`${styles.btn} ${styles.ghost} ${styles.hamburger}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </nav>

      {/* Mobile backdrop */}
      <div
        className={`${styles['av-mobile-backdrop']} ${mobileOpen ? styles.open : ''}`}
        onClick={closeMobile}
      />

      {/* Mobile panel */}
      <div className={`${styles['av-mobile-panel']} ${mobileOpen ? styles.open : ''}`}>
        <Link
          href="/"
          className={isActive('/') ? styles.active : ''}
          onClick={closeMobile}
        >
          BIBLIOTECA
        </Link>
        <Link
          href="/salon"
          className={isActive('/salon') ? styles.active : ''}
          onClick={closeMobile}
        >
          SALÓN DE LA FAMA
        </Link>

        <div style={{ marginTop: '16px' }}>
          {user ? (
            <button
              className={`${styles.btn} ${styles.magenta}`}
              onClick={() => {
                onSignOut();
                closeMobile();
              }}
              style={{ width: '100%' }}
            >
              CERRAR SESIÓN ({user.name})
            </button>
          ) : (
            <Link
              href="/auth"
              className={styles.btn}
              onClick={closeMobile}
              style={{ width: '100%', textAlign: 'center' }}
            >
              INICIAR SESIÓN
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
