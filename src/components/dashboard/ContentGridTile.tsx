"use client";

import { Movie } from "@/data/movies";
import { usePlayerStore } from "@/store/playerStore";
import { useNavigate } from "react-router-dom";
import { Play, Star } from "lucide-react";

interface ContentGridTileProps {
  item: Movie;
  aspectRatio?: string;
}

export function ContentGridTile({ item, aspectRatio = "aspect-video" }: ContentGridTileProps) {
  const { setCurrentItem } = usePlayerStore();
  const navigate = useNavigate();

  const handleClick = () => {
    setCurrentItem(item);
    navigate("/player");
  };

  return (
    <div
      className={`group relative ${aspectRatio} rounded-lg overflow-hidden bg-muted cursor-pointer transition-all hover:scale-105 hover:shadow-xl`}
      onClick={handleClick}
    >
      <img
        src={item.thumbnail || `/placeholders/movie-01.svg`}
        alt={item.title}
        className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `/placeholders/movie-01.svg`;
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
          <h3 className="text-white font-semibold text-xs md:text-sm line-clamp-2">{item.title}</h3>
          <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs text-gray-300">
            <span>{item.year}</span>
            <span>•</span>
            <span>{item.language}</span>
            {item.isTop10 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3 h-3 fill-current" />
                  Top 10
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white ml-0.5" />
        </div>
      </div>

      {item.isTop10 && (
        <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
          TOP 10
        </div>
      )}
    </div>
  );
}
