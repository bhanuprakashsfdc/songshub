import { Movie } from "../data/movies";
import MovieCard from "./MovieCard";

interface FeaturedGridProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

export default function FeaturedGrid({ title, movies, onPlay, onInfo }: FeaturedGridProps) {
  if (movies.length === 0) return null;

  return (
    <section className="mb-8 md:mb-12" aria-label={title}>
      <div className="px-4 md:px-12 mb-3">
        <h2 className="font-headline text-base md:text-xl font-bold tracking-tight text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 px-4 md:px-12">
        {movies.slice(0, 10).map((movie) => (
          <MovieCard key={movie.id} movie={movie} onPlay={onPlay} onInfo={onInfo} />
        ))}
      </div>
    </section>
  );
}
