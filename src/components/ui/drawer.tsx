'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const drawerVariants = cva(
  'fixed inset-y-0 z-50 flex flex-col bg-background shadow-lg transition-transform duration-300 ease-in-out',
  {
    variants: {
      side: {
        left: 'left-0 border-r',
        right: 'right-0 border-l',
      },
      size: {
        sm: 'w-64',
        default: 'w-80',
        lg: 'w-96',
        full: 'w-screen',
      },
    },
    defaultVariants: {
      side: 'left',
      size: 'default',
    },
  }
);

export interface DrawerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof drawerVariants> {
  open?: boolean;
  onClose?: () => void;
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, children, side, size, open, onClose, ...props }, ref) => {
    // Close drawer when pressing Escape key
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open && onClose) {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    // Prevent body scroll when drawer is open
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [open]);

    return (
      <>
        {/* Backdrop */}
        {open && (
          <div
            className='fixed inset-0 z-40 bg-black/50 transition-opacity'
            onClick={onClose}
            aria-hidden='true'
          />
        )}

        {/* Drawer */}
        <div
          className={cn(
            drawerVariants({ side, size }),
            open
              ? 'translate-x-0'
              : side === 'left'
              ? '-translate-x-full'
              : 'translate-x-full',
            className
          )}
          ref={ref}
          role='dialog'
          aria-modal='true'
          {...props}
        >
          {onClose && (
            <button
              onClick={onClose}
              className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              aria-label='Close'
            >
              <X className='h-5 w-5' />
              <span className='sr-only'>Close</span>
            </button>
          )}
          {children}
        </div>
      </>
    );
  }
);
Drawer.displayName = 'Drawer';

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
DrawerHeader.displayName = 'DrawerHeader';

const DrawerTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = 'DrawerTitle';

const DrawerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-auto p-6', className)}
    {...props}
  />
));
DrawerContent.displayName = 'DrawerContent';

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-2 p-6 pt-0', className)}
    {...props}
  />
));
DrawerFooter.displayName = 'DrawerFooter';

export { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter };
