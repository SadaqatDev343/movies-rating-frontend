'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Pencil, Save, User, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect, type OptionType } from '@/components/multi-select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useAuthStore from '../authStore';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryObject {
  _id: string;
  name: string;
  __v: number;
}

interface UserData {
  name: string;
  email: string;
  address: string;
  image: string;
  dob: Date;
  categories: CategoryObject[] | string[]; // Can be either objects or string IDs
}

interface Category {
  _id: string;
  name: string;
  __v: number;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserData, setTempUserData] = useState<UserData | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesData, setCategoriesData] = useState<OptionType[]>([]);

  const { token } = useAuthStore();

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setError('No authentication token found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3000/user/whoami', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('User data:', data);

        // Format the user data
        const formattedUserData: UserData = {
          name: data.user.name,
          email: data.user.email,
          address: data.user.address,
          image:
            data.user.image && data.user.image.startsWith('http')
              ? data.user.image
              : data.user.image
              ? `http://localhost:3000/${data.user.image}`
              : '',
          dob: new Date(data.user.dob),
          categories: data.user.categories || [],
        };

        setUserData(formattedUserData);
        setTempUserData(formattedUserData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch user data'
        );
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        console.log('Categories:', data);

        // Store the raw categories data
        setCategories(data);

        // Transform the API data to the format needed for the MultiSelect
        const formattedCategories = data.map((category: Category) => ({
          value: category._id,
          label: category.name,
        }));

        setCategoriesData(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Extract category IDs from userData.categories (which could be objects or strings)
  const getUserCategoryIds = (): string[] => {
    if (!userData?.categories || userData.categories.length === 0) return [];

    // Check if categories are objects or strings
    if (typeof userData.categories[0] === 'string') {
      return userData.categories as string[];
    } else {
      return (userData.categories as CategoryObject[]).map((cat) => cat._id);
    }
  };

  // Get selected categories with labels for the MultiSelect
  const selectedCategories = tempUserData?.categories
    ? categoriesData.filter((category) => {
        const categoryIds =
          typeof tempUserData.categories[0] === 'string'
            ? (tempUserData.categories as string[])
            : (tempUserData.categories as CategoryObject[]).map(
                (cat) => cat._id
              );

        return categoryIds.includes(category.value);
      })
    : [];

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setTempUserData(userData);
      setPreviewImage(null);
      setNewImage(null);
    } else {
      // Start editing
      setTempUserData(userData ? { ...userData } : null);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!tempUserData || !token) return;

    try {
      // Create form data if there's a new image
      const formData = new FormData();

      if (newImage) {
        formData.append('image', newImage);
      }

      // Add other user data
      formData.append('name', tempUserData.name);
      formData.append('email', tempUserData.email);
      formData.append('address', tempUserData.address);
      formData.append('dob', tempUserData.dob.toISOString());

      // Extract category IDs for saving
      const categoryIds =
        typeof tempUserData.categories[0] === 'string'
          ? (tempUserData.categories as string[])
          : (tempUserData.categories as CategoryObject[]).map((cat) => cat._id);

      categoryIds.forEach((category) => {
        formData.append('categories', category);
      });

      // Send update request to API
      const response = await fetch('http://localhost:3000/user/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      // Update the user data
      setUserData(tempUserData);
      setIsEditing(false);

      // Clear the preview image
      setPreviewImage(null);
      setNewImage(null);

      // Show success message
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (selectedOptions: OptionType[]) => {
    if (!tempUserData) return;

    setTempUserData({
      ...tempUserData,
      categories: selectedOptions.map((option) => option.value),
    });
  };

  // Display category names directly from the user data if they're objects
  const displayCategories = (): string => {
    if (!userData?.categories || userData.categories.length === 0) {
      return 'No categories selected';
    }

    // If categories are already objects with names, use those directly
    if (typeof userData.categories[0] !== 'string') {
      return (userData.categories as CategoryObject[])
        .map((cat) => cat.name)
        .join(', ');
    }

    // Otherwise, look up names from the categories list
    const categoryIds = userData.categories as string[];
    const categoryNames = categoryIds.map((id) => {
      const category = categories.find((cat) => cat._id === id);
      return category ? category.name : id;
    });

    return categoryNames.join(', ');
  };

  if (isLoading) {
    return (
      <div className='container mx-auto py-10'>
        <Card className='max-w-3xl mx-auto'>
          <CardHeader>
            <Skeleton className='h-8 w-1/3' />
            <Skeleton className='h-4 w-1/2' />
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex flex-col items-center space-y-4'>
              <Skeleton className='h-32 w-32 rounded-full' />
              <Skeleton className='h-6 w-1/4' />
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-4 w-1/4' />
                  <Skeleton className='h-10 w-full' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto py-10'>
        <Card className='max-w-3xl mx-auto'>
          <CardHeader>
            <CardTitle className='text-2xl'>Error</CardTitle>
            <CardDescription>
              There was a problem loading your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-md bg-destructive/10 p-4 text-destructive'>
              {error}
            </div>
            <Button className='mt-4' onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className='container mx-auto py-10'>
        <Card className='max-w-3xl mx-auto'>
          <CardHeader>
            <CardTitle className='text-2xl'>No User Data</CardTitle>
            <CardDescription>
              No user data was found. Please log in again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-10'>
      <Card className='max-w-3xl mx-auto'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div className='space-y-1'>
            <CardTitle className='text-2xl'>Profile</CardTitle>
            <CardDescription>
              View and manage your personal information
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? 'destructive' : 'default'}
            size='sm'
            onClick={handleEditToggle}
          >
            {isEditing ? (
              <>
                <X className='mr-2 h-4 w-4' /> Cancel
              </>
            ) : (
              <>
                <Pencil className='mr-2 h-4 w-4' /> Edit Profile
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='relative'>
              <Avatar className='h-32 w-32'>
                <AvatarImage
                  src={previewImage || tempUserData?.image}
                  alt={tempUserData?.name}
                />
                <AvatarFallback className='text-4xl'>
                  <User className='h-16 w-16' />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className='absolute -bottom-2 -right-2'>
                  <Label htmlFor='picture' className='cursor-pointer'>
                    <div className='rounded-full bg-primary p-2 text-primary-foreground shadow-sm'>
                      <Pencil className='h-4 w-4' />
                    </div>
                    <Input
                      id='picture'
                      type='file'
                      accept='image/*'
                      className='sr-only'
                      onChange={handleImageChange}
                    />
                  </Label>
                </div>
              )}
            </div>
            {!isEditing && (
              <div className='text-center'>
                <h2 className='text-xl font-bold'>{userData.name}</h2>
                <p className='text-muted-foreground'>{userData.email}</p>
              </div>
            )}
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Full Name</Label>
              {isEditing ? (
                <Input
                  id='name'
                  value={tempUserData?.name}
                  onChange={(e) =>
                    setTempUserData(
                      tempUserData
                        ? {
                            ...tempUserData,
                            name: e.target.value,
                          }
                        : null
                    )
                  }
                />
              ) : (
                <div className='rounded-md border border-input px-3 py-2'>
                  {userData.name}
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              {isEditing ? (
                <Input
                  id='email'
                  type='email'
                  value={tempUserData?.email}
                  onChange={(e) =>
                    setTempUserData(
                      tempUserData
                        ? {
                            ...tempUserData,
                            email: e.target.value,
                          }
                        : null
                    )
                  }
                />
              ) : (
                <div className='rounded-md border border-input px-3 py-2'>
                  {userData.email}
                </div>
              )}
            </div>

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='address'>Address</Label>
              {isEditing ? (
                <Textarea
                  id='address'
                  value={tempUserData?.address}
                  onChange={(e) =>
                    setTempUserData(
                      tempUserData
                        ? {
                            ...tempUserData,
                            address: e.target.value,
                          }
                        : null
                    )
                  }
                  rows={3}
                />
              ) : (
                <div className='rounded-md border border-input px-3 py-2 min-h-[80px]'>
                  {userData.address}
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dob'>Date of Birth</Label>
              {isEditing ? (
                <Input
                  id='dob'
                  type='date'
                  value={
                    tempUserData ? format(tempUserData.dob, 'yyyy-MM-dd') : ''
                  }
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime()) && tempUserData) {
                      setTempUserData({ ...tempUserData, dob: date });
                    }
                  }}
                />
              ) : (
                <div className='rounded-md border border-input px-3 py-2'>
                  {format(userData.dob, 'PPP')}
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='categories'>Interests/Categories</Label>
              {isEditing ? (
                <MultiSelect
                  options={categoriesData}
                  selected={selectedCategories}
                  onChange={handleCategoryChange}
                  placeholder='Select categories'
                />
              ) : (
                <div className='rounded-md border border-input px-3 py-2'>
                  {displayCategories()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter>
            <Button className='ml-auto' onClick={handleSave}>
              <Save className='mr-2 h-4 w-4' /> Save Changes
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
