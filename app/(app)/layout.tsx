import type { ReactNode } from 'react';
import AppWrapper from '@/components/app-wrapper';
import { AuthProvider } from '@/lib/auth-context';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppWrapper>{children}</AppWrapper>
    </AuthProvider>
  );
}
