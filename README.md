# Ivan's 3D Interactive Portfolio

**Live: https://ivan-3d-world.vercel.app**

A handcrafted, explorable 3D world that doubles as a portfolio. Walk through seven themed zones, listen for ambient cues, and discover Ivan's work the way you'd wander a sculpture garden — at your own pace.

Built with [Three.js](https://threejs.org/), [Vite](https://vitejs.dev/), and vanilla JavaScript. No React, no UI framework — just the DOM and WebGL.

---

## Features

- **Seven themed zones** — Welcome, Projects, Soulprint, Theater, Library, Social, Collaborate. Each has its own color palette, geometry language, and content panel.
- **Guided tour** — a one-click cinematic flythrough that pauses on each zone with narration.
- **Free-fly first-person controls** — pointer-lock WASD with smooth damping; tap to interact.
- **Ambient audio** — atmospheric soundscape with a settings panel for volume and mute.
- **Hover and proximity effects** — interactive meshes glow on hover; sparkles trail you as you approach a zone.
- **Mini-map and compass** — always know where you are.
- **Animated atmosphere** — drifting butterflies, floating dust motes, dynamic sky and lighting, camera trail.
- **Idle screensaver** — graceful auto-orbit when you step away.
- **Visit tracking** — local session counter on the Welcome panel, plus a time-of-day greeting.
- **Easter eggs** — a few small surprises hidden across the world. Listen, look, and try the obvious things.
- **Postprocessing** — subtle bloom and vignette for that filmic feel.
- **Reduced-motion mode** — respects the user's preference; animations dampen automatically.

---

## Run locally

```bash
npm install
npm run dev
```

Vite serves the world at `http://localhost:5173`. Click anywhere to lock the pointer and start exploring.

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build with `npm run preview`.

---

## Project structure

```
ivan-3d-world/
├── index.html
├── public/                  # static assets (audio, textures)
├── src/
│   ├── main.js              # entry — bootstraps scene, controls, UI
│   ├── config.js            # zone definitions + content
│   ├── audio.js             # ambient sound system
│   ├── tour.js              # guided cinematic tour
│   ├── easter-eggs.js       # hidden surprises
│   ├── postprocessing.js    # bloom + vignette
│   ├── visit-tracker.js     # local session tracking
│   ├── controls/            # camera + input
│   ├── world/               # 3D scene construction
│   │   ├── zones.js         # the seven zones
│   │   ├── terrain.js       # ground + paths
│   │   ├── sky.js           # sky dome + lighting
│   │   ├── atmosphere.js    # ambient particles
│   │   ├── butterflies.js   # animated critters
│   │   ├── vegetation.js    # trees + foliage
│   │   └── ...
│   └── ui/                  # DOM overlays
│       ├── overlay.js       # zone content panels
│       ├── nav.js           # navigation bar
│       ├── tutorial.js      # first-visit hints
│       ├── minimap.js
│       └── ...
└── vite.config.js
```

---

## Easter eggs

There are a few. They reward curiosity, not cleverness — most reveal themselves if you slow down and pay attention. That's all the hint you get.

---

## Documentation

- [DEPLOY.md](./DEPLOY.md) — production deployment notes (Vercel + manual builds).
- [CHANGELOG.md](./CHANGELOG.md) — release history and feature waves.
- [CONTRIBUTING.md](./CONTRIBUTING.md) — local setup, coding conventions, PR flow.

---

## Credits

Built by Ivan with [Claude Code](https://claude.com/claude-code) — a long, patient collaboration across many sessions of polish.

---

## Privacy

This project stores nothing on a server. All preferences (audio toggle, motion sensitivity, achievements, visit log, journey time) live in your browser's `localStorage`. Clear site data to reset.

No analytics. No cookies. No third-party scripts.

## Browser support

Tested:

- Chrome / Edge 100+
- Safari 16+ (incl. iOS)
- Firefox 100+
- WebGL required — graceful fallback page shown otherwise

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `WASD` / arrows | Move |
| Mouse | Look |
| Click | Interact with zone |
| `Tab` | Toggle minimap |
| `Esc` | Close menus / stop tour |
| `?` | Shortcuts overlay |
| `↑↑↓↓←→←→BA` | (try it) |

## License

MIT — see [LICENSE](./LICENSE)
