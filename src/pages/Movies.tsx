import { useMemo } from "react";
import { useMovies } from "@/context/MovieContext";
import { PaginatedGrid } from "@/components/dashboard/InfiniteScrollFeed";
import { ContentGridTile } from "@/components/dashboard/ContentGridTile";

export default function Movies() {
  const { movies, loading } = useMovies();

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const isMovie = (m.type || "").toLowerCase() === "movie";
      const isTelugu = (m.language || "").toLowerCase() === "telugu";
      const hasComedy = m.genres.some((g) => g.toLowerCase().includes("comedy"));
      return isMovie && isTelugu && !hasComedy;
    });
  }, [movies]);

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-3 md:gap-4 px-4 md:px-8">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-6xl mb-4">🎬</p>
        <h3 className="text-xl font-semibold mb-2 text-white">No Telugu movies found</h3>
        <p className="text-neutral-400">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <PaginatedGrid
      items={filtered}
      pageSize={28}
      columns={7}
      renderItem={(item) => <ContentGridTile key={item.id} item={item} />}
    />
  );
}
