'use client';

import type React from 'react';

import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Pencil, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect, type OptionType } from '@/components/multi-select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile, useUpdateProfile } from '@/hooks/use-auth';
import { useCategories } from '@/hooks/use-movies';
import { MainLayout } from '@/components/main-layout';

// Profile Form Component
const ProfileForm = ({
  userData,
  tempUserData,
  setTempUserData,
  isEditing,
  categoriesData,
  selectedCategories,
  handleCategoryChange,
  previewImage,
  handleImageChange,
  displayCategories,
}: {
  userData: any;
  tempUserData: any;
  setTempUserData: (data: any) => void;
  isEditing: boolean;
  categoriesData: OptionType[];
  selectedCategories: OptionType[];
  handleCategoryChange: (selected: OptionType[]) => void;
  previewImage: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayCategories: () => string;
}) => {
  return (
    <div className='space-y-6'>
      {/* Avatar Section */}
      <div className='flex flex-col items-center space-y-4'>
        <div className='relative'>
          <Avatar className='h-32 w-32'>
            <AvatarImage
              src={previewImage || tempUserData?.image || userData.image}
              alt={tempUserData?.name || userData.name}
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

      {/* Form Fields */}
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Full Name</Label>
          {isEditing ? (
            <Input
              id='name'
              value={tempUserData?.name}
              onChange={(e) =>
                setTempUserData({
                  ...tempUserData,
                  name: e.target.value,
                })
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
                setTempUserData({
                  ...tempUserData,
                  email: e.target.value,
                })
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
                setTempUserData({
                  ...tempUserData,
                  address: e.target.value,
                })
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
                tempUserData
                  ? format(new Date(tempUserData.dob), 'yyyy-MM-dd')
                  : ''
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
              {format(new Date(userData.dob), 'PPP')}
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
    </div>
  );
};

// Loading Skeleton Component
const ProfileSkeleton = () => (
  <div className='space-y-6'>
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
  </div>
);

// Error Component
const ProfileError = ({
  error,
  onRetry,
}: {
  error: any;
  onRetry: () => void;
}) => (
  <div>
    <CardTitle className='text-2xl'>Error</CardTitle>
    <CardDescription>There was a problem loading your profile</CardDescription>
    <div className='rounded-md bg-destructive/10 p-4 text-destructive mt-4'>
      {error instanceof Error ? error.message : 'An unknown error occurred'}
    </div>
    <Button className='mt-4' onClick={onRetry}>
      Try Again
    </Button>
  </div>
);

// Main Profile Page Component
export default function ProfilePage() {
  const { data: userData, isLoading, error, refetch } = useUserProfile();
  const { data: categories = [] } = useCategories();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [tempUserData, setTempUserData] = useState<any>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Transform categories for MultiSelect - memoized
  const categoriesData = useMemo(
    () =>
      categories.map((category: any) => ({
        value: category._id,
        label: category.name,
      })),
    [categories]
  );

  // Get selected categories with labels for the MultiSelect - memoized
  const selectedCategories = useMemo(
    () =>
      tempUserData?.categories
        ? categoriesData.filter((category: OptionType) => {
            const categoryIds =
              typeof tempUserData.categories[0] === 'string'
                ? tempUserData.categories
                : tempUserData.categories.map((cat: any) => cat._id);

            return categoryIds.includes(category.value);
          })
        : [],
    [tempUserData?.categories, categoriesData]
  );

  // Handle edit toggle
  const handleEditToggle = useCallback(() => {
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
  }, [isEditing, userData]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!tempUserData || !tempUserData._id) return;

    // Create form data
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
        ? tempUserData.categories
        : tempUserData.categories.map((cat: any) => cat._id);

    categoryIds.forEach((category: string) => {
      formData.append('categories', category);
    });

    updateProfile.mutate(
      {
        userId: tempUserData._id,
        formData,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setPreviewImage(null);
          setNewImage(null);
        },
      }
    );
  }, [tempUserData, newImage, updateProfile]);

  // Handle image change
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    []
  );

  // Handle category change
  const handleCategoryChange = useCallback(
    (selectedOptions: OptionType[]) => {
      if (!tempUserData) return;

      setTempUserData({
        ...tempUserData,
        categories: selectedOptions.map((option) => option.value),
      });
    },
    [tempUserData]
  );

  // Display category names - memoized
  const displayCategories = useCallback(() => {
    if (!userData?.categories || userData.categories.length === 0) {
      return 'No categories selected';
    }

    // If categories are already objects with names, use those directly
    if (typeof userData.categories[0] !== 'string') {
      return (userData.categories as any[]).map((cat) => cat.name).join(', ');
    }

    // Otherwise, look up names from the categories list
    const categoryIds = userData.categories as string[];
    const categoryNames = categoryIds.map((id) => {
      const category = categories.find((cat: any) => cat._id === id);
      return category ? category.name : id;
    });

    return categoryNames.join(', ');
  }, [userData?.categories, categories]);

  return (
    <MainLayout>
      <header className='sticky top-0 z-30 w-full bg-background border-b'>
        <div className='flex h-16 items-center px-6'>
          <h1 className='text-xl font-bold'>Profile</h1>
        </div>
      </header>

      <div className='container py-6 px-6'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          {isLoading ? (
            <ProfileSkeleton />
          ) : error ? (
            <ProfileError error={error} onRetry={() => refetch()} />
          ) : !userData ? (
            <div>
              <CardTitle className='text-2xl'>No User Data</CardTitle>
              <CardDescription>
                No user data was found. Please log in again.
              </CardDescription>
            </div>
          ) : (
            <>
              <h2 className='text-xl font-semibold mb-4'>User Profile</h2>
              <ProfileForm
                userData={userData}
                tempUserData={tempUserData || userData}
                setTempUserData={setTempUserData}
                isEditing={isEditing}
                categoriesData={categoriesData}
                selectedCategories={selectedCategories}
                handleCategoryChange={handleCategoryChange}
                previewImage={previewImage}
                handleImageChange={handleImageChange}
                displayCategories={displayCategories}
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
