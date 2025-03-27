'use client';

import type React from 'react';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Pencil, Save, User, X, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { OptionType } from '@/components/multi-select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile, useUpdateProfile } from '@/hooks/use-auth';
import { useCategories } from '@/hooks/use-movies';
import { MainLayout } from '@/components/main-layout';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

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
  handleSave,
  handleCancel,
  isUpdating,
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
  handleSave: () => void;
  handleCancel: () => void;
  isUpdating: boolean;
}) => {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };

    if (categoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryOpen]);

  // Add keyboard event listener to close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && categoryOpen) {
        setCategoryOpen(false);
      }
    };

    if (categoryOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [categoryOpen]);

  // Function to toggle category selection
  const toggleCategory = (category: OptionType, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const isSelected = selectedCategories.some(
      (item) => item.value === category.value
    );
    let newSelected = [...selectedCategories];

    if (isSelected) {
      newSelected = newSelected.filter((item) => item.value !== category.value);
    } else {
      newSelected.push(category);
    }

    handleCategoryChange(newSelected);
  };

  return (
    <div className='space-y-6'>
      {/* Avatar Section */}
      <div className='flex flex-col items-center space-y-4'>
        <div className='relative'>
          <Avatar className='h-24 w-24 md:h-32 md:w-32'>
            <AvatarImage
              src={
                previewImage ||
                (tempUserData?.image && tempUserData.image !== ''
                  ? tempUserData.image
                  : null) ||
                (userData.image && userData.image !== ''
                  ? userData.image
                  : null)
              }
              alt={tempUserData?.name || userData.name || 'User'}
            />
            <AvatarFallback className='text-4xl'>
              <User className='h-12 w-12 md:h-16 md:w-16' />
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
                tempUserData && tempUserData.dob
                  ? tempUserData.dob instanceof Date
                    ? format(tempUserData.dob, 'yyyy-MM-dd')
                    : format(new Date(tempUserData.dob), 'yyyy-MM-dd')
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
              {userData.dob
                ? userData.dob instanceof Date
                  ? format(userData.dob, 'PPP')
                  : format(new Date(userData.dob), 'PPP')
                : 'Not set'}
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='categories'>Interests/Categories</Label>
          {isEditing ? (
            <div className='space-y-2'>
              <div className='relative'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className='w-full justify-between'
                  ref={buttonRef}
                >
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} selected`
                    : 'Select categories...'}
                  <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>

                {categoryOpen && (
                  <div
                    className='absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-md'
                    ref={dropdownRef}
                  >
                    <div className='max-h-60 overflow-auto p-1'>
                      {categoriesData.map((category) => (
                        <div
                          key={category.value}
                          className='flex items-center px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer'
                          onClick={(e) => toggleCategory(category, e)}
                        >
                          <div
                            className={`mr-2 h-4 w-4 rounded-sm border flex items-center justify-center ${
                              selectedCategories.some(
                                (item) => item.value === category.value
                              )
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-input'
                            }`}
                          >
                            {selectedCategories.some(
                              (item) => item.value === category.value
                            ) && <Check className='h-3 w-3' />}
                          </div>
                          <span>{category.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedCategories.length > 0 && (
                <div className='flex flex-wrap gap-1 mt-2'>
                  {selectedCategories.map((category) => (
                    <Badge
                      key={category.value}
                      variant='secondary'
                      className='px-2 py-1 mb-1'
                    >
                      {category.label}
                      <button
                        type='button'
                        className='ml-1 rounded-full outline-none focus:ring-2'
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category);
                        }}
                      >
                        <X className='h-3 w-3' />
                        <span className='sr-only'>Remove {category.label}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className='rounded-md border border-input px-3 py-2'>
              {displayCategories()}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4'>
          <Button
            variant='outline'
            onClick={handleCancel}
            disabled={isUpdating}
            className='w-full sm:w-auto'
          >
            <X className='mr-2 h-4 w-4' /> Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className='w-full sm:w-auto'
          >
            {isUpdating ? (
              <>Saving...</>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' /> Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// Loading Skeleton Component
const ProfileSkeleton = () => (
  <div className='space-y-6'>
    <div className='flex flex-col items-center space-y-4'>
      <Skeleton className='h-24 w-24 md:h-32 md:w-32 rounded-full' />
      <Skeleton className='h-6 w-1/2 md:w-1/4' />
    </div>
    <div className='grid gap-4 md:grid-cols-2'>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className='space-y-2'>
          <Skeleton className='h-4 w-1/3 md:w-1/4' />
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
  const queryClient = useQueryClient();
  const { data: userData, isLoading, error, refetch } = useUserProfile();
  const { data: categories = [] } = useCategories();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [tempUserData, setTempUserData] = useState<any>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Set initial temp data when user data loads
  useEffect(() => {
    if (userData && !tempUserData) {
      // Create a deep copy and ensure dob is a Date object
      const userDataCopy = { ...userData };
      if (userDataCopy.dob && typeof userDataCopy.dob === 'string') {
        userDataCopy.dob = new Date(userDataCopy.dob);
      }
      setTempUserData(userDataCopy);
    }
  }, [userData, tempUserData]);

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
  const selectedCategories = useMemo(() => {
    if (!tempUserData?.categories) return [];

    const categoryIds =
      typeof tempUserData.categories[0] === 'string'
        ? tempUserData.categories
        : tempUserData.categories.map((cat: any) => cat._id);

    return categoriesData.filter((category: OptionType) =>
      categoryIds.includes(category.value)
    );
  }, [tempUserData?.categories, categoriesData]);

  // Handle edit toggle
  const handleEditToggle = useCallback(() => {
    if (!isEditing && userData) {
      // Start editing - make a deep copy to avoid reference issues
      const userDataCopy = JSON.parse(JSON.stringify(userData));
      // Ensure dob is a Date object after JSON parsing
      if (userDataCopy.dob) {
        userDataCopy.dob = new Date(userDataCopy.dob);
      }
      setTempUserData(userDataCopy);
      setIsEditing(true);
    }
  }, [isEditing, userData]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setTempUserData(userData ? { ...userData } : null);
    setPreviewImage(null);
    setNewImage(null);
    setIsEditing(false);
  }, [userData]);

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

    // Ensure dob is properly handled as a Date
    let dobValue = tempUserData.dob;
    if (typeof dobValue === 'string') {
      dobValue = new Date(dobValue);
    }
    formData.append(
      'dob',
      dobValue instanceof Date ? dobValue.toISOString() : dobValue
    );

    // Extract category IDs for saving
    const categoryIds =
      typeof tempUserData.categories[0] === 'string'
        ? tempUserData.categories
        : tempUserData.categories.map((cat: any) => cat.value || cat._id);

    // Clear any existing categories to avoid duplicates
    categoryIds.forEach((category: string) => {
      formData.append('categories', category);
    });

    // Store current state for optimistic update
    const previousUserData = userData;
    const optimisticUserData = {
      ...tempUserData,
      image: previewImage || tempUserData.image,
    };

    // Optimistically update UI
    queryClient.setQueryData(['user'], {
      user: optimisticUserData,
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
          toast({
            title: 'Profile Updated',
            description: 'Your profile has been updated successfully',
          });
          // Force refetch to update the UI with the latest data
          refetch();
        },
        onError: (error) => {
          // Revert to previous state on error
          queryClient.setQueryData(['user'], {
            user: previousUserData,
          });

          toast({
            title: 'Update Failed',
            description:
              error instanceof Error
                ? error.message
                : 'Failed to update profile',
            variant: 'destructive',
          });
        },
      }
    );
  }, [
    tempUserData,
    newImage,
    updateProfile,
    refetch,
    previewImage,
    userData,
    queryClient,
  ]);

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
        <div className='flex h-16 items-center justify-between px-4 md:px-6'>
          <h1 className='text-xl font-bold'>Profile</h1>
          {!isEditing && userData && (
            <Button
              onClick={handleEditToggle}
              disabled={isLoading || updateProfile.isPending}
            >
              <Pencil className='mr-2 h-4 w-4' /> Edit Profile
            </Button>
          )}
        </div>
      </header>

      <div className='container py-4 md:py-6 px-4 md:px-6'>
        <div className='bg-white rounded-lg shadow-md p-4 md:p-6'>
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
              handleSave={handleSave}
              handleCancel={handleCancel}
              isUpdating={updateProfile.isPending}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
