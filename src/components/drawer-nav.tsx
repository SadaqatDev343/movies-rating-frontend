'use client';

import type React from 'react';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Home, LogOut, Menu, User, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useLogout } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile } from '@/hooks/use-auth';

interface NavRoute {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export function DrawerNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const logout = useLogout();
  const { data: userData } = useUserProfile();

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close drawer when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    setDrawerOpen(false);
    logout();
  }, [logout]);

  const routes: NavRoute[] = [
    {
      name: 'Home',
      path: '/movies',
      icon: <Home className='mr-2 h-4 w-4' />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className='mr-2 h-4 w-4' />,
    },
  ];

  return (
    <>
      <div className='flex items-center justify-between w-full'>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden mr-2'
            onClick={toggleDrawer}
            aria-label='Toggle menu'
          >
            <Menu className='h-5 w-5' />
          </Button>
          <Link href='/movies' className='flex items-center space-x-2'>
            <Film className='h-6 w-6' />
            <span className='font-bold'>MovieRater</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center space-x-4'>
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                'flex items-center text-sm font-medium transition-colors hover:text-primary',
                pathname === route.path
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {route.icon}
              {route.name}
            </Link>
          ))}
          <Button
            variant='ghost'
            size='sm'
            onClick={logout}
            className='text-red-500'
          >
            <LogOut className='mr-2 h-4 w-4' />
            Logout
          </Button>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <DrawerHeader className='flex flex-row items-center justify-between'>
          <DrawerTitle>MovieRater</DrawerTitle>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setDrawerOpen(false)}
            className='md:hidden'
          >
            <X className='h-5 w-5' />
          </Button>
        </DrawerHeader>
        <DrawerContent>
          <div className='flex flex-col space-y-4'>
            {userData && (
              <div className='flex items-center space-x-4 mb-6 pb-6 border-b'>
                <Avatar>
                  <AvatarImage src={userData.image} alt={userData.name} />
                  <AvatarFallback>
                    {userData.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-medium'>{userData.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {userData.email}
                  </p>
                </div>
              </div>
            )}

            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  'flex items-center py-2 text-sm font-medium transition-colors hover:text-primary',
                  pathname === route.path
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {route.icon}
                {route.name}
              </Link>
            ))}

            <Button
              variant='ghost'
              className='justify-start text-red-500 px-0 hover:bg-transparent mt-4'
              onClick={handleLogout}
            >
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
