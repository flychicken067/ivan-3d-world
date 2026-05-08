# Contributing

Thanks for considering a contribution to Ivan's World. This is a personal portfolio, but the patterns are reusable. PRs that fix bugs or improve accessibility are very welcome. Feature additions should match the editorial green design system.

## Setup

```bash
git clone <fork-url>
cd ivan-3d-world
npm install
npm run dev
```

Server runs at `http://localhost:5174`.

## Project structure

```
src/
├── main.js              entry — boots scene, wires everything
├── config.js            colors, zones, camera config
├── events.js            tiny pub/sub bus (on/off/emit)
├── tour.js              guided 45s tour with narration
├── audio.js             Web Audio (events + optional ambient pad)
├── perf.js              FPS-adaptive quality
├── achievements.js      5 achievements w/ toast
├── easter-eggs.js       click-sky-7x + Konami code
├── visit-tracker.js     per-zone visited set
├── idle-screensaver.js  60s idle → auto-tour
├── controls/
│   ├── camera.js        PointerLockControls + start screen wiring
│   └── movement.js      WASD + touch joystick + head-bob
├── world/
│   ├── sky.js           gradient sphere (dynamic time-of-day)
│   ├── terrain.js       flat-shaded ground plane
│   ├── vegetation.js    instanced trees
│   ├── paths.js         golden paths + waypoint dots + pulses
│   ├── zones.js         7 zone builders (Welcome..Collaborate)
│   ├── atmosphere.js    floating particles
│   ├── proximity-sparkles.js   gold sparkles near closest zone
│   ├── butterflies.js   8 wing-flapping sprites
│   ├── dust.js          50 ambient drift particles
│   └── camera-trail.js  particle trail behind flying camera
├── ui/
│   ├── hud.js           current zone indicator
│   ├── minimap.js       7-zone list w/ distance + colors
│   ├── overlay.js       panel render + greeting + sessions
│   ├── nav.js           Tab-key full nav
│   ├── tutorial.js      first-visit overlay
│   ├── zone-splash.js   1.5s zone arrival fade
│   ├── compass.js       direction indicator
│   ├── settings.js      preferences panel
│   ├── shortcuts.js     '?' overlay
│   ├── share.js         screenshot capture
│   ├── home-button.js   return-to-start animation
│   ├── start-parallax.js mouse-follow on title
│   ├── loader.js        pre-start progress bar
│   └── styles.css       single CSS file (Editorial Green system)
└── utils/
    └── raycaster.js     hover detection + click events
```

## Design system

All colors live as CSS custom properties in `src/ui/styles.css`. Use them.

| Token | Use |
| --- | --- |
| `--bg-deep` | Page bg, overlay bg |
| `--bg-panel` | Panel bg |
| `--bg-card` | Inner card bg, key chips |
| `--text-primary` | Body text |
| `--text-secondary` | Sub-headers |
| `--text-muted` | Hints, footnotes |
| `--accent-green` | Success, hover state |
| `--accent-gold` | Primary CTA, golden details |
| `--accent-cream` | Headers, titles |

Typography: `var(--mono)` for labels and tech, `var(--serif)` for italic taglines, `var(--sans)` for body.

Spacing: only use `var(--space-xs|sm|md|lg|xl)` — never hardcode pixels.

## Adding a new zone

1. Add to `ZONES` array in `src/config.js`
2. Add a builder function in `src/world/zones.js`
3. Add accent color to `ZONE_ACCENT` map
4. Add narration line to `NARRATION` map in `src/tour.js`
5. Add stripe color to `ZONE_STRIPE` in `src/ui/overlay.js`
6. Add color to `ZONE_DOT_COLOR` in `src/ui/minimap.js`

That's it — minimap, raycaster, panel, tour all auto-pick it up.

## Performance budget

- Bundle: keep under 700KB raw / 200KB gzip
- 60 FPS on a M-series Mac, ≥30 FPS on a 5-year-old laptop
- Use `requestAnimationFrame`, never `setTimeout` for visual loops
- Throttle expensive per-frame work using the `frameCount % N === 0` pattern in `main.js`

## Accessibility checklist

When adding UI:
- [ ] Add `aria-label` to icon-only buttons
- [ ] Use `role="status"` + `aria-live="polite"` for ephemeral status
- [ ] All interactive elements keyboard-reachable
- [ ] Respect `prefers-reduced-motion` (check `localStorage['ivan-world-pref-reduce-motion']`)
- [ ] Hover states have `:focus-visible` equivalents
- [ ] Color contrast ≥ 4.5:1 for text

## Pull request flow

1. Fork + branch (`fix/xyz` or `feat/xyz`)
2. `npm run build` must succeed with zero errors
3. Test the existing tour end-to-end to make sure nothing broke
4. Concise commit message: `[type] scope: summary` — type is feat/fix/style/docs/chore
5. Open PR with screenshot or video demo

## Style notes

- Single quotes for JS strings
- 2-space indent
- No emoji in source code (per project decree)
- Prefer named exports over default
- Module-level state is fine for UI singletons

## License

MIT.
