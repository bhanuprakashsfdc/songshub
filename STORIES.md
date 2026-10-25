# SongShub — UI Stories for Parallel Execution (Backend/Google Sheet unchanged)

> CEO directive: Keep Google Sheet data source as-is. No backend changes. All stories are UI-only and run in parallel via subagents.

## Story 1: Layout & Visual Polish
**Files:** `src/App.tsx`, `src/index.css`, `tailwind.config.js`
**Task:** World-class responsive layout, typography, spacing, dark theme, consistent design tokens.
**Acceptance:** No horizontal scroll; consistent spacing; dark theme default.

## Story 2: Navbar & Navigation
**Files:** `src/components/Navbar.tsx`, `src/components/Footer.tsx`
**Task:** Sticky glassmorphism navbar, mobile hamburger menu, active route highlight, footer with links.
**Acceptance:** Mobile menu works; active states correct.

## Story 3: Home & Banner
**Files:** `src/pages/Home.tsx`, `src/components/Banner.tsx`, `src/components/FeaturedGrid.tsx`
**Task:** Hero banner carousel with auto-rotate, featured grid with hover effects, smooth transitions.
**Acceptance:** Carousel auto-rotates; hover scale; no CLS.

## Story 4: Content Cards
**Files:** `src/components/SongCard.tsx`, `src/components/MovieCard.tsx`, `src/components/dashboard/ContentTile.tsx`, `src/components/dashboard/ContentGridTile.tsx`
**Task:** Premium card design: image aspect ratio, overlay play button, metadata, skeleton loading, hover lift.
**Acceptance:** Cards consistent; skeletons shown; hover effects smooth.

## Story 5: Filter Bar UX
**Files:** `src/components/dashboard/FilterBar.tsx`
**Task:** Pill-style filters, animated transitions, search with debounce, clear-all, mobile collapsible.
**Acceptance:** Filters intuitive; mobile-friendly; debounced search.

## Story 6: Mode Switcher
**Files:** `src/components/dashboard/ModeSwitcher.tsx`
**Task:** Segmented control Movies/Songs with icon, animated indicator, keyboard support.
**Acceptance:** Smooth animation; keyboard navigable.

## Story 7: Media Player UI
**Files:** `src/components/player/MediaPlayer.tsx`, `src/components/FullPlayer.tsx`
**Task:** Custom player controls overlay, progress bar, volume, fullscreen, picture-in-picture styling.
**Acceptance:** Controls accessible; progress accurate; responsive.

## Story 8: Floating Audio Icon & Drag
**Files:** `src/components/FloatingAudioIcon.tsx`, `src/components/AudioModeToggle.tsx`
**Task:** Draggable floating icon, position persist, long-press drag, mini-player expand, z-index above modals.
**Acceptance:** Drag works mouse/touch; position persists; visible all routes.

## Story 9: Mini-Player & Queue
**Files:** `src/components/MusicPlayer.tsx`, `src/components/MusicQueue.tsx`
**Task:** Bottom mini-player bar with artwork, controls, progress; slide-out queue panel with shuffle.
**Acceptance:** Controls functional; queue shows upcoming; shuffle works.

## Story 10: Infinite Scroll Feed
**Files:** `src/components/dashboard/InfiniteScrollFeed.tsx`
**Task:** Virtualized infinite scroll with loading spinner, end-of-list indicator, smooth performance.
**Acceptance:** Smooth scroll; no jank with 1000+ items.

## Story 11: Detail Modal
**Files:** `src/components/DetailModal.tsx`
**Task:** Modal with backdrop blur, trailer, metadata, actions (play, add to list), focus trap, ESC close.
**Acceptance:** Focus trapped; ESC closes; backdrop dismiss.

## Story 12: Search Results Page
**Files:** `src/pages/SearchResults.tsx`
**Task:** Live search results grid, highlight matches, empty state, recent searches.
**Acceptance:** Results update live; empty state shown.

## Story 13: My List & Watch History UI
**Files:** `src/pages/MyList.tsx`, `src/utils/watchHistory.ts`
**Task:** Grid of saved/watched items, remove action, empty state, continue watching row.
**Acceptance:** Items render; remove works; empty state.

## Story 14: Profile Selection
**Files:** `src/pages/ProfileSelection.tsx`
**Task:** Netflix-style profile picker with avatars, add profile, hover effects.
**Acceptance:** Profiles selectable; hover scale.

## Story 15: Accessibility & Motion
**Files:** all UI components
**Task:** aria-labels, keyboard nav, focus rings, reduced-motion support, WCAG AA contrast.
**Acceptance:** Keyboard-only usable; contrast passes.

## Story 16: Loading & Error States
**Files:** `src/components/LoadingSpinner.tsx`, `src/components/ErrorBoundary.tsx`
**Task:** Skeleton loaders, error fallbacks with retry, toast notifications.
**Acceptance:** Skeletons during load; errors contained; retry works.

## Execution Plan
All stories independent. Spawn subagents for Stories 1-16 in parallel. Google Sheet data source untouched.
