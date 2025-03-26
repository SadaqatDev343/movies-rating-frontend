'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import useAuthStore from '@/app/authStore';
import { useRouter } from 'next/navigation';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  address: string;
  dob: string;
  categories: string[];
}

interface UpdateProfileData {
  userId: string;
  formData: FormData;
}

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

  return useQuery({
    queryKey: ['user'],
    queryFn: authAPI.getProfile,
    select: (data) => {
      // Format the user data
      return {
        _id: data.user._id,
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
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, formData }: UpdateProfileData) =>
      authAPI.updateProfile(userId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
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
