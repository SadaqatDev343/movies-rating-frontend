import axios from 'axios';

import {
  LoginCredentials,
  SignupData,
  UserResponse,
  MovieQueryParams,
  MoviesResponse,
  MovieRating,
  RecommendedMovie,
  CategoryResponse,
  LoginResponse,
} from '@/app/types/types';
import useAuthStore from '@/app/store/authStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearToken();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/user/login', credentials);
    return response.data;
  },
  signup: async (userData: SignupData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      '/user/signup',
      userData
    );
    return response.data;
  },
  getProfile: async (): Promise<UserResponse> => {
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await api.get<UserResponse>(`/user/whoami?t=${timestamp}`);
    return response.data;
  },
  updateProfile: async (
    userId: string,
    formData: FormData
  ): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(
      `/user/profile/${userId}`,
      formData
    );
    return response.data;
  },
};

export const moviesAPI = {
  getMovies: async ({
    page = 1,
    limit = 12,
    search = '',
  }: MovieQueryParams): Promise<MoviesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('q', search);
    }

    const response = await api.get<MoviesResponse>(`/movies?${params}`);
    return response.data;
  },
  rateMovie: async (
    movieId: string,
    rating: MovieRating
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/movies/${movieId}/rate`,
      rating
    );
    return response.data;
  },
  getRecommendations: async (userId: string): Promise<RecommendedMovie[]> => {
    const response = await api.get<RecommendedMovie[]>(
      `/recommendation/${userId}`
    );
    return response.data;
  },
};

export const categoriesAPI = {
  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await api.get<CategoryResponse[]>('/categories');
    return response.data;
  },
};
