import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Movie } from '../data/movies';
import { useMovies } from './MovieContext';

interface MusicContextType {
  isMusicMode: boolean;
  setIsMusicMode: (mode: boolean) => void;
  toggleMusicMode: () => void;
  audioMode: boolean;
  setAudioMode: (mode: boolean) => void;
  toggleAudioMode: () => void;
  songs: Movie[];
  currentSong: Movie | null;
  isPlaying: boolean;
  playSong: (song: Movie, list: Movie[]) => void;
  togglePlay: () => void;
  queue: Movie[];
  setQueue: (songs: Movie[]) => void;
  addToQueue: (song: Movie) => void;
  playNext: () => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  reshuffleQueue: () => void;
  showQueue: boolean;
  setShowQueue: (show: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { movies } = useMovies();
  const [isMusicMode, setIsMusicMode] = useState(false);
  const [audioMode, setAudioModeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('songshub-audio-mode');
      return stored === 'true';
    }
    return false;
  });
  const [currentSong, setCurrentSong] = useState<Movie | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Movie[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const songs = movies.filter((m) => {
    const t = (m.type || '').toLowerCase();
    return t.includes('song') || t.includes('music');
  });

  const setAudioMode = useCallback((mode: boolean) => {
    setAudioModeState(mode);
    localStorage.setItem('songshub-audio-mode', String(mode));
  }, []);

  const toggleAudioMode = useCallback(() => {
    setAudioModeState((prev) => {
      const next = !prev;
      localStorage.setItem('songshub-audio-mode', String(next));
      return next;
    });
  }, []);

  const toggleMusicMode = useCallback(() => {
    setIsMusicMode((prev) => !prev);
  }, []);

  const playSong = useCallback((song: Movie, list: Movie[]) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (list.length > 0) {
      setQueue(list);
    }
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const reshuffleQueue = useCallback(() => {
    setQueue((prev) => {
      if (prev.length <= 1) return prev;
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const next = !prev;
      if (next && queue.length > 1) {
        reshuffleQueue();
      }
      return next;
    });
  }, [queue.length, reshuffleQueue]);

  const addToQueue = useCallback((song: Movie) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = currentSong ? queue.findIndex((s) => s.id === currentSong.id) : -1;

    if (shuffle) {
      if (queue.length === 1) {
        setCurrentSong(queue[0]);
        setIsPlaying(true);
        return;
      }
      let nextIndex: number;
      let attempts = 0;
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
        attempts++;
      } while (nextIndex === currentIndex && attempts < 20);
      setCurrentSong(queue[nextIndex]);
      setIsPlaying(true);
    } else {
      const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
      setCurrentSong(queue[nextIndex]);
      setIsPlaying(true);
    }
  }, [currentSong, queue, shuffle]);

  return (
    <MusicContext.Provider
      value={{
        isMusicMode,
        setIsMusicMode,
        toggleMusicMode,
        audioMode,
        setAudioMode,
        toggleAudioMode,
        songs,
        currentSong,
        isPlaying,
        playSong,
        togglePlay,
        queue,
        setQueue,
        addToQueue,
        playNext,
        shuffle,
        toggleShuffle,
        reshuffleQueue,
        showQueue,
        setShowQueue,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
