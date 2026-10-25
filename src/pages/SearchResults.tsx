import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { X, Search as SearchIcon, Play } from "lucide-react";
import FullPlayer from "../components/FullPlayer";
import DetailModal from "../components/DetailModal";
import { useMovies } from "../context/MovieContext";
import { Movie } from "../data/movies";
import { useToast } from "@/components/ui/toast";

const RECENT_SEARCHES_KEY = "songshub_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    let recent = getRecentSearches();
    recent = recent.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    recent.unshift(trimmed);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // localStorage unavailable
  }
}

function removeRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // localStorage unavailable
  }
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const q = query.trim();
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(re);
  return parts.map((part, i) => {
    if (part.toLowerCase() === q.toLowerCase()) {
      return (
        <mark key={i} className="bg-primary text-black px-0.5 rounded font-bold">
          {part}
        </mark>
      );
    }
    return part;
  });
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const { movies } = useMovies();
  const { toast } = useToast();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<Movie | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    if (query.trim()) {
      addRecentSearch(query);
      setRecentSearches(getRecentSearches());
    }
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return movies.filter((m) => {
      const searchable = [m.title, ...m.genres, ...(m.cast || []), m.director || "", m.category || ""].join(" ").toLowerCase();
      return searchable.includes(q);
    });
  }, [query, movies]);

  const handlePlay = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setSelectedMovieForDetail(null);
  }, []);

  const handlePlayerClose = useCallback(() => {
    setSelectedMovie(null);
  }, []);
  const handleSelectRecent = useCallback(
    (q: string) => {
      setQuery(q);
    },
    [setQuery]
  );

  const handleRemoveRecent = useCallback(
    (q: string, e: React.MouseEvent) => {
      e.stopPropagation();
      removeRecentSearch(q);
      setRecentSearches(getRecentSearches());
      toast({
        title: "Removed from recent searches",
        description: q,
        duration: 3000,
      });
    },
    [toast]
  );

  const handleClearRecent = useCallback(() => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
    setRecentSearches([]);
    toast({
      title: "Recent searches cleared",
      duration: 3000,
    });
  }, [toast]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addRecentSearch(query);
      setRecentSearches(getRecentSearches());
    }
  };

  return (
    <main className="relative min-h-screen pt-24 pb-20 px-4 md:px-12">
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" aria-hidden="true" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search movies, songs, actors..."
            className="pl-10 pr-4 py-3 rounded-xl bg-background border border-white/10 text-white text-base placeholder-neutral-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring w-full"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white focus-ring rounded"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {query.trim() ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white">
                Results for “{query}”
              </h1>
              <p className="text-neutral-400">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <button
              onClick={() => setQuery("")}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-white focus-ring rounded-md"
            >
              Clear
            </button>
          </div>
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-neutral-500 mb-4">No matches found for “{query}”.</p>
              <a
                href="/"
                className="px-6 py-2.5 bg-primary text-white rounded-md font-bold hover:bg-accent transition-colors focus-ring"
              >
                Browse Content
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handlePlay(movie)}
                  className="group flex flex-col gap-2"
                  aria-label={`Play ${movie.title}`}
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                    <img
                      src={movie.thumbnail || `/placeholders/movie-01.svg`}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `/placeholders/movie-01.svg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white line-clamp-2">
                    {highlightMatch(movie.title, query)}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.rating}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-2">Search</h1>
          <p className="text-neutral-400 mb-8">
            Search for movies, songs, actors, genres, or categories.
          </p>

          {recentSearches.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
                  Recent searches
                </h2>
                <button
                  onClick={handleClearRecent}
                  className="text-xs text-neutral-500 hover:text-white focus-ring underline"
                  aria-label="Clear recent searches"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {recentSearches.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSelectRecent(q)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-colors focus-ring"
                  >
                    <SearchIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    {q}
                    <button
                      onClick={(e) => handleRemoveRecent(q, e)}
                      className="ml-2 p-1 text-neutral-500 hover:text-white focus-ring rounded"
                      aria-label={`Remove “${q}” from recent searches`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      <FullPlayer movie={selectedMovie} onClose={handlePlayerClose} />
      <DetailModal movie={selectedMovieForDetail} onClose={() => setSelectedMovieForDetail(null)} onPlay={handlePlay} />
    </main>
  );
}