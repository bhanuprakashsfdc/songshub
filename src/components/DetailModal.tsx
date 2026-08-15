import { useEffect, useMemo, useRef, useState } from "react";
import { X, Play, Plus, ThumbsUp, Volume2, Check } from "lucide-react";
import { Movie } from "../data/movies";
import { motion, AnimatePresence } from "motion/react";
import { useMovies } from "../context/MovieContext";
import { isInMyList, addToMyList, removeFromMyList } from "../utils/watchHistory";

interface DetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
}

export default function DetailModal({ movie, onClose, onPlay }: DetailModalProps) {
  const { movies } = useMovies();
  const modalRef = useRef<HTMLDivElement>(null);
  const [inList, setInList] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (movie) {
      setInList(isInMyList(movie.id));
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [movie]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && movie) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [movie, onClose]);

  useEffect(() => {
    if (!movie || !modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    const firstEl = focusableElements[0] as HTMLElement;
    const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement;

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    document.addEventListener("keydown", trapFocus);
    firstEl?.focus();
    return () => document.removeEventListener("keydown", trapFocus);
  }, [movie]);

  const relatedMovies = useMemo(() => {
    if (!movie) return [];
    const allMovies = movies.filter((m) => m.id !== movie.id);

    const scored = allMovies.map((m) => {
      let score = 0;
      if (m.category === movie.category) score += 3;
      if (m.type === movie.type) score += 2;
      const sharedGenres = m.genres.filter((g) => movie.genres.includes(g));
      score += sharedGenres.length;
      const yearDiff = Math.abs(parseInt(m.year) - parseInt(movie.year));
      if (yearDiff <= 5) score += 1;
      return { movie: m, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 6).map((s) => s.movie);
  }, [movies, movie]);

  if (!movie) return null;

  const handleToggleList = () => {
    if (inList) {
      removeFromMyList(movie.id);
      setInList(false);
    } else {
      addToMyList(movie.id);
      setInList(true);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[150] flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto pt-8 md:pt-16 pb-20 px-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-neutral-900 rounded-xl overflow-hidden shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-50 h-10 w-10 bg-neutral-900/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors focus-ring"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-video w-full">
              <img
                src={movie.bannerImage}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />

              <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10">
                <h1
                  id="detail-modal-title"
                  className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 text-white drop-shadow-lg leading-tight"
                >
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onPlay(movie)}
                    className="flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-white text-black rounded-md font-bold hover:bg-neutral-200 transition-colors active:scale-95 focus-ring text-sm md:text-base"
                    aria-label={`Play ${movie.title}`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Play
                  </button>
                  <button
                    onClick={handleToggleList}
                    className={`h-10 w-10 md:h-12 md:w-12 rounded-full border-2 flex items-center justify-center transition-colors focus-ring ${
                      inList ? "border-white bg-white/10 text-white" : "border-neutral-500 text-white hover:border-white"
                    }`}
                    aria-label={inList ? "Remove from My List" : "Add to My List"}
                  >
                    {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleLike}
                    className={`h-10 w-10 md:h-12 md:w-12 rounded-full border-2 flex items-center justify-center transition-colors focus-ring ${
                      liked ? "border-white bg-white/10 text-white" : "border-neutral-500 text-white hover:border-white"
                    }`}
                    aria-label={liked ? "Unlike" : "Like"}
                    aria-pressed={liked}
                  >
                    <ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                  </button>
                  <div className="flex-grow" />
                  <button
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-neutral-500 text-white flex items-center justify-center hover:border-white transition-colors focus-ring"
                    aria-label="Toggle audio"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-base md:text-lg">
                  <span className="text-success font-bold">{movie.matchScore}</span>
                  <span className="text-neutral-400">{movie.year}</span>
                  <span className="px-1.5 py-0.5 border border-neutral-600 text-xs rounded text-neutral-300 font-bold">
                    {movie.rating}
                  </span>
                  <span className="text-neutral-400">{movie.duration}</span>
                  <span className="px-1.5 py-0.5 border border-neutral-600 text-[10px] rounded text-neutral-300 font-bold">
                    HD
                  </span>
                </div>

                <p className="text-base md:text-lg text-white leading-relaxed">{movie.description}</p>
              </div>

              <div className="space-y-3 text-sm">
                {movie.cast.length > 0 && (
                  <div>
                    <span className="text-neutral-500">Cast: </span>
                    <span className="text-neutral-300">{movie.cast.slice(0, 5).join(", ")}</span>
                  </div>
                )}
                {movie.genres.length > 0 && (
                  <div>
                    <span className="text-neutral-500">Genres: </span>
                    <span className="text-neutral-300">{movie.genres.join(", ")}</span>
                  </div>
                )}
                {movie.director && (
                  <div>
                    <span className="text-neutral-500">Director: </span>
                    <span className="text-neutral-300">{movie.director}</span>
                  </div>
                )}
                {movie.language && (
                  <div>
                    <span className="text-neutral-500">Language: </span>
                    <span className="text-neutral-300">{movie.language}</span>
                  </div>
                )}
              </div>
            </div>

            {relatedMovies.length > 0 && (
              <div className="px-6 md:px-10 pb-8 md:pb-10">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-5">More Like This</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedMovies.map((m) => (
                    <button
                      key={m.id}
                      className="bg-neutral-800 rounded-lg overflow-hidden group text-left focus-ring transition-transform hover:scale-[1.02]"
                      onClick={() => onPlay(m)}
                      aria-label={`Play ${m.title}`}
                    >
                      <div className="relative aspect-video">
                        <img src={m.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-success font-bold text-xs">{m.matchScore}</span>
                          <span className="px-1.5 py-0.5 border border-neutral-600 text-[10px] rounded text-neutral-300">
                            {m.rating}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-xs line-clamp-2">{m.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
