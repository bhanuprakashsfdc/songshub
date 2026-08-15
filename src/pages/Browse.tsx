import { useMemo, useState, useCallback } from "react";
import MovieRow from "../components/MovieRow";
import FullPlayer from "../components/FullPlayer";
import DetailModal from "../components/DetailModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { useMovies } from "../context/MovieContext";
import { useMusic } from "../context/MusicContext";
import { Movie } from "../data/movies";

interface BrowseProps {
  type: string;
  title: string;
}

export default function Browse({ type, title }: BrowseProps) {
  const { movies, loading } = useMovies();
  const { songs } = useMusic();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<Movie | null>(null);

  const filteredMovies = useMemo(() => {
    switch (type) {
      case "tv-shows":
        return movies.filter((m) => {
          const t = (m.type || "").toLowerCase();
          return t.includes("tv") || t.includes("show");
        });
      case "movies":
        return movies.filter((m) => {
          const t = (m.type || "").toLowerCase();
          return t === "movie" || t.includes("film");
        });
      case "new-popular":
        return [...movies].sort((a, b) => parseInt(b.year) - parseInt(a.year));
      case "songs":
        return songs;
      default:
        return movies;
    }
  }, [movies, songs, type]);

  const rows = useMemo(() => {
    const map: Record<string, typeof movies> = {};
    filteredMovies.forEach((m) => {
      const cat = m.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(m);
    });
    return Object.entries(map).map(([cat, list]) => ({ title: cat, movies: list }));
  }, [filteredMovies]);

  const handlePlay = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setSelectedMovieForDetail(null);
  }, []);

  const handleInfo = useCallback((movie: Movie) => setSelectedMovieForDetail(movie), []);

  const handleVideoEnd = useCallback((currentMovie: Movie) => {
    const currentIndex = filteredMovies.findIndex((m) => m.id === currentMovie.id);
    if (currentIndex >= 0 && currentIndex < filteredMovies.length - 1) {
      setSelectedMovie(filteredMovies[currentIndex + 1]);
    }
  }, [filteredMovies]);

  const handlePlayerClose = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <main className="relative min-h-screen pt-24 pb-20">
      <div className="px-4 md:px-12 mb-6">
        <h1 className="text-2xl md:text-4xl font-black text-white">{title}</h1>
        <p className="text-neutral-400 mt-1">{filteredMovies.length} titles</p>
      </div>
      {filteredMovies.length === 0 ? (
        <p className="text-neutral-500 text-center py-20">No content found.</p>
      ) : (
        rows.map((row) => (
          <MovieRow key={row.title} title={row.title} movies={row.movies} onPlay={handlePlay} onInfo={handleInfo} />
        ))
      )}
      <FullPlayer movie={selectedMovie} onClose={handlePlayerClose} onVideoEnd={handleVideoEnd} />
      <DetailModal movie={selectedMovieForDetail} onClose={() => setSelectedMovieForDetail(null)} onPlay={handlePlay} />
    </main>
  );
}
