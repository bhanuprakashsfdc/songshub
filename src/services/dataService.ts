import Papa from 'papaparse';
import { Movie } from '../data/movies';

const SPREADSHEET_ID = '1rasahcNkL9ibMkQ2rhjIZ5-nxbNd2RU8SJ0-kWAdbo8';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;

const SHEET_CONFIGS = {
  movies: { sheet: 'Music', defaultType: 'Movie' },
  songs: { sheet: 'Songs', defaultType: 'Song' },
} as const;

type SheetType = keyof typeof SHEET_CONFIGS;

interface RawRow {
  [key: string]: string;
}

function normalizeYoutubeUrl(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function parseMovieRow(row: RawRow, defaultType: string): Movie {
  return {
    id: String(row['ID'] || Math.random()),
    title: row['Title'] || 'Untitled',
    description: row['Description'] || '',
    thumbnail: row['Thumbnail'] || '',
    bannerImage: row['Banner Image'] || row['Thumbnail'] || '',
    youtubeUrl: normalizeYoutubeUrl(row['YouTube URL'] || ''),
    videoUrl: row['Video URL'] || '',
    category: row['Category'] || '',
    type: row['Type'] || defaultType,
    year: String(row['Year'] || ''),
    rating: row['Rating'] || '',
    duration: row['Duration'] || '',
    matchScore: row['Match Score'] || '',
    isTop10: row['Is Top 10']?.toUpperCase() === 'TRUE',
    genres: row['Genres'] ? row['Genres'].split(',').map((g: string) => g.trim()) : [],
    cast: row['Cast'] ? row['Cast'].split(',').map((c: string) => c.trim()) : [],
    language: row['Language'] || '',
    director: row['Director'] || '',
  };
}

async function fetchSheet(type: SheetType): Promise<Movie[]> {
  const config = SHEET_CONFIGS[type];
  const url = `${BASE_URL}&sheet=${encodeURIComponent(config.sheet)}`;

  try {
    const response = await fetch(url);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const items: Movie[] = (results.data as RawRow[]).map((row) => parseMovieRow(row, config.defaultType));
          resolve(items);
        },
        error: (error: any) => reject(error),
      });
    });
  } catch (error) {
    console.error(`Error fetching ${type} from spreadsheet:`, error);
    return [];
  }
}

export async function fetchMoviesFromSpreadsheet(): Promise<Movie[]> {
  return fetchSheet('movies');
}

export async function fetchSongsFromSpreadsheet(): Promise<Movie[]> {
  return fetchSheet('songs');
}

export async function fetchAllContent(): Promise<Movie[]> {
  const [movies, songs] = await Promise.all([fetchSheet('movies'), fetchSheet('songs')]);
  return [...movies, ...songs];
}

export interface Profile {
  id: string;
  name: string;
  image: string;
}

export async function fetchProfiles(): Promise<Profile[]> {
  return [
    { id: 'user1', name: 'User 1', image: 'https://picsum.photos/seed/user1/200/200' },
    { id: 'user2', name: 'User 2', image: 'https://picsum.photos/seed/user2/200/200' },
    { id: 'user3', name: 'Kids', image: 'https://picsum.photos/seed/kids/200/200' },
    { id: 'user4', name: 'Guest', image: 'https://picsum.photos/seed/guest/200/200' },
  ];
}
