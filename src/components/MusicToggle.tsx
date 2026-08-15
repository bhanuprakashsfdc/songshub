"use client";

import { Music, MusicIcon } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { motion } from "motion/react";

export default function MusicToggle() {
  const { isMusicMode, toggleMusicMode } = useMusic();

  return (
    <motion.button
      onClick={toggleMusicMode}
      className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-colors focus-ring ${
        isMusicMode ? "bg-primary text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"
      }`}
      aria-label={isMusicMode ? "Switch to video mode" : "Switch to music mode"}
      title={isMusicMode ? "Switch to video mode" : "Switch to music mode"}
    >
      {isMusicMode ? <MusicIcon className="w-6 h-6" /> : <Music className="w-6 h-6" />}
    </motion.button>
  );
}
