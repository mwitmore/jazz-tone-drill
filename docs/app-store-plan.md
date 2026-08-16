# App Store plan (later)

Do this only when you want Jazz Tone Drill in the iOS App Store. Until then, Cloudflare Pages + Add to Home Screen is enough.

**Approach:** wrap the existing Vite/React app with [Capacitor](https://capacitorjs.com). Do not rewrite in Swift or React Native.

**Rough cost:** Apple Developer Program $99/year. Time: a weekend for a TestFlight build if the web app is stable; another few days for listing, screenshots, and review.

---

## Why Capacitor

The app is already phone-first, has no backend, and stores settings in `localStorage`. Capacitor puts that same `dist/` build in a native WKWebView, then gives you an Xcode project to archive and upload.

You keep editing the same files (`src/components`, `src/theory`, `src/audio`). A store release is `npm run build` plus an Xcode archive — not a second codebase.

---

## Phase 0 — Before you start

- [ ] Web app feels done enough that you will not change layout every day
- [ ] Live Pages URL works on your iPhone (sound, timer, settings)
- [ ] Apple ID you will use for the store
- [ ] Enroll in [Apple Developer Program](https://developer.apple.com/programs/) ($99/year). Approval can take a day or two
- [ ] Mac with a recent Xcode (you already have a Mac)
- [ ] Physical iPhone for TestFlight (Simulator is not enough for audio)

---

## Phase 1 — Native shell (half day)

On the laptop, in this repo:

1. Install Capacitor and add the iOS platform (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`).
2. Point Capacitor at Vite’s `dist/` output (`webDir: "dist"` in `capacitor.config.ts`).
3. `npm run build` then `npx cap add ios` then `npx cap sync`.
4. Open `ios/App/App.xcworkspace` in Xcode.
5. Set Bundle ID (e.g. `com.mwitmore.jazztone`). This cannot be a generic `com.example` for the store.
6. Add a 1024×1024 app icon and a simple splash (the existing `public/icon.svg` is a start; App Store wants PNG).
7. Run on a device from Xcode. Confirm the drill, note pad, and Play sound work.

Do **not** check secrets or your signing certificate into git. The `ios/` folder can live in the repo once it builds cleanly.

---

## Phase 2 — iOS-specific fixes (half day)

These are the things Safari already fakes; a store app should do them properly.

| Issue | What to do |
|---|---|
| Silent switch mutes sound | Use Capacitor’s audio / a small native plugin so playback is “playback” category, not “ambient” |
| First-tap unlock | Still fine; optionally start the audio session when the app becomes active |
| Status bar / safe area | You already use `env(safe-area-inset-*)`. Check notch + Home indicator in the native chrome |
| Offline | PWA service worker may be redundant in the wrapper. Prefer Capacitor’s bundled `dist/` so the app works with no network |
| Orientation | Lock to portrait unless you want landscape on a stand |
| External links | None today. If you add any, they must open in-app or Safari and stay App Review–safe |

Keep Cloudflare Pages. The store binary and the website can share one `src/`.

---

## Phase 3 — TestFlight (a few hours + waiting)

1. In Xcode: signing team = your Developer account, increment version/build.
2. Product → Archive → Distribute → App Store Connect → TestFlight.
3. On the phone, install TestFlight and the build.
4. Practice a real session on a stand: auto-advance, auto sound, reveal, Settings below the fold.
5. Fix anything that only shows up in the wrapper, then ship another build (build number +1).

Internal TestFlight is usually available within an hour after processing.

---

## Phase 4 — Store listing (an evening)

App Store Connect needs:

- Name (e.g. **Jazz Tone Drill**) and subtitle
- Category: Music or Education
- Description: what it drills (chord tones, parent modes, ii–V–I). Say it is a practice aid, not a full fake book
- Keywords
- Privacy: no account, no tracking, settings stay on device. Nutrition labels should be “Data Not Collected” if that stays true
- Support URL (GitHub repo or a one-page site is enough)
- Screenshots for the iPhone sizes Apple currently requires (6.7" and whatever is listed that year)
- Age rating (4+ if nothing changes)

No login, no IAP, no ads keeps review simpler. Do not add those for v1.

---

## Phase 5 — Submit and review

1. Attach the TestFlight build to a version.
2. Submit for review.
3. Typical wait: a few days. Common rejections for a wrapped web app:
   - Incomplete metadata or missing screenshots
   - App looks unfinished (placeholder icon)
   - “This is just a website” — make sure it works fully offline and does not bounce the user to Safari to use the product
   - Missing privacy text

After approval, a tap on the App Store is the install path. Updates are a new archive + review (or a shorter review for small updates).

---

## What not to do

- Do not rewrite the theory engine in Swift
- Do not add accounts, iCloud sync, or IAP in the first store version
- Do not drop the Cloudflare site — it is still the fastest way to try a change
- Do not expect Cursor-on-phone to produce a signed iOS build. Phone edits still go to `src/` and GitHub; you archive from the Mac

---

## Suggested order when you pick this up

1. Apple Developer enrollment (start this first; it is the slow part)
2. Capacitor + `ios/` project, run on your phone
3. Audio session so Play works with the ringer off
4. TestFlight for a week of real practice
5. Listing + submit

When you are ready, say so in Cursor and we can do Phase 1 in this repo without touching the live Pages site.
