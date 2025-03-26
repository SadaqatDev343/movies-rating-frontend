'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { moviesAPI, categoriesAPI } from '@/lib/api';

export function useMovies(search = '') {
  return useInfiniteQuery({
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
  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn: () => moviesAPI.getRecommendations(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      movieId,
      rating,
    }: {
      movieId: string;
      rating: { userId: string; rating: number };
    }) => moviesAPI.rateMovie(movieId, rating),
    onMutate: async ({ movieId, rating }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['movies'] });

      // Snapshot the previous value
      const previousMovies = queryClient.getQueryData(['movies']);

      // Optimistically update to the new value
      queryClient.setQueryData(['movies'], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            movies: page.movies.map((movie: any) =>
              movie._id === movieId
                ? {
                    ...movie,
                    userRating: rating.rating,
                    ratings: [
                      ...movie.ratings.filter(
                        (r: any) => r.userId !== rating.userId
                      ),
                      rating,
                    ],
                  }
                : movie
            ),
          })),
        };
      });

      return { previousMovies };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMovies) {
        queryClient.setQueryData(['movies'], context.previousMovies);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync with server
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
