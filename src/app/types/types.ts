import type React from 'react';

export interface User {
  _id: string;
  name: string;
  email: string;
  address: string;
  image: string;
  dob: Date;
  categories: string[] | Category[];
}

export interface UserResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    address: string;
    image: string;
    dob: string;
    categories: string[] | CategoryResponse[];
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  address: string;
  dob: string;
  categories: string[];
}

export interface UpdateProfileData {
  userId: string;
  formData: FormData;
}

export interface Category {
  _id: string;
  name: string;
}

export interface CategoryResponse {
  _id: string;
  name: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseYear: number;
  categories: string[];
  averageRating: number;
  ratings: MovieRating[];
  poster?: string;
  userRating?: number;
}

export interface MovieRating {
  userId: string;
  rating: number;
}

export interface RecommendedMovie {
  title: string;
  description: string;
  releaseYear: number;
  categories: string;
  averageRating: number;
}

export interface MoviesResponse {
  movies: Movie[];
  currentPage: number;
  totalPages: number;
  totalMovies: number;
}

export interface MovieQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface RateMovieData {
  movieId: string;
  rating: {
    userId: string;
    rating: number;
  };
}

export interface ProfileFormProps {
  userData: User;
  tempUserData: User;
  setTempUserData: (data: User) => void;
  isEditing: boolean;
  categoriesData: CategoryOption[];
  selectedCategories: CategoryOption[];
  handleCategoryChange: (selected: CategoryOption[]) => void;
  previewImage: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayCategories: () => string;
  handleSave: () => void;
  handleCancel: () => void;
  isUpdating: boolean;
}

export interface ProfileErrorProps {
  error: unknown;
  onRetry: () => void;
}

export interface MovieCardProps {
  movie: Movie;
  onRate: (id: string, rating: number) => void;
  getCategoryName: (categoryId: string) => string;
  userId: string | undefined;
}

export interface RecommendationCardProps {
  movie: RecommendedMovie;
}

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export interface MainLayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  className?: string;
}

export interface NavRoute {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export interface SiteHeaderProps {
  children?: React.ReactNode;
}
