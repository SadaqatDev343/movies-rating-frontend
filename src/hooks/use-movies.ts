'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { moviesAPI, categoriesAPI } from '@/lib/api';
import {
  MoviesResponse,
  RecommendedMovie,
  CategoryResponse,
  RateMovieData,
} from '@/app/types/types';

export function useMovies(search = '') {
  return useInfiniteQuery<MoviesResponse, Error>({
    queryKey: ['movies', search],
    queryFn: ({ pageParam = 1 }) =>
      moviesAPI.getMovies({ page: pageParam, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecommendations(userId: string) {
  return useQuery<RecommendedMovie[], Error>({
    queryKey: ['recommendations', userId],
    queryFn: () => moviesAPI.getRecommendations(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId, rating }: RateMovieData) =>
      moviesAPI.rateMovie(movieId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

export function useCategories() {
  return useQuery<CategoryResponse[], Error>({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
