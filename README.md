# Phalen + Ronan Palette Explorer

A no-build static PWA prototype.

## What it does

- Lets you choose a historical background/panel color.
- Filters the main-copy dropdown to only real Phalen palette combinations.
- Shows palette cards with background, main copy, and accent colors.
- Shows Ronan match/confidence notes from the workbook dictionary.
- Lets users check off owned Ronan stock colors.
- Saves owned paint locally in the browser using localStorage.
- Works on GitHub Pages.

## Files

- `index.html` - app page
- `style.css` - blue/black app styling
- `app.js` - app logic
- `data.js` - generated palette/dictionary data
- `manifest.webmanifest` - PWA manifest
- `sw.js` - service worker
- `icon.svg` - app icon

## GitHub Pages setup

1. Create a new GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to **Settings**.
4. Go to **Pages**.
5. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Click **Save**.
7. Wait a minute or two.
8. Your app will be live at:

`https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

## Notes

This is an MVP. Ronan matches and confidence values are working notes and should be tested before publication.
