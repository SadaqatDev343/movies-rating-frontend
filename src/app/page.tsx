'use client';

import type React from 'react';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { useLogin } from '@/hooks/use-auth';
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  // Handle form submission
  const handleLogin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      login.mutate(formData, {
        onSuccess: () => {
          // Smooth transition to movies page
          router.push('/movies');
        },
      });
    },
    [formData, login, router]
  );

  // Navigate to signup
  const navigateToSignup = useCallback(() => {
    router.push('/signup');
  }, [router]);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50'
      )}
    >
      <div className='flex items-center mb-6'>
        <Film className='h-10 w-10 text-primary mr-2' />
        <h1 className='text-3xl font-bold'>MovieRater</h1>
      </div>

      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {login.error && (
            <Alert variant='destructive' className='mb-4'>
              {login.error instanceof Error
                ? login.error.message
                : 'An error occurred during login'}
            </Alert>
          )}
          <form onSubmit={handleLogin}>
            <div className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='m@example.com'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={login.isPending}
                />
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>Password</Label>
                </div>
                <Input
                  id='password'
                  type='password'
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={login.isPending}
                />
              </div>
              <Button
                type='submit'
                className='w-full'
                disabled={login.isPending}
              >
                {login.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            <div className='mt-4 text-center text-sm'>
              Don&apos;t have an account?{' '}
              <button
                type='button'
                onClick={navigateToSignup}
                className='underline underline-offset-4'
                disabled={login.isPending}
              >
                Sign up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
