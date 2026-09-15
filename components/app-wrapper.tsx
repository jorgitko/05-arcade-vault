'use client';

import { useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { getUser, clearUser } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import Nav from './nav';

interface AppWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = getUser();
    setUser(stored);
  }, []);

  const handleSignOut = () => {
    clearUser();
    setUser(null);
    router.push('/');
  };

  return (
    <>
      <Nav user={user} onSignOut={handleSignOut} />
      <main style={{ flex: 1 }}>{children}</main>
    </>
  );
}
