import { Movie } from "@/data/movies";

export interface ContentFilters {
  type: "All" | "Movie" | "Song";
  language: string;
  mediaFormat: "All" | "VideoSong" | "AudioSong";
  search: string;
}

export function applyFilters(items: Movie[], filters: ContentFilters): Movie[] {
  return items.filter((item) => {
    if (filters.type !== "All") {
      const itemType = (item.type || "").toLowerCase();
      const filterType = filters.type.toLowerCase();
      if (!itemType.includes(filterType) && !itemType.includes("music")) return false;
    }
    if (filters.language !== "All" && (item.language || "") !== filters.language) return false;
    if (filters.type === "Song" && filters.mediaFormat !== "All" && (item.mediaFormat || "") !== filters.mediaFormat) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.cast.some((c) => c.toLowerCase().includes(searchLower)) ||
        item.genres.some((g) => g.toLowerCase().includes(searchLower)) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
}

export function sortByMatchScore(items: Movie[]): Movie[] {
  return [...items].sort((a, b) => {
    const scoreA = parseFloat(a.matchScore) || 0;
    const scoreB = parseFloat(b.matchScore) || 0;
    return scoreB - scoreA;
  });
}

export function sortByYear(items: Movie[]): Movie[] {
  return [...items].sort((a, b) => parseInt(b.year) - parseInt(a.year));
}

export function getAvailableLanguages(items: Movie[]): string[] {
  return [...new Set(items.map((item) => item.language || "").filter(Boolean))].sort();
}

export function getAvailableGenres(items: Movie[]): string[] {
  return [...new Set(items.flatMap((item) => item.genres))].sort();
}
