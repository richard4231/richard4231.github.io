# Mandarinenpackungen Simulation

## Beschreibung
Dieses Applet simuliert die Gewichtsverteilung von 1kg Mandarinenpackungen und visualisiert diese als Normalverteilung.

## Funktionen

### Schieberegler
- **Anzahl Packungen** (1-5000): Steuert, wie viele Packungen simuliert werden
- **Standardabweichung** (1-30g): Steuert die Streuung der Gewichte

### Checkbox
- **Median & Mittelwert anzeigen**: Blendet vertikale Linien für Median (pink gestrichelt) und Mittelwert (grün gepunktet) ein

### Visualisierungsmodi
Das Applet passt die Darstellung automatisch an die Anzahl der Packungen an:

1. **1-10 Packungen**: Jede Packung wird als blaues Rechteck mit dem genauen Gewicht dargestellt
   - Legende: 🔷 = 1 Packung (mit Gewicht in g)

2. **11-999 Packungen**: Kleine orange Punkte werden gestapelt (Histogramm-Darstellung)
   - Legende: 🟠 = 1 Packung

3. **1000+ Packungen**: Orange Säulen zeigen die Häufigkeitsverteilung
   - Breite der Säule = Intervallgröße (0,1g bei ≥1000 Packungen)
   - Legende: Säule = Anzahl Packungen, Breite = Intervallgröße

### Achsenbeschriftung
- **X-Achse**: Masse in Gramm (990g - 1030g)
- **Y-Achse**: Anzahl der Packungen (skaliert automatisch basierend auf der höchsten Säule)

### Normalverteilungskurve
Die blaue Kurve zeigt die theoretische Normalverteilung und skaliert mit der Anzahl der Packungen. Die Y-Achse passt sich automatisch an, sodass die Kurve und die Daten immer gut sichtbar sind.

### Einstellbare Parameter im Code

In `sketch.js` kannst du folgende Werte anpassen:

```javascript
let mittelwert = 1010;           // Mittelwert in Gramm
let standardabweichung = 5;      // Standardabweichung (auch per Slider)
let binSize = 2;                 // Histogramm-Intervallgröße (0.5-5g)
let minMasse = 990;              // Minimale Masse auf X-Achse
let maxMasse = 1030;             // Maximale Masse auf X-Achse
```

## Installation

1. Lade alle drei Dateien (index.html, sketch.js, style.css) in denselben Ordner
2. Öffne `index.html` in einem modernen Browser
3. Das Applet sollte sofort funktionieren

## Optional: Font
Das Applet versucht, den PoloCEF-Font zu laden (wie im Original-Applet). Wenn der Font nicht verfügbar ist, wird automatisch ein Fallback-Font verwendet. Um den Font zu nutzen:

1. Erstelle einen Unterordner `assets/`
2. Lege die Datei `PoloCEF-Regular.otf` dort ab

## Technologie
- p5.js (Version 2.0.3)
- Normalverteilung nach Box-Muller-Transform
- Responsive Canvas-Visualisierung

## Nutzung
- Bewege die Schieberegler, um verschiedene Szenarien zu simulieren
- Die Normalverteilungskurve (blau) zeigt die theoretische Verteilung
- Die gestapelten Elemente zeigen die tatsächlich simulierten Werte
- Bei vielen Packungen entsteht ein typisches "Gaußsches" Histogramm