import { useMemo } from "react";
import { useMusic } from "../context/MusicContext";
import SongCard from "../components/SongCard";

export default function MusicLibrary() {
  const { songs } = useMusic();

  const rows = useMemo(() => {
    const map: Record<string, typeof songs> = {};
    songs.forEach((s) => {
      const cat = s.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return Object.entries(map).map(([cat, list]) => ({ title: cat, songs: list }));
  }, [songs]);

  return (
    <main className="relative min-h-screen pt-24 pb-20 px-4 md:px-12">
      <h1 className="text-2xl md:text-4xl font-black text-white mb-8">Music Library</h1>
      {songs.length === 0 ? (
        <p className="text-neutral-500 text-center py-20">No songs available.</p>
      ) : (
        rows.map((row) => (
          <section key={row.title} className="mb-10" aria-label={row.title}>
            <h2 className="text-lg font-bold text-white mb-4">{row.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {row.songs.map((song) => (
                <SongCard key={song.id} song={song} list={row.songs} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
