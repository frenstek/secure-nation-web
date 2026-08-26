# Secure Nation Group — Marketing Website

Public-facing marketing website for Secure Nation Group — Australia's First Indigenous Security Company.

**Live:** https://secure-nation-web.vercel.app

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Vanilla CSS animations (no animation libraries)

## Getting Started

```bash
# 1. Clone
git clone https://github.com/kraegeronimo-tech/secure-nation-web.git
cd secure-nation-web

# 2. Install
npm install

# 3. Run locally
npm run dev
```

Opens at `http://localhost:5173`

## Project Structure

```
secure-nation-web/
├── public/              # Images, videos, favicon
│   ├── hero-bg.jpg      # Hero background
│   ├── hero-video.mp4   # Hero background video
│   ├── broll-video.mp4  # B-roll section video
│   ├── logo.jpg         # Company logo
│   ├── about-bg.jpg     # About section background
│   ├── services-bg.jpg  # Services section background
│   ├── australia-map.jpg
│   ├── showcase-*.jpg   # Project showcase images
│   └── icons.svg        # SVG icon sprite
├── src/
│   ├── App.jsx          # ALL content and components (single file)
│   ├── index.css        # Global styles + Tailwind + animations
│   └── main.jsx         # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## How to Edit

### Content
Everything is in **`src/App.jsx`** — one file. Sections are clearly labeled with comments:
- Hero section (headline, rotating scramble text, CTA buttons)
- Stats counters (animated numbers on scroll)
- Services grid
- About section
- Project showcase
- Contact / CTA
- Footer

### Images & Videos
Replace files in `public/` with the same filenames, or update the references in `App.jsx`.

### Colors & Theme
- Primary dark: `#0a0a0a` (near black)
- Accent: Indigo/purple highlights
- Edit CSS variables and Tailwind classes in `App.jsx` and `src/index.css`

### Animations
Built-in effects (no external libraries needed):
- **Scramble text** — characters scramble then resolve (hero headline)
- **Rotating scramble** — text cycles through phrases with scramble transition
- **Scroll reveal** — elements fade/slide in when scrolled into view
- **Counter animation** — numbers count up when visible
- **Dot circle** — decorative animated dot pattern

## Build & Deploy

```bash
# Build for production
npm run build

# Output goes to dist/ — host anywhere

# Deploy to Vercel
npx vercel --prod
```

The `dist/` folder is a static site — works on any hosting (Vercel, Netlify, Apache, Nginx, etc).

## Notes

- Single-page app with smooth scroll navigation
- Fully responsive (mobile, tablet, desktop)
- No backend required — pure static site
- All animations are CSS/JS only, no external dependencies beyond React + Vite
