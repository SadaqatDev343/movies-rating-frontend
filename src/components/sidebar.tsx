'use client';

import type React from 'react';

import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Film, Home, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = useCallback(() => {
    logout();
    // Smooth transition to login page
    router.push('/');
  }, [logout, router]);

  const routes: NavItem[] = [
    {
      name: 'Movies',
      path: '/movies',
      icon: <Home className='h-5 w-5' />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className='h-5 w-5' />,
    },
  ];

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-full w-60 bg-background border-r flex flex-col transition-all duration-300',
        className
      )}
    >
      {/* Logo */}
      <div className='flex items-center h-16 px-6 border-b'>
        <Link
          href='/movies'
          className='flex items-center gap-2 transition-colors hover:text-primary'
        >
          <Film className='h-6 w-6' />
          <span className='font-bold text-lg'>MovieRater</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-3 py-4'>
        <ul className='space-y-1'>
          {routes.map((route) => (
            <li key={route.path}>
              <Link
                href={route.path}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  pathname === route.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className='mr-3'>{route.icon}</span>
                {route.name}
              </Link>
            </li>
          ))}

          <li className='mt-4'>
            <button
              onClick={handleLogout}
              className='flex w-full items-center px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200'
            >
              <LogOut className='mr-3 h-5 w-5' />
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className='px-3 py-4 border-t'>
        <div className='text-xs text-muted-foreground'>
          <p>v1.0.1</p>
        </div>
      </div>
    </div>
  );
}
