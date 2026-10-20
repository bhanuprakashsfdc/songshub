# SongShub — Media Streaming Platform
## Technical Architecture & Implementation Roadmap

---

## 1. System Overview

**Product Vision:** A high-scale, enterprise-grade media streaming platform delivering Movies and Songs via YouTube embeds, powered entirely by a Google Spreadsheet as the single source of truth (CMS).

**Core Principles:**
- Data-driven architecture: Zero hardcoded media assets
- Real-time synchronization between GSheet and client
- High-performance filtering and playback
- Seamless mode-switching between Movies and Songs
- Auto-continuous playback experience

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Next.js 14  │  │  React 18    │  │   Tailwind CSS v3    │ │
│  │  App Router  │  │  Server Comp │  │   shadcn/ui          │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘ │
│         │                 │                                   │
│  ┌──────▼─────────────────▼───────────────────────────────────┐ │
│  │              STATE MANAGEMENT (Zustand)                     │ │
│  │  - Content Store (filtered items, loading states)          │ │
│  │  - Player Store (current item, auto mode, queue)           │ │
│  │  - UI Store (active tab, modals, sidebar)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              DATA LAYER                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │ /data/        │  │ React Query  │  │ IndexedDB       │  │ │
│  │  │ content.js    │  │ (TanStack)   │  │ (offline cache) │  │ │
│  │  │ (local cache) │  │              │  │                 │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / Cron
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SYNC / API LAYER                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Vercel Edge Functions / Next.js API Routes                │ │
│  │  - ETL Pipeline (fetch → parse → transform → store)        │ │
│  │  - Google Sheets API v4 integration                        │ │
│  │  - Content validation & normalization                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              │ Google Sheets API                 │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              GOOGLE SPREADSHEET (CMS)                       │ │
│  │  Sheet: "MovieList"                                        │ │
│  │  - Full URL, Trim URL, ID, Type, Language, Title           │ │
│  │  - YouTube URL, Video ID, Thumbnail, Banner Image          │ │
│  │  - Category, Year, Rating, Duration, Match Score           │ │
│  │  - Is Top 10, Genres, Cast, Language                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Architecture

### 3.1 Google Spreadsheet Schema (Source of Truth)

The GSheet `MovieList` tab serves as the absolute CMS with the following columns:

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | fullUrl | string | Complete YouTube watch URL |
| B | trimUrl | string | Trimmed/clean YouTube URL |
| C | id | number | Unique row identifier |
| D | type | enum | `Movie` \| `Song` \| `VideoSong` \| `AudioSong` |
| E | language | string | Primary language (Hindi, English, Telugu, etc.) |
| F | title | string | Content title |
| G | description | string | Content description |
| H | youtubeUrl | string | Embeddable YouTube URL |
| I | videoId | string | YouTube video ID |
| J | thumbnail | string | Thumbnail image URL |
| K | bannerImage | string | Banner/poster image URL |
| L | category | string | Content category/genre bucket |
| M | year | number | Release year |
| N | rating | string | Content rating (e.g., U/A) |
| O | duration | string | Duration (e.g., 2h 37m) |
| P | matchScore | string | Recommendation score |
| Q | isTop10 | boolean | Top 10 flag |
| R | genres | string | Comma-separated genres |
| S | cast | string | Cast members |
| T | language | string | Secondary language field |

### 3.2 Local Data Cache Schema

Generated `/data/content.js` structure:

```javascript
export const CONTENT = [
  {
    id: 1,
    type: "Movie",
    contentType: "Movie",        // Normalized: Movie, VideoSong, AudioSong
    language: "Telugu",
    title: "Dragon",
    description: "...",
    youtubeUrl: "https://www.youtube.com/embed/3iQtnZsgtn8",
    videoId: "3iQtnZsgtn8",
    thumbnail: "https://img.youtube.com/vi/...",
    bannerImage: "https://img.youtube.com/vi/...",
    category: "Comedy",
    year: 2025,
    rating: "U/A (India)",
    duration: "2h 37m",
    matchScore: "7.8/10",
    isTop10: true,
    genres: ["Comedy", "Drama", "Romance"],
    cast: ["Pradeep Ranganathan", "Anupama Parameswaran"],
    mediaFormat: null,            // Only for Songs: "VideoSong" | "AudioSong"
    normalizedLanguage: "telugu", // Lowercase for filtering
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z"
  }
];
```

### 3.3 Derived Data Structures (Computed at Runtime)

```javascript
// /data/derived.js
export const DERIVED = {
  movies: CONTENT.filter(item => item.type === "Movie"),
  songs: CONTENT.filter(item => item.type === "Song"),
  videoSongs: CONTENT.filter(item => item.mediaFormat === "VideoSong"),
  audioSongs: CONTENT.filter(item => item.mediaFormat === "AudioSong"),
  languages: [...new Set(CONTENT.map(item => item.language))].sort(),
  genres: [...new Set(CONTENT.flatMap(item => item.genres))].sort(),
  top10: CONTENT.filter(item => item.isTop10),
  byLanguage: {
    hindi: CONTENT.filter(item => item.language === "Hindi"),
    english: CONTENT.filter(item => item.language === "English"),
    telugu: CONTENT.filter(item => item.language === "Telugu")
  }
};
```

---

## 4. ETL Pipeline (Extract, Transform, Load)

### 4.1 Pipeline Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   EXTRACT   │ -> │  TRANSFORM  │ -> │   VALIDATE  │ -> │    LOAD     │
│             │    │             │    │             │    │             │
│ Google      │    │ Normalize   │    │ Schema      │    │ Write to    │
│ Sheets API  │    │ Parse       │    │ Validation  │    │ /data/      │
│ v4          │    │ Enrich      │    │ Dedup        │    │ content.js  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 4.2 Implementation: `/scripts/sync-sheet.js`

```javascript
#!/usr/bin/env node
/**
 * ETL Pipeline: Google Sheets → /data/content.js
 * 
 * Scheduled via Vercel Cron / GitHub Actions
 * Run: node scripts/sync-sheet.js
 */

import { google } from "googleapis";
import fs from "fs";
import path from "path";

const SPREADSHEET_ID = "1rasahcNkL9ibMkQ2rhjIZ5-nxbNd2RU8SJ0-kWAdbo8";
const SHEET_NAME = "MovieList";
const OUTPUT_PATH = path.join(process.cwd(), "data", "content.js");

// Google Auth via service account
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

async function extract() {
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:T`, // Skip header row
  });
  return response.data.values || [];
}

function transform(rows) {
  const headers = [
    "fullUrl", "trimUrl", "id", "type", "language", "title", "description",
    "youtubeUrl", "videoId", "thumbnail", "bannerImage", "category",
    "year", "rating", "duration", "matchScore", "isTop10", "genres",
    "cast", "language2"
  ];

  return rows.map((row, index) => {
    const item = {};
    headers.forEach((header, i) => {
      item[header] = (row[i] || "").toString().trim();
    });

    // Normalize
    item.isTop10 = item.isTop10?.toUpperCase() === "TRUE";
    item.genres = item.genres ? item.genres.split(",").map(g => g.trim()).filter(Boolean) : [];
    item.cast = item.cast ? item.cast.split(",").map(c => c.trim()).filter(Boolean) : [];
    item.mediaFormat = item.type === "Song" ? "VideoSong" : null; // Expand based on actual data
    item.normalizedLanguage = (item.language || "").toLowerCase();

    // Parse year safely
    item.year = parseInt(item.year, 10) || new Date().getFullYear();

    return item;
  }).filter(item => item.videoId); // Filter out empty rows
}

function validate(items) {
  const seenIds = new Set();
  const valid = [];
  const errors = [];

  items.forEach((item, idx) => {
    if (!item.videoId || !item.title) {
      errors.push(`Row ${idx + 2}: Missing videoId or title`);
      return;
    }
    if (seenIds.has(item.id)) {
      errors.push(`Row ${idx + 2}: Duplicate ID ${item.id}`);
      return;
    }
    seenIds.add(item.id);
    valid.push(item);
  });

  if (errors.length > 0) {
    console.error("Validation errors:", errors);
    process.exit(1);
  }

  return valid;
}

function load(items) {
  const timestamp = new Date().toISOString();
  const content = items.map(item => ({ ...item, updatedAt: timestamp }));

  const output = `// Auto-generated by sync-sheet.js — DO NOT EDIT MANUALLY
// Last synced: ${timestamp}
// Source: Google Sheets MovieList tab

export const CONTENT = ${JSON.stringify(content, null, 2)};

export const METADATA = {
  totalItems: ${items.length},
  movies: ${items.filter(i => i.type === "Movie").length},
  songs: ${items.filter(i => i.type === "Song").length},
  lastSynced: "${timestamp}",
  spreadsheetId: "${SPREADSHEET_ID}",
  sheetName: "${SHEET_NAME}"
};

export const DERIVED = {
  movies: CONTENT.filter(item => item.type === "Movie"),
  songs: CONTENT.filter(item => item.type === "Song"),
  languages: [...new Set(CONTENT.map(item => item.language))].sort(),
  genres: [...new Set(CONTENT.flatMap(item => item.genres))].sort(),
  top10: CONTENT.filter(item => item.isTop10)
};
`;

  fs.writeFileSync(OUTPUT_PATH, content, "utf-8");
  console.log(`Synced ${items.length} items to ${OUTPUT_PATH}`);
}

async function main() {
  try {
    console.log("Starting ETL pipeline...");
    const raw = await extract();
    const transformed = transform(raw);
    const validated = validate(transformed);
    load(validated);
    console.log("ETL complete.");
  } catch (error) {
    console.error("ETL failed:", error);
    process.exit(1);
  }
}

main();
```

### 4.3 Scheduling

**Option A: Vercel Cron (Recommended for Vercel deployments)**

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-content",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

`app/api/cron/sync-content/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { syncContent } from "@/lib/sync";

export async function GET(request: Request) {
  try {
    await syncContent();
    return NextResponse.json({ success: true, message: "Content synced" });
  } catch (error) {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
```

**Option B: GitHub Actions**

`.github/workflows/sync-content.yml`:
```yaml
name: Sync Content from Google Sheets
on:
  schedule:
    - cron: "0 */6 * * *"  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: node scripts/sync-sheet.js
        env:
          GOOGLE_SERVICE_ACCOUNT: ${{ secrets.GOOGLE_SERVICE_ACCOUNT }}
      - run: |
          git config --local user.email "bot@example.com"
          git config --local user.name "Content Bot"
          git add data/content.js
          git diff --cached --quiet || git commit -m "chore: sync content from Google Sheets"
          git push
```

### 4.4 Build-Time Integration

For SSG/SSR, fetch cached data at build time:

```typescript
// lib/data.ts
import { CONTENT, METADATA } from "@/data/content";

export async function getContent() {
  return CONTENT;
}

export async function getFilteredContent(filters: ContentFilters) {
  return CONTENT.filter(item => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.language && item.language !== filters.language) return false;
    if (filters.mediaFormat && item.mediaFormat !== filters.mediaFormat) return false;
    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}
```

---

## 5. Frontend Architecture

### 5.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR/SSG, Image Optimization, Edge Functions, React Server Components |
| **UI Library** | React 18 + TypeScript | Type safety, concurrent features |
| **Styling** | Tailwind CSS v3 + shadcn/ui | Rapid development, consistent design system |
| **State Management** | Zustand + TanStack Query | Lightweight global state, server state caching |
| **Media Player** | react-player / YouTube IFrame API | Reliable YouTube playback, custom controls |
| **Routing** | Next.js App Router | File-based routing, layouts, parallel routes |
| **Caching** | React Query + IndexedDB | Client-side caching, offline support |
| **Testing** | Vitest + React Testing Library | Fast unit/integration tests |

### 5.2 Project Structure

```
songshub/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Home / Movies (default)
│   ├── movies/
│   │   └── page.tsx
│   ├── songs/
│   │   └── page.tsx
│   └── globals.css
├── components/
│   ├── dashboard/
│   │   ├── ModeSwitcher.tsx      # Movies ↔ Songs toggle
│   │   ├── FilterBar.tsx         # Multi-layer filters
│   │   ├── ContentGrid.tsx       # Responsive grid
│   │   └── ContentCard.tsx       # Individual item card
│   ├── player/
│   │   ├── MediaPlayer.tsx       # Core player wrapper
│   │   ├── AutoModeControls.tsx
│   │   ├── PlaybackControls.tsx
│   │   └── QueueManager.tsx
│   └── ui/                       # shadcn/ui components
├── data/
│   ├── content.js                # Auto-generated local cache
│   └── derived.js                # Computed data structures
├── lib/
│   ├── sync.ts                   # ETL orchestration
│   ├── filters.ts                # Filter logic
│   ├── player.ts                 # Player utilities
│   └── types.ts                  # TypeScript definitions
├── store/
│   ├── contentStore.ts           # Zustand: content state
│   ├── playerStore.ts            # Zustand: player state
│   └── uiStore.ts                # Zustand: UI state
├── scripts/
│   └── sync-sheet.js             # ETL script
├── public/
│   └── assets/
└── package.json
```

---

## 6. State Management Strategy

### 6.1 Architecture Decision: Zustand + TanStack Query

**Rationale:**
- **Zustand**: Minimal boilerplate, ideal for UI state (filters, player mode, sidebar)
- **TanStack Query (React Query)**: Server state caching, background refetching, optimistic updates
- Avoid Redux overhead for this use case; client state is relatively simple

### 6.2 Store Definitions

```typescript
// store/contentStore.ts
interface ContentFilters {
  type: "Movie" | "Song" | "All";
  language: string;
  mediaFormat: "VideoSong" | "AudioSong" | "All";
  search: string;
}

interface ContentStore {
  filters: ContentFilters;
  setFilter: (key: keyof ContentFilters, value: any) => void;
  resetFilters: () => void;
  filteredContent: ContentItem[];
  isLoading: boolean;
  setFilteredContent: (items: ContentItem[]) => void;
}

export const useContentStore = create<ContentStore>((set, get) => ({
  filters: {
    type: "All",
    language: "All",
    mediaFormat: "All",
    search: "",
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () =>
    set({
      filters: { type: "All", language: "All", mediaFormat: "All", search: "" },
    }),
  filteredContent: [],
  isLoading: false,
  setFilteredContent: (items) => set({ filteredContent: items }),
}));

// store/playerStore.ts
interface PlayerStore {
  currentItem: ContentItem | null;
  queue: ContentItem[];
  autoMode: boolean;
  isPlaying: boolean;
  currentTime: number;
  setCurrentItem: (item: ContentItem) => void;
  setQueue: (items: ContentItem[]) => void;
  toggleAutoMode: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentItem: null,
  queue: [],
  autoMode: false,
  isPlaying: false,
  currentTime: 0,
  setCurrentItem: (item) => set({ currentItem: item, isPlaying: true }),
  setQueue: (items) => set({ queue: items }),
  toggleAutoMode: () => set((state) => ({ autoMode: !state.autoMode })),
  playNext: () => {
    const { queue, currentItem } = get();
    if (!currentItem || queue.length === 0) return;
    const currentIndex = queue.findIndex((item) => item.id === currentItem.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    set({ currentItem: queue[nextIndex] });
  },
  playPrevious: () => {
    const { queue, currentItem } = get();
    if (!currentItem || queue.length === 0) return;
    const currentIndex = queue.findIndex((item) => item.id === currentItem.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    set({ currentItem: queue[prevIndex] });
  },
}));
```

### 6.3 Filtering Logic

```typescript
// lib/filters.ts
export function applyFilters(items: ContentItem[], filters: ContentFilters): ContentItem[] {
  return items.filter((item) => {
    if (filters.type !== "All" && item.type !== filters.type) return false;
    if (filters.language !== "All" && item.language !== filters.language) return false;
    if (filters.type === "Song" && filters.mediaFormat !== "All" && item.mediaFormat !== filters.mediaFormat) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.cast.some((c) => c.toLowerCase().includes(searchLower)) ||
        item.genres.some((g) => g.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });
}
```

---

## 7. Media Player Module

### 7.1 Player Architecture

```typescript
// components/player/MediaPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Player from "react-player/youtube";
import { usePlayerStore } from "@/store/playerStore";

export function MediaPlayer() {
  const playerRef = useRef<Player>(null);
  const { currentItem, autoMode, isPlaying, currentTime, setCurrentItem, playNext } = usePlayerStore();

  useEffect(() => {
    if (!currentItem) return;

    // Update queue based on current filters
    const filtered = getFilteredContent(useContentStore.getState().filters);
    usePlayerStore.getState().setQueue(filtered);

    if (autoMode) {
      playerRef.current?.seekTo(currentTime);
      playerRef.current?.play();
    }
  }, [currentItem?.id, autoMode]);

  const handleEnded = () => {
    if (autoMode) {
      playNext();
    }
  };

  if (!currentItem) return <PlayerPlaceholder />;

  return (
    <div className="relative aspect-video bg-black">
      <Player
        ref={playerRef}
        url={currentItem.youtubeUrl}
        playing={isPlaying}
        controls
        onEnded={handleEnded}
        height="100%"
        width="100%"
        config={{
          playerVars: { autoplay: autoMode ? 1 : 0, modestbranding: 1 },
        }}
      />
    </div>
  );
}
```

### 7.2 Auto Mode Implementation

```typescript
// lib/autoMode.ts
export function useAutoMode() {
  const { currentItem, autoMode, playNext } = usePlayerStore();

  useEffect(() => {
    if (!autoMode) return;

    const interval = setInterval(() => {
      const player = document.querySelector(".ytd-html5-main-video") as HTMLVideoElement;
      if (player && player.ended) {
        playNext();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoMode, playNext]);
}
```

---

## 8. Multi-Layered Filtering UI

### 8.1 Filter Bar Component

```typescript
// components/dashboard/FilterBar.tsx
"use client";

import { useContentStore } from "@/store/contentStore";
import { CONTENT } from "@/data/content";

export function FilterBar() {
  const { filters, setFilter } = useContentStore();
  const languages = [...new Set(CONTENT.map((c) => c.language))];

  return (
    <div className="flex flex-wrap gap-4 p-4 border-b">
      {/* Primary: Content Type */}
      <select
        value={filters.type}
        onChange={(e) => setFilter("type", e.target.value)}
        className="px-4 py-2 border rounded-lg bg-background"
      >
        <option value="All">All Content</option>
        <option value="Movie">Movies</option>
        <option value="Song">Songs</option>
      </select>

      {/* Secondary: Language */}
      <select
        value={filters.language}
        onChange={(e) => setFilter("language", e.target.value)}
        className="px-4 py-2 border rounded-lg bg-background"
      >
        <option value="All">All Languages</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>

      {/* Tertiary: Media Format (Songs only) */}
      {filters.type === "Song" && (
        <select
          value={filters.mediaFormat}
          onChange={(e) => setFilter("mediaFormat", e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="All">All Songs</option>
          <option value="VideoSong">Video Songs</option>
          <option value="AudioSong">Audio Songs</option>
        </select>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => setFilter("search", e.target.value)}
        className="px-4 py-2 border rounded-lg bg-background"
      />

      <button onClick={() => useContentStore.getState().resetFilters()} className="px-4 py-2 text-sm">
        Reset
      </button>
    </div>
  );
}
```

---

## 9. Mode-Switching Dashboard

### 9.1 Layout Structure

```typescript
// app/(dashboard)/layout.tsx
import { ModeSwitcher } from "@/components/dashboard/ModeSwitcher";
import { FilterBar } from "@/components/dashboard/FilterBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">SongShub</h1>
          <ModeSwitcher />
        </div>
      </header>
      <FilterBar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
```

### 9.2 Mode Switcher

```typescript
// components/dashboard/ModeSwitcher.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ModeSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const isMovies = pathname.includes("/movies");

  return (
    <Tabs value={isMovies ? "movies" : "songs"} onValueChange={(val) => router.push(`/${val}`)}>
      <TabsList>
        <TabsTrigger value="movies">🎬 Movies</TabsTrigger>
        <TabsTrigger value="songs">🎵 Songs</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

---

## 10. Scalability & Production Readiness

### 10.1 Performance Optimizations

| Technique | Implementation | Impact |
|-----------|---------------|--------|
| **Image Optimization** | Next.js Image + YouTube thumbnails | Lazy load, responsive sizes |
| **Code Splitting** | Dynamic imports for player, heavy components | Reduce initial bundle |
| **Edge Caching** | Vercel Edge Cache / CDN | 50ms response times |
| **Data Caching** | React Query stale-while-revalidate | Instant UI updates |
| **Virtualization** | react-window for large grids | Smooth scrolling with 1000+ items |
| **Prefetching** | Next.js prefetch on hover | Instant navigation |

### 10.2 Monitoring & Observability

```
Sentry          → Error tracking & performance monitoring
PostHog         → Product analytics (play counts, drop-off)
Vercel Analytics → Web vitals, traffic insights
Google Sheets Audit Log → Data change tracking
```

### 10.3 Security

| Concern | Mitigation |
|---------|-----------|
| **Google Sheets Exposure** | Service account with read-only scope |
| **YouTube Embedding** | No API keys exposed client-side |
| **Content Tampering** | Validate sheet data against schema |
| **Rate Limiting** | Vercel Edge Middleware / Upstash Ratelimit |

---

## 11. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Initialize Next.js 14 + TypeScript + Tailwind
- [x] Set up project structure
- [x] Configure Zustand stores
- [ ] **Build ETL pipeline** (`scripts/sync-sheet.js`)
- [ ] Generate `/data/content.js`
- [ ] Create dashboard layout + mode switcher

### Phase 2: Core UI (Week 3-4)
- [ ] Build FilterBar component
- [ ] Implement ContentGrid with virtualization
- [ ] Create ContentCard component
- [ ] Implement filtering logic
- [ ] Add search functionality

### Phase 3: Media Player (Week 5)
- [ ] Integrate YouTube player (react-player)
- [ ] Build custom controls
- [ ] Implement Auto Mode
- [ ] Add queue management
- [ ] Keyboard shortcuts

### Phase 4: Polish & Deploy (Week 6)
- [ ] Responsive design audit
- [ ] Loading states & skeletons
- [ ] Error boundaries
- [ ] Set up Vercel Cron
- [ ] Configure monitoring (Sentry)
- [ ] Deploy to production

### Phase 5: Scale (Week 7+)
- [ ] Implement recommendations
- [ ] Add download/share features
- [ ] Multi-language support (i18n)
- [ ] PWA support

---

## 12. API Reference

### 12.1 Key Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/cron/sync-content` | GET | No | Trigger ETL sync |
| `/api/content` | GET | No | Fetch all content |
| `/api/content/search` | GET | No | Search content |

### 12.2 Environment Variables

```env
# Google Sheets
GOOGLE_SERVICE_ACCOUNT={"type":"service_account",...}
SPREADSHEET_ID=1rasahcNkL9ibMkQ2rhjIZ5-nxbNd2RU8SJ0-kWAdbo8

# Cron
CRON_SECRET=random-cron-secret

# Monitoring
SENTRY_DSN=https://...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

---

## 13. Conclusion

This architecture provides a scalable, maintainable foundation for a media streaming platform powered by Google Sheets as CMS. The key strengths are:

1. **Zero hardcoded content** — Everything is data-driven
2. **Real-time sync** — ETL pipeline keeps cache fresh
3. **High performance** — Virtualized lists, edge caching, code splitting
4. **Excellent UX** — Multi-layer filters, auto-play, mode switching
5. **Production-ready** — Monitoring, security built-in

The system can scale from a prototype to thousands of concurrent users by leveraging Vercel's edge network, React Query caching, and the Google Sheets API's generous rate limits.
