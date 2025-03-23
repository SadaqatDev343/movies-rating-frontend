'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Toggle selection of an option
  const toggleOption = (option: Option) => {
    const isSelected = selected.some((item) => item.value === option.value);

    if (isSelected) {
      onChange(selected.filter((item) => item.value !== option.value));
    } else {
      onChange([...selected, option]);
    }
  };

  // Remove a selected option
  const removeOption = (option: Option, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the dropdown
    onChange(selected.filter((item) => item.value !== option.value));
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Trigger button */}
      <div
        className={cn(
          'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer',
          className
        )}
        onClick={() => setOpen(!open)}
      >
        <div className='flex flex-wrap gap-1'>
          {selected.length > 0 ? (
            selected.map((option) => (
              <Badge
                key={option.value}
                variant='secondary'
                className='rounded-sm px-1 font-normal'
              >
                {option.label}
                <button
                  type='button'
                  className='ml-1 rounded-full outline-none hover:bg-muted'
                  onClick={(e) => removeOption(option, e)}
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className='h-4 w-4 opacity-50' />
      </div>

      {/* Dropdown */}
      {open && (
        <div className='absolute z-10 mt-1 w-full rounded-md border border-input bg-background shadow-md'>
          <div className='max-h-60 overflow-y-auto p-1'>
            {options.map((option) => {
              const isSelected = selected.some(
                (item) => item.value === option.value
              );
              return (
                <div
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent',
                    isSelected && 'bg-accent'
                  )}
                  onClick={() => toggleOption(option)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className='h-4 w-4' />}
                </div>
              );
            })}
            {options.length === 0 && (
              <div className='py-6 text-center text-sm text-muted-foreground'>
                No options available
              </div>
            )}
          </div>
          <div className='border-t p-1'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='w-full text-xs'
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
