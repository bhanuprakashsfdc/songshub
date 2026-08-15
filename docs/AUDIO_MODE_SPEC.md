# Audio Mode — Technical Specification & UI Requirements

## 1. Feature Overview
A global **Audio Mode** toggle that enables music playback across the entire application. When active, a floating audio icon remains visible on every screen, allowing users to control playback without navigating to a dedicated music page. The icon must be draggable so users can reposition it to avoid obstructing content.

## 2. Functional Requirements

### 2.1 Global Audio Mode Toggle
- A toggle control must be accessible from **any screen** within the application.
- When Audio Mode is enabled:
  - The app enters a "music mode" state.
  - A floating audio control icon appears and remains visible across all routes.
  - Music playback can continue in the background, including when the device screen is locked.
- When Audio Mode is disabled:
  - The floating audio control icon hides.
  - Background playback stops unless another media session is active.
- The toggle state must persist across page refreshes using `localStorage`.

### 2.2 Floating Audio Icon
- The icon must be rendered at the **application root level** so it is never unmounted during route transitions.
- The icon must be visible on **every page** regardless of the current route.
- Default position: **bottom-right corner** of the viewport.
- The icon must sit above all other UI layers (`z-index` higher than modals, navbars, and footers).
- Minimum touch target size: **48x48px** to meet WCAG 2.2 touch target requirements.

### 2.3 Draggable Repositioning
- Users must be able to **drag** the floating icon to any position on the screen.
- Dragging must work via both **mouse** (desktop) and **touch** (mobile) events.
- The icon's position must be **persisted** in `localStorage` so it remains where the user placed it across sessions.
- While dragging, the icon must have a visual elevation effect (e.g., increased shadow and scale) to indicate it is being moved.
- The icon must **not** be draggable when the user is simply tapping it to open the mini-player or toggle playback.
- A **long press** (300ms+) or dedicated drag handle should initiate dragging to distinguish from tap/click actions.
- The icon must remain within the **viewport bounds** and cannot be dragged off-screen.

### 2.4 Mini-Player Interface
- Tapping the floating icon opens a **mini-player** overlay or expands the icon into a compact playback control bar.
- The mini-player must display:
  - Current track title
  - Play/Pause button
  - Next/Previous track buttons
  - Progress indicator (time elapsed / total duration)
  - Close/Minimize button
- The mini-player must be dismissible without stopping playback.
- Controls in the mini-player must be keyboard-accessible (`tabIndex`, `aria-label`).

### 2.5 Background Playback
- Music must continue playing when:
  - The user navigates between app pages
  - The user switches to another app
  - The device screen locks (mobile)
- The app must use the **Media Session API** to expose playback controls to the system lock screen and notification shade.
- Media Session metadata must include:
  - Title
  - Artist/Category
  - Album art (thumbnail)
- Media Session action handlers must support:
  - `play`
  - `pause`
  - `nexttrack`
  - `previoustrack`

### 2.6 Queue Management
- Users must be able to view the current playback queue.
- Users must be able to add songs to the queue from any gallery or list view.
- A **Shuffle** option must randomize the upcoming queue order.
- The queue panel must be accessible from the floating icon or mini-player.

## 3. Non-Functional Requirements

### 3.1 Performance
- The floating icon and audio engine must not cause layout shifts (CLS).
- Audio playback must use `preload="none"` and lazy loading to minimize bandwidth.
- The drag handler must use `requestAnimationFrame` or CSS transforms for smooth 60fps dragging.

### 3.2 Accessibility
- The floating icon must have an `aria-label` describing its purpose (e.g., "Open audio player").
- The mini-player must support keyboard navigation (`Enter`/`Space` to activate controls).
- Focus must be trapped within the mini-player when it is open (if modal behavior is implemented).
- Color contrast ratios must meet **WCAG 2.2 AA** standards.

### 3.3 Browser Compatibility
- Background playback must work on **iOS Safari** (requires `playsinline` attribute on audio elements).
- The Media Session API must be feature-detected before use.
- Dragging must fall back to mouse events on desktop and touch events on mobile.

## 4. Technical Implementation Notes

### 4.1 Component Architecture
```
src/
  components/
    AudioModeToggle.tsx       # Global toggle button (floating)
    AudioPlayer.tsx            # Invisible HTML5 Audio engine + Media Session
    MusicPlayer.tsx            # Bottom mini-player bar
    MusicQueue.tsx             # Slide-out queue panel
    FloatingAudioIcon.tsx      # Draggable floating icon
```

### 4.2 State Management
- Use `MusicContext` (React Context) for:
  - `currentSong`
  - `isPlaying`
  - `queue`
  - `shuffle`
  - `playNext()`
  - `togglePlay()`
- Use `localStorage` for:
  - Audio Mode enabled/disabled state
  - Floating icon position `{x, y}`

### 4.3 Drag Implementation
- Use pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) for unified mouse/touch handling.
- Calculate delta from pointer start position and update icon `transform: translate(x, y)`.
- Clamp final position within `window.innerWidth` and `window.innerHeight`.
- Debounce `localStorage` writes during drag to avoid performance issues.

### 4.4 Audio Playback
- Use a singleton `HTMLAudioElement` instance managed in `AudioPlayer.tsx`.
- Set `audio.setAttribute("playsinline", "")` and `audio.setAttribute("webkit-playsinline", "")` for iOS.
- Register `navigator.mediaSession` handlers when a song is active.
- Clean up event listeners and audio source on component unmount.

## 5. User Interface Mockup (Textual Description)

### 5.1 Default State
- Floating icon: **Music note icon** inside a circular button, 56px diameter.
- Color: Primary brand color when active, neutral gray when inactive.
- Position: Bottom-right corner, 24px margin from edges.

### 5.2 Dragging State
- Icon scales up to 1.1x.
- Shadow increases (e.g., `shadow-2xl`).
- Opacity reduces slightly to 0.8 to indicate movement.
- Other UI elements remain interactive underneath.

### 5.3 Mini-Player State (Expanded)
- Appears above the floating icon or as a bottom sheet.
- Width: 100% on mobile, max-width 400px on desktop.
- Rounded corners, blurred background (`backdrop-blur-xl`).
- Contains album art thumbnail (16:9 aspect ratio), title, artist, playback controls, and progress bar.

### 5.4 Queue Panel
- Slides in from the right edge.
- Width: 320px on desktop, 85vw on mobile.
- Lists upcoming tracks with thumbnails.
- Shuffle button in the header.

## 6. Acceptance Criteria
- [ ] Audio Mode toggle is accessible from every page in the app.
- [ ] Floating audio icon is visible on all pages when Audio Mode is active.
- [ ] Icon can be dragged to any position and persists across refreshes.
- [ ] Music continues playing during navigation and screen lock.
- [ ] Lock-screen media controls show correct metadata and respond to play/pause/next.
- [ ] Mini-player opens on tap and closes without stopping playback.
- [ ] Queue panel shows upcoming tracks and supports shuffle.
- [ ] All interactive elements have `aria-label` and meet WCAG 2.2 AA contrast.
- [ ] No layout shifts or performance degradation when the floating icon is rendered.

## 7. Out of Scope
- Voice search or voice commands for audio control.
- Cross-fade between tracks.
- Offline download and playback.
- Support for podcast or audiobook formats.
