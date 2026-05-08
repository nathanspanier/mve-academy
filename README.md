# MVE Academy

Minimum Viable Engineer — a course for PMs who need to ship.

16 modules, 5 phases, ~72 hours.

## Local development

You need a local server because the site fetches JSON files. Opening `index.html` directly won't work.

**Option 1 — VS Code Live Server** (covered in M2):
- Install the Live Server extension
- Right-click `index.html` → Open with Live Server

**Option 2 — npx serve** (requires Node, covered in M5):
```bash
cd mve-academy
npx serve .
```
Then open http://localhost:3000

## File structure

```
mve-academy/
├── index.html          ← Course home (module cards)
├── module.html         ← Lab Bench shell (reused for all modules)
├── data/
│   ├── syllabus.json   ← Module metadata, phase structure
│   ├── m0.json         ← M0 step content
│   └── m1.json         ← (add as modules are authored)
├── css/
│   └── style.css       ← Shared design tokens
├── js/
│   ├── app.js          ← Progress, navigation, utilities
│   └── labench.js      ← Lab Bench renderer
└── .github/workflows/
    └── deploy.yml      ← Auto-deploy to GitHub Pages
```

## Adding a new module

1. Create `data/mN.json` following the structure of `data/m0.json`
2. Update `data/syllabus.json` — set `"status": "ready"` and `"unlocked": true` for the new module
3. Push to `main` — GitHub Pages deploys automatically

## Hosting

Deployed via GitHub Pages. Auto-deploys on every push to `main`.

To enable: GitHub repo → Settings → Pages → Source: GitHub Actions
