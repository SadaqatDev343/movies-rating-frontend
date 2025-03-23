'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

const Page = () => {
  const router = useRouter();
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  console.log('API Base URL:', BASE_URL);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    dob: '',
    categories: [] as string[],
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
      setDropdownOpen(false); // Close dropdown after selection
    }
  };

  // Handle category removal
  const handleCategoryRemove = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
  };

  // Handle form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting to sign up with:', {
        ...formData,
        categories: selectedCategories,
      });
      const response = await axios.post(`${BASE_URL}/user/signup`, {
        ...formData,
        categories: selectedCategories,
      });

      console.log('Sign Up Response:', response.data);

      if (response.data) {
        // Redirect to login page after successful signup
        alert('Sign up successful! Please log in.');
        router.push('/');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Sign Up Error:', error.response?.data || error.message);
      } else {
        console.error('Sign Up Error:', error);
      }
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Sign up failed. Please try again.'
          : 'Sign up failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : '';
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-6'>
      <Card className='w-full lg:w-96'>
        <CardHeader>
          <CardTitle className='text-2xl'>Sign Up</CardTitle>
          <CardDescription>
            Create your account by filling in the details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  type='text'
                  placeholder='John Doe'
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='m@example.com'
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='address'>Address</Label>
                <Input
                  id='address'
                  type='text'
                  placeholder='e.g. Islamabad'
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='dob'>Date of Birth</Label>
                <Input
                  id='dob'
                  type='date'
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='categories'>Select Categories</Label>

                {/* Custom dropdown */}
                <div className='relative'>
                  <button
                    type='button'
                    className='flex justify-between w-full p-2 border rounded items-center'
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span>Select categories</span>
                    <span>{dropdownOpen ? '▲' : '▼'}</span>
                  </button>

                  {dropdownOpen && (
                    <div className='absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto'>
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          className={`p-2 cursor-pointer hover:bg-gray-100 ${
                            selectedCategories.includes(category._id)
                              ? 'bg-gray-200'
                              : ''
                          }`}
                          onClick={() => handleCategorySelect(category._id)}
                        >
                          {category.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected categories */}
                {selectedCategories.length > 0 && (
                  <div className='mt-3'>
                    <Label>Selected Categories:</Label>
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {selectedCategories.map((categoryId) => (
                        <div
                          key={categoryId}
                          className='flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full'
                        >
                          {getCategoryName(categoryId)}
                          <button
                            type='button'
                            onClick={() => handleCategoryRemove(categoryId)}
                            className='w-4 h-4 rounded-full flex items-center justify-center hover:bg-gray-300'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && <div className='text-red-500 text-sm'>{error}</div>}

              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? 'Processing...' : 'Sign Up'}
              </Button>
            </div>
            <div className='mt-4 text-center text-sm'>
              Already have an account?{' '}
              <button
                type='button'
                onClick={() => router.push('/')}
                className='underline underline-offset-4'
              >
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
