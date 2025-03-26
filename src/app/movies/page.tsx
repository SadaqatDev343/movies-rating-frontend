'use client';

import React from 'react';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/hooks/use-auth';
import {
  useMovies,
  useRecommendations,
  useRateMovie,
  useCategories,
} from '@/hooks/use-movies';
import { useInView } from 'react-intersection-observer';
import { SiteHeader } from '@/components/site-header';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/main-layout';

// Types
interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseYear: number;
  categories: string[];
  averageRating: number;
  ratings: { userId: string; rating: number }[];
  poster?: string;
  userRating?: number;
}

interface RecommendedMovie {
  title: string;
  description: string;
  releaseYear: number;
  categories: string;
  averageRating: number;
}

// Movie Card Component
const MovieCard = React.memo(
  ({
    movie,
    onRate,
    getCategoryName,
  }: {
    movie: Movie;
    onRate: (id: string, rating: number) => void;
    getCategoryName: (categoryId: string) => string;
  }) => {
    // Display the first category for the badge
    const primaryCategory = useMemo(
      () =>
        movie.categories.length > 0
          ? getCategoryName(movie.categories[0])
          : 'Uncategorized',
      [movie.categories, getCategoryName]
    );

    return (
      <Card className='overflow-hidden transition-all hover:shadow-lg'>
        <div className='relative aspect-[2/3] w-full bg-gray-200'>
          {movie.poster && <div className='relative h-full w-full'></div>}
        </div>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-start justify-between'>
            <h3 className='font-semibold'>{movie.title}</h3>
            <span className='text-sm text-gray-500'>{movie.releaseYear}</span>
          </div>
          <div className='mb-3 flex items-center gap-1'>
            <Badge className='capitalize'>{primaryCategory}</Badge>
            <div className='ml-auto flex items-center gap-1'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='text-sm'>{movie.averageRating.toFixed(1)}</span>
            </div>
          </div>
          <p className='text-sm text-gray-600 line-clamp-2 mb-4'>
            {movie.description}
          </p>
          <div className='mt-4'>
            <p className='mb-1 text-sm text-gray-500'>Your Rating:</p>
            <div className='flex gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant='ghost'
                  size='icon'
                  className={`h-8 w-8 ${
                    (movie.userRating || 0) >= star
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  onClick={() => onRate(movie._id, star)}
                >
                  <Star
                    className={`h-5 w-5 ${
                      (movie.userRating || 0) >= star ? 'fill-yellow-400' : ''
                    }`}
                  />
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

MovieCard.displayName = 'MovieCard';

// Recommendation Card Component
const RecommendationCard = React.memo(
  ({ movie }: { movie: RecommendedMovie }) => {
    return (
      <Card className='overflow-hidden transition-all hover:shadow-lg border-l-4 border-l-blue-500'>
        <div className='relative aspect-[2/3] w-full bg-gray-200'>
          <div className='relative h-full w-full'></div>
        </div>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-start justify-between'>
            <h3 className='font-semibold'>{movie.title}</h3>
            <span className='text-sm text-gray-500'>{movie.releaseYear}</span>
          </div>
          <div className='mb-3 flex items-center gap-1'>
            <Badge className='capitalize'>{movie.categories}</Badge>
            <div className='ml-auto flex items-center gap-1'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='text-sm'>{movie.averageRating}</span>
            </div>
          </div>
          <p className='text-sm text-gray-600 line-clamp-2 mb-4'>
            {movie.description}
          </p>
          <div className='mt-4'>
            <Badge
              variant='outline'
              className='bg-blue-50 text-blue-700 border-blue-200'
            >
              Recommended for you
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }
);

RecommendationCard.displayName = 'RecommendationCard';

// Loading Skeleton Component
const MovieSkeleton = () => (
  <Card className='overflow-hidden'>
    <Skeleton className='aspect-[2/3] w-full' />
    <CardContent className='p-4'>
      <Skeleton className='h-4 w-3/4 mb-2' />
      <Skeleton className='h-4 w-1/4 mb-3' />
      <Skeleton className='h-4 w-full mb-2' />
      <div className='flex gap-1 mt-4'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-8 w-8 rounded-full' />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Error Message Component
const ErrorMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className='text-center py-8 bg-red-50 rounded-lg border border-red-100'>
    <p className='text-red-600'>{message}</p>
    {onRetry && (
      <Button className='mt-4' variant='outline' onClick={onRetry}>
        Try Again
      </Button>
    )}
  </div>
);

// Main Movies Page Component
export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [userRatedMovies, setUserRatedMovies] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');

  // Infinite scroll setup with react-intersection-observer
  const { ref, inView } = useInView();

  // Fetch user data
  const { data: userData } = useUserProfile();

  // Fetch categories
  const { data: categories = [] } = useCategories();

  // Fetch movies with infinite query
  const {
    data: moviesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useMovies(debouncedSearchQuery);

  // Fetch recommendations
  const {
    data: recommendations = [],
    isLoading: recommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useRecommendations(userData?._id || '');

  // Rate movie mutation
  const rateMovieMutation = useRateMovie();

  // Trigger next page load when bottom is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Memoize flattened movies from all pages
  const movies = useMemo(
    () =>
      moviesData?.pages.flatMap((page) =>
        page.movies.map((movie) => ({
          ...movie,
          userRating:
            movie.ratings.find((r) => r.userId === userData?._id)?.rating || 0,
          poster: movie.poster || '/placeholder.svg?height=400&width=300',
        }))
      ) || [],
    [moviesData, userData?._id]
  );

  // Update userRatedMovies array when movies change
  useEffect(() => {
    if (movies.length > 0) {
      const ratedMovieIds = movies
        .filter((movie) => movie.userRating > 0)
        .map((movie) => movie._id);

      setUserRatedMovies((prev) => [...new Set([...prev, ...ratedMovieIds])]);
    }
  }, [movies]);

  // Get category name by ID - memoized
  const getCategoryName = useCallback(
    (categoryId: string): string => {
      const category = categories.find((cat: any) => cat._id === categoryId);
      return category ? category.name : 'Unknown';
    },
    [categories]
  );

  // Handle user rating
  const handleRating = useCallback(
    async (movieId: string, rating: number) => {
      if (!userData?._id) {
        alert('You must be logged in to rate movies');
        return;
      }

      // Optimistically update UI
      if (!userRatedMovies.includes(movieId)) {
        setUserRatedMovies((prev) => [...prev, movieId]);
      }

      rateMovieMutation.mutate({
        movieId,
        rating: {
          userId: userData._id,
          rating,
        },
      });
    },
    [userData, userRatedMovies, rateMovieMutation]
  );

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  // Filter movies based on selected tab - memoized
  const filteredMovies = useMemo(
    () =>
      selectedTab === 'all'
        ? movies
        : movies.filter((movie) => movie.categories.includes(selectedTab)),
    [movies, selectedTab]
  );

  // Memoize rated movies
  const ratedMovies = useMemo(
    () =>
      movies
        .filter((movie) => userRatedMovies.includes(movie._id))
        .sort((a, b) => (b.userRating || 0) - (a.userRating || 0)),
    [movies, userRatedMovies]
  );

  // Handle errors
  if (moviesError) {
    return (
      <div className='min-h-screen'>
        <SiteHeader />
        <div className='container mx-auto px-4 py-8 text-center'>
          <h2 className='text-2xl font-bold text-red-600'>Error</h2>
          <p className='mt-4'>
            {moviesError instanceof Error
              ? moviesError.message
              : 'An error occurred loading movies'}
          </p>
          <Button className='mt-4' onClick={() => refetchMovies()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Header with search */}
      <header className='sticky top-0 z-30 w-full bg-background border-b'>
        <div className='flex h-16 items-center px-6'>
          <h1 className='text-xl font-bold'>Movies</h1>
          <div className='relative ml-auto w-full max-w-sm'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search movies...'
              className='pl-10'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        {/* Recommendations Section */}
        <section className='mb-12'>
          <div className='flex items-center mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Recommended For You
            </h2>
          </div>

          {recommendationsLoading ? (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {[...Array(4)].map((_, index) => (
                <MovieSkeleton key={index} />
              ))}
            </div>
          ) : recommendationsError ? (
            <ErrorMessage
              message={
                recommendationsError instanceof Error
                  ? recommendationsError.message
                  : 'Failed to load recommendations'
              }
              onRetry={() => refetchRecommendations()}
            />
          ) : (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {recommendations.length > 0 ? (
                recommendations.map((movie, index) => (
                  <RecommendationCard key={index} movie={movie} />
                ))
              ) : (
                <div className='col-span-full text-center py-8 bg-blue-50 rounded-lg border border-blue-100'>
                  <p className='text-gray-700'>
                    No recommendations available yet. Try rating more movies!
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Movies Collection Section */}
        <section>
          <h2 className='mb-6 text-2xl font-bold text-gray-900'>
            Movies Collection
          </h2>
          <Tabs
            defaultValue='all'
            value={selectedTab}
            onValueChange={handleTabChange}
          >
            <TabsList className='mb-6 flex flex-wrap'>
              <TabsTrigger key='all' value='all' className='capitalize'>
                All
              </TabsTrigger>
              {categories.map((category: any) => (
                <TabsTrigger
                  key={category._id}
                  value={category._id}
                  className='capitalize'
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedTab}>
              {moviesLoading && !filteredMovies.length ? (
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {[...Array(8)].map((_, index) => (
                    <MovieSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                    {filteredMovies.map((movie, index) => (
                      <MovieCard
                        key={movie._id}
                        movie={movie}
                        onRate={handleRating}
                        getCategoryName={getCategoryName}
                      />
                    ))}
                  </div>

                  {/* Loading indicator for next page */}
                  {isFetchingNextPage && (
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6'>
                      {[...Array(4)].map((_, index) => (
                        <MovieSkeleton key={`loading-more-${index}`} />
                      ))}
                    </div>
                  )}

                  {/* Intersection observer target */}
                  {hasNextPage && <div ref={ref} className='h-10 w-full' />}

                  {/* End of list message */}
                  {!moviesLoading &&
                    !isFetchingNextPage &&
                    filteredMovies.length > 0 &&
                    !hasNextPage && (
                      <div className='text-center mt-8 p-4 bg-gray-100 rounded-lg'>
                        <p className='text-gray-600'>No more movies to load</p>
                      </div>
                    )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </MainLayout>
  );
}
