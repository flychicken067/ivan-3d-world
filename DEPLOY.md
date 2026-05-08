# Deployment Guide

This guide covers deploying Ivan's World to production.

## Quick Deploy: Vercel (recommended)

Vercel is the fastest path. The repo includes a `vercel.json` with sensible defaults.

```bash
# One-time install
npm i -g vercel

# From project root
vercel              # first run — links to your account, deploys preview
vercel --prod       # subsequent — deploys to production
```

That's it. Vercel auto-detects Vite, runs `npm run build`, serves `dist/`.

## Alternative: Cloudflare Pages

```bash
# One-time
npm i -g wrangler
wrangler login

# Deploy
npm run build
wrangler pages deploy dist --project-name ivans-world
```

## Alternative: Netlify

```bash
# One-time
npm i -g netlify-cli

# Deploy
netlify deploy --build      # preview
netlify deploy --build --prod
```

## Static hosting (any provider)

```bash
npm run build
# Upload contents of dist/ to your host
```

The site is fully static. No backend, no env vars, no database.

## Custom domain setup

After deploy, point your DNS:

| Provider | Record type | Value |
| --- | --- | --- |
| Vercel | CNAME | `cname.vercel-dns.com` |
| Cloudflare Pages | CNAME | `<project>.pages.dev` |
| Netlify | CNAME | `<project>.netlify.app` |

Then add the domain in the dashboard.

## Performance tips

- The bundle is ~625KB JS / 160KB gzipped — well under the 1MB practical budget for a portfolio site
- All assets are cached `immutable` for 1 year via headers in `vercel.json`
- WebGL fallback covers the ~3% of visitors without WebGL

## Pre-deploy checklist

- [ ] `npm run build` succeeds with zero errors
- [ ] Open the start screen — TAKE THE TOUR works
- [ ] Walk through all 7 zones, each panel renders
- [ ] Test on a phone (iOS Safari + Android Chrome)
- [ ] Verify Open Graph card on `https://www.opengraph.xyz/`
- [ ] Check audio toggle works
- [ ] Try `?` shortcut overlay
- [ ] Try the easter eggs (click sky 7x, Konami code)

## Post-deploy

- Share the link in your bio (X, 小红书, 微博, GitHub README)
- Monitor analytics — Vercel Analytics is free, drop-in
- Iterate on zone content based on which zones get the most clicks

---

Built with Three.js + Claude Code.
