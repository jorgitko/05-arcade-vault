import type { ReactNode } from 'react';
import AppWrapper from '@/components/app-wrapper';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppWrapper>{children}</AppWrapper>;
}
