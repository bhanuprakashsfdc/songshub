import { useMemo, useState, useEffect } from "react";
import { useMovies } from "@/context/MovieContext";
import { PaginatedGrid } from "@/components/dashboard/InfiniteScrollFeed";
import { ContentGridTile } from "@/components/dashboard/ContentGridTile";
import { LanguageFilter } from "@/components/dashboard/LanguageFilter";
import { Movie } from "@/data/movies";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Movies() {
  const { movies, loading } = useMovies();
  const [language, setLanguage] = useState("All");
  const [shuffledMovies, setShuffledMovies] = useState<Movie[]>([]);

  const baseMovies = useMemo(() => {
    return movies.filter((m) => {
      const isMovie = (m.type || "").toLowerCase() === "movie";
      const hasComedy = m.genres.some((g) => g.toLowerCase().includes("comedy"));
      return isMovie && !hasComedy;
    });
  }, [movies]);

  const filtered = useMemo(() => {
    if (language === "All") return baseMovies;
    return baseMovies.filter((m) => (m.language || "") === language);
  }, [baseMovies, language]);

  useEffect(() => {
    setShuffledMovies(shuffleArray(filtered));
  }, [filtered]);

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-3 md:gap-4 px-4 md:px-8">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (shuffledMovies.length === 0) {
    return (
      <main className="relative min-h-screen pt-24 pb-20">
        <div className="flex items-center justify-between gap-4 px-4 md:px-8 mb-6">
          <h1 className="text-2xl md:text-4xl font-black text-white">Movies</h1>
          <LanguageFilter items={baseMovies} value={language} onChange={setLanguage} />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-6xl mb-4">🎬</p>
          <h3 className="text-xl font-semibold mb-2 text-white">No movies found</h3>
          <p className="text-neutral-400">Try adjusting your filters or search query</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pt-24 pb-20">
      <div className="flex items-center justify-between gap-4 px-4 md:px-8 mb-6">
        <h1 className="text-2xl md:text-4xl font-black text-white">Movies</h1>
        <LanguageFilter items={baseMovies} value={language} onChange={setLanguage} />
      </div>
      <PaginatedGrid
        items={shuffledMovies}
        pageSize={28}
        columns={7}
        renderItem={(item) => <ContentGridTile key={item.id} item={item} list={shuffledMovies} />}
      />
    </main>
  );
}
