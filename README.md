# Phalen + Ronan Palette Explorer

A no-build static PWA prototype for browsing a digitized historical sign-painting color system and connecting it to Ronan stock colors, formula colors, and future makeable shop builds.

## Current MVP features

- Browse 287 historical Phalen color combinations.
- Start with the sign painter workflow: background/panel color first, main copy second.
- Main copy dropdown only shows colors documented for the selected background.
- Palette cards show:
  - Background color
  - Main copy color
  - Accent colors
  - Historical swatches
  - Current Ronan build / anchor notes
- New Color Builds tab:
  - Search all canonical Phalen colors.
  - See current direct stock/formula anchors from the hex-reviewed Rosetta sheet.
  - Placeholder structure for future “base + modifier + tint” formulas.
- My Ronan Paint Collection tab:
  - Actual stock can checkboxes with hex swatches.
  - Ronan formula/mix color reference list with sampled hex swatches.
  - Local browser storage.
- All Palettes archive grouped by background color.
- Random Palette tab.
- Works as a simple static PWA on GitHub Pages.

## Important concept

The app preserves Phalen’s historical color language, but the long-term goal is practical translation:

Historical color name  
→ closest Ronan stock color or Ronan formula color  
→ makeable shop build  
→ palette availability based on what the painter owns

Example future build:

Greenish Cream  
→ Vanilla Bean base  
→ touch French Green  
→ lighten with White/Ivory as needed

## Files

- `index.html` - app page
- `style.css` - blue/black app styling
- `app.js` - app logic
- `data.js` - generated palette, dictionary, Ronan color, and build data
- `manifest.webmanifest` - PWA manifest
- `sw.js` - service worker
- `icon.svg` - app icon

## GitHub Pages setup

1. Upload all files to the repository root.
2. Go to **Settings → Pages**.
3. Source: **Deploy from a branch**
4. Branch: **main**
5. Folder: **/root**
6. Save.

## Prototype warning

Ronan mappings, formulas, mix assumptions, and historical UI swatches are working notes and should be tested before any public official release.
