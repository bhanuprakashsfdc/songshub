import { create } from "zustand";
import { Movie } from "@/data/movies";

export interface PlayerStore {
  currentItem: Movie | null;
  queue: Movie[];
  autoMode: boolean;
  isPlaying: boolean;
  currentTime: number;
  setCurrentItem: (item: Movie) => void;
  setQueue: (items: Movie[]) => void;
  toggleAutoMode: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentItem: null,
  queue: [],
  autoMode: false,
  isPlaying: false,
  currentTime: 0,
  setCurrentItem: (item) => set({ currentItem: item, isPlaying: true, currentTime: 0 }),
  setQueue: (items) => set({ queue: items }),
  toggleAutoMode: () => set((state) => ({ autoMode: !state.autoMode })),
  playNext: () => {
    const { queue, currentItem } = get();
    if (!currentItem || queue.length === 0) return;
    const currentIndex = queue.findIndex((item) => item.id === currentItem.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    set({ currentItem: queue[nextIndex], currentTime: 0 });
  },
  playPrevious: () => {
    const { queue, currentItem } = get();
    if (!currentItem || queue.length === 0) return;
    const currentIndex = queue.findIndex((item) => item.id === currentItem.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    set({ currentItem: queue[prevIndex], currentTime: 0 });
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
}));
