'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveUser } from '@/lib/storage';
import styles from '@/styles/arcade.module.css';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Por favor completa email y contraseña');
      return;
    }
    if (tab === 'register' && !name) {
      alert('Por favor completa tu nombre');
      return;
    }

    const user = {
      name: tab === 'register' ? name : email.split('@')[0].toUpperCase(),
      email,
    };

    saveUser(user);
    window.location.href = '/';
  };

  return (
    <div className={styles['av-auth-wrap']}>
      <div className={styles['auth-card']}>
        <div className={styles['auth-header']}>
          <div className={styles.mark} />
          <h2 className={`${styles.pixel} ${styles['neon-cyan']}`}>
            ARCADE VAULT
          </h2>
        </div>

        <div className={styles['auth-tabs']}>
          <button
            className={tab === 'login' ? styles.on : ''}
            onClick={() => setTab('login')}
          >
            INICIAR SESIÓN
          </button>
          <button
            className={tab === 'register' ? styles.on : ''}
            onClick={() => setTab('register')}
          >
            REGISTRARSE
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className={styles.field}>
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre de jugador"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
              />
            </div>
          )}

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`${styles.btn} ${styles.lg}`}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {tab === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
          </button>
        </form>

        <div className={styles['auth-divider']}>O CONTINUAR CON</div>

        <div className={styles.social}>
          <button className={`${styles.btn} ${styles.ghost}`}>GOOGLE</button>
          <button className={`${styles.btn} ${styles.ghost}`}>DISCORD</button>
        </div>
      </div>
    </div>
  );
}
