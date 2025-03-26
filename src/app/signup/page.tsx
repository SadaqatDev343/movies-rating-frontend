'use client';

import type React from 'react';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { X, Film } from 'lucide-react';
import { useSignup } from '@/hooks/use-auth';
import { useCategories } from '@/hooks/use-movies';
import { Alert } from '@/components/ui/alert';

interface FormData {
  name: string;
  email: string;
  password: string;
  address: string;
  dob: string;
}

interface CategoryItem {
  _id: string;
  name: string;
}

interface FormErrors {
  [key: string]: string;
}

// Category Item Component
const CategoryItem = ({
  category,
  isSelected,
  onSelect,
  onRemove,
}: {
  category: CategoryItem;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) => {
  if (isSelected) {
    return (
      <div className='flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full'>
        {category.name}
        <button
          type='button'
          onClick={onRemove}
          className='w-4 h-4 rounded-full flex items-center justify-center hover:bg-gray-300'
        >
          <X className='w-3 h-3' />
        </button>
      </div>
    );
  }

  return (
    <div className='p-2 cursor-pointer hover:bg-gray-100' onClick={onSelect}>
      {category.name}
    </div>
  );
};

export default function SignupPage() {
  const router = useRouter();
  const signup = useSignup();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    address: '',
    dob: '',
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));

      // Clear error when field is edited
      if (formErrors[id]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    },
    [formErrors]
  );

  // Handle category selection
  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      if (!selectedCategories.includes(categoryId)) {
        setSelectedCategories((prev) => [...prev, categoryId]);
        setDropdownOpen(false); // Close dropdown after selection
      }
    },
    [selectedCategories]
  );

  // Handle category removal
  const handleCategoryRemove = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    }

    if (selectedCategories.length === 0) {
      errors.categories = 'Please select at least one category';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, selectedCategories]);

  // Handle form submission
  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      signup.mutate(
        {
          ...formData,
          categories: selectedCategories,
        },
        {
          onSuccess: () => {
            // Smooth transition to login page
            router.push('/');
          },
        }
      );
    },
    [formData, selectedCategories, signup, validateForm, router]
  );

  // Navigate to login
  const navigateToLogin = useCallback(() => {
    router.push('/');
  }, [router]);

  // Get category name by ID - memoized
  const getCategoryName = useCallback(
    (categoryId: string) => {
      const category = categories.find((cat: any) => cat._id === categoryId);
      return category ? category.name : '';
    },
    [categories]
  );

  // Filter available categories - memoized
  const availableCategories = useMemo(
    () =>
      categories.filter((cat: any) => !selectedCategories.includes(cat._id)),
    [categories, selectedCategories]
  );

  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50'>
      <div className='flex items-center mb-6'>
        <Film className='h-10 w-10 text-primary mr-2' />
        <h1 className='text-3xl font-bold'>MovieRater</h1>
      </div>

      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl'>Sign Up</CardTitle>
          <CardDescription>
            Create your account by filling in the details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signup.error && (
            <Alert variant='destructive' className='mb-4'>
              {signup.error instanceof Error
                ? signup.error.message
                : 'Sign up failed. Please try again.'}
            </Alert>
          )}

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
                  disabled={signup.isPending}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className='text-red-500 text-xs mt-1'>{formErrors.name}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='m@example.com'
                  value={formData.email}
                  onChange={handleChange}
                  disabled={signup.isPending}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && (
                  <p className='text-red-500 text-xs mt-1'>
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  value={formData.password}
                  onChange={handleChange}
                  disabled={signup.isPending}
                  className={formErrors.password ? 'border-red-500' : ''}
                />
                {formErrors.password && (
                  <p className='text-red-500 text-xs mt-1'>
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='address'>Address</Label>
                <Input
                  id='address'
                  type='text'
                  placeholder='e.g. Islamabad'
                  value={formData.address}
                  onChange={handleChange}
                  disabled={signup.isPending}
                  className={formErrors.address ? 'border-red-500' : ''}
                />
                {formErrors.address && (
                  <p className='text-red-500 text-xs mt-1'>
                    {formErrors.address}
                  </p>
                )}
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='dob'>Date of Birth</Label>
                <Input
                  id='dob'
                  type='date'
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={signup.isPending}
                  className={formErrors.dob ? 'border-red-500' : ''}
                />
                {formErrors.dob && (
                  <p className='text-red-500 text-xs mt-1'>{formErrors.dob}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='categories'>Select Categories</Label>

                {/* Custom dropdown */}
                <div className='relative'>
                  <button
                    type='button'
                    className={`flex justify-between w-full p-2 border rounded items-center ${
                      formErrors.categories ? 'border-red-500' : ''
                    }`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    disabled={signup.isPending}
                  >
                    <span>Select categories</span>
                    <span>{dropdownOpen ? '▲' : '▼'}</span>
                  </button>

                  {dropdownOpen && (
                    <div className='absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto'>
                      {categoriesLoading ? (
                        <div className='p-2'>Loading categories...</div>
                      ) : availableCategories.length > 0 ? (
                        availableCategories.map((category: any) => (
                          <CategoryItem
                            key={category._id}
                            category={category}
                            isSelected={false}
                            onSelect={() => handleCategorySelect(category._id)}
                            onRemove={() => {}} // Not used for unselected items
                          />
                        ))
                      ) : (
                        <div className='p-2 text-gray-500'>
                          No more categories available
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {formErrors.categories && (
                  <p className='text-red-500 text-xs mt-1'>
                    {formErrors.categories}
                  </p>
                )}

                {/* Selected categories */}
                {selectedCategories.length > 0 && (
                  <div className='mt-3'>
                    <Label>Selected Categories:</Label>
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {selectedCategories.map((categoryId) => (
                        <CategoryItem
                          key={categoryId}
                          category={{
                            _id: categoryId,
                            name: getCategoryName(categoryId),
                          }}
                          isSelected={true}
                          onSelect={() => {}} // Not used for selected items
                          onRemove={() => handleCategoryRemove(categoryId)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type='submit'
                className='w-full'
                disabled={signup.isPending}
              >
                {signup.isPending ? 'Processing...' : 'Sign Up'}
              </Button>
            </div>
            <div className='mt-4 text-center text-sm'>
              Already have an account?{' '}
              <button
                type='button'
                onClick={navigateToLogin}
                className='underline underline-offset-4'
                disabled={signup.isPending}
              >
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
