# CLAUDE.md - Project Instructions

## Project Overview
This is a GitHub Pages site (richard4231.github.io) containing interactive mathematical visualizations, simulations, and educational tools. Most projects use **p5.js** for graphics and interactivity.

## Project Structure
- Each visualization lives in its own folder (e.g., `25-02-gummybears/`, `25-12-cavalieri-v03/`)
- Folder naming convention: `YY-MM-projectname` (year-month-projectname)
- Standard files per project:
  - `index.html` - Entry point
  - `sketch.js` - Main p5.js code
  - `style.css` - Styling
  - `libraries/` - Local p5.js and other libraries (when included)

## Tech Stack
- **p5.js** - Primary graphics library
- **WebGPU** - Used in newer high-performance visualizations (e.g., `25-12-xplodingsierpinski-webgpu/`)
- **dat.gui.js / quicksettings.js** - UI controls in some projects
- Vanilla HTML/CSS/JavaScript (no build tools)

## Design Guidelines
- Primary accent color: `rgb(217, 78, 31)` (orange-red, used in sliders/UI)
- Slider styling defined in shared `style.css` files
- Canvas should be `display: block` with no margin/padding on html/body
- German language for UI text (educational context: Swiss schools)

## Common Tasks
- **New visualization**: Copy an existing project folder, rename with current date prefix
- **Test locally**: Open `index.html` directly in browser or use Live Server
- **Deploy**: Push to main branch - GitHub Pages auto-deploys

## Past Conversation Paths
Claude Code conversations are stored locally. To preserve context:

### macOS Claude Code conversations location:
```
~/.claude/projects/-Users-andreasrichard-Library-CloudStorage-OneDrive-Perso-nlich-01JupyterAndCo-04GitHub-GitHubCloneMac-richard4231-github-io/
```

### Wichtige Konversationen:

| Datum | Thema | Datei |
|-------|-------|-------|
| 2026-01-08 | 26-01-Wurzelschnecke (WebGPU 3D-Spirale, Theodorus, interaktive Dreiecke) | `010e8d48-c8c4-4316-a237-27c7925106a6.jsonl` |
| 2026-01-08 | JS-3K6B-Standardabweichung (Normalverteilung, CSV/Excel Export, interaktive Intervall-Linien) | `0429689c-838f-4010-8859-0703a058e9f8.jsonl` |

### Weitere Dateien:
- Main config: `~/.claude/settings.json`
- Projects: `~/.claude/projects/`

## Projektübersicht

### 26-01-Wurzelschnecke
**Interaktive 3D-Wurzelschnecke (Theodorus-Spirale)**
- **Tech:** WebGPU (kein p5.js!), wgpu-matrix für 3D-Mathematik
- **Features:**
  - 3D-Darstellung mit goldbrauner Farbpalette (`#D4A574` bis `#5D4037`)
  - Leuchtende goldene Kanten mit Glow-Effekt
  - Interaktive Steuerung: Mausziehen (Rotation), Mausrad (Zoom), WASD (Kamera)
  - Klick auf Dreieck zeigt mathematische Infos (Katheten, Hypotenuse, Satz des Pythagoras)
  - Slider für Anzahl Dreiecke, 3D-Spirale (Z-Versatz), Helligkeit
- **Mathematik:** Jedes Dreieck n hat Kathete a=1, Kathete b=√n, Hypotenuse c=√(n+1)

## Notes
- Some projects have German folder names with umlauts (e.g., `Binärzahlenspiel`)
- The `25-02-mb21pub/` folder contains Mathbuch-related tools
- `Jellybears/` and `25-02-gummybears/` are related probability simulations
