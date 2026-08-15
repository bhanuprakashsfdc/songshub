"use client";

import { useContentStore } from "@/store/contentStore";
import { useMovies } from "@/context/MovieContext";
import { Button } from "@/components/ui/button";

export function FilterBar() {
  const { filters, setFilter, resetFilters } = useContentStore();
  const { movies } = useMovies();
  const languages = [...new Set(movies.map((c) => c.language || "").filter(Boolean))].sort();

  return (
    <div className="flex flex-wrap gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <select
        value={filters.type}
        onChange={(e) => setFilter("type", e.target.value)}
        className="px-4 py-2 border rounded-lg bg-background text-sm font-medium"
      >
        <option value="All">All Content</option>
        <option value="Movie">Movies</option>
        <option value="Song">Songs</option>
      </select>

      <select
        value={filters.language}
        onChange={(e) => setFilter("language", e.target.value)}
        className="px-4 py-2 border rounded-lg bg-background text-sm font-medium"
      >
        <option value="All">All Languages</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>

      {filters.type === "Song" && (
        <select
          value={filters.mediaFormat}
          onChange={(e) => setFilter("mediaFormat", e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background text-sm font-medium"
        >
          <option value="All">All Songs</option>
          <option value="VideoSong">Video Songs</option>
          <option value="AudioSong">Audio Songs</option>
        </select>
      )}

      <input
        type="text"
        placeholder="Search movies, songs, actors..."
        value={filters.search}
        onChange={(e) => setFilter("search", e.target.value)}
        className="px-4 py-2 border rounded-lg bg-background text-sm flex-1 min-w-[200px]"
      />

      <Button variant="outline" size="sm" onClick={resetFilters}>
        Reset
      </Button>
    </div>
  );
}
