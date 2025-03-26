'use client';

import type { ReactNode } from 'react';
import { DrawerNav } from '@/components/drawer-nav';

interface SiteHeaderProps {
  children?: ReactNode;
}

export function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className='sticky top-0 z-40 w-full bg-background border-b'>
      <div className='container flex h-16 items-center justify-between px-4 md:px-6'>
        <DrawerNav />
        {children}
      </div>
    </header>
  );
}
