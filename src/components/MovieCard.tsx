import React, { useState, useEffect, useCallback, memo } from "react";
import { Play, Plus, Check, ChevronDown, ThumbsUp } from "lucide-react";
import { Movie } from "../data/movies";
import { motion } from "motion/react";
import { isInMyList, addToMyList, removeFromMyList, getWatchHistory } from "../utils/watchHistory";

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

const MovieCard = memo(function MovieCard({ movie, onPlay, onInfo }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [inList, setInList] = useState(false);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    setInList(isInMyList(movie.id));
    const history = getWatchHistory();
    const entry = history.find((h) => h.movieId === movie.id);
    if (entry && entry.progress > 0 && entry.progress < 100) {
      setProgress(entry.progress);
    }
  }, [movie.id]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isHovered) {
      timer = setTimeout(() => setShowPreview(true), 800);
    } else {
      setShowPreview(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered]);

  const handleAddToList = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (inList) {
        removeFromMyList(movie.id);
        setInList(false);
      } else {
        addToMyList(movie.id);
        setInList(true);
      }
    },
    [inList, movie.id]
  );

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
  }, [liked]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPlay(movie);
      }
    },
    [onPlay, movie]
  );

  const youtubeId = movie.youtubeUrl?.split("/").pop()?.split("?")[0];

  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.08, zIndex: 40 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex-none w-44 md:w-60 lg:w-64 aspect-video rounded-md overflow-hidden bg-surface-container relative cursor-pointer group shadow-lg"
      onClick={() => onPlay(movie)}
      onKeyDown={handleKeyDown}
      aria-label={`Play ${movie.title}`}
    >
      <img
        src={movie.thumbnail || `/placeholders/movie-01.svg`}
        alt=""
        loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          showPreview ? "opacity-0" : "opacity-100"
        }`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `/placeholders/movie-01.svg`;
        }}
      />

      {showPreview && youtubeId && (
        <div className="absolute inset-0 bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&rel=0&playsinline=1`}
            className="w-full h-full pointer-events-none scale-150"
            allow="autoplay; encrypted-media; picture-in-picture"
            title=""
            aria-hidden="true"
          />
        </div>
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
          <p className="font-bold text-xs text-white truncate leading-tight">{movie.title}</p>

          <div className="flex justify-between items-center">
            <div className="flex gap-1.5">
              <button
                className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors focus-ring"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(movie);
                }}
                aria-label={`Play ${movie.title}`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                className={`h-8 w-8 rounded-full border flex items-center justify-center transition-colors focus-ring ${
                  inList ? "border-white bg-white/10 text-white" : "border-neutral-500 text-white hover:border-white"
                }`}
                onClick={handleAddToList}
                aria-label={inList ? `Remove ${movie.title} from My List` : `Add ${movie.title} to My List`}
              >
                {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
              <button
                className={`h-8 w-8 rounded-full border flex items-center justify-center transition-colors focus-ring ${
                  liked ? "border-white bg-white/10 text-white" : "border-neutral-500 text-white hover:border-white"
                }`}
                onClick={handleLike}
                aria-label={liked ? `Unlike ${movie.title}` : `Like ${movie.title}`}
                aria-pressed={liked}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>
            <button
              className="h-8 w-8 rounded-full border border-neutral-500 text-white flex items-center justify-center hover:border-white transition-colors focus-ring"
              onClick={(e) => {
                e.stopPropagation();
                onInfo(movie);
              }}
              aria-label={`More information about ${movie.title}`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-success">{movie.matchScore}</span>
            <span className="text-white border border-white/40 px-1 rounded-sm leading-none">{movie.rating}</span>
            <span className="text-neutral-400">{movie.duration}</span>
          </div>

          {movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-x-1">
              {movie.genres.slice(0, 3).map((genre, i) => (
                <span key={genre} className="text-[10px] text-neutral-400">
                  {genre}
                  {i < Math.min(2, movie.genres.length - 1) ? " ·" : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {movie.isTop10 && (
        <div className="absolute top-1.5 right-1.5 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-md z-10">
          TOP 10
        </div>
      )}

      {progress !== null && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-600 z-10" aria-label={`${Math.round(progress)}% watched`}>
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}
    </motion.button>
  );
});

export default MovieCard;
