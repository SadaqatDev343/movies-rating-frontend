'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateInputProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function DateInput({ value, onChange, className }: DateInputProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [inputValue, setInputValue] = useState(format(value, 'yyyy-MM-dd'));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Try to parse the date
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onChange(date);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setInputValue(format(date, 'yyyy-MM-dd'));
      setShowCalendar(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className='flex'>
        <Input
          type='date'
          value={inputValue}
          onChange={handleInputChange}
          className='rounded-r-none'
        />
        <Button
          type='button'
          variant='outline'
          className='rounded-l-none border-l-0'
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CalendarIcon className='h-4 w-4' />
        </Button>
      </div>

      {showCalendar && (
        <div className='absolute right-0 z-50 mt-1 rounded-md border bg-background p-3 shadow-md'>
          <Calendar
            mode='single'
            selected={value}
            onSelect={handleCalendarSelect}
            initialFocus
          />
          <div className='mt-2 flex justify-end'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setShowCalendar(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
