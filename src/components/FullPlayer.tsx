import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, Volume2, Maximize, Settings, Subtitles, SkipForward, VolumeX } from "lucide-react";
import { Movie } from "../data/movies";
import { motion, AnimatePresence } from "motion/react";
import { saveWatchProgress } from "../utils/watchHistory";

interface FullPlayerProps {
  movie: Movie | null;
  onClose: () => void;
  onVideoEnd?: (currentMovie: Movie) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function FullPlayer({ movie, onClose, onVideoEnd }: FullPlayerProps) {
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentMovieRef = useRef<Movie | null>(null);
  const hasTriggeredNearEnd = useRef(false);

  useEffect(() => {
    if (movie) {
      currentMovieRef.current = movie;
      hasTriggeredNearEnd.current = false;
    }
  }, [movie]);

  useEffect(() => {
    if (!movie) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          seek(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(-10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((prev) => {
            const newVol = Math.min(100, prev + 10);
            if (playerRef.current) playerRef.current.setVolume(newVol);
            if (newVol > 0) setIsMuted(false);
            return newVol;
          });
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((prev) => {
            const newVol = Math.max(0, prev - 10);
            if (playerRef.current) playerRef.current.setVolume(newVol);
            if (newVol === 0) setIsMuted(true);
            return newVol;
          });
          break;
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        case "Escape":
          handleClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movie, volume, isPlaying]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    if (movie) {
      document.body.style.overflow = "hidden";
      const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
      };

      window.addEventListener("mousemove", handleMouseMove);
      handleMouseMove();

      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("mousemove", handleMouseMove);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        if (progressInterval.current) clearInterval(progressInterval.current);
      };
    }
  }, [movie]);

  useEffect(() => {
    if (!movie || !window.YT) return;

    const getYoutubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = movie.youtubeUrl ? getYoutubeId(movie.youtubeUrl) : null;
    if (!videoId) return;

    const initPlayer = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
            event.target.playVideo();
            setIsPlaying(true);
            progressInterval.current = setInterval(() => {
              if (playerRef.current?.getCurrentTime) {
                const time = playerRef.current.getCurrentTime();
                const dur = playerRef.current.getDuration();
                setCurrentTime(time);

                if (dur > 0 && dur - time <= 2 && !hasTriggeredNearEnd.current) {
                  hasTriggeredNearEnd.current = true;
                  if (currentMovieRef.current && onVideoEnd) {
                    onVideoEnd(currentMovieRef.current);
                  }
                }
              }
            }, 250);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              if (!hasTriggeredNearEnd.current && currentMovieRef.current && onVideoEnd) {
                hasTriggeredNearEnd.current = true;
                onVideoEnd(currentMovieRef.current);
              }
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [movie, onVideoEnd]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const seek = useCallback((seconds: number) => {
    if (!playerRef.current?.getCurrentTime) return;
    const newTime = playerRef.current.getCurrentTime() + seconds;
    playerRef.current.seekTo(Math.max(0, newTime), true);
  }, []);

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!playerRef.current || duration === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    },
    [duration]
  );

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume > 0) setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleClose = useCallback(() => {
    if (movie && duration > 0) {
      const progress = (currentTime / duration) * 100;
      saveWatchProgress(movie.id, progress);
    }
    onClose();
  }, [movie, duration, currentTime, onClose]);

  if (!movie) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Video player: ${movie.title}`}
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div id="youtube-player" className="w-full h-full" />
        </div>

        <div
          className={`absolute inset-0 z-10 transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0 cursor-none"}`}
          onClick={togglePlay}
        >
          <div className="absolute top-0 left-0 w-full p-4 md:p-8 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="flex items-center gap-3 text-white hover:scale-105 transition-transform focus-ring rounded-md p-1"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-lg md:text-xl font-medium hidden md:block">Back</span>
            </button>

            <div className="flex items-center gap-4 md:gap-6 text-white/70">
              <div className="relative">
                <button
                  className="hover:text-white transition-colors focus-ring rounded-md p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettings(!showSettings);
                  }}
                  aria-label="Settings"
                  aria-expanded={showSettings}
                >
                  <Settings className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                {showSettings && (
                  <div className="absolute top-full right-0 mt-2 bg-black/95 backdrop-blur rounded-lg p-2 min-w-[140px] border border-white/10">
                    <div className="text-xs text-neutral-500 px-3 py-1.5 font-medium">Quality</div>
                    {["Auto", "1080p", "720p", "480p"].map((q) => (
                      <button
                        key={q}
                        className="w-full text-left px-3 py-1.5 hover:bg-white/10 rounded text-sm text-neutral-300 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSettings(false);
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="hover:text-white transition-colors focus-ring rounded-md p-1" aria-label="Subtitles">
                <Subtitles className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-current ml-1" />
              </div>
            </div>
          )}

          <div
            className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <span className="text-white text-xs md:text-sm font-medium min-w-[45px] tabular-nums">
                {formatTime(currentTime)}
              </span>
              <div
                className="group relative flex-1 h-1 md:h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all"
                onClick={handleTimelineClick}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    seek(5);
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    seek(-5);
                  }
                }}
                role="slider"
                aria-label="Video progress"
                aria-valuenow={Math.round(progressPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
              >
                <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>
              <span className="text-white text-xs md:text-sm font-medium min-w-[45px] tabular-nums text-right">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 md:gap-6">
                <button
                  onClick={togglePlay}
                  className="text-white hover:scale-110 transition-transform focus-ring rounded-md p-1"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 md:w-9 md:h-9 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 md:w-9 md:h-9 fill-current" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    seek(-10);
                  }}
                  className="text-white hover:scale-110 transition-transform focus-ring rounded-md p-1"
                  aria-label="Rewind 10 seconds"
                >
                  <RotateCcw className="w-6 h-6 md:w-7 md:h-7" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    seek(10);
                  }}
                  className="text-white hover:scale-110 transition-transform focus-ring rounded-md p-1"
                  aria-label="Forward 10 seconds"
                >
                  <RotateCw className="w-6 h-6 md:w-7 md:h-7" />
                </button>

                <div className="flex items-center gap-2 group">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="text-white hover:scale-110 transition-transform focus-ring rounded-md p-1"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-6 h-6 md:w-7 md:h-7" /> : <Volume2 className="w-6 h-6 md:w-7 md:h-7" />}
                  </button>
                  <div className="w-0 group-hover:w-20 md:group-hover:w-24 overflow-hidden transition-all duration-300">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 accent-primary cursor-pointer"
                      aria-label="Volume"
                    />
                  </div>
                </div>
              </div>

              <div className="hidden md:block text-white text-base font-medium absolute left-1/2 -translate-x-1/2 truncate max-w-md">
                {movie.title}
              </div>

              <div className="flex items-center gap-4 md:gap-6 text-white/70">
                <button
                  className="hover:text-white transition-colors focus-ring rounded-md p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onVideoEnd && currentMovieRef.current) onVideoEnd(currentMovieRef.current);
                  }}
                  aria-label="Next video"
                >
                  <SkipForward className="w-6 h-6 md:w-7 md:h-7" />
                </button>
                <button
                  className="hover:text-white transition-colors focus-ring rounded-md p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      document.documentElement.requestFullscreen();
                    }
                  }}
                  aria-label="Toggle fullscreen"
                >
                  <Maximize className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
