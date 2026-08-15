"use client";

import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, Shuffle, ListMusic } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { motion, AnimatePresence } from "motion/react";

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    shuffle,
    toggleShuffle,
    reshuffleQueue,
    setShowQueue,
    playNext,
  } = useMusic();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!currentSong) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSong]);

  if (!currentSong) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 w-full z-40 bg-neutral-900/95 backdrop-blur-xl border-t border-white/5"
      >
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentSong.title}</p>
            <p className="text-neutral-500 text-xs truncate">{currentSong.cast?.[0] || currentSong.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors focus-ring"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={playNext}
              className="h-10 w-10 rounded-full bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors focus-ring"
              aria-label="Next song"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => shuffle ? reshuffleQueue() : toggleShuffle()}
              className={`p-2 rounded-full transition-colors focus-ring ${
                shuffle ? "text-primary" : "text-neutral-400 hover:text-white"
              }`}
              aria-label={shuffle ? "Reshuffle" : "Shuffle"}
              aria-pressed={shuffle}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQueue(true)}
              className="p-2 text-neutral-400 hover:text-white transition-colors focus-ring rounded-full"
              aria-label="Open queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-neutral-800">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
