import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "../data/movies";
import MovieCard from "./MovieCard";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

export default function MovieRow({ title, movies, onPlay, onInfo }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (!scrollRef.current) return;
      const scrollAmount = scrollRef.current.clientWidth * 0.85;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(updateScrollState, 400);
    },
    [updateScrollState]
  );

  if (movies.length === 0) return null;

  return (
    <section className="mb-8 md:mb-12 group/row" aria-label={title}>
      {title && (
        <div className="flex items-center justify-between px-4 md:px-12 mb-3">
          <h2 className="font-headline text-base md:text-xl font-bold tracking-tight text-white">{title}</h2>
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors opacity-0 group-hover/row:opacity-100 focus-ring rounded px-2 py-1"
              aria-label={`See more ${title}`}
            >
              Explore All
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <div
        className="relative group"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            scroll("right");
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            scroll("left");
          }
        }}
      >
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 md:w-14 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-ring"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 md:gap-3 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory px-4 md:px-12 pb-4"
          role="list"
          aria-label={`${title} carousel`}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="snap-start flex-shrink-0" role="listitem">
              <MovieCard movie={movie} onPlay={onPlay} onInfo={onInfo} />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-14 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-ring"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}

        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-12 md:w-16 pointer-events-none bg-gradient-to-r from-background to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-4 w-12 md:w-16 pointer-events-none bg-gradient-to-l from-background to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </section>
  );
}
