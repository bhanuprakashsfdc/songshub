import { useState, useMemo, useCallback } from "react";
import MovieRow from "../components/MovieRow";
import FullPlayer from "../components/FullPlayer";
import DetailModal from "../components/DetailModal";
import { useMovies } from "../context/MovieContext";
import { isInMyList } from "../utils/watchHistory";
import { Movie } from "../data/movies";

export default function MyList() {
  const { movies } = useMovies();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<Movie | null>(null);

  const myListMovies = useMemo(() => {
    return movies.filter((m) => isInMyList(m.id));
  }, [movies]);

  const handlePlay = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setSelectedMovieForDetail(null);
  }, []);

  const handleInfo = useCallback((movie: Movie) => setSelectedMovieForDetail(movie), []);

  const handlePlayerClose = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  return (
    <main className="relative min-h-screen pt-24 pb-20 px-4 md:px-12">
      <h1 className="text-2xl md:text-4xl font-black text-white mb-8">My List</h1>
      {myListMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-neutral-500 mb-4">Your list is empty. Add movies and shows to watch later.</p>
          <a
            href="/"
            className="px-6 py-2.5 bg-primary text-white rounded-md font-bold hover:bg-accent transition-colors focus-ring"
          >
            Browse Content
          </a>
        </div>
      ) : (
        <MovieRow title="Saved for Later" movies={myListMovies} onPlay={handlePlay} onInfo={handleInfo} />
      )}
      <FullPlayer movie={selectedMovie} onClose={handlePlayerClose} />
      <DetailModal movie={selectedMovieForDetail} onClose={() => setSelectedMovieForDetail(null)} onPlay={handlePlay} />
    </main>
  );
}
