import { create } from "zustand";
import { Movie } from "@/data/movies";
import { ContentFilters } from "@/lib/content";

export interface ContentStore {
  filters: ContentFilters;
  filteredContent: Movie[];
  isLoading: boolean;
  setFilter: (key: keyof ContentFilters, value: string) => void;
  resetFilters: () => void;
  setFilteredContent: (items: Movie[]) => void;
  setLoading: (loading: boolean) => void;
}

const DEFAULT_FILTERS: ContentFilters = {
  type: "All",
  language: "All",
  mediaFormat: "All",
  search: "",
};

export const useContentStore = create<ContentStore>((set) => ({
  filters: DEFAULT_FILTERS,
  filteredContent: [],
  isLoading: true,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () =>
    set({
      filters: DEFAULT_FILTERS,
    }),
  setFilteredContent: (items) => set({ filteredContent: items }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
