# Phalen + Ronan Palette Explorer

A no-build static PWA prototype for browsing a digitized historical sign-painting color system and connecting it to Ronan paint notes.

## Current MVP features

- Browse 287 historical Phalen color combinations.
- Start with the sign painter workflow: background/panel color first, main copy second.
- Main copy dropdown only shows colors documented for the selected background.
- Palette cards show:
  - Background color
  - Main copy color
  - Accent colors
  - Ronan match notes
  - Match confidence
  - UI swatches for historical color names
- All Palettes archive grouped by background color.
- Random Palette tab.
- My Ronan Paint Collection tab with local browser storage.
- Select all / clear all paint collection buttons for demo and testing.
- “Show strongest owned matches first” filter moved into the Browse controls.
- Works as a simple static PWA on GitHub Pages.

## Files

- `index.html` - app page
- `style.css` - blue/black app styling
- `app.js` - app logic
- `data.js` - generated palette, dictionary, Ronan, and swatch data
- `manifest.webmanifest` - PWA manifest
- `sw.js` - service worker
- `icon.svg` - app icon

## Important note

This is a prototype. Ronan mappings, mix assumptions, and historical UI swatches are working notes and should be tested before any public official release.
