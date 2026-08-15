"use client";

import { X, Pause } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { motion, AnimatePresence } from "motion/react";

export default function MusicQueue() {
  const { queue, currentSong, isPlaying, playSong, setShowQueue, showQueue } = useMusic();

  if (!showQueue) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 bg-neutral-900/98 backdrop-blur-xl border-l border-white/10 overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-bold">Queue</h3>
          <button
            onClick={() => setShowQueue(false)}
            className="p-2 text-neutral-400 hover:text-white focus-ring rounded-md"
            aria-label="Close queue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2">
          {queue.map((song, index) => {
            const active = currentSong?.id === song.id;
            return (
              <button
                key={song.id}
                onClick={() => playSong(song, queue)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left focus-ring ${
                  active ? "bg-primary/20" : "hover:bg-neutral-800/60"
                }`}
              >
                <div className="w-8 text-center flex-shrink-0">
                  {active && isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-5">
                      <div className="w-0.5 bg-primary rounded-full animate-[equalizer1_0.5s_ease-in-out_infinite]" />
                      <div className="w-0.5 bg-primary rounded-full animate-[equalizer2_0.6s_ease-in-out_infinite]" />
                      <div className="w-0.5 bg-primary rounded-full animate-[equalizer3_0.4s_ease-in-out_infinite]" />
                    </div>
                  ) : active ? (
                    <Pause className="w-4 h-4 text-primary mx-auto" />
                  ) : (
                    <span className="text-sm text-neutral-500">{index + 1}</span>
                  )}
                </div>
                <div className="w-16 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                  <img src={song.thumbnail || `/placeholders/song-01.svg`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => {
                    (e.target as HTMLImageElement).src = `/placeholders/song-01.svg`;
                  }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${active ? "text-primary" : "text-white"}`}>{song.title}</p>
                  <p className="text-xs text-neutral-500 truncate">{song.cast?.slice(0, 2).join(", ") || song.category}</p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
