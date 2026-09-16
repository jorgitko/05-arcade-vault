'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/arcade.module.css';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const register = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No se pudo crear la cuenta');

    const { error: profileError } = await supabase
      .from('users')
      .insert({ id: data.user.id, name });
    if (profileError) throw profileError;
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Completa email y contraseña');
      return;
    }
    if (tab === 'register' && !name) {
      setError('Completa tu nombre de jugador');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await (tab === 'login' ? login() : register());
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
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
            onClick={() => switchTab('login')}
          >
            INICIAR SESIÓN
          </button>
          <button
            className={tab === 'register' ? styles.on : ''}
            onClick={() => switchTab('register')}
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

          {error && (
            <p className={styles['auth-error']} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={`${styles.btn} ${styles.lg}`}
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submitting}
          >
            {submitting
              ? 'CARGANDO...'
              : tab === 'login'
                ? 'ENTRAR'
                : 'CREAR CUENTA'}
          </button>
        </form>
      </div>
    </div>
  );
}
