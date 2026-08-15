import { Movie } from "@/data/movies";

export interface ContentItem extends Movie {
  contentType: string;
  videoId: string;
  normalizedLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFilters {
  type: "All" | "Movie" | "Song";
  language: string;
  mediaFormat: "All" | "VideoSong" | "AudioSong";
  search: string;
}
