# Jazz Tone Drill

Phone-first practice-stand app for naming **chord tones** (and optionally the **parent scale/mode**) over isolated chords and short jazz sequences. Use iReal Pro for time. Use this for 10–15 minutes of forced naming.

**Repo:** [github.com/mwitmore/jazz-tone-drill](https://github.com/mwitmore/jazz-tone-drill)

**Live site:** after you connect this repo in Cloudflare Pages (one-time, below), it will be  
`https://jazz-tone-drill.pages.dev`  
(or the URL Cloudflare shows). Add that page to your Home Screen.

**App Store (later):** see [docs/app-store-plan.md](docs/app-store-plan.md). Do not start it until the web app is stable. It is a Capacitor wrap of this same repo, not a rewrite.

## Run locally

```bash
npm install
npm run dev
```

Then `npm run build` / `npm test` / `npm run deploy` as needed.

## Edit from your phone (Cursor)

1. Open [mwitmore/jazz-tone-drill](https://github.com/mwitmore/jazz-tone-drill) in the Cursor app.
2. Change the file you need (table below).
3. Commit and **push to `main`**.
4. If Cloudflare Pages is connected to the repo, the live site rebuilds in a minute or two. Hard-refresh the phone page (or close the tab) to see it.

You do **not** need to run a local server on your phone.

## What to change

| I want to… | Edit |
|---|---|
| Layout, type size, colors | [`src/index.css`](src/index.css) |
| Play / Next / timer / note pad layout | [`src/components/DrillScreen.tsx`](src/components/DrillScreen.tsx) |
| Settings sheet (auto sound, keys, chord types) | [`src/components/SettingsPanel.tsx`](src/components/SettingsPanel.tsx) |
| Soft root → upper-tone clip | [`src/audio/playChord.ts`](src/audio/playChord.ts) |
| Default settings (keys, qualities, 3rds/7ths) | [`src/drills/settings.ts`](src/drills/settings.ts) |
| How a question is dealt / graded | [`src/drills/engine.ts`](src/drills/engine.ts) |
| Chord tones and symbols (`7alt`, `#9` spelling) | [`src/theory/chords.ts`](src/theory/chords.ts) |
| Note spelling (Gb7 → Bb, not A#) | [`src/theory/notes.ts`](src/theory/notes.ts) |
| Modes of major / melodic minor / harmonic minor | [`src/theory/scales.ts`](src/theory/scales.ts) |
| Chord → parent scale (Superlocrian, Lydian ♯2, …) | [`src/theory/parents.ts`](src/theory/parents.ts) |
| ii–V–I and other sequences | [`src/theory/progressions.ts`](src/theory/progressions.ts) |

**A** = name the tone. **B** = name the tone and the parent mode. Toggle is below the fold with Settings.

## Deploy to Cloudflare Pages

### First time (laptop)

1. Install and log in (opens a browser):

   ```bash
   npm install
   npx wrangler login
   ```

2. Build and publish:

   ```bash
   npm run deploy
   ```

3. In the [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **jazz-tone-drill** → **Settings** → **Builds & deployments** → **Connect to Git**. Pick this GitHub repo.

   - Framework preset: Vite  
   - Build command: `npm run build`  
   - Output directory: `dist`  
   - Branch: `main`

After that, every push to `main` (including from Cursor on your phone) updates the live site.

When we change the app in Cursor on this Mac, the agent runs `npm run deploy` so https://jazz-tone-drill.pages.dev updates without an extra step. Docs-only edits are not deployed.

### Later deploys from a laptop

```bash
npm run deploy
```

## Project map

```
src/
  audio/playChord.ts      Root, then asked tone (WAV on an <audio> element — works on iPhone)
  components/             Drill UI
  drills/                 Question engine + saved settings
  theory/                 Spelling, chords, scales, progressions
  index.css               Phone-first stand layout
```

Settings live in the browser (`localStorage`). Changing defaults in `settings.ts` only affects a fresh install or after you clear site data.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local server (use the Network URL on the same Wi‑Fi) |
| `npm test` | Theory + drill tests |
| `npm run build` | Production build in `dist/` |
| `npm run deploy` | Build, then upload `dist/` to Cloudflare Pages |
