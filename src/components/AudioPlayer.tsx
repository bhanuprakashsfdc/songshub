"use client";

import { useEffect, useRef } from "react";
import { useMusic } from "@/context/MusicContext";

export default function AudioPlayer() {
  const { currentSong, isPlaying, playNext, togglePlay } = useMusic();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const directAudioUrl = currentSong ? getDirectAudioUrl(currentSong) : "";
  const youtubeVideoId = currentSong ? getYoutubeVideoId(currentSong.youtubeUrl || currentSong.videoUrl || "") : "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "none";
    audio.setAttribute("playsinline", "");
    audio.setAttribute("webkit-playsinline", "");
    if (typeof audio.setSinkId !== "undefined") {
      audio.setSinkId("default").catch(() => {});
    }
    audioRef.current = audio;

    const handleEnded = () => {
      playNext();
    };

    const handleError = () => {
      console.warn("[AudioPlayer] media error for", currentSong?.title, audio.error || null);
    };

    const handleEvent = (ev: Event) => {
      const name = ev.type;
      const target = (ev.target as HTMLMediaElement) || audio;
      console.debug(`[AudioPlayer] event: ${name}`, {
        src: target?.src,
        currentTime: target?.currentTime,
        paused: target?.paused,
      });
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    [
      "play",
      "playing",
      "pause",
      "stalled",
      "waiting",
      "suspend",
      "loadedmetadata",
      "canplay",
      "canplaythrough",
    ].forEach((evt) => audio.addEventListener(evt, handleEvent));

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      [
        "play",
        "playing",
        "pause",
        "stalled",
        "waiting",
        "suspend",
        "loadedmetadata",
        "canplay",
        "canplaythrough",
      ].forEach((evt) => audio.removeEventListener(evt, handleEvent));
      audio.pause();
      audio.src = "";
    };
  }, [playNext, currentSong?.id]);

  useEffect(() => {
      if (!audioRef.current || !currentSong || !directAudioUrl) return;

      const audio = audioRef.current;

      if (audio.src !== directAudioUrl) {
        audio.src = directAudioUrl;
        audio.load();
      }

      if (isPlaying) {
        // Use safePlay helper to handle mobile autoplay restrictions
        import("@/lib/mediaHelpers").then(({ safePlay, setupUserGestureUnlock }) => {
          safePlay(audio).catch((err) => {
            console.warn("[AudioPlayer] safePlay failed for", currentSong.title, err);
          });

          // Ensure user gesture will attempt to resume if needed
          setupUserGestureUnlock(() => {
            // attempt to unmute after user gesture if we had muted for autoplay
            try {
              if (audio.muted) audio.muted = false;
              audio.play().catch(() => {});
            } catch (e) {
              // ignore
            }
          });
        });
      } else {
        audio.pause();
      }
    }, [currentSong, directAudioUrl, isPlaying]);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    if (directAudioUrl) return;

    audioRef.current.pause();
    audioRef.current.src = "";
  }, [currentSong, directAudioUrl]);

  useEffect(() => {
    if (!currentSong) return;
    if (!("mediaSession" in navigator)) return;
    if (!directAudioUrl) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.cast?.[0] || currentSong.category || "SongShub",
      album: "SongShub",
      artwork: [
        { src: currentSong.thumbnail || "/placeholders/song-01.svg", sizes: "96x96", type: "image/svg+xml" },
        { src: currentSong.thumbnail || "/placeholders/song-01.svg", sizes: "128x128", type: "image/svg+xml" },
        { src: currentSong.thumbnail || "/placeholders/song-01.svg", sizes: "192x192", type: "image/svg+xml" },
        { src: currentSong.thumbnail || "/placeholders/song-01.svg", sizes: "256x256", type: "image/svg+xml" },
        { src: currentSong.thumbnail || "/placeholders/song-01.svg", sizes: "384x384", type: "image/svg+xml" },
        { src: currentSong.thumbnail || "/placeholders/song-01.svg", sizes: "512x512", type: "image/svg+xml" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      togglePlay();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      togglePlay();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      playNext();
    });

    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    };
  }, [currentSong, directAudioUrl, togglePlay, playNext]);

  if (!currentSong) return null;

  if (youtubeVideoId) {
    return (
      <div className="hidden" aria-hidden="true">
        <iframe
          key={currentSong.id}
          title={currentSong.title}
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${isPlaying ? 1 : 0}&controls=0&rel=0&modestbranding=1&playsinline=1&mute=0`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen={false}
          style={{ display: "none" }}
        />
      </div>
    );
  }

  return null;
}

function getDirectAudioUrl(song: { videoUrl?: string; youtubeUrl?: string }): string {
  const url = song.videoUrl || "";
  if (!url) return "";

  const lower = url.toLowerCase();
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "";

  const audioExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".webm"];
  return audioExtensions.some((ext) => lower.includes(ext)) ? url : "";
}

function getYoutubeVideoId(url: string): string {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}
