import { Play, Pause, SkipForward } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { Movie } from "@/data/movies";

interface SongRowProps {
  song: Movie;
  index: number;
  list: Movie[];
}

export default function SongRow({ song, index, list }: SongRowProps) {
  const { currentSong, isPlaying, playSong, addToQueue } = useMusic();
  const active = currentSong?.id === song.id;
  const playing = active && isPlaying;

  return (
    <div
      onClick={() => playSong(song, list)}
      className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
        active ? "bg-primary/10" : "hover:bg-neutral-800/60"
      }`}
    >
      <div className="w-8 text-center flex-shrink-0">
        {playing ? (
          <div className="flex items-end justify-center gap-0.5 h-5">
            <div className="w-0.5 bg-primary rounded-full animate-[equalizer1_0.5s_ease-in-out_infinite]" />
            <div className="w-0.5 bg-primary rounded-full animate-[equalizer2_0.6s_ease-in-out_infinite]" />
            <div className="w-0.5 bg-primary rounded-full animate-[equalizer3_0.4s_ease-in-out_infinite]" />
          </div>
        ) : active ? (
          <Pause className="w-4 h-4 text-primary mx-auto" />
        ) : (
          <>
            <span className="text-sm text-neutral-500 group-hover:hidden">{index + 1}</span>
            <Play className="w-4 h-4 text-white mx-auto hidden group-hover:block" />
          </>
        )}
      </div>
      <div className="w-16 aspect-video rounded-lg overflow-hidden flex-shrink-0">
        <img src={song.thumbnail || `/placeholders/song-01.svg`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => {
          (e.target as HTMLImageElement).src = `/placeholders/song-01.svg`;
        }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${active ? "text-primary" : "text-white"}`}>{song.title}</p>
        <p className="text-xs text-neutral-500 truncate">{song.cast?.slice(0, 2).join(", ") || song.category}</p>
      </div>
      <span className="text-xs text-neutral-600 tabular-nums">{song.duration}</span>
      <button
        onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
        className="p-2 text-neutral-600 hover:text-primary opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-primary/10"
        aria-label="Add to queue"
      >
        <SkipForward className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
