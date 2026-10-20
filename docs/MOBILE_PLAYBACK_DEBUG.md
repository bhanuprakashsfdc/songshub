# Mobile Playback Debugging Guide

## Overview
Audio and video playback fail on mobile devices while working on desktop. This document provides a structured debugging approach for the most common mobile-specific playback issues.

---

## 1. Autoplay Restrictions & User Interaction Requirements

### Problem
Mobile browsers (iOS Safari, Chrome Android) block media autoplay until a user gesture occurs. Even with `playsinline`, autoplay may be blocked without prior user interaction.

### What to Check in Code

#### `src/components/AudioPlayer.tsx`
- [ ] `safePlay()` is called from a user gesture handler (e.g., tile click)
- [ ] Audio element has `playsinline` and `webkit-playsinline` attributes
- [ ] `preload="none"` is set to avoid background loading before interaction
- [ ] First play attempt happens synchronously within the click handler

#### `src/components/FullPlayer.tsx`
- [ ] YouTube player `onReady` calls `playVideo()` immediately
- [ ] `autoplay: 1` is set in `playerVars`
- [ ] Player initialization is triggered by user click, not automatically on mount

### Debug Steps
1. Open browser DevTools → Console on mobile (remote debugging)
2. Look for `[AudioPlayer] initial play blocked` or `[AudioPlayer] play still blocked after muting`
3. Check if `safePlay()` is being called but failing
4. Verify the click handler that triggers `playSong()` actually fires on mobile

### Fix Applied
- `safePlay()` in `src/lib/mediaHelpers.ts` attempts muted autoplay as fallback
- `setupUserGestureUnlock()` attaches one-time gesture listeners as last resort
- AudioPlayer only mounts when `audioMode` is active

---

## 2. Supported Video Codecs & File Formats

### Problem
Mobile devices have limited codec support compared to desktop:
- iOS Safari: H.264 (AVC) baseline/main/high, AAC audio. No VP9/AV1.
- Android Chrome: H.264, VP8/VP9, AV1 (newer devices), AAC/Opus audio.
- YouTube embeds: Generally work across devices, but direct video URLs may fail.

### What to Check in Code

#### `src/lib/mediaHelpers.ts`
- [ ] `getDirectAudioUrl()` only accepts `.mp3`, `.wav`, `.ogg`, `.m4a`, `.aac`, `.flac`, `.webm`
- [ ] Non-audio URLs fall back to YouTube iframe
- [ ] URLs containing `youtube` or `youtu.be` are excluded from audio playback

#### `src/services/dataService.ts`
- [ ] Spreadsheet `Video URL` column contains direct audio URLs or YouTube URLs
- [ ] No `.mkv`, `.avi`, or other unsupported formats

### Debug Steps
1. Check `network` tab in mobile DevTools for failed media requests
2. Look for 404s or `media error` events in console
3. Verify `videoUrl` values in the spreadsheet are mobile-compatible
4. Test a known-good MP3 URL directly in mobile browser

### Recommendations
- Use H.264 + AAC for any direct video/audio files
- Prefer YouTube embeds for video content (broadest compatibility)
- Add `.m4a` support if using Apple Music/iTunes format

---

## 3. Touch Events vs. Click Events

### Problem
Mobile browsers have a 300ms tap delay on click events. Additionally, `onClick` may not fire if:
- The element is covered by another element
- `touch-action` CSS property blocks interaction
- Event propagation is stopped incorrectly

### What to Check in Code

#### `src/components/dashboard/ContentGridTile.tsx`
- [ ] Uses standard `onClick` handler
- [ ] No `touch-action: none` on parent containers blocking taps
- [ ] No overlapping elements with higher z-index

#### `src/components/FloatingAudioIcon.tsx`
- [ ] Uses `onPointerDown` + `onClick` for drag vs. tap distinction
- [ ] `touchAction: "none"` is set on the draggable icon (intentional)
- [ ] Long-press (300ms) initiates drag, short tap triggers action

#### `src/components/MusicPlayer.tsx`
- [ ] All buttons use `onClick`
- [ ] No touch-specific handlers that might conflict

### Debug Steps
1. Add `onTouchStart`/`onTouchEnd` handlers alongside `onClick` to test if touch events fire
2. Check for `pointer-events: none` on parent elements
3. Verify z-index stacking context
4. Test with Chrome DevTools mobile emulation → toggle device toolbar → test touch events

### Fix Applied
- `FloatingAudioIcon` uses `onPointerDown` for unified mouse/touch drag handling
- Long-press detection prevents accidental drags on tap
- `touchAction: "none"` only applied to the draggable icon

---

## 4. Media Element Attributes

### Problem
iOS Safari requires specific attributes for inline playback. Without them, videos open in fullscreen and audio may pause when screen locks.

### What to Check in Code

#### `src/components/AudioPlayer.tsx`
- [ ] `audio.setAttribute("playsinline", "")` ✓
- [ ] `audio.setAttribute("webkit-playsinline", "")` ✓
- [ ] No `autoplay` attribute on the audio element directly (handled via JS)
- [ ] Audio element is created in DOM or via `new Audio()` (not just in memory)

#### `src/components/FullPlayer.tsx`
- [ ] YouTube iframe has `playsinline=1` in playerVars ✓
- [ ] iframe has `allow="autoplay; encrypted-media; picture-in-picture"` ✓
- [ ] `allowFullScreen` is set appropriately

### Debug Steps
1. Inspect the audio/video element in mobile DevTools
2. Verify `playsinline` attribute is present in DOM
3. Check if iOS is forcing fullscreen (look for `-apple-fullscreen` class)
4. Test with `muted` attribute added temporarily to see if audio plays

### Fix Applied
- AudioPlayer creates `new Audio()` with `playsinline` and `webkit-playsinline`
- YouTube player uses `playsinline: 1` in playerVars
- `setSinkId("default")` called when available for audio routing

---

## 5. Network & Bandwidth Constraints

### Problem
Mobile networks (4G/5G) may have higher latency and lower throughput than desktop. Large media files may stall or fail to load.

### What to Check in Code

#### `src/components/AudioPlayer.tsx`
- [ ] `preload="none"` prevents unnecessary bandwidth usage
- [ ] `audio.load()` is called only when source changes
- [ ] Error handler logs network failures

#### `src/components/FullPlayer.tsx`
- [ ] YouTube iframe uses `modestbranding=1` and `rel=0` to reduce overhead
- [ ] No unnecessary preloading of multiple videos

### Debug Steps
1. Test on slow 3G network (DevTools → Network → Slow 3G)
2. Check for `stalled`, `waiting`, `suspend` events in AudioPlayer logs
3. Monitor data usage in browser DevTools
4. Verify CDN/URLs are accessible from mobile network (not blocked by firewall)

### Recommendations
- Add `crossOrigin="anonymous"` if loading from CDN with CORS
- Implement adaptive bitrate for direct video URLs
- Show loading spinner during buffering on mobile

---

## 6. Additional Mobile-Specific Issues

### 6.1 iOS Safari Background Playback
- [ ] Audio context is created on user gesture (not on page load)
- [ ] `Audio` element is not garbage collected (keep ref)
- [ ] Media Session API handlers are registered while audio is playing

### 6.2 Android Chrome Issues
- [ ] No `display: none` on iframe/audio when active (Android may stop hidden media)
- [ ] Wake lock not required for audio, but screen may dim during playback

### 6.3 React-Specific Issues
- [ ] Components are not unmounted during navigation (use app-level mounting)
- [ ] `useEffect` cleanup properly pauses/stops media
- [ ] StrictMode double-mount doesn't create duplicate audio instances

---

## 7. Debugging Checklist

### Immediate Checks
```bash
# 1. Check for console errors on mobile
# Open remote debugging:
# - iOS: Safari → Develop → [Device] → [Page]
# - Android: Chrome → chrome://inspect

# 2. Verify network requests
# Look for failed media requests (404, 403, CORS)

# 3. Check element attributes
# Verify playsinline, controls, preload on media elements

# 4. Test user gesture requirement
# Add console.log to click handlers to verify they fire
```

### Code Inspection Points
| File | What to Verify |
|------|---------------|
| `src/components/AudioPlayer.tsx` | `playsinline`, `webkit-playsinline`, `safePlay()` usage |
| `src/components/FullPlayer.tsx` | YouTube `playsinline: 1`, `autoplay: 1`, gesture-triggered init |
| `src/components/MusicPlayer.tsx` | Button `onClick` handlers work on touch |
| `src/components/dashboard/ContentGridTile.tsx` | No touch-blocking CSS, click fires on mobile |
| `src/lib/mediaHelpers.ts` | `safePlay` fallback chain (play → muted play → gesture) |
| `index.html` | `<meta name="viewport" content="width=device-width, initial-scale=1.0">` |

### Testing Matrix
| Device | Browser | Audio Mode | Video Mode | Notes |
|--------|---------|------------|------------|-------|
| iPhone | Safari | Test | Test | Check playsinline, background audio |
| iPhone | Chrome | Test | Test | WebKit engine, same as Safari |
| Android | Chrome | Test | Test | Check codec support |
| Android | Firefox | Test | Test | Check autoplay policy |

---

## 8. Quick Fixes to Apply

1. **Ensure all play calls happen inside user gesture handlers**
   - Click on tile → immediately call `playSong()` or `setCurrentItem()`
   - Do not delay playback with `setTimeout` or async operations

2. **Add loading states for mobile**
   - Show spinner while media buffers
   - Disable buttons during loading to prevent double-taps

3. **Implement retry logic**
   - On `error` event, retry once before giving up
   - Log error details for debugging

4. **Test with actual devices**
   - Emulation is useful but not perfect
   - Test on real iOS and Android devices

---

## 9. Diagnostic Logging

The codebase already includes lightweight diagnostic logging:

### AudioPlayer.tsx
```typescript
// Logs media events:
console.debug(`[AudioPlayer] event: ${name}`, {
  src: target?.src,
  currentTime: target?.currentTime,
  paused: target?.paused,
});

// Logs play failures:
console.warn("[AudioPlayer] initial play blocked", err);
console.warn("[AudioPlayer] play still blocked after muting", err2);
console.warn("[AudioPlayer] safePlay failed for", currentSong.title, err);
```

### mediaHelpers.ts
```typescript
console.warn('[mediaHelpers] initial play blocked', err);
console.debug('[mediaHelpers] play succeeded after muting');
console.warn('[mediaHelpers] play still blocked after muting', err2);
console.debug('[mediaHelpers] play succeeded after user gesture');
```

---

## 10. Known Limitations

- **iOS Safari**: Requires user interaction before any audio/video playback. Background audio works only after first user gesture.
- **Android Chrome**: May pause hidden iframes. YouTube embeds must not be `display: none` if playback is expected.
- **Data Saver**: Some mobile browsers block media on metered connections. No workaround without user settings change.
