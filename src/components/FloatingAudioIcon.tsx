"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Music, Play, Pause } from "lucide-react";
import { useMusic } from "@/context/MusicContext";

const STORAGE_KEY = "songshub-floating-icon-pos";

export default function FloatingAudioIcon() {
  const { audioMode, currentSong, isPlaying, setShowQueue } = useMusic();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasLongPress, setHasLongPress] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  const clampPosition = useCallback(
    (x: number, y: number) => {
      if (typeof window === "undefined") return { x, y };
      const size = 56;
      const margin = 16;
      const maxX = window.innerWidth - size - margin;
      const maxY = window.innerHeight - size - margin;
      return {
        x: Math.max(margin, Math.min(x, maxX)),
        y: Math.max(margin, Math.min(y, maxY)),
      };
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPosition(clampPosition(parsed.x ?? 0, parsed.y ?? 0));
      } catch {
        const defaultX = window.innerWidth - 56 - 16;
        const defaultY = window.innerHeight - 56 - 16;
        setPosition(clampPosition(defaultX, defaultY));
      }
    } else {
      const defaultX = window.innerWidth - 56 - 16;
      const defaultY = window.innerHeight - 56 - 16;
      setPosition(clampPosition(defaultX, defaultY));
    }
  }, [clampPosition]);

  const persistPosition = useCallback((x: number, y: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!audioMode) return;
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);

      const startX = e.clientX;
      const startY = e.clientY;

      longPressTimer.current = setTimeout(() => {
        setHasLongPress(true);
        const rect = iconRef.current?.getBoundingClientRect();
        if (rect) {
          setDragOffset({
            x: startX - rect.left,
            y: startY - rect.top,
          });
        }
        setIsDragging(true);
      }, 300);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!hasLongPress && longPressTimer.current) {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            if (longPressTimer.current) clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }
        if (!isDragging) return;
        const newX = moveEvent.clientX - dragOffset.x;
        const newY = moveEvent.clientY - dragOffset.y;
        const clamped = clampPosition(newX, newY);
        setPosition(clamped);
      };

      const handlePointerUp = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        if (isDragging && position) {
          persistPosition(position.x, position.y);
          setIsDragging(false);
          setHasLongPress(false);
        }
        (e.target as Element).releasePointerCapture(e.pointerId);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    },
    [audioMode, isDragging, dragOffset, position, clampPosition, persistPosition, hasLongPress]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!audioMode) return;
      if (isDragging || hasLongPress) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (currentSong) {
        setShowQueue(true);
      }
    },
    [audioMode, isDragging, hasLongPress, currentSong, setShowQueue]
  );

  if (!audioMode || !position) return null;

  return (
    <button
      ref={iconRef}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={`fixed z-[9999] flex items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-transform focus-ring ${
        isDragging ? "scale-110 opacity-90" : "scale-100 opacity-100"
      }`}
      style={{
        width: 56,
        height: 56,
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none",
      }}
      aria-label={currentSong ? (isPlaying ? "Pause audio" : "Play audio") : "Open audio player"}
      title={currentSong ? (isPlaying ? "Pause" : "Play") : "Open audio player"}
    >
      {currentSong ? (
        isPlaying ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current ml-0.5" />
        )
      ) : (
        <Music className="w-6 h-6" />
      )}
    </button>
  );
}
