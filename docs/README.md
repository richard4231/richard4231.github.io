# GitHub Pages Hauptseite - Dokumentation

Diese Seite ist die zentrale Übersichtsseite für alle Simulationen und Visualisierungen auf [richard4231.github.io](https://richard4231.github.io).

## Dateistruktur

```
docs/
├── index.html          # Hauptseite
├── style.css           # Styling inkl. Hintergrundfarben
├── script.js           # JavaScript für Tab-Funktionalität
├── data.json           # Datenquelle für Tabs und Projekte
├── screenshots/        # Vorschaubilder
└── README.md          # Diese Datei
```

## data.json - Struktur

Die `data.json` Datei steuert den Inhalt der Seite. Sie enthält ein Array von Tab-Objekten.

### Erforderliche Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `section` | String | Name des Tabs (wird angezeigt) |
| `category` | String | Kategorie für Styling und Hintergrundfarbe<br>Verfügbar: `welcome`, `main`, `further` |

### Optionale Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `isWelcome` | Boolean | `true` = Zeigt Willkommenstext statt Grid |
| `isImpressum` | Boolean | `true` = Zeigt Impressum statt Grid |
| `items` | Array | Liste der Projekt-Karten (nur bei normalen Tabs) |

### Item-Struktur (für normale Tabs)

```json
{
  "title": "Projektname",
  "url": "https://richard4231.github.io/projekt-ordner/",
  "img": "screenshots/projekt-screenshot.png"
}
```

### Beispiel

```json
[
  {
    "section": "Über diese Seite",
    "category": "welcome",
    "isWelcome": true,
    "items": []
  },
  {
    "section": "Simulationen",
    "category": "main",
    "items": [
      {
        "title": "Gummibärchen",
        "url": "https://richard4231.github.io/25-02-gummybears/",
        "img": "screenshots/25-02-gummybears.png"
      }
    ]
  }
]
```

## Hintergrundfarben anpassen

Die Seite passt den Hintergrund automatisch an den aktiven Tab an. Die Farben werden in `style.css` definiert.

### Farben ändern

In `style.css` (Zeilen 28-41):

```css
/* Intensität der Hintergrundfarbe (0.0 = transparent, 1.0 = volle Farbe) */
--bg-opacity: 0.15;

/* Hintergrundfarben pro Kategorie (RGB-Werte ohne Alpha) */
--bg-category-welcome: 151, 166, 182;    /* Über diese Seite, Impressum */
--bg-category-main: 176, 181, 151;       /* Simulationen, Muster, 3D, ... */
--bg-category-further: 181, 152, 150;    /* Weitere Seiten */
```

**Anpassungen:**
- **Intensität ändern:** `--bg-opacity` (z.B. `0.08` für subtil, `0.25` für stark)
- **Farbe ändern:** RGB-Werte anpassen (z.B. `--bg-category-main: 100, 200, 150;`)

### Neue Kategorie hinzufügen

**Schritt 1:** In `style.css` eine neue Variable definieren:
```css
--bg-category-NEUERNAME: 200, 150, 100;    /* Beschreibung */
```

**Schritt 2:** In `data.json` die neue Kategorie verwenden:
```json
{
  "section": "Meine neue Kategorie",
  "category": "NEUERNAME",
  "items": [...]
}
```

Die Hintergrundfarbe wird automatisch beim Tab-Wechsel angewendet.

## Neues Projekt hinzufügen

1. **Screenshot erstellen:** Speichere ein Vorschaubild in `docs/screenshots/`
2. **data.json bearbeiten:** Füge ein neues Item zum gewünschten Tab hinzu:
   ```json
   {
     "title": "Mein neues Projekt",
     "url": "https://richard4231.github.io/26-01-mein-projekt/",
     "img": "screenshots/26-01-mein-projekt.png"
   }
   ```
3. **Pushen:** Die Änderungen werden automatisch auf GitHub Pages deployed

## Technologie

- **Vanilla JavaScript** - Keine Frameworks, keine Build-Tools
- **CSS Custom Properties** - Für dynamische Farbänderungen
- **Fetch API** - Lädt `data.json` asynchron
- **GitHub Pages** - Automatisches Deployment bei Push

## Wartung

- **Neue Tabs:** In `data.json` ein neues Objekt hinzufügen
- **Tabs umsortieren:** Reihenfolge in `data.json` ändern
- **Farben anpassen:** In `style.css` die CSS-Variablen ändern
- **Layout ändern:** In `style.css` Grid-Eigenschaften anpassen

---

**Entwickelt von Andreas Richard** für den Mathematikunterricht
---
