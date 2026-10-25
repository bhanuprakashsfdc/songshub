"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useContentStore } from "@/store/contentStore";
import { useMovies } from "@/context/MovieContext";
import { Button } from "@/components/ui/button";
import { X, Search as SearchIcon, Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterBar() {
  const { filters, setFilter, resetFilters } = useContentStore();
  const { movies } = useMovies();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const languages = [...new Set(movies.map((c) => c.language || "").filter(Boolean))].sort();

  const hasActiveFilters =
    filters.type !== "All" ||
    filters.language !== "All" ||
    filters.mediaFormat !== "All" ||
    filters.search.length > 0;

  const debouncedSetSearch = useCallback(
    (value: string) => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      setFilter("search", value);
      searchDebounceRef.current = setTimeout(() => {
        // Commit complete; downstream consumers react to the store value.
      }, 300);
    },
    [setFilter]
  );

  useEffect(() => {
    debouncedSetSearch(filters.search);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [filters.search, debouncedSetSearch]);

  const removeFilter = useCallback((key: "type" | "language" | "mediaFormat") => {
    setFilter(key, "All");
  }, [setFilter]);

  const pill = (label: string, onRemove: () => void) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-colors focus-ring"
      aria-label={`Remove ${label} filter`}
    >
      <span>{label}</span>
      <X className="w-3 h-3" />
    </button>
  );

  const selectPill = (
    value: string,
    label: string,
    options: { value: string; label: string }[],
    key: "type" | "language" | "mediaFormat"
  ) => {
    const active = options.find((o) => o.value === value);
    return (
      <div className="relative inline-block">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPanelOpen(!panelOpen);
          }}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-xs font-medium text-neutral-300 hover:bg-white/10 transition-colors focus-ring min-w-[110px]",
            value !== "All" ? "bg-primary/10 text-white border-white/20" : ""
          )}
          aria-expanded={panelOpen}
          aria-label={`${label} filter, currently ${active?.label || value}`}
        >
          <span className="truncate max-w-[120px]">{active?.label || value}</span>
          {value !== "All" && <X className="w-3 h-3" />}
          <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400", panelOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute z-10 mt-1.5 w-48 rounded-xl border border-white/10 bg-background/95 backdrop-blur-md shadow-2xl p-1"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter(key, opt.value);
                    setPanelOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                    value === opt.value
                      ? "bg-primary text-white"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {opt.label}
                  {value === opt.value && (
                    <CheckIcon className="ml-auto w-4 h-4" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20">
      <div className="flex items-center justify-between px-4 md:px-8 py-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" aria-hidden="true" />
          <span className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
            Filters
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-neutral-400 hover:text-white focus-ring rounded-md"
          aria-label={mobileOpen ? "Hide filters" : "Show filters"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden transition-all"
          >
            <div className="px-4 md:px-8 pb-4">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                {selectPill(
                  filters.type,
                  "Content type",
                  [
                    { value: "All", label: "All Content" },
                    { value: "Movie", label: "Movies" },
                    { value: "Song", label: "Songs" },
                  ],
                  "type"
                )}
                {selectPill(
                  filters.language,
                  "Language",
                  [{ value: "All", label: "All Languages" }, ...languages.map((l) => ({ value: l, label: l }))],
                  "language"
                )}
                {filters.type === "Song" && (
                  selectPill(
                    filters.mediaFormat,
                    "Media format",
                    [
                      { value: "All", label: "All Songs" },
                      { value: "VideoSong", label: "Video Songs" },
                      { value: "AudioSong", label: "Audio Songs" },
                    ],
                    "mediaFormat"
                  )
                )}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {filters.type !== "All" && pill(filters.type, () => removeFilter("type"))}
                    {filters.language !== "All" && pill(filters.language, () => removeFilter("language"))}
                    {filters.mediaFormat !== "All" &&
                      filters.type === "Song" && pill(filters.mediaFormat, () => removeFilter("mediaFormat"))}
                    {filters.search.length > 0 && (
                      pill(`“${filters.search}”`, () => setFilter("search", ""))
                    )}
                  </div>
                )}
              </div>

              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search movies, songs, actors..."
                  value={filters.search}
                  onChange={(e) => debouncedSetSearch(e.target.value)}
                  className="px-4 py-2 pl-10 rounded-xl bg-background border border-white/10 text-sm font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring w-full md:w-96"
                />
                {filters.search.length > 0 && (
                  <button
                    onClick={() => setFilter("search", "")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white focus-ring rounded"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear all
                </Button>
                {hasActiveFilters && (
                  <span className="text-xs text-neutral-500">
                    {Object.values(filters).filter((v) => v && v !== "All").length} active
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="hidden md:flex items-center justify-between gap-4 px-8 py-2.5">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {selectPill(
              filters.type,
              "Content type",
              [
                { value: "All", label: "All" },
                { value: "Movie", label: "Movies" },
                { value: "Song", label: "Songs" },
              ],
              "type"
            )}
            {selectPill(
              filters.language,
              "Language",
              [{ value: "All", label: "All" }, ...languages.map((l) => ({ value: l, label: l }))],
              "language"
            )}
          </div>
          {filters.type === "Song" && (
            selectPill(
              filters.mediaFormat,
              "Format",
              [
                { value: "All", label: "All" },
                { value: "VideoSong", label: "Video" },
                { value: "AudioSong", label: "Audio" },
              ],
              "mediaFormat"
            )
          )}
          <div className="relative w-48">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => debouncedSetSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-background border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-primary w-full"
            />
          </div>
          <Button variant="outline" size="sm" onClick={resetFilters} className="px-2 py-1.5 text-xs">
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
