"use client";

import { Music } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { motion } from "motion/react";

export default function AudioModeToggle() {
  const { audioMode, toggleAudioMode } = useMusic();

  return (
    <motion.button
      onClick={toggleAudioMode}
      className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-colors focus-ring ${
        audioMode ? "bg-primary text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"
      }`}
      aria-label={audioMode ? "Disable audio mode" : "Enable audio mode"}
      title={audioMode ? "Disable audio mode" : "Enable audio mode"}
      whileTap={{ scale: 0.9 }}
    >
      <Music className="w-6 h-6" />
    </motion.button>
  );
}
