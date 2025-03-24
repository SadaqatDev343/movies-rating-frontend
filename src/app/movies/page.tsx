'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge, Search, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { create } from 'zustand';
import useAuthStore from '../authStore';

interface Category {
  _id: string;
  name: string;
  __v: number;
}

interface Rating {
  userId: string;
  rating: number;
}

interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseYear: number;
  categories: string[];
  averageRating: number;
  ratings: Rating[];
  poster?: string;
  userRating?: number;
}

// New interface for API recommendations
interface RecommendedMovie {
  title: string;
  description: string;
  releaseYear: number;
  categories: string;
  averageRating: number;
}
interface UserData {
  _id: string;
  name: string;
  email: string;
  address: string;
  image: string;
  dob: Date;
  categories: CategoryObject[] | string[]; // Can be either objects or string IDs
}
interface MovieResponse {
  movies: Movie[];
  total: number;
  page: number;
  limit: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userRatedMovies, setUserRatedMovies] = useState<string[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [apiRecommendations, setApiRecommendations] = useState<
    RecommendedMovie[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendationsError, setRecommendationsError] = useState<
    string | null
  >(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalMovies, setTotalMovies] = useState(0);
  const [selectedTab, setSelectedTab] = useState('all');
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/user/whoami', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('User data:', data);

        // Format the user data
        const formattedUserData: UserData = {
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
        setUserData(formattedUserData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch user data'
        );
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);
  // Fetch recommendations from API
  const fetchRecommendations = async () => {
    if (userData?._id) {
      console.log('userid-------------------------', userData?._id);
    }

    try {
      setRecommendationsLoading(true);
      setRecommendationsError(null);

      const response = await fetch(
        `http://localhost:3000/recommendation/${userData?._id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data: RecommendedMovie[] = await response.json();

      console.log('Recommended Movies:', data); // ✅ Logs actual data

      setApiRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendationsError(
        err instanceof Error ? err.message : 'Failed to load recommendations'
      );
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Fetch movies from API
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) {
        queryParams.append('q', searchQuery);
      }

      const response = await fetch(
        `http://localhost:3000/movies?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data: MovieResponse = await response.json();

      // Add userRating property to each movie
      const moviesWithUserRating = data.movies.map((movie) => {
        // Find if user has already rated this movie
        const userRating =
          movie.ratings.find((r) => r.userId === userData?._id)?.rating || 0;

        return {
          ...movie,
          userRating,
          poster: movie.poster || '/placeholder.svg?height=400&width=300',
        };
      });

      // Update userRatedMovies array
      const ratedMovieIds = moviesWithUserRating
        .filter((movie) => movie.userRating > 0)
        .map((movie) => movie._id);

      setUserRatedMovies(ratedMovieIds);
      setMovies(moviesWithUserRating);
      setTotalMovies(data.total);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchMovies(), fetchRecommendations()]);
    };

    loadInitialData();
  }, [userData?._id]);

  // Handle pagination and search changes
  useEffect(() => {
    fetchMovies();
  }, [searchQuery, page, limit]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/categories');

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Handle user rating
  const handleRating = async (movieId: string, rating: number) => {
    if (!userData?._id) {
      setError('You must be logged in to rate movies');
      return;
    }

    try {
      // Optimistically update UI first for better user experience
      setMovies(
        movies.map((movie) => {
          if (movie._id === movieId) {
            if (!userRatedMovies.includes(movieId)) {
              setUserRatedMovies([...userRatedMovies, movieId]);
            }
            return { ...movie, userRating: rating };
          }
          return movie;
        })
      );

      // Call API to save rating
      const response = await fetch(
        `http://localhost:3000/movies/${movieId}/rate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            userId: userData?._id,
            rating,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to rate movie');
      }

      // After successful rating update, refresh recommendations
      await fetchRecommendations();

      // Refetch all movies to get updated averages
      await fetchMovies();
    } catch (err) {
      console.error('Error rating movie:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Rollback optimistic update on error
      fetchMovies();
    }
  };

  // Filter movies based on search query
  const filteredMovies = movies;

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>
        <h2 className='text-2xl font-bold text-red-600'>Error</h2>
        <p className='mt-4'>{error}</p>
        <Button
          className='mt-4'
          onClick={() => {
            setError(null);
            fetchMovies();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 pb-10'>
      <header className='bg-white shadow'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <h1 className='text-2xl font-bold text-gray-900'>MovieRater</h1>
            <div className='relative w-full max-w-md'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <Input
                type='search'
                placeholder='Search movies...'
                className='pl-10'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        {/* API Recommendations Section */}
        <section className='mb-12'>
          <div className='flex items-center mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Recommended For You
            </h2>
          </div>

          {recommendationsLoading ? (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {[...Array(4)].map((_, index) => (
                <Card key={index} className='overflow-hidden'>
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
              ))}
            </div>
          ) : recommendationsError ? (
            <div className='text-center py-8 bg-red-50 rounded-lg border border-red-100'>
              <p className='text-red-600'>{recommendationsError}</p>
              <Button
                className='mt-4'
                variant='outline'
                onClick={fetchRecommendations}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {apiRecommendations.length > 0 ? (
                apiRecommendations.map((movie, index) => (
                  <APIRecommendationCard key={index} movie={movie} />
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

        {loading ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {[...Array(8)].map((_, index) => (
              <Card key={index} className='overflow-hidden'>
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
            ))}
          </div>
        ) : (
          <>
            <section>
              <h2 className='mb-6 text-2xl font-bold text-gray-900'>
                Movies Collection
              </h2>
              <Tabs
                defaultValue='all'
                value={selectedTab}
                onValueChange={setSelectedTab}
              >
                <TabsList className='mb-6 flex flex-wrap'>
                  <TabsTrigger key='all' value='all' className='capitalize'>
                    All
                  </TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category._id}
                      value={category._id}
                      className='capitalize'
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value='all'>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                    {filteredMovies.map((movie) => (
                      <MovieCard
                        key={movie._id}
                        movie={movie}
                        onRate={handleRating}
                        getCategoryName={getCategoryName}
                      />
                    ))}
                  </div>
                </TabsContent>

                {categories.map((category) => (
                  <TabsContent key={category._id} value={category._id}>
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                      {filteredMovies
                        .filter((movie) =>
                          movie.categories.includes(category._id)
                        )
                        .map((movie) => (
                          <MovieCard
                            key={movie._id}
                            movie={movie}
                            onRate={handleRating}
                            getCategoryName={getCategoryName}
                          />
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {totalMovies > limit && (
                <div className='flex justify-center mt-8'>
                  <Button
                    variant='outline'
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className='mr-2'
                  >
                    Previous
                  </Button>
                  <span className='flex items-center mx-4'>
                    Page {page} of {Math.ceil(totalMovies / limit)}
                  </span>
                  <Button
                    variant='outline'
                    disabled={page >= Math.ceil(totalMovies / limit)}
                    onClick={() => setPage((p) => p + 1)}
                    className='ml-2'
                  >
                    Next
                  </Button>
                </div>
              )}
            </section>

            {userRatedMovies.length > 0 && (
              <section className='mt-12'>
                <h2 className='mb-6 text-2xl font-bold text-gray-900'>
                  Your Rated Movies
                </h2>
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {movies
                    .filter((movie) => userRatedMovies.includes(movie._id))
                    .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
                    .map((movie) => (
                      <MovieCard
                        key={movie._id}
                        movie={movie}
                        onRate={handleRating}
                        getCategoryName={getCategoryName}
                      />
                    ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

interface MovieProps {
  movie: Movie;
  onRate: (id: string, rating: number) => void;
  getCategoryName: (categoryId: string) => string;
}

function MovieCard({ movie, onRate, getCategoryName }: MovieProps) {
  // Display the first category for the badge
  const primaryCategory =
    movie.categories.length > 0
      ? getCategoryName(movie.categories[0])
      : 'Uncategorized';
  console.log('movie.poster', movie);

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

// New component for API recommendations
interface APIRecommendationProps {
  movie: RecommendedMovie;
}

function APIRecommendationCard({ movie }: APIRecommendationProps) {
  return (
    <Card className='overflow-hidden transition-all hover:shadow-lg border-l-4 border-l-blue-500'>
      <div className='relative aspect-[2/3] w-full bg-gray-200'>
        {/* Placeholder image */}
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
