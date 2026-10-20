import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FullPlayer from "../components/FullPlayer";
import { useMovies } from "../context/MovieContext";
import { Movie } from "../data/movies";
import { usePlayerStore } from "@/store/playerStore";
import { useMusic } from "@/context/MusicContext";

export default function Player() {
  const { id } = useParams();
  const { movies } = useMovies();
  const currentItem = usePlayerStore((state) => state.currentItem);
  const playNext = usePlayerStore((state) => state.playNext);
  const { playNext: musicPlayNext, currentSong, audioMode } = useMusic();
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (audioMode) {
      setMovie(null);
      return;
    }

    if (currentItem) {
      setMovie(currentItem);
      return;
    }

    if (id) {
      const found = movies.find((m) => m.id === id);
      setMovie(found || null);
      return;
    }

    setMovie(null);
  }, [audioMode, currentItem, id, movies]);

  const handleClose = () => {
    setMovie(null);
    window.history.back();
  };

  const handleVideoEnd = () => {
    if (!movie) return;
    const isSong = (movie.type || "").toLowerCase().includes("song") || (movie.type || "").toLowerCase().includes("music");
    if (isSong && currentSong?.id === movie.id) {
      musicPlayNext();
    } else {
      playNext();
    }
  };

  if (audioMode || !movie) return null;

  return (
    <main className="relative min-h-screen bg-black">
      <FullPlayer movie={movie} onClose={handleClose} onVideoEnd={handleVideoEnd} />
    </main>
  );
}
