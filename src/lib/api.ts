import axios from 'axios';
import useAuthStore from '@/app/authStore';

// Create an axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Add a request interceptor to include the auth token
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

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      useAuthStore.getState().clearToken();
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/user/login', credentials);
    return response.data;
  },
  signup: async (userData: any) => {
    const response = await api.post('/user/signup', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/user/whoami');
    return response.data;
  },
  updateProfile: async (userId: string, formData: FormData) => {
    const response = await api.put(`/user/profile/${userId}`, formData);
    return response.data;
  },
};

export const moviesAPI = {
  getMovies: async ({ page = 1, limit = 12, search = '' }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('q', search);
    }

    const response = await api.get(`/movies?${params}`);
    return response.data;
  },
  rateMovie: async (
    movieId: string,
    rating: { userId: string; rating: number }
  ) => {
    const response = await api.post(`/movies/${movieId}/rate`, rating);
    return response.data;
  },
  getRecommendations: async (userId: string) => {
    const response = await api.get(`/recommendation/${userId}`);
    return response.data;
  },
};

export const categoriesAPI = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};
