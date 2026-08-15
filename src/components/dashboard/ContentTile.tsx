"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ContentItem } from "@/lib/content";
import { usePlayerStore } from "@/store/playerStore";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

interface ContentTileProps {
  item: ContentItem;
}

export function ContentTile({ item }: ContentTileProps) {
  const { setCurrentItem } = usePlayerStore();
  const navigate = useNavigate();

  const handleClick = () => {
    setCurrentItem(item);
    navigate("/player");
  };

  return (
    <div
      className="group relative flex gap-4 p-4 rounded-xl bg-surface-container/50 hover:bg-surface-container-high transition-colors cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative w-40 md:w-56 aspect-video flex-shrink-0 rounded-lg overflow-hidden">
        <img
          src={item.thumbnail || `/placeholders/movie-01.svg`}
          alt={item.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `/placeholders/movie-01.svg`;
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        {item.isTop10 && (
          <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
            TOP 10
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-1">
        <h3 className="text-white font-semibold text-base md:text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-400">
          <span className="text-success font-bold">{item.matchScore}</span>
          <span>{item.year}</span>
          <span className="border border-neutral-600 px-1 rounded text-[10px] font-bold text-neutral-300">
            {item.rating}
          </span>
          <span>{item.duration}</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">{item.language}</span>
        </div>
        {item.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.genres.slice(0, 4).map((genre) => (
              <span key={genre} className="text-[11px] text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface InfiniteScrollFeedProps {
  items: ContentItem[];
  batchSize?: number;
  renderItem: (item: ContentItem) => React.ReactNode;
}

export function InfiniteScrollFeed({ items, batchSize = 10, renderItem }: InfiniteScrollFeedProps) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, batchSize, items.length]);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pb-20">
      <div className="space-y-2">
        {visibleItems.map((item) => (
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
    </div>
  );
}
