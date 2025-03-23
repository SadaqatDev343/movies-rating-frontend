'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge, Search, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample movie data
const movies = [
  {
    id: 1,
    title: 'Inception',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'sci-fi',
    rating: 4.8,
    year: 2010,
    userRating: 0,
  },
  {
    id: 2,
    title: 'The Shawshank Redemption',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'drama',
    rating: 4.9,
    year: 1994,
    userRating: 0,
  },
  {
    id: 3,
    title: 'The Dark Knight',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'action',
    rating: 4.7,
    year: 2008,
    userRating: 0,
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'crime',
    rating: 4.6,
    year: 1994,
    userRating: 0,
  },
  {
    id: 5,
    title: 'The Godfather',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'crime',
    rating: 4.9,
    year: 1972,
    userRating: 0,
  },
  {
    id: 6,
    title: 'Forrest Gump',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'drama',
    rating: 4.5,
    year: 1994,
    userRating: 0,
  },
  {
    id: 7,
    title: 'The Matrix',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'sci-fi',
    rating: 4.4,
    year: 1999,
    userRating: 0,
  },
  {
    id: 8,
    title: 'Interstellar',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'sci-fi',
    rating: 4.7,
    year: 2014,
    userRating: 0,
  },
  {
    id: 9,
    title: 'The Lord of the Rings',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'fantasy',
    rating: 4.8,
    year: 2001,
    userRating: 0,
  },
  {
    id: 10,
    title: 'Fight Club',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'drama',
    rating: 4.5,
    year: 1999,
    userRating: 0,
  },
  {
    id: 11,
    title: 'Goodfellas',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'crime',
    rating: 4.6,
    year: 1990,
    userRating: 0,
  },
  {
    id: 12,
    title: 'The Silence of the Lambs',
    poster: '/placeholder.svg?height=400&width=300',
    category: 'thriller',
    rating: 4.5,
    year: 1991,
    userRating: 0,
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userRatedMovies, setUserRatedMovies] = useState<number[]>([]);
  const [moviesData, setMoviesData] = useState(movies);

  // Filter movies based on search query
  const filteredMovies = moviesData.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique categories
  const categories = ['all', ...new Set(movies.map((movie) => movie.category))];

  // Handle user rating
  const handleRating = (movieId: number, rating: number) => {
    setMoviesData(
      moviesData.map((movie) => {
        if (movie.id === movieId) {
          if (!userRatedMovies.includes(movieId)) {
            setUserRatedMovies([...userRatedMovies, movieId]);
          }
          return { ...movie, userRating: rating };
        }
        return movie;
      })
    );
  };

  // Get recommended movies based on user ratings
  const recommendedMovies = moviesData
    .filter((movie) => !userRatedMovies.includes(movie.id))
    .sort((a, b) => {
      // Find movies with similar categories to highly rated movies
      const userHighlyRatedCategories = moviesData
        .filter((m) => m.userRating >= 4)
        .map((m) => m.category);

      const aMatchesUserPreference = userHighlyRatedCategories.includes(
        a.category
      )
        ? 1
        : 0;
      const bMatchesUserPreference = userHighlyRatedCategories.includes(
        b.category
      )
        ? 1
        : 0;

      return (
        bMatchesUserPreference - aMatchesUserPreference || b.rating - a.rating
      );
    })
    .slice(0, 4);

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
        {userRatedMovies.length > 0 && (
          <section className='mb-12'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900'>
              Recommended For You
            </h2>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {recommendedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onRate={handleRating} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className='mb-6 text-2xl font-bold text-gray-900'>
            Movies Collection
          </h2>
          <Tabs defaultValue='all'>
            <TabsList className='mb-6'>
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className='capitalize'
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {filteredMovies
                    .filter(
                      (movie) =>
                        category === 'all' || movie.category === category
                    )
                    .map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onRate={handleRating}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {userRatedMovies.length > 0 && (
          <section className='mt-12'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900'>
              Your Rated Movies
            </h2>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {moviesData
                .filter((movie) => userRatedMovies.includes(movie.id))
                .sort((a, b) => b.userRating - a.userRating)
                .map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onRate={handleRating}
                  />
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

interface MovieProps {
  movie: {
    id: number;
    title: string;
    poster: string;
    category: string;
    rating: number;
    year: number;
    userRating: number;
  };
  onRate: (id: number, rating: number) => void;
}

function MovieCard({ movie, onRate }: MovieProps) {
  return (
    <Card className='overflow-hidden transition-all hover:shadow-lg'>
      <div className='relative aspect-[2/3] w-full'>
        <Image
          src={movie.poster || '/placeholder.svg'}
          alt={movie.title}
          fill
          className='object-cover'
        />
      </div>
      <CardContent className='p-4'>
        <div className='mb-2 flex items-start justify-between'>
          <h3 className='font-semibold'>{movie.title}</h3>
          <span className='text-sm text-gray-500'>{movie.year}</span>
        </div>
        <div className='mb-3 flex items-center gap-1'>
          <Badge className='capitalize'>{movie.category}</Badge>
          <div className='ml-auto flex items-center gap-1'>
            <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
            <span className='text-sm'>{movie.rating}</span>
          </div>
        </div>
        <div className='mt-4'>
          <p className='mb-1 text-sm text-gray-500'>Your Rating:</p>
          <div className='flex gap-1'>
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant='ghost'
                size='icon'
                className={`h-8 w-8 ${
                  movie.userRating >= star ? 'text-yellow-400' : 'text-gray-300'
                }`}
                onClick={() => onRate(movie.id, star)}
              >
                <Star
                  className={`h-5 w-5 ${
                    movie.userRating >= star ? 'fill-yellow-400' : ''
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
