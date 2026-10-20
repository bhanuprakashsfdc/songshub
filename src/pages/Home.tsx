import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Banner from "../components/Banner";
import MovieRow from "../components/MovieRow";
import FeaturedGrid from "../components/FeaturedGrid";
import FullPlayer from "../components/FullPlayer";
import DetailModal from "../components/DetailModal";
import LoadingSpinner from "../components/LoadingSpinner";
import SongCard from "../components/SongCard";
import SongRow from "../components/SongRow";
import { Movie } from "../data/movies";
import { getContinueWatchingMovies, saveWatchProgress, getWatchHistory } from "../utils/watchHistory";
import { useMovies } from "../context/MovieContext";
import { useMusic } from "../context/MusicContext";
import { Play, Music, Search, ListMusic, Shuffle } from "lucide-react";

function shuffleArray<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MusicHomeView() {
  const { songs, playSong, setShowQueue, shuffle, toggleShuffle, reshuffleQueue } = useMusic();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [featuredSongs, setFeaturedSongs] = useState<Movie[]>([]);
  const songsLengthRef = useRef(0);

  useEffect(() => {
    if (songs.length > 0 && songsLengthRef.current === 0) {
      songsLengthRef.current = songs.length;
      setFeaturedSongs(shuffleArray(songs).slice(0, 10));
    }
  }, [songs.length]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    songs.forEach((s) => { if (s.category) cats.add(s.category); });
    return ["all", ...Array.from(cats)];
  }, [songs]);

  const filtered = useMemo(() => {
    let r = songs;
    if (activeCat !== "all") r = r.filter((s) => s.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((s) => s.title.toLowerCase().includes(q) || (s.cast && s.cast.some((c) => c.toLowerCase().includes(q))));
    }
    return r;
  }, [songs, activeCat, search]);

  const rows = useMemo(() => {
    const map: Record<string, Movie[]> = {};
    songs.forEach((s) => {
      const cat = s.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, list]) => ({ title: cat, songs: list }));
  }, [songs]);

  const handlePlayAll = () => {
    if (filtered.length > 0) playSong(filtered[0], filtered);
  };

  return (
    <div className="min-h-screen pb-40">
      <div className="relative h-[40vh] md:h-[45vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30 mb-6">
            <Music className="w-10 h-10 md:w-14 md:h-14 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Music Mode</h1>
          <p className="text-neutral-400 text-sm md:text-base mb-6">{songs.length} songs available</p>
          <div className="w-full max-w-md flex items-center gap-2 bg-white/10 backdrop-blur border border-white/10 rounded-xl px-4 py-3 focus-within:border-primary/50 transition-colors">
            <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white placeholder:text-neutral-500 outline-none w-full text-sm"
            />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 flex gap-2 overflow-x-auto hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeCat === cat ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"
            }`}
          >
            {cat === "all" ? "All Songs" : cat}
          </button>
        ))}
      </div>

      {filtered.length > 0 && (
        <div className="px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handlePlayAll} className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center hover:bg-accent hover:scale-105 transition-all shadow-lg shadow-primary/30" aria-label="Play all">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
            <div>
              <p className="text-white font-bold">{filtered.length} songs</p>
              <p className="text-xs text-neutral-500">{activeCat === "all" ? "All categories" : activeCat}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (shuffle ? reshuffleQueue() : toggleShuffle())}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                shuffle ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
              }`}
              aria-label={shuffle ? "Get fresh songs" : "Enable shuffle"}
              aria-pressed={shuffle}
              title={shuffle ? "Click for new songs" : "Enable shuffle"}
            >
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
            <button onClick={() => setShowQueue(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors text-sm">
              <ListMusic className="w-4 h-4" /> Queue
            </button>
          </div>
        </div>
      )}

      {!search.trim() && featuredSongs.length > 0 && (
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Trending Now</h2>
            <button
              onClick={() => setFeaturedSongs(shuffleArray(songs).slice(0, 10))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
              aria-label="Refresh trending songs"
            >
              <Shuffle className="w-3 h-3" />
              Refresh
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {featuredSongs.map((song) => (
              <SongCard key={song.id} song={song} list={featuredSongs} />
            ))}
          </div>
        </div>
      )}

      {search.trim() && (
        <div className="px-4 md:px-8 mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Search Results</h2>
          {filtered.length === 0 ? (
            <p className="text-neutral-500 text-sm py-8 text-center">No songs found for "{search}"</p>
          ) : (
            <div className="space-y-0.5">
              {filtered.slice(0, 30).map((song, i) => (
                <SongRow key={song.id} song={song} index={i} list={filtered} />
              ))}
            </div>
          )}
        </div>
      )}

      {!search.trim() && (
        <div className="space-y-6">
          {rows.map((row) => (
            <div key={row.title}>
              <h2 className="px-4 md:px-8 text-lg font-bold text-white mb-3">{row.title}</h2>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 md:px-8 pb-2">
                {row.songs.map((song) => (
                  <SongCard key={song.id} song={song} list={row.songs} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoHomeView() {
  const { movies, loading } = useMovies();
  const { songs: songList } = useMusic();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<Movie | null>(null);
  const [continueWatching, setContinueWatching] = useState<(Movie & { progress: number })[]>([]);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (!loading && movies.length > 0) {
      setContinueWatching(getContinueWatchingMovies(movies));
      const history = getWatchHistory();
      if (history.length > 0) {
        const lastWatched = movies.find((m) => m.id === history[0].movieId);
        setHeroMovie(lastWatched || movies[0]);
      } else {
        setHeroMovie(movies[0]);
      }
    }
  }, [loading, movies]);

  const rows = useMemo(() => {
    if (movies.length === 0) return [];
    const trending = movies.filter((m) => m.category === "Trending Now");
    const action = movies.filter((m) => m.category === "Action Movies");
    const topRated = movies.filter((m) => m.category === "Top Rated");
    const newPopular = [...movies].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    const songs = movies.filter((m) => {
      const t = (m.type || "").toLowerCase();
      return t.includes("song") || t.includes("music");
    });
    const tvShows = movies.filter((m) => {
      const t = (m.type || "").toLowerCase();
      return t.includes("tv") || t.includes("show");
    });
    const movieType = movies.filter((m) => {
      const t = (m.type || "").toLowerCase();
      return t === "movie" || t.includes("film");
    });
    const comedy = movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes("comedy")));
    const drama = movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes("drama")));
    const thriller = movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes("thriller")));
    return [
      { title: "Trending Now", movies: trending },
      { title: "Top Rated", movies: topRated },
      { title: "Action Movies", movies: action },
      { title: "New & Popular", movies: newPopular.slice(0, 15) },
      { title: "Comedy", movies: comedy },
      { title: "Drama", movies: drama },
      { title: "Thriller", movies: thriller },
      { title: "Songs", movies: songs },
      { title: "TV Shows", movies: tvShows },
      { title: "Movies", movies: movieType },
    ].filter((row) => row.movies.length > 0);
  }, [movies]);

  const featuredMovies = useMemo(() => movies.slice(0, 10), [movies]);
  const topRatedMovies = useMemo(() => [...movies].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 10), [movies]);

  const handlePlay = useCallback((movie: Movie) => {
    setHeroMovie(movie);
    saveWatchProgress(movie.id, 0);
    setSelectedMovie(movie);
    setSelectedMovieForDetail(null);
  }, []);

  const handleInfo = useCallback((movie: Movie) => setSelectedMovieForDetail(movie), []);

  const handleVideoEnd = useCallback((currentMovie: Movie) => {
    saveWatchProgress(currentMovie.id, 100);

    const currentIndex = movies.findIndex((m) => m.id === currentMovie.id);
    if (currentIndex >= 0 && currentIndex < movies.length - 1) {
      const nextMovie = movies[currentIndex + 1];
      setSelectedMovie(nextMovie);
      saveWatchProgress(nextMovie.id, 0);
      return;
    }

    if (songList.length > 0) {
      const randomSong = songList[Math.floor(Math.random() * songList.length)];
      setSelectedMovie(randomSong);
      saveWatchProgress(randomSong.id, 0);
    }
  }, [movies, songList]);

  const handlePlayerClose = useCallback(() => {
    setSelectedMovie(null);
    setContinueWatching(getContinueWatchingMovies(movies));
  }, [movies]);

  if (loading) return <LoadingSpinner />;

  return (
    <main id="main-content" className="relative pb-20 md:pb-24">
      {movies.length > 0 && heroMovie && <Banner movie={heroMovie} onPlay={handlePlay} onInfo={handleInfo} />}
      <div className="relative -mt-16 md:-mt-24 z-10 space-y-2 md:space-y-4">
        {continueWatching.length > 0 && (
          <MovieRow title="Continue Watching" movies={continueWatching} onPlay={handlePlay} onInfo={handleInfo} />
        )}
        {movies.filter((m) => m.isTop10).length > 0 && (
          <FeaturedGrid title="Top 10 TV Shows Today" movies={movies.filter((m) => m.isTop10)} onPlay={handlePlay} onInfo={handleInfo} />
        )}
        <FeaturedGrid title="Featured Today" movies={featuredMovies} onPlay={handlePlay} onInfo={handleInfo} />
        <FeaturedGrid title="Top Recommendations for You" movies={topRatedMovies} onPlay={handlePlay} onInfo={handleInfo} />
        {rows.map((row) => (
          <MovieRow key={row.title} title={row.title} movies={row.movies} onPlay={handlePlay} onInfo={handleInfo} />
        ))}
      </div>
      <FullPlayer movie={selectedMovie} onClose={handlePlayerClose} onVideoEnd={handleVideoEnd} />
      <DetailModal movie={selectedMovieForDetail} onClose={() => setSelectedMovieForDetail(null)} onPlay={handlePlay} />
    </main>
  );
}

export default function Home() {
  const { isMusicMode } = useMusic();
  if (isMusicMode) return <MusicHomeView />;
  return <VideoHomeView />;
}
