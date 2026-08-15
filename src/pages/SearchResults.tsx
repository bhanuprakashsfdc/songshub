import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import MovieRow from "../components/MovieRow";
import FullPlayer from "../components/FullPlayer";
import DetailModal from "../components/DetailModal";
import { useMovies } from "../context/MovieContext";
import { Movie } from "../data/movies";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { movies } = useMovies();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<Movie | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return movies.filter((m) => {
      const searchable = [m.title, ...m.genres, ...(m.cast || []), m.director || "", m.category || ""].join(" ").toLowerCase();
      return searchable.includes(q);
    });
  }, [query, movies]);

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
      <h1 className="text-2xl md:text-4xl font-black text-white mb-2">
        {query ? `Results for "${query}"` : "Search"}
      </h1>
      <p className="text-neutral-400 mb-8">{results.length} result{results.length !== 1 ? "s" : ""}</p>
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-neutral-500 mb-4">No matches found. Try a different search.</p>
          <a
            href="/"
            className="px-6 py-2.5 bg-primary text-white rounded-md font-bold hover:bg-accent transition-colors focus-ring"
          >
            Browse Content
          </a>
        </div>
      ) : (
        <MovieRow title="" movies={results} onPlay={handlePlay} onInfo={handleInfo} />
      )}
      <FullPlayer movie={selectedMovie} onClose={handlePlayerClose} />
      <DetailModal movie={selectedMovieForDetail} onClose={() => setSelectedMovieForDetail(null)} onPlay={handlePlay} />
    </main>
  );
}
