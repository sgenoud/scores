# Board Game Scorekeeper

A mobile-first, offline-capable React/Vite score sheet for board games.

## Features

- Fast new score sheets from typed names or previously played groups
- Per-player colors and compact initials for one- or two-letter names
- Manual score sorting: tap the sort button when you want to reorder high-first or low-first
- Quick `+1` / `-1` controls on the main screen
- Detailed score dialog for custom values and undoing recent changes
- MobX-State-Tree data model persisted to `localStorage`
- PWA/service worker support via `vite-plugin-pwa` for offline use after the first visit

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
