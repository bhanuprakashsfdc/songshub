import { create } from "zustand";
import { Movie } from "@/data/movies";

export interface PlayerStore {
  currentItem: Movie | null;
  queue: Movie[];
  autoMode: boolean;
  isPlaying: boolean;
  currentTime: number;
  shuffle: boolean;
  setCurrentItem: (item: Movie) => void;
  setQueue: (items: Movie[]) => void;
  toggleAutoMode: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  reshuffleQueue: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentItem: null,
  queue: [],
  autoMode: false,
  isPlaying: false,
  currentTime: 0,
  shuffle: false,
  setCurrentItem: (item) => set({ currentItem: item, isPlaying: true, currentTime: 0 }),
  setQueue: (items) => set({ queue: items }),
  toggleAutoMode: () => set((state) => ({ autoMode: !state.autoMode })),
  toggleShuffle: () => {
    set((state) => {
      const nextShuffle = !state.shuffle;
      if (nextShuffle && state.queue.length > 1) {
        const shuffled = [...state.queue];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return { shuffle: nextShuffle, queue: shuffled };
      }
      return { shuffle: nextShuffle };
    });
  },
  reshuffleQueue: () => {
    set((state) => {
      if (state.queue.length <= 1) return state;
      const shuffled = [...state.queue];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { queue: shuffled };
    });
  },
  playNext: () => {
    const { queue, currentItem, shuffle } = get();
    if (queue.length === 0) return;
    const currentIndex = currentItem ? queue.findIndex((item) => item.id === currentItem.id) : -1;

    if (shuffle) {
      if (queue.length === 1) {
        set({ currentItem: queue[0], currentTime: 0 });
        return;
      }
      let nextIndex: number;
      let attempts = 0;
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
        attempts++;
      } while (nextIndex === currentIndex && attempts < 20);
      set({ currentItem: queue[nextIndex], currentTime: 0 });
    } else {
      const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
      set({ currentItem: queue[nextIndex], currentTime: 0 });
    }
  },
  playPrevious: () => {
    const { queue, currentItem } = get();
    if (queue.length === 0) return;
    const currentIndex = currentItem ? queue.findIndex((item) => item.id === currentItem.id) : -1;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    set({ currentItem: queue[prevIndex], currentTime: 0 });
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
}));
