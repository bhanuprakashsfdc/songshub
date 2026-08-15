"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Movie } from "@/data/movies";

function getRandomColumns(seed: number) {
  const options = [3, 4, 5, 6, 7];
  return options[seed % options.length];
}

interface PaginatedGridProps {
  items: Movie[];
  pageSize?: number;
  columns?: number;
  renderItem: (item: Movie) => React.ReactNode;
  randomize?: boolean;
}

export function PaginatedGrid({ items, pageSize = 28, columns = 7, renderItem, randomize = true }: PaginatedGridProps) {
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const seed = useMemo(() => (randomize ? Date.now() : 0), [randomize]);
  const gridColumns = useMemo(() => (randomize ? getRandomColumns(seed) : columns), [randomize, columns, seed]);

  const totalPages = Math.ceil(items.length / pageSize);
  const currentItems = items.slice(0, (page + 1) * pageSize);
  const hasMore = page < totalPages - 1;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoading(false);
    }, 400);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loadMore]);

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
  }[gridColumns] || "grid-cols-7";

  return (
    <div className="w-full">
      {items.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 text-sm">
          No content to display
        </div>
      ) : (
        <>
          <div className={`grid ${gridCols} gap-3 md:gap-4 px-4 md:px-8`}>
            {currentItems.map((item) => (
              <div key={item.id}>{renderItem(item)}</div>
            ))}
          </div>

          {hasMore && (
            <div ref={observerRef} className="flex items-center justify-center py-8">
              {isLoading ? (
                <div className="flex items-center gap-2 text-neutral-400">
                  <div className="w-5 h-5 border-2 border-neutral-600 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              ) : (
                <div className="h-8" />
              )}
            </div>
          )}

          {!hasMore && items.length > 0 && (
            <div className="text-center py-8 text-neutral-500 text-sm">
              You&apos;ve reached the end
            </div>
          )}
        </>
      )}
    </div>
  );
}
