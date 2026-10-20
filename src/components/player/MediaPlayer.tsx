"use client";

import { useState, useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2 } from "lucide-react";

export function MediaPlayer() {
  const playerRef = useRef<HTMLIFrameElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);

  const {
    currentItem,
    autoMode,
    isPlaying,
    toggleAutoMode,
    playNext,
    playPrevious,
    setIsPlaying,
  } = usePlayerStore();

  const embedUrl = currentItem
    ? `${currentItem.youtubeUrl}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1&playsinline=1&rel=0&modestbranding=1`
    : "";

  useEffect(() => {
    if (!playerRef.current || !currentItem) return;
    const iframe = playerRef.current;
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "setVolume", args: [volume * 100] }),
      "*"
    );
  }, [volume, currentItem]);

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Select content to start watching</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <iframe
        ref={playerRef}
        src={embedUrl}
        title={currentItem.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        onLoad={() => console.debug('[MediaPlayer] iframe loaded', embedUrl)}
      />

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-semibold text-lg">{currentItem.title}</h2>
            <p className="text-gray-300 text-sm">
              {currentItem.year} • {currentItem.language} • {currentItem.duration}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={toggleAutoMode}
              className={`text-white hover:text-white ${autoMode ? "bg-white/20" : ""}`}
            >
              <span className="text-xs font-bold">{autoMode ? "AUTO: ON" : "AUTO: OFF"}</span>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={playPrevious}
              className="text-white hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-white"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
            </Button>
            <Button
              variant="ghost"
              onClick={playNext}
              className="text-white hover:text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            <div className="flex items-center gap-2 ml-4">
              <Volume2 className="w-4 h-4 text-white" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 accent-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
