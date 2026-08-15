import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FullPlayer from "../components/FullPlayer";
import { useMovies } from "../context/MovieContext";
import { Movie } from "../data/movies";
import { usePlayerStore } from "@/store/playerStore";

export default function Player() {
  const { id } = useParams();
  const { movies } = useMovies();
  const currentItem = usePlayerStore((state) => state.currentItem);
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
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
  }, [currentItem, id, movies]);

  const handleClose = () => {
    setMovie(null);
    window.history.back();
  };

  return (
    <main className="relative min-h-screen bg-black">
      <FullPlayer movie={movie} onClose={handleClose} />
    </main>
  );
}
