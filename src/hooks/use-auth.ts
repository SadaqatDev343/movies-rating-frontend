'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';

import { useRouter } from 'next/navigation';
import {
  LoginCredentials,
  SignupData,
  UpdateProfileData,
  User,
  UserResponse,
} from '@/app/types/types';
import useAuthStore from '@/app/store/authStore';

export function useLogin() {
  const { setToken } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/movies');
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: (userData: SignupData) => authAPI.signup(userData),
    onSuccess: () => {
      alert('Sign up successful! Please log in.');
      router.push('/');
    },
  });
}

export function useUserProfile() {
  const { token } = useAuthStore();

  return useQuery<UserResponse, Error, User>({
    queryKey: ['user'],
    queryFn: authAPI.getProfile,
    select: (data: UserResponse) => {
      // Format the user data
      return {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        address: data.user.address,
        image:
          data.user.image && data.user.image.startsWith('http')
            ? `${data.user.image}?t=${new Date().getTime()}`
            : data.user.image
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${
                data.user.image
              }?t=${new Date().getTime()}`
            : '',
        dob: new Date(data.user.dob),
        categories: data.user.categories || [],
      };
    },
    enabled: !!token,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, formData }: UpdateProfileData) =>
      authAPI.updateProfile(userId, formData),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['user'] });

      queryClient.fetchQuery({ queryKey: ['user'] });
    },
  });
}

export function useLogout() {
  const { clearToken } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.clear();
    router.push('/');
  };
}
