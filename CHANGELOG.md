# Changelog

All notable changes to Ivan's World.

## [0.7.0] — 2026-05-09

### Wave 8 — Content + DX
- README.md, vercel.json with caching/security headers
- Soulprint zone: stone tablet + flickering incense flames
- Theater zone: emissive screen + spotlight cone + flanking trees
- Welcome panel: time-of-day greeting + sessions counter
- DEPLOY.md guide

### Wave 7 — Micro-interactions
- Camera fly trail (gold particles fade behind moving camera)
- Dust motes (50 particles drifting around zones)
- Minimap hover: shows distance + zone-color glow
- Start screen parallax (title shifts opposite mouse)
- Mobile CTA: stacked, larger, tap-feedback

### Wave 6 — Deploy readiness
- WebGL fallback page for unsupported browsers
- Footer credits 'Built with three.js + Claude Code · 2026'
- Per-frame throttle (HUD/3, minimap/5, sparkles/2, compass/2)
- Visit tracker — minimap shows visited zones in green
- Konami code easter egg (DEBUG MODE)
- Idle screensaver (60s → auto-tour)
- Panel close animation

### Wave 5 — Ambient life + sharing
- Ambient butterflies (8 sprites with flap, drift, bob)
- Screenshot share with watermark
- Reduce-motion gating across all decorative animations
- ARIA labels + role/aria-live + Open Graph + favicon
- Tour completion celebration message

### Wave 4 — Operational polish
- Minimap colored zone dots
- Subtle head-bob during walk
- Zone splash with timestamp
- Settings menu (reduce motion / compass / waypoints)
- CTA button hover effects

### Wave 3 — Identity + paths
- Welcome zone hero: portrait frame + 3 floating gold orbs
- Path waypoints: 7 pulsing gold spheres at zones
- Panel color stripes per zone
- Tour PREV button
- Version tag

### Wave 2 — Discovery
- Keyboard shortcuts overlay (?)
- Zone proximity sparkles
- Dynamic sun + sky color cycle
- Tour pause/resume from saved zone
- Mobile UX cleanup
- Panel pop-in animation

### Wave 1 — Foundation
- Per-zone color identity (forest green, terracotta, antique gold,
  deep purple, burgundy, teal, crimson)
- Hover glow + crosshair feedback
- Zone arrival splash (1.5s overlay)
- FPS-adaptive quality
- Tour skip button
- Loading screen with progress
- Easter egg: click sky 7×
- Compass HUD
- Hire → Collaborate rename

### Foundation (pre-waves)
- 7-zone world with WASD + pointer-lock
- Guided 45-second tour with narration
- Audio (event-driven sounds)
- Post-processing (bloom, tone mapping, vignette)
- Fog, particles, atmosphere

## Credits

Built in two evenings with Claude Code, the Anthropic Agent SDK,
and a lot of `[fix]` commits.
