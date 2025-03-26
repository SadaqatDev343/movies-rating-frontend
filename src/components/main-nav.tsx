'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Home, LogOut, Menu, User } from 'lucide-react';

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

export function MainNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const logout = useLogout();
  const { data: userData } = useUserProfile();

  const routes = [
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
      <div className='flex items-center'>
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden'
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Toggle menu</span>
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
              pathname === route.path ? 'text-primary' : 'text-muted-foreground'
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

      {/* Mobile Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <DrawerHeader>
          <DrawerTitle>MovieRater</DrawerTitle>
        </DrawerHeader>
        <DrawerContent>
          <div className='flex flex-col space-y-4'>
            {userData && (
              <div className='flex items-center space-x-4 mb-6 pb-6 border-b'>
                <Avatar>
                  <AvatarImage src={userData.image} />
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
                onClick={() => setDrawerOpen(false)}
              >
                {route.icon}
                {route.name}
              </Link>
            ))}

            <Button
              variant='ghost'
              className='justify-start text-red-500 px-0 hover:bg-transparent'
              onClick={() => {
                setDrawerOpen(false);
                logout();
              }}
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
