# 3R6 Standardabweichung erkunden

## Beschreibung
Dieses Applet simuliert die Gewichtsverteilung von 1kg Mandarinenpackungen und visualisiert diese als Normalverteilung. Es ist speziell für den Mathematikunterricht konzipiert, um Standardabweichung und Normalverteilung anschaulich zu erkunden. Canvas-Größe: 800×600 Pixel (optimal für Computer und Tablets).

## Funktionen

### Schieberegler
- **Anzahl Packungen** (1-5000): Steuert, wie viele Packungen simuliert werden
  - Ändert die Zufallsverteilung neu
- **Standardabweichung** (1-30g): Steuert die Streuung der Gewichte
  - Generiert neue Zufallsverteilung
- **Intervallgröße** (0.5-10g): Steuert die Breite der Histogramm-Intervalle in 0.5g Schritten
  - Ändert nur die Darstellung, nicht die Zufallsdaten!

### Checkboxen
- **Median & Mittelwert anzeigen**: Blendet vertikale Linien für Median (pink gestrichelt) und Mittelwert (grün gepunktet) ein
- **Standardabweichung anzeigen**: Zeigt die 1., 2. und 3. Standardabweichung als vertikale Linien
  - ±σ (1. Standardabweichung): Deutlich sichtbar, blaue gestrichelte Linien
  - ±2σ (2. Standardabweichung): Dezenter, hellere gestrichelte Linien
  - ±3σ (3. Standardabweichung): Sehr dezent, noch hellere gestrichelte Linien
- **Fixe Kurvenhöhe**: 
  - Aktiviert: Normalverteilungskurve nutzt immer die volle Diagrammhöhe (gut für kleine Stichproben)
  - Deaktiviert: Kurve wächst mit Anzahl der Packungen (realistische Darstellung)
- **Sehr viele Packungen (×100)**: Multipliziert die Anzahl der Packungen mit 100 für große Stichproben

### Visualisierungsmodi
Das Applet passt die Darstellung automatisch an die Anzahl der Packungen an:

1. **1-50 Packungen**: Große blaue Rechtecke mit exaktem Gewicht
   - Stapeln von unten nach oben
   - Adaptive Größe: Bei mehr Packungen werden sie kleiner
   - Legende: 🔷 = 1 Packung (mit Gewicht in g)

2. **51-999 Packungen**: Orange Punkte gestapelt (Histogramm)
   - Adaptive Punktgröße: Werden bei höheren Zahlen kleiner und dichter
   - Stapeln von unten nach oben
   - Legende: 🟠 = 1 Packung

3. **1000+ Packungen**: Orange Säulen mit feinem Rand
   - Breite der Säule = eingestellte Intervallgröße
   - Feiner oranger Rand für bessere Sichtbarkeit
   - Legende: Säule = Anzahl Packungen, Breite = Intervallgröße

### Interaktive Features
- **Präziser Hover-Effekt**: Fahre mit der Maus über Säulen oder gestapelte Packungen
  - Zeigt die genaue Anzahl in einem Tooltip
  - Funktioniert nur innerhalb der tatsächlichen Säule/Packungen
  - Zeigt auch "Anzahl: 0" für leere Bins an

### Achsenbeschriftung
- **X-Achse**: Masse in Gramm (990g - 1030g)
- **Y-Achse**: Anzahl der Packungen - skaliert automatisch in sinnvollen Schritten (5er, 10er, 25er, 50er, 100er, etc.)

### Normalverteilungskurve
Die blaue Kurve zeigt die theoretische Normalverteilung:
- **Skalierbar (Standard)**: Wächst mit Anzahl der Packungen, begrenzt auf maximale Säulenhöhe
- **Fix (optional)**: Nutzt immer die volle Diagrammhöhe - ideal zum Vergleichen kleiner Stichproben

### Einstellbare Parameter im Code

In `sketch.js` kannst du folgende Werte anpassen:

```javascript
let canvasWidth = 800;           // Canvas-Breite in Pixeln
let canvasHeight = 600;          // Canvas-Höhe in Pixeln
let margin = 70;                 // Rand für Achsenbeschriftung (mehr Platz für Y-Achse)
let mittelwert = 1010;           // Mittelwert in Gramm
let standardabweichung = 5;      // Standardabweichung (auch per Slider)
let binSize = 2;                 // Start-Intervallgröße (auch per Slider: 0.5-10g)
let minMasse = 990;              // Minimale Masse auf X-Achse
let maxMasse = 1030;             // Maximale Masse auf X-Achse
let wechsel_punkt = 50;          // Ab dieser Anzahl: Punktmodus
let wechsel_balken = 1000;       // Ab dieser Anzahl: Balkenmodus
let multiplikator = 100;         // Faktor für "Sehr viele Packungen" Checkbox (änderbar im Code)
```

### Technische Details

- **Zufallsverteilung**: Wird nur bei Änderung der Anzahl Packungen, Standardabweichung oder beim Neuladen neu generiert. Änderungen der Intervallgröße behalten die gleichen Zufallsdaten!
- **Multiplikator-Modus**: Wenn aktiviert, wird die Packungsanzahl mit dem Faktor multipliziert (Standard: 100×), ideal für große Stichproben
- **Histogramm-Binning**: Die Intervalle sind um ganze Werte zentriert. Bei einer Intervallgröße von 1g und Mittelwert 1010g geht das Intervall von 1009.5g bis 1010.5g
- **Y-Achsen-Skalierung**: Die Schrittgröße wird automatisch in sinnvollen Werten gewählt (5, 10, 25, 50, 100, 200, 250, 500, etc.)
- **Balkenbreite**: Die Breite der Säulen entspricht exakt der eingestellten Intervallgröße auf der Masse-Skala
- **Adaptive Darstellung**: Packungen und Punkte werden bei höheren Anzahlen automatisch kleiner und dichter gepackt
- **Präzise Hover-Erkennung**: Der Tooltip erscheint nur, wenn die Maus tatsächlich innerhalb der Säule oder gestapelten Elemente ist
- **Standardabweichungs-Visualisierung**: Zeigt ±1σ, ±2σ und ±3σ mit unterschiedlicher Sichtbarkeit (68%, 95%, 99.7% der Daten)

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

## Didaktischer Nutzen

Das Applet "3R6 Standardabweichung erkunden" ist ideal für den Mathematikunterricht geeignet:

### Lernziele
- **Standardabweichung verstehen**: Die drei Standardabweichungs-Linien (±σ, ±2σ, ±3σ) zeigen visuell die 68-95-99.7-Regel
- **Normalverteilung erkunden**: Wie verändert sich die Verteilung bei unterschiedlicher Standardabweichung?
- **Stichprobengröße**: Vergleich kleiner (z.B. 10) und großer Stichproben (z.B. 5000)
- **Median vs. Mittelwert**: Bei symmetrischen Verteilungen fallen beide zusammen
- **Intervallbildung**: Einfluss der Intervallgröße auf die Histogramm-Darstellung

### Unterrichtsideen
1. **Empirische Regel testen**: Standardabweichung anzeigen und zählen, wie viele Packungen innerhalb ±1σ, ±2σ, ±3σ liegen
2. **Einfluss der Standardabweichung**: Vergleiche σ = 2g mit σ = 10g bei gleicher Packungsanzahl
3. **Gesetz der großen Zahlen**: Beobachte, wie die Form bei steigender Anzahl der Normalverteilungskurve immer ähnlicher wird
4. **Fixe vs. wachsende Kurve**: Verstehe den Unterschied zwischen relativer Häufigkeit und absoluter Anzahl

## Nutzung
- Bewege die Schieberegler, um verschiedene Szenarien zu simulieren
- Die Normalverteilungskurve (blau) zeigt die theoretische Verteilung
- Die gestapelten Elemente zeigen die tatsächlich simulierten Werte
- Bei vielen Packungen entsteht ein typisches "Gaußsches" Histogramm