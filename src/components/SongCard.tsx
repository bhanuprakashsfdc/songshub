import { Play } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { Movie } from "@/data/movies";

interface SongCardProps {
  song: Movie;
  list: Movie[];
}

export default function SongCard({ song, list }: SongCardProps) {
  const { currentSong, isPlaying, playSong } = useMusic();
  const active = currentSong?.id === song.id;

  return (
    <button onClick={() => playSong(song, list)} className="flex-none w-36 md:w-44 text-left group">
      <div className="relative aspect-video rounded-xl overflow-hidden mb-2 shadow-lg">
        <img src={song.thumbnail || `/placeholders/song-01.svg`} alt={song.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" onError={(e) => {
          (e.target as HTMLImageElement).src = `/placeholders/song-01.svg`;
        }} />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${active && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {active && isPlaying ? (
            <div className="flex items-end gap-0.5 h-6">
              <div className="w-1 bg-primary rounded-full animate-[equalizer1_0.5s_ease-in-out_infinite]" />
              <div className="w-1 bg-primary rounded-full animate-[equalizer2_0.6s_ease-in-out_infinite]" />
              <div className="w-1 bg-primary rounded-full animate-[equalizer3_0.4s_ease-in-out_infinite]" />
              <div className="w-1 bg-primary rounded-full animate-[equalizer4_0.7s_ease-in-out_infinite]" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-black fill-current ml-0.5" />
            </div>
          )}
        </div>
        {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
      </div>
      <p className={`text-sm font-medium truncate ${active ? "text-primary" : "text-white"}`}>{song.title}</p>
      <p className="text-xs text-neutral-500 truncate">{song.cast?.[0] || song.category}</p>
    </button>
  );
}
