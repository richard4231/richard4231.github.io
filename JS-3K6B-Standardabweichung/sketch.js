// Globale Einstellungen und Variablen
let canvasWidth = 800;
let canvasHeight = 600;
let margin = 70;  // Rand für Achsenbeschriftung (vergrössert für Y-Achse)

// Statistische Parameter (im Code anpassbar)
let mittelwert = 1010;  // in Gramm
let standardabweichung = 5;  // in Gramm (wird über Schieberegler gesteuert)

// Histogramm-Parameter
let binSize = 2;  // Intervallgrösse in Gramm (im Code anpassbar: 0.5 bis 10g)
let intervallGroesse = binSize; // wird über Schieberegler gesteuert

// Parameter Übergänge
let wechsel_punkt = 50;   // Ab dieser Anzahl: Punktmodus
let wechsel_balken = 1000; // Ab dieser Anzahl: Balkenmodus

// Simulation
let anzahlPackungen = 1;
let packungen = [];  // Array mit Gewichten
let maxAnzahl = 5000;  // Maximale Anzahl Packungen (im Code änderbar)

// Slider-Skalierung: 1-100 (erstes Drittel), 101-1000 (zweites Drittel), 1001-5000 (drittes Drittel)
function sliderToPackungen(sliderValue) {
  if (sliderValue <= 33.33) {
    // Erstes Drittel: 1-100
    return Math.round(1 + (sliderValue / 33.33) * 99);
  } else if (sliderValue <= 66.67) {
    // Zweites Drittel: 101-1000
    return Math.round(101 + ((sliderValue - 33.33) / 33.34) * 899);
  } else {
    // Drittes Drittel: 1001-5000
    return Math.round(1001 + ((sliderValue - 66.67) / 33.33) * 3999);
  }
}

function packungenToSlider(anzahl) {
  if (anzahl <= 100) {
    return (anzahl - 1) / 99 * 33.33;
  } else if (anzahl <= 1000) {
    return 33.33 + ((anzahl - 101) / 899) * 33.34;
  } else {
    return 66.67 + ((anzahl - 1001) / 3999) * 33.33;
  }
}

// Visualisierung
let minMasse = 990;
let maxMasse = 1030;
let maxHoehe = 0;
let currentHistogram = {};  // Aktuelles Histogramm für Hover-Erkennung

// UI-Elemente
let anzahlSlider;
let stdabwSlider;
let intervallSlider;
let showStatsCheckbox;
let controlPanel;
let backgroundLayer;
let infoText;

// Statistik
let showStats = false;
let median = 0;
let berechneteMittelwert = 0;
let fixedCurveHeight = true;  // Toggle für fixe Kurvenhöhe
let showStdDev = false;  // Toggle für Standardabweichungs-Linien
let multiplikator = 1;  // Faktor für "sehr viele Packungen"
let multiplikatorAktiv = false;

// Hover-Tracking
let hoveredBin = null;
let hoveredCount = 0;

// Boxplot
let showBoxplot = false;
let boxplotY = 0; // Y-Position des Boxplots (relativ zum Canvas)
let draggingBoxplot = false;
let boxplotHeight = 30; // Höhe des Boxplot-Bereichs
let quartile1 = 0;
let quartile3 = 0;

// Farben (wie im Original)
let color1 = [238, 172, 136, 200]; // Orange für Packungen
// let color1 = [0, 135, 191, 200]; // Blau für Packungen
let color2 = [238, 172, 136, 200]; // Orange für Punkte
let color3 = 'rgba(224, 224, 224, 0.9)'; // Kontrollpanel Hintergrund
let curveColor = [97, 167, 211, 150]; // Kurvenfarbe
let medianColor = [217, 67, 104, 180]; // Pink für Median
let mittelwertColor = [174, 190, 56, 180]; // Grün für Mittelwert

let font_polo;

/**
 * Gaussian/Normalverteilung Zufallszahl (Box-Muller Transform)
 */
function gaussianRandom(mean, stdDev) {
  let u1 = Math.random();
  let u2 = Math.random();
  let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Berechnet eine sinnvolle Schrittgrösse für die Y-Achse
 */
function getNiceStep(maxValue) {
  if (maxValue <= 0) return 1;
  
  let roughStep = maxValue / 5; // Wir wollen etwa 5 Schritte
  let magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  let residual = roughStep / magnitude;
  
  let niceResidual;
  if (residual <= 1) niceResidual = 1;
  else if (residual <= 2) niceResidual = 2;
  else if (residual <= 5) niceResidual = 5;
  else niceResidual = 10;
  
  return niceResidual * magnitude;
}

/**
 * Normalverteilungs-Dichtefunktion
 */
function normalDensity(x, mean, stdDev) {
  let exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

/**
 * setup(): Initialisiert das Programm.
 */
async function setup() {
  // Versuche Font zu laden (mit Fallback)
  try {
    font_polo = await loadFont('./assets/PoloCEF-Regular.otf');
    
    let fontFace = new FontFace('PoloCEF', 'url(./assets/PoloCEF-Regular.otf)');
    await fontFace.load();
    document.fonts.add(fontFace);
  } catch(e) {
    console.log('Font konnte nicht geladen werden, verwende Fallback');
  }

  createCanvas(canvasWidth, canvasHeight);
  
  // Kontrollpanel
  controlPanel = createDiv();
  controlPanel.style('position', 'absolute');
  controlPanel.style('top', '20px');
  controlPanel.style('right', '20px');
  controlPanel.style('background', color3);
  controlPanel.style('padding', '15px');
  controlPanel.style('border-radius', '8px');
  controlPanel.style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)');
  controlPanel.style('font-family', 'PoloCEF, Arial, sans-serif');
  controlPanel.style('font-size', '16px');
  controlPanel.style('z-index', '1000');
  controlPanel.style('min-width', '280px');
  
  // Anzahl Packungen Slider (nicht-linear skaliert)
  let anzahlLabel = createP('Anzahl Packungen: <span id="anzahlValue">1</span>');
  anzahlLabel.parent(controlPanel);
  anzahlLabel.style('margin', '0 0 5px 0');
  anzahlLabel.style('font-weight', 'bold');
  
  anzahlSlider = createSlider(0, 100, 0, 0.1);
  anzahlSlider.parent(controlPanel);
  anzahlSlider.style('width', '100%');
  anzahlSlider.style('margin-bottom', '15px');
  anzahlSlider.input(updateAnzahl);
  
  // Standardabweichung Slider
  let stdabwLabel = createP('Standardabweichung: <span id="stdabwValue">5</span> g');
  stdabwLabel.parent(controlPanel);
  stdabwLabel.style('margin', '0 0 5px 0');
  stdabwLabel.style('font-weight', 'bold');
  
  stdabwSlider = createSlider(1, 30, 5, 0.5);
  stdabwSlider.parent(controlPanel);
  stdabwSlider.style('width', '100%');
  stdabwSlider.style('margin-bottom', '15px');
  stdabwSlider.input(updateStdAbw);
  
  // Intervallgrösse Slider
  let intervallLabel = createP('Intervallgrösse: <span id="intervallValue">2</span> g');
  intervallLabel.parent(controlPanel);
  intervallLabel.style('margin', '0 0 5px 0');
  intervallLabel.style('font-weight', 'bold');
  
  intervallSlider = createSlider(0.5, 10, 2, 0.5);
  intervallSlider.parent(controlPanel);
  intervallSlider.style('width', '100%');
  intervallSlider.style('margin-bottom', '15px');
  intervallSlider.input(updateIntervall);
  
  // Checkbox für Median/Mittelwert
  showStatsCheckbox = createCheckbox('Median & Mittelwert anzeigen', showStats);
  showStatsCheckbox.parent(controlPanel);
  showStatsCheckbox.style('margin-bottom', '15px');
  showStatsCheckbox.style('display', 'block');
  showStatsCheckbox.changed(updateStats);
  
  // Checkbox für Standardabweichung
  let showStdDevCheckbox = createCheckbox('Standardabweichung anzeigen', showStdDev);
  showStdDevCheckbox.parent(controlPanel);
  showStdDevCheckbox.style('margin-bottom', '15px');
  showStdDevCheckbox.style('display', 'block');
  showStdDevCheckbox.changed(() => {
    showStdDev = showStdDevCheckbox.checked();
    drawVisualization();
  });
  
  // Checkbox für Boxplot
  let boxplotCheckbox = createCheckbox('Boxplot anzeigen', showBoxplot);
  boxplotCheckbox.parent(controlPanel);
  boxplotCheckbox.style('margin-bottom', '15px');
  boxplotCheckbox.style('display', 'block');
  boxplotCheckbox.changed(() => {
    showBoxplot = boxplotCheckbox.checked();
    drawVisualization();
  });
  
  // Initialisiere Boxplot-Position (in der Mitte des Diagramms)
  boxplotY = canvasHeight / 2;
  
  // Checkbox für viele Packungen (Multiplikator)
  let multiplikatorCheckbox = createCheckbox('Sehr viele Packungen (×100)', multiplikatorAktiv);
  multiplikatorCheckbox.parent(controlPanel);
  multiplikatorCheckbox.style('margin-bottom', '15px');
  multiplikatorCheckbox.style('display', 'block');
  multiplikatorCheckbox.changed(() => {
    multiplikatorAktiv = multiplikatorCheckbox.checked();
    multiplikator = multiplikatorAktiv ? 100 : 1;
    generatePackungen();
    drawVisualization();
  });
  
  // Checkbox für fixe Kurvenhöhe
  let fixedCurveCheckbox = createCheckbox('Fixe Kurvenhöhe', fixedCurveHeight);
  fixedCurveCheckbox.parent(controlPanel);
  fixedCurveCheckbox.style('margin-bottom', '15px');
  fixedCurveCheckbox.style('display', 'block');
  fixedCurveCheckbox.changed(() => {
    fixedCurveHeight = fixedCurveCheckbox.checked();
    drawVisualization();
  });
  
  // Legende
  let legendeDiv = createDiv();
  legendeDiv.parent(controlPanel);
  legendeDiv.style('margin-top', '15px');
  legendeDiv.style('padding-top', '10px');
  legendeDiv.style('border-top', '1px solid #ccc');
  legendeDiv.style('font-size', '14px');
  
  let legendeText = createP('');
  legendeText.parent(legendeDiv);
  legendeText.id('legendeText');
  legendeText.style('margin', '0');
  legendeText.style('color', '#666');
  
  // Info-Text
  infoText = createP(`Theoretischer Mittelwert: ${mittelwert} g<br>Intervallgrösse: ${intervallGroesse} g`);
  infoText.parent(controlPanel);
  infoText.id('infoText');
  infoText.style('margin', '10px 0 0 0');
  infoText.style('font-size', '14px');
  infoText.style('color', '#666');
  infoText.style('border-top', '1px solid #ccc');
  infoText.style('padding-top', '10px');

  if (font_polo) {
    textFont(font_polo);
  }
  
  frameRate(30);
  generatePackungen();
  drawVisualization();
  loop(); // Aktiviere kontinuierliches Zeichnen für Hover-Effekt
}

/**
 * Aktualisiert die Anzahl der Packungen
 */
function updateAnzahl() {
  anzahlPackungen = sliderToPackungen(anzahlSlider.value());
  document.getElementById('anzahlValue').textContent = anzahlPackungen;
  generatePackungen();
  drawVisualization();
}

/**
 * Aktualisiert die Standardabweichung
 */
function updateStdAbw() {
  standardabweichung = stdabwSlider.value();
  document.getElementById('stdabwValue').textContent = nf(standardabweichung, 1, 1);
  generatePackungen();
  drawVisualization();
}

/**
 * Aktualisiert die Intervallgrösse
 */
function updateIntervall() {
  intervallGroesse = intervallSlider.value();
  binSize = intervallGroesse; // Für Kompatibilität
  document.getElementById('intervallValue').textContent = nf(intervallGroesse, 1, 1);
  document.getElementById('infoText').innerHTML = `Theoretischer Mittelwert: ${mittelwert} g<br>Intervallgrösse: ${nf(intervallGroesse, 1, 1)} g`;
  // Nur Visualisierung neu zeichnen, nicht die Zufallsverteilung neu generieren
  drawVisualization();
}

/**
 * Aktualisiert die Statistik-Anzeige
 */
function updateStats() {
  showStats = showStatsCheckbox.checked();
  drawVisualization();
}

/**
 * Generiert die Packungen mit Normalverteilung
 */
function generatePackungen() {
  packungen = [];
  let effektiveAnzahl = anzahlPackungen * multiplikator;
  
  for (let i = 0; i < effektiveAnzahl; i++) {
    let gewicht = gaussianRandom(mittelwert, standardabweichung);
    packungen.push(gewicht);
  }
  
  // Sortiere für Median und Quartile
  let sortiert = [...packungen].sort((a, b) => a - b);
  
  // Mittelwert berechnen
  let summe = packungen.reduce((a, b) => a + b, 0);
  berechneteMittelwert = summe / packungen.length;
  
  // Median berechnen
  if (sortiert.length % 2 === 0) {
    median = (sortiert[sortiert.length / 2 - 1] + sortiert[sortiert.length / 2]) / 2;
  } else {
    median = sortiert[Math.floor(sortiert.length / 2)];
  }
  
  // Quartile berechnen
  let q1Index = Math.floor(sortiert.length / 4);
  let q3Index = Math.floor(sortiert.length * 3 / 4);
  quartile1 = sortiert[q1Index];
  quartile3 = sortiert[q3Index];
  
  // Legende aktualisieren
  updateLegende();
}

/**
 * Aktualisiert die Legende je nach Anzahl der Packungen
 */
function updateLegende() {
  let legendeElement = document.getElementById('legendeText');
  if (legendeElement) {
    let effektiveAnzahl = anzahlPackungen * multiplikator;
    
    if (effektiveAnzahl <= wechsel_punkt) {
      legendeElement.innerHTML = '🟧 = 1 Packung<br>(mit Gewicht in g)';
    } else if (effektiveAnzahl < wechsel_balken) {
      legendeElement.innerHTML = '🟠 = 1 Packung';
    } else {
      legendeElement.innerHTML = 'Säule = Anzahl Packungen<br>Breite = Intervallgrösse';
    }
  }
}

/**
 * Erstellt Histogramm-Daten
 */
function createHistogram() {
  let histogram = {};
  
  for (let gewicht of packungen) {
    // Bins um den theoretischen Mittelwert zentrieren
    // z.B. bei intervallGroesse = 1 und mittelwert = 1010:
    // Bin bei 1010 geht von 1009.5 bis 1010.5
    let offset = gewicht - mittelwert;
    let roundedOffset = Math.round(offset / intervallGroesse) * intervallGroesse;
    let key = mittelwert + roundedOffset;
    
    if (!histogram[key]) {
      histogram[key] = 0;
    }
    histogram[key]++;
  }
  
  return histogram;
}

/**
 * Zeichnet die komplette Visualisierung
 */
function drawVisualization() {
  backgroundLayer = createGraphics(canvasWidth, canvasHeight);
  backgroundLayer.background(255);
  
  // Zuerst Histogramm-Daten erstellen um maxHoehe zu kennen
  currentHistogram = createHistogram();
  maxHoehe = Math.max(...Object.values(currentHistogram), 1);
  
  // Koordinatensystem zeichnen (benötigt maxHoehe)
  drawCoordinateSystem(backgroundLayer);
  
  // Normalverteilungskurve zeichnen
  drawNormalCurve(backgroundLayer);
  
  // Histogramm/Packungen zeichnen
  drawHistogram(backgroundLayer, currentHistogram);
  
  // Boxplot zeichnen (falls aktiviert)
  drawBoxplot(backgroundLayer);
}

/**
 * Zeichnet das Koordinatensystem
 */
function drawCoordinateSystem(pg) {
  pg.push();
  
  // Titel
  if (font_polo) {
    pg.textFont(font_polo);
  }
  pg.fill(0);
  pg.noStroke();
  pg.textSize(20);
  pg.textAlign(CENTER, TOP);
  pg.text("3R6 Standardabweichung erkunden", canvasWidth / 2, 10);
  
  pg.stroke(100);
  pg.strokeWeight(2);
  
  // X-Achse
  pg.line(margin, canvasHeight - margin, canvasWidth - margin, canvasHeight - margin);
  
  // Y-Achse
  pg.line(margin, canvasHeight - margin, margin, margin);
  
  // Beschriftungen
  if (font_polo) {
    pg.textFont(font_polo);
  }
  pg.fill(0);
  pg.noStroke();
  pg.textSize(14);
  
  // X-Achse Beschriftung (Masse in g)
  let stepX = 5;
  for (let m = minMasse; m <= maxMasse; m += stepX) {
    let x = map(m, minMasse, maxMasse, margin, canvasWidth - margin);
    pg.textAlign(CENTER, TOP);
    pg.text(m, x, canvasHeight - margin + 5);
    pg.stroke(200);
    pg.strokeWeight(1);
    pg.line(x, canvasHeight - margin, x, canvasHeight - margin - 5);
  }
  
  // Y-Achse Beschriftung (Anzahl)
  pg.noStroke();
  pg.textAlign(RIGHT, CENTER);
  
  // Spezialbehandlung für kleine Anzahlen (<=50): Stelle sicher, dass Schritte ganzzahlig sind
  let stepY;
  if (maxHoehe <= 50) {
    stepY = Math.max(1, Math.floor(getNiceStep(maxHoehe)));
  } else {
    stepY = getNiceStep(maxHoehe);
  }
  
  // Ermittle den aktuellen Darstellungsmodus
  let effektiveAnzahl = anzahlPackungen * multiplikator;
  
  for (let anzahl = 0; anzahl <= maxHoehe; anzahl += stepY) {
    let y;
    
    if (effektiveAnzahl <= wechsel_punkt) {
      // Packungen-Modus: Beschriftung zeigt auf die Mitte der n-ten Packung
      if (anzahl === 0) {
        y = canvasHeight - margin;
      } else {
        // Berechne packungHoehe wie in drawPackungenMode
        let verfuegbareHoehe = canvasHeight - 2 * margin;
        let basePackungHoehe = 30;
        let packungHoehe = Math.max(10, Math.min(basePackungHoehe, verfuegbareHoehe / (maxHoehe + 2)));
        // Die n-te Packung (n=anzahl, n startet bei 1) hat Index i=n-1, Mitte bei:
        y = canvasHeight - margin - (anzahl - 0.5) * packungHoehe;
      }
    } else if (effektiveAnzahl < wechsel_balken) {
      // Punkt-Modus: Beschriftung zeigt auf die Mitte des n-ten Punktes
      if (anzahl === 0) {
        y = canvasHeight - margin;
      } else {
        y = map(anzahl - 0.5, 0, maxHoehe, canvasHeight - margin, margin);
      }
    } else {
      // Säulen-Modus: normale kontinuierliche Skalierung
      y = map(anzahl, 0, maxHoehe, canvasHeight - margin, margin);
    }
    
    pg.text(Math.round(anzahl), margin - 10, y);
    pg.stroke(200);
    pg.strokeWeight(1);
    pg.line(margin, y, margin + 5, y);
  }
  
  // Achsenbeschriftung
  pg.noStroke();
  pg.textSize(16);
  pg.textAlign(CENTER, TOP);
  pg.text("Masse (g)", canvasWidth / 2, canvasHeight - 20);
  
  pg.push();
  pg.translate(15, canvasHeight / 2);
  pg.rotate(-PI / 2);
  pg.textAlign(CENTER);
  pg.text("Anzahl", 0, 0);
  pg.pop();
  
  pg.pop();
}

/**
 * Zeichnet die Normalverteilungskurve
 */
function drawNormalCurve(pg) {
  pg.push();
  pg.noFill();
  pg.stroke(curveColor);
  pg.strokeWeight(2);
  
  // Berechne die erwartete maximale Höhe (am Mittelwert)
  let maxErwarteteHoehe = anzahlPackungen * intervallGroesse * normalDensity(mittelwert, mittelwert, standardabweichung);
  
  let kurvenSkalierung;
  
  if (fixedCurveHeight) {
    // Fixe Kurvenhöhe: Nutzt immer die volle verfügbare Höhe
    kurvenSkalierung = maxHoehe;
  } else {
    // Skalierbare Kurve: Begrenzt auf maxHoehe, wächst aber mit Anzahl
    kurvenSkalierung = Math.min(maxErwarteteHoehe, maxHoehe);
  }
  
  pg.beginShape();
  for (let m = minMasse; m <= maxMasse; m += 0.5) {
    let x = map(m, minMasse, maxMasse, margin, canvasWidth - margin);
    let density = normalDensity(m, mittelwert, standardabweichung);
    
    let skalierteAnzahl;
    if (fixedCurveHeight) {
      // Bei fixer Höhe: Normalisiere auf maxHoehe
      let maxDensity = normalDensity(mittelwert, mittelwert, standardabweichung);
      skalierteAnzahl = (density / maxDensity) * maxHoehe;
    } else {
      // Bei skalierbarer Höhe: Wie vorher
      let erwarteteAnzahl = anzahlPackungen * intervallGroesse * density;
      skalierteAnzahl = erwarteteAnzahl * (kurvenSkalierung / maxErwarteteHoehe);
    }
    
    // Y-Position basierend auf maxHoehe
    let y = map(skalierteAnzahl, 0, maxHoehe, canvasHeight - margin, margin);
    pg.vertex(x, y);
  }
  pg.endShape();
  
  // Median und Mittelwert Linien zeichnen (wenn aktiviert)
  if (showStats) {
    // Median
    pg.stroke(medianColor);
    pg.strokeWeight(2);
    pg.drawingContext.setLineDash([5, 5]);
    let xMedian = map(median, minMasse, maxMasse, margin, canvasWidth - margin);
    pg.line(xMedian, canvasHeight - margin, xMedian, margin);
    
    // Mittelwert
    pg.stroke(mittelwertColor);
    pg.drawingContext.setLineDash([10, 5]);
    let xMittelwert = map(berechneteMittelwert, minMasse, maxMasse, margin, canvasWidth - margin);
    pg.line(xMittelwert, canvasHeight - margin, xMittelwert, margin);
    
    pg.drawingContext.setLineDash([]);
    
    // Beschriftungen
    pg.noStroke();
    pg.textSize(12);
    pg.textAlign(CENTER, BOTTOM);
    pg.fill(medianColor);
    pg.text('Median: ' + nf(median, 1, 1) + 'g', xMedian, margin - 5);
    pg.fill(mittelwertColor);
    pg.text('Mittelwert: ' + nf(berechneteMittelwert, 1, 1) + 'g', xMittelwert, margin - 20);
  }
  
  // Standardabweichungs-Linien zeichnen (wenn aktiviert)
  if (showStdDev) {
    let xMittel = map(mittelwert, minMasse, maxMasse, margin, canvasWidth - margin);
    
    // 1. Standardabweichung (±σ) - gut sichtbar
    pg.stroke(100, 100, 200, 180);
    pg.strokeWeight(2);
    pg.drawingContext.setLineDash([8, 4]);
    let x1Sigma_plus = map(mittelwert + standardabweichung, minMasse, maxMasse, margin, canvasWidth - margin);
    let x1Sigma_minus = map(mittelwert - standardabweichung, minMasse, maxMasse, margin, canvasWidth - margin);
    pg.line(x1Sigma_plus, canvasHeight - margin, x1Sigma_plus, margin);
    pg.line(x1Sigma_minus, canvasHeight - margin, x1Sigma_minus, margin);
    
    // 2. Standardabweichung (±2σ) - dezenter
    pg.stroke(100, 100, 200, 120);
    pg.strokeWeight(1.5);
    pg.drawingContext.setLineDash([6, 6]);
    let x2Sigma_plus = map(mittelwert + 2 * standardabweichung, minMasse, maxMasse, margin, canvasWidth - margin);
    let x2Sigma_minus = map(mittelwert - 2 * standardabweichung, minMasse, maxMasse, margin, canvasWidth - margin);
    pg.line(x2Sigma_plus, canvasHeight - margin, x2Sigma_plus, margin);
    pg.line(x2Sigma_minus, canvasHeight - margin, x2Sigma_minus, margin);
    
    // 3. Standardabweichung (±3σ) - noch dezenter
    pg.stroke(100, 100, 200, 80);
    pg.strokeWeight(1);
    pg.drawingContext.setLineDash([4, 8]);
    let x3Sigma_plus = map(mittelwert + 3 * standardabweichung, minMasse, maxMasse, margin, canvasWidth - margin);
    let x3Sigma_minus = map(mittelwert - 3 * standardabweichung, minMasse, maxMasse, margin, canvasWidth - margin);
    pg.line(x3Sigma_plus, canvasHeight - margin, x3Sigma_plus, margin);
    pg.line(x3Sigma_minus, canvasHeight - margin, x3Sigma_minus, margin);
    
    pg.drawingContext.setLineDash([]);
  }
  
  pg.pop();
}

/**
 * Zeichnet einen horizontalen Boxplot
 */
function drawBoxplot(pg) {
  if (!showBoxplot || packungen.length === 0) return;
  
  pg.push();
  
  // Sortierte Daten für Ausreisser
  let sortiert = [...packungen].sort((a, b) => a - b);
  
  // Whiskers (min/max ohne Ausreisser)
  let iqr = quartile3 - quartile1;
  let lowerWhisker = quartile1 - 1.5 * iqr;
  let upperWhisker = quartile3 + 1.5 * iqr;
  
  // Finde tatsächliche Whisker-Werte (kleinster/grösster Wert innerhalb der Grenzen)
  let minWhisker = sortiert.find(x => x >= lowerWhisker) || sortiert[0];
  let maxWhisker = sortiert.reverse().find(x => x <= upperWhisker) || sortiert[sortiert.length - 1];
  sortiert.reverse(); // Zurück zur aufsteigenden Sortierung
  
  // X-Positionen berechnen
  let xQ1 = map(quartile1, minMasse, maxMasse, margin, canvasWidth - margin);
  let xMedian = map(median, minMasse, maxMasse, margin, canvasWidth - margin);
  let xQ3 = map(quartile3, minMasse, maxMasse, margin, canvasWidth - margin);
  let xMin = map(minWhisker, minMasse, maxMasse, margin, canvasWidth - margin);
  let xMax = map(maxWhisker, minMasse, maxMasse, margin, canvasWidth - margin);
  
  // Y-Position (verschiebbar)
  let y = boxplotY;
  let boxHeight = boxplotHeight;
  
  // Hintergrund für bessere Sichtbarkeit
  pg.fill(255, 255, 255, 200);
  pg.stroke(100);
  pg.strokeWeight(1);
  pg.rect(margin, y - boxHeight/2, canvasWidth - 2*margin, boxHeight, 5);
  
  // Whiskers (Linien)
  pg.stroke(80);
  pg.strokeWeight(2);
  pg.line(xMin, y, xQ1, y);
  pg.line(xQ3, y, xMax, y);
  
  // Whisker-Enden
  pg.line(xMin, y - boxHeight/4, xMin, y + boxHeight/4);
  pg.line(xMax, y - boxHeight/4, xMax, y + boxHeight/4);
  
  // Box (Q1 bis Q3)
  pg.fill(97, 167, 211, 150);
  pg.stroke(50);
  pg.strokeWeight(2);
  pg.rect(xQ1, y - boxHeight/2, xQ3 - xQ1, boxHeight, 3);
  
  // Median-Linie
  pg.stroke(217, 67, 104, 255);
  pg.strokeWeight(3);
  pg.line(xMedian, y - boxHeight/2, xMedian, y + boxHeight/2);
  
  // Mittelwert als Punkt
  let xMittel = map(berechneteMittelwert, minMasse, maxMasse, margin, canvasWidth - margin);
  pg.fill(174, 190, 56, 255);
  pg.noStroke();
  pg.circle(xMittel, y, 8);
  
  // Beschriftung "Boxplot" links
  pg.fill(80);
  pg.noStroke();
  pg.textAlign(RIGHT, CENTER);
  pg.textSize(12);
  pg.text('Boxplot', margin - 10, y);
  
  pg.pop();
}

/**
 * Zeichnet das Histogramm je nach Anzahl der Packungen
 */
function drawHistogram(pg, histogram) {
  let effektiveAnzahl = anzahlPackungen * multiplikator;
  
  if (effektiveAnzahl <= wechsel_punkt) {
    drawPackungenMode(pg, histogram);
  } else if (effektiveAnzahl < wechsel_balken) {
    drawPunkteMode(pg, histogram);
  } else {
    drawLinienMode(pg, histogram);
  }
}

/**
 * Modus 1-50: Packungen als Rechtecke
 */
function drawPackungenMode(pg, histogram) {
  pg.push();
  
  let packungBreite = 40;  // Grössere Breite
  let verfuegbareHoehe = canvasHeight - 2 * margin;
  
  // Adaptive Höhe: Bei wenigen Packungen gross, bei vielen kleiner
  let basePackungHoehe = 30;  // Grössere Basishöhe
  let packungHoehe = Math.max(10, Math.min(basePackungHoehe, verfuegbareHoehe / (maxHoehe + 2)));
  
  for (let key in histogram) {
    let masse = parseFloat(key);
    let anzahl = histogram[key];
    let x = map(masse, minMasse, maxMasse, margin, canvasWidth - margin);
    
    // Finde alle Packungen, die in dieses Bin gehören
    let binPackungen = [];
    for (let gewicht of packungen) {
      let offset = gewicht - mittelwert;
      let roundedOffset = Math.round(offset / intervallGroesse) * intervallGroesse;
      let binKey = mittelwert + roundedOffset;
      if (Math.abs(binKey - masse) < 0.001) {  // Floating-Point-Vergleich
        binPackungen.push(gewicht);
      }
    }
    
    // Stapel von unten nach oben (wie im Original)
    for (let i = 0; i < anzahl && i < binPackungen.length; i++) {
      let yPos = canvasHeight - margin - (i + 1) * packungHoehe;
      
      pg.fill(color1);
      pg.stroke(50);
      pg.strokeWeight(1);
      pg.rect(x - packungBreite / 2, yPos, packungBreite, packungHoehe, 2);
      
      // Gewicht auf Packung schreiben - verwende das tatsächliche Gewicht aus dem Bin
      pg.fill(50);
      pg.noStroke();
      pg.textAlign(CENTER, CENTER);
      pg.textSize(10);
      pg.text(nf(binPackungen[i], 1, 1) + "g", x, yPos + packungHoehe / 2);
    }
  }
  
  pg.pop();
}

/**
 * Modus 51-999: Kleine orange Punkte
 */
function drawPunkteMode(pg, histogram) {
  pg.push();
  
  let verfuegbareHoehe = canvasHeight - 2 * margin;
  
  // Adaptive Punktgrösse: Bei wenigen Packungen gross, bei vielen kleiner
  let basePunktGroesse = 10;  // Grössere Basispunktgrösse
  // Reduzierter Faktor von 1.5 auf 1.2 für glatterer Übergang zu Säulen
  let punktGroesse = Math.max(3, Math.min(basePunktGroesse, verfuegbareHoehe / (maxHoehe * 1.2)));
  
  for (let key in histogram) {
    let masse = parseFloat(key);
    let anzahl = histogram[key];
    let x = map(masse, minMasse, maxMasse, margin, canvasWidth - margin);
    
    // Punkte stapeln von unten nach oben - mit map() für konsistente Skalierung
    for (let i = 0; i < anzahl; i++) {
      // Verwende die gleiche Skalierung wie bei Säulen für glatten Übergang
      let yPos = map(i + 0.5, 0, maxHoehe, canvasHeight - margin, margin);
      
      pg.fill(color2);
      pg.noStroke();
      pg.circle(x, yPos, punktGroesse);
    }
  }
  
  pg.pop();
}

/**
 * Modus 1000+: Säulen mit Intervallbreite
 */
function drawLinienMode(pg, histogram) {
  pg.push();
  
  let verfuegbareHoehe = canvasHeight - 2 * margin;
  
  // Berechne Säulenbreite basierend auf der tatsächlichen Intervallgrösse
  // Die Breite in Pixeln entspricht der Intervallgrösse auf der Masse-Skala
  let saulenBreite = (canvasWidth - 2 * margin) / (maxMasse - minMasse) * intervallGroesse;
  
  for (let key in histogram) {
    let masse = parseFloat(key);
    let anzahl = histogram[key];
    let x = map(masse, minMasse, maxMasse, margin, canvasWidth - margin);
    
    // Höhe der Säule basierend auf maxHoehe
    let barHeight = map(anzahl, 0, maxHoehe, 0, verfuegbareHoehe);
    
    pg.fill(color2);
    pg.stroke(200, 100, 50);  // Feiner oranger Rand
    pg.strokeWeight(0.5);
    pg.rect(x - saulenBreite / 2, canvasHeight - margin - barHeight, saulenBreite, barHeight);
  }
  
  pg.pop();
}

/**
 * draw(): Hauptzeichenschleife
 */
function draw() {
  if (backgroundLayer) {
    image(backgroundLayer, 0, 0);
  }
  
  // Hover-Anzeige (auch für 0)
  if (hoveredBin !== null) {
    push();
    fill(0, 150);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    
    // Berechne Intervallgrenzen
    let binMasse = parseFloat(hoveredBin);
    let untereGrenze = binMasse - intervallGroesse / 2;
    let obereGrenze = binMasse + intervallGroesse / 2;
    
    // Tooltip-Text mit Intervall
    let tooltipText = `Anzahl: ${hoveredCount}\n${nf(untereGrenze, 1, 1)}g ≤ Gewicht < ${nf(obereGrenze, 1, 1)}g`;
    
    // Berechne Textbreite und -höhe für mehrzeiligen Text
    let lines = tooltipText.split('\n');
    let maxWidth = 0;
    for (let line of lines) {
      maxWidth = max(maxWidth, textWidth(line));
    }
    let textW = maxWidth + 10;
    let textH = lines.length * 18 + 8; // 18px pro Zeile + Padding
    
    let tooltipX = mouseX + 15;
    let tooltipY = mouseY - 30;
    
    // Verhindere, dass Tooltip aus dem Canvas läuft
    if (tooltipX + textW > canvasWidth) tooltipX = mouseX - textW - 15;
    if (tooltipY < 0) tooltipY = mouseY + 15;
    if (tooltipY + textH > canvasHeight) tooltipY = canvasHeight - textH;
    
    fill(255, 240);
    stroke(100);
    strokeWeight(1);
    rect(tooltipX, tooltipY, textW, textH, 3);
    
    fill(0);
    noStroke();
    // Zeichne jede Zeile separat
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], tooltipX + 5, tooltipY + 5 + i * 18);
    }
    pop();
  }
}

/**
 * mouseMoved(): Erkennt Hover über Säulen/Punkte
 */
function mouseMoved() {
  hoveredBin = null;
  hoveredCount = 0;
  
  // Prüfe, ob Maus im Diagrammbereich ist
  if (mouseX < margin || mouseX > canvasWidth - margin || 
      mouseY < margin || mouseY > canvasHeight - margin) {
    return;
  }
  
  // Finde die nächste Masse basierend auf Mausposition
  let masse = map(mouseX, margin, canvasWidth - margin, minMasse, maxMasse);
  
  // Finde das nächste Bin im Histogramm
  let closestKey = null;
  let minDist = Infinity;
  
  for (let key in currentHistogram) {
    let binMasse = parseFloat(key);
    let dist = abs(binMasse - masse);
    if (dist < minDist) {
      minDist = dist;
      closestKey = key;
    }
  }
  
  // Wenn ein Bin gefunden wurde und es nah genug ist
  if (closestKey !== null && minDist < intervallGroesse * 0.6) {
    let binMasse = parseFloat(closestKey);
    let binCount = currentHistogram[closestKey];
    let binX = map(binMasse, minMasse, maxMasse, margin, canvasWidth - margin);
    
    // Berechne die Breite des Bins in Pixeln
    let effektiveAnzahl = anzahlPackungen * multiplikator;
    let binWidth;
    
    if (effektiveAnzahl <= wechsel_punkt) {
      binWidth = 40; // Packungen-Breite
    } else if (effektiveAnzahl < wechsel_balken) {
      binWidth = 10; // Punkt-Bereich (etwas grosszügiger)
    } else {
      binWidth = (canvasWidth - 2 * margin) / (maxMasse - minMasse) * intervallGroesse;
    }
    
    // Prüfe, ob Maus horizontal innerhalb des Bins ist
    if (abs(mouseX - binX) <= binWidth / 2) {
      // Prüfe, ob Maus vertikal innerhalb der Säule/Stapel ist
      let barHeight;
      if (binCount > 0) {
        if (effektiveAnzahl <= wechsel_punkt) {
          // Packungen-Modus - berechne Höhe wie in drawPackungenMode
          let verfuegbareHoehe = canvasHeight - 2 * margin;
          let basePackungHoehe = 30;
          let packungHoehe = Math.max(10, Math.min(basePackungHoehe, verfuegbareHoehe / (maxHoehe + 2)));
          barHeight = binCount * packungHoehe;
        } else if (effektiveAnzahl < wechsel_balken) {
          // Punkt-Modus - mit map() Skalierung
          // Berechne die Position des obersten Punktes
          let topY = map(binCount - 0.5, 0, maxHoehe, canvasHeight - margin, margin);
          barHeight = canvasHeight - margin - topY;
        } else {
          // Säulen-Modus
          let verfuegbareHoehe = canvasHeight - 2 * margin;
          barHeight = map(binCount, 0, maxHoehe, 0, verfuegbareHoehe);
        }
        
        let topY = canvasHeight - margin - barHeight;
        
        // Maus muss zwischen topY und canvasHeight - margin sein
        if (mouseY >= topY && mouseY <= canvasHeight - margin) {
          hoveredBin = closestKey;
          hoveredCount = binCount;
        }
      } else {
        // Auch 0 anzeigen, wenn horizontal im Bin
        hoveredBin = closestKey;
        hoveredCount = 0;
      }
    }
  }
  
  return false; // Verhindert Standard-Verhalten
}

/**
 * mousePressed(): Startet das Verschieben des Boxplots
 */
function mousePressed() {
  if (!showBoxplot) return;
  
  // Prüfe, ob auf den Boxplot geklickt wurde
  if (mouseX >= margin && mouseX <= canvasWidth - margin &&
      mouseY >= boxplotY - boxplotHeight/2 && mouseY <= boxplotY + boxplotHeight/2) {
    draggingBoxplot = true;
  }
}

/**
 * mouseDragged(): Verschiebt den Boxplot
 */
function mouseDragged() {
  if (draggingBoxplot) {
    // Beschränke Y-Position auf den Diagrammbereich
    boxplotY = constrain(mouseY, margin + boxplotHeight/2, canvasHeight - margin - boxplotHeight/2);
    drawVisualization();
  }
}

/**
 * mouseReleased(): Beendet das Verschieben des Boxplots
 */
function mouseReleased() {
  draggingBoxplot = false;
}