# Our Time — Love for Mena

A private little clock: it counts every day, hour and heartbeat since you two
started, counts down to each anniversary, and quietly celebrates your
milestones. Part of the **Love for Mena** collection.

**Live:** https://ammar49-cyber.github.io/love-countdown/

## What it does

- Live "together for" counter (days · hours · minutes · seconds)
- Anniversary ring — progress through the year toward the next one
- Milestones (1 week, 100 days, one year, one thousand days, …) with dates
- "Add to calendar" → downloads a yearly recurring `.ics` you can put on any
  phone or computer
- Optional daily browser reminder (works while a tab is open)
- Installable PWA with offline support
- Everything is stored on the device only — no tracking, no network calls

## Set your date

Open the **Settings** section and enter your anniversary (and her name). It is
saved in `localStorage` on that device. To change the default for a fresh
visitor, edit the `read(STORE.date, "")` fallback in `js/app.js`.

## Files

- `index.html` — the page
- `css/theme.css` — shared love-theme (copied from `_love-theme/`)
- `css/app.css` — page-specific styles
- `js/theme-main.js`, `js/effects.js` — shared behaviour/effects
- `js/app.js` — the counter, ring, milestones, calendar, reminders
- `manifest.webmanifest`, `sw.js` — PWA
- `assets/` — favicon and icons

## Run locally

```powershell
py -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Static site, deployed with GitHub Pages from `main`.

## License

Creative Commons BY-NC-ND 4.0 — see [`LICENSE`](LICENSE).
© 2026 Ammar (ammar49-cyber). Made with care for Mena.
