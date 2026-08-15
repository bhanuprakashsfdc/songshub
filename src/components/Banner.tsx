import { useState, useEffect } from "react";
import { Play, Info, Volume2, VolumeX } from "lucide-react";
import { Movie } from "../data/movies";
import { motion } from "motion/react";

interface BannerProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

export default function Banner({ movie, onPlay, onInfo }: BannerProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setShowVideo(false);
    const timer = setTimeout(() => setShowVideo(true), 2000);
    return () => clearTimeout(timer);
  }, [movie.id]);

  const youtubeId = movie.youtubeUrl?.split("/").pop()?.split("?")[0];

  return (
    <section className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden" aria-label="Featured content">
      <div className="absolute inset-0">
        {movie.bannerImage && (
          <img
            src={movie.bannerImage}
            alt=""
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              showVideo ? "opacity-0" : "opacity-100"
            }`}
            referrerPolicy="no-referrer"
          />
        )}

        {showVideo && youtubeId && (
          <div className="absolute inset-0 bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${youtubeId}&rel=0&modestbranding=1&playsinline=1`}
              className="w-full h-full scale-[1.5] pointer-events-none"
              allow="autoplay"
              title=""
              aria-hidden="true"
            />
          </div>
        )}

        <div className="absolute inset-0 hero-vignette" aria-hidden="true" />
      </div>

      <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 pb-16 md:pb-24 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl"
        >
          <h1 className="title-display text-4xl md:text-6xl lg:text-7xl text-white mb-4 drop-shadow-2xl leading-tight">
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-sm font-medium">
            <span className="text-success font-bold">{movie.matchScore}</span>
            <span className="text-neutral-400">{movie.year}</span>
            <span className="border border-neutral-500 px-1.5 py-0.5 text-[11px] rounded text-neutral-300 font-bold leading-none">
              {movie.rating}
            </span>
            <span className="text-neutral-400">{movie.duration}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-neutral-300">
              4K Ultra HD
            </span>
          </div>

          {movie.genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-4">
              {movie.genres.slice(0, 4).map((genre, i) => (
                <span key={genre} className="text-sm text-neutral-300">
                  {genre}
                  {i < Math.min(3, movie.genres.length - 1) ? (
                    <span className="text-neutral-600 mx-1">·</span>
                  ) : null}
                </span>
              ))}
            </div>
          )}

          <p className="text-neutral-300 text-sm md:text-base mb-6 line-clamp-3 leading-relaxed max-w-xl">
            {movie.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlay(movie)}
              className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2.5 md:py-3 rounded-md font-bold text-sm md:text-base hover:bg-neutral-200 transition-all duration-200 active:scale-95 focus-ring"
              aria-label={`Play ${movie.title}`}
            >
              <Play className="w-5 h-5 fill-current" />
              Play
            </button>
            <button
              onClick={() => onInfo(movie)}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md font-bold text-sm md:text-base hover:bg-white/30 transition-all duration-200 active:scale-95 focus-ring"
              aria-label={`More information about ${movie.title}`}
            >
              <Info className="w-5 h-5" />
              More Info
            </button>

            <div className="flex-grow" />

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="h-10 w-10 md:h-11 md:w-11 rounded-full border-2 border-white/40 text-white flex items-center justify-center hover:border-white hover:bg-white/10 transition-all duration-200 focus-ring"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
