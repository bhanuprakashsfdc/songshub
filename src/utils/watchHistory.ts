import { Movie } from '../data/movies';

const WATCH_HISTORY_KEY = 'songshub_watch_history';
const MY_LIST_KEY = 'songshub_my_list';

export function getWatchHistory(): { movieId: string; progress: number; timestamp: number }[] {
  try {
    const data = localStorage.getItem(WATCH_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWatchProgress(movieId: string, progress: number) {
  const history = getWatchHistory();
  const existing = history.findIndex(h => h.movieId === movieId);
  const entry = { movieId, progress, timestamp: Date.now() };
  
  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.push(entry);
  }
  
  localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
}

export function getContinueWatchingMovies(movies: Movie[]): (Movie & { progress: number })[] {
  const history = getWatchHistory();
  return history
    .filter((h) => h.progress > 0 && h.progress < 100)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((h) => movies.find((m) => m.id === h.movieId))
    .filter((m): m is Movie => m !== undefined)
    .map((m) => ({ ...m, progress: history.find((h) => h.movieId === m.id)!.progress }))
    .slice(0, 10);
}

export function isInMyList(movieId: string): boolean {
  try {
    const list = JSON.parse(localStorage.getItem(MY_LIST_KEY) || '[]');
    return list.includes(movieId);
  } catch {
    return false;
  }
}

export function addToMyList(movieId: string) {
  try {
    const list = JSON.parse(localStorage.getItem(MY_LIST_KEY) || '[]');
    if (!list.includes(movieId)) {
      list.push(movieId);
      localStorage.setItem(MY_LIST_KEY, JSON.stringify(list));
    }
  } catch {
    // localStorage unavailable
  }
}

export function removeFromMyList(movieId: string) {
  try {
    const list = JSON.parse(localStorage.getItem(MY_LIST_KEY) || '[]');
    const filtered = list.filter((id: string) => id !== movieId);
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(filtered));
  } catch {
    // localStorage unavailable
  }
}
