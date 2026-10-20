export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  bannerImage: string;
  youtubeUrl: string;
  videoUrl: string;
  category: string;
  type: string;
  contentType?: string;
  year: string;
  rating: string;
  duration: string;
  matchScore: string;
  isTop10?: boolean;
  genres: string[];
  cast: string[];
  language?: string;
  director?: string;
  mediaFormat?: string | null;
  normalizedLanguage?: string;
  createdAt?: string;
  updatedAt?: string;
}
