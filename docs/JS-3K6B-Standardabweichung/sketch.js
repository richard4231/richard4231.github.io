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
let wechsel_balken = 50; // Ab dieser Anzahl: Balkenmodus

// Simulation
let anzahlPackungen = 1;
let packungen = [];  // Array mit Gewichten
let maxAnzahl = 5000;  // Maximale Anzahl Packungen (im Code änderbar)

// Slider-Skalierung: 1-100 (erstes Drittel), 101-1000 (zweites Drittel), 1001-5000 (drittes Drittel)
function sliderToPackungen(sliderValue) {
  if (sliderValue <= 100) {
    // Erstes Drittel: 1-100
    return sliderValue;
  } else if (sliderValue <= 200) {
    // Zweites Drittel: 101-600
    return (5 * sliderValue - 400);
  } else {
    // Drittes Drittel: 600-5000
    return (50 * sliderValue - 9400);
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
let mittelwertSlider;
let showStatsCheckbox;
let controlPanel;
let backgroundLayer;
let infoText;

// Statistik
let showMedian = false;
let showMittelwert = false;
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

// Intervall-Linien (gespiegelt um Mittelwert)
let showIntervallLinien = false;
let intervallAbstand = 5;  // Abstand vom Mittelwert in Gramm (kontinuierlich)
let intervallSliderLinien;  // Slider für die Linien
let intervallLinienColor = [140, 80, 180, 200]; // Violett für Intervall-Linien

// Flächenaufteilung
let showFlaechenaufteilung = false;
let cutoffPunkt = 1010;  // Trennpunkt in Gramm
let cutoffSlider;  // Slider für den Cut-off Point
let flaecheLinksColor = [255, 150, 150, 100]; // Hellrot
let flaecheRechtsColor = [150, 200, 255, 100]; // Hellblau

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
  
  anzahlSlider = createSlider(0, 288, 0, 1);
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
  
  // Mittelwert Slider
  let mittelwertLabel = createP('Mittelwert: <span id="mittelwertValue">1010</span> g');
  mittelwertLabel.parent(controlPanel);
  mittelwertLabel.style('margin', '0 0 5px 0');
  mittelwertLabel.style('font-weight', 'bold');
  
  mittelwertSlider = createSlider(990, 1030, 1010, 0.5);
  mittelwertSlider.parent(controlPanel);
  mittelwertSlider.style('width', '100%');
  mittelwertSlider.style('margin-bottom', '15px');
  mittelwertSlider.input(updateMittelwert);
  
  // Checkbox für Median
  let showMedianCheckbox = createCheckbox('Median anzeigen', showMedian);
  showMedianCheckbox.parent(controlPanel);
  showMedianCheckbox.style('margin-bottom', '15px');
  showMedianCheckbox.style('display', 'block');
  showMedianCheckbox.changed(() => {
    showMedian = showMedianCheckbox.checked();
    drawVisualization();
  });
  
  // Checkbox für Mittelwert
  let showMittelwertCheckbox = createCheckbox('Mittelwert anzeigen', showMittelwert);
  showMittelwertCheckbox.parent(controlPanel);
  showMittelwertCheckbox.style('margin-bottom', '15px');
  showMittelwertCheckbox.style('display', 'block');
  showMittelwertCheckbox.changed(() => {
    showMittelwert = showMittelwertCheckbox.checked();
    drawVisualization();
  });
  
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

  // Checkbox für Intervall-Linien
  let intervallLinienCheckbox = createCheckbox('Intervall-Linien anzeigen', showIntervallLinien);
  intervallLinienCheckbox.parent(controlPanel);
  intervallLinienCheckbox.style('margin-bottom', '15px');
  intervallLinienCheckbox.style('display', 'block');
  intervallLinienCheckbox.changed(() => {
    showIntervallLinien = intervallLinienCheckbox.checked();
    // Zeige/verstecke den Slider
    document.getElementById('intervallLinienSliderDiv').style.display = showIntervallLinien ? 'block' : 'none';
    drawVisualization();
  });

  // Container für Intervall-Slider (zunächst versteckt)
  let intervallLinienDiv = createDiv();
  intervallLinienDiv.parent(controlPanel);
  intervallLinienDiv.id('intervallLinienSliderDiv');
  intervallLinienDiv.style('display', 'none');
  intervallLinienDiv.style('margin-bottom', '15px');
  intervallLinienDiv.style('padding', '10px');
  intervallLinienDiv.style('background', 'rgba(140, 80, 180, 0.1)');
  intervallLinienDiv.style('border-radius', '5px');

  let intervallLinienLabel = createP('Abstand vom Mittelwert: <span id="intervallAbstandValue">5.0</span> g');
  intervallLinienLabel.parent(intervallLinienDiv);
  intervallLinienLabel.style('margin', '0 0 5px 0');
  intervallLinienLabel.style('font-size', '13px');

  intervallSliderLinien = createSlider(0.5, 20, 5, 0.1);
  intervallSliderLinien.parent(intervallLinienDiv);
  intervallSliderLinien.style('width', '100%');
  intervallSliderLinien.input(() => {
    intervallAbstand = intervallSliderLinien.value();
    document.getElementById('intervallAbstandValue').textContent = nf(intervallAbstand, 1, 1);
    drawVisualization();
  });

  // Anzeige für theoretischen und experimentellen Anteil
  let anteilAnzeige = createP('');
  anteilAnzeige.parent(intervallLinienDiv);
  anteilAnzeige.id('anteilAnzeige');
  anteilAnzeige.style('margin', '10px 0 0 0');
  anteilAnzeige.style('font-size', '13px');
  anteilAnzeige.style('line-height', '1.5');

  // Checkbox für Flächenaufteilung
  let flaechenCheckbox = createCheckbox('Flächenaufteilung anzeigen', showFlaechenaufteilung);
  flaechenCheckbox.parent(controlPanel);
  flaechenCheckbox.style('margin-bottom', '15px');
  flaechenCheckbox.style('display', 'block');
  flaechenCheckbox.changed(() => {
    showFlaechenaufteilung = flaechenCheckbox.checked();
    document.getElementById('flaechenSliderDiv').style.display = showFlaechenaufteilung ? 'block' : 'none';
    drawVisualization();
  });

  // Container für Flächen-Slider (zunächst versteckt)
  let flaechenDiv = createDiv();
  flaechenDiv.parent(controlPanel);
  flaechenDiv.id('flaechenSliderDiv');
  flaechenDiv.style('display', 'none');
  flaechenDiv.style('margin-bottom', '15px');
  flaechenDiv.style('padding', '10px');
  flaechenDiv.style('background', 'rgba(200, 200, 255, 0.15)');
  flaechenDiv.style('border-radius', '5px');

  let cutoffLabel = createP('Trennpunkt: <span id="cutoffValue">1010.0</span> g');
  cutoffLabel.parent(flaechenDiv);
  cutoffLabel.style('margin', '0 0 5px 0');
  cutoffLabel.style('font-size', '13px');

  cutoffSlider = createSlider(990, 1030, 1010, 0.5);
  cutoffSlider.parent(flaechenDiv);
  cutoffSlider.style('width', '100%');
  cutoffSlider.input(() => {
    cutoffPunkt = cutoffSlider.value();
    document.getElementById('cutoffValue').textContent = nf(cutoffPunkt, 1, 1);
    drawVisualization();
  });

  // Anzeige für die Flächenprozente
  let flaechenAnzeige = createP('');
  flaechenAnzeige.parent(flaechenDiv);
  flaechenAnzeige.id('flaechenAnzeige');
  flaechenAnzeige.style('margin', '10px 0 0 0');
  flaechenAnzeige.style('font-size', '13px');
  flaechenAnzeige.style('line-height', '1.5');

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
  infoText = createP(`Theoretischer Mittelwert: ${nf(mittelwert, 1, 1)} g<br>Intervallgrösse: ${nf(intervallGroesse, 1, 1)} g`);
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
  document.getElementById('infoText').innerHTML = `Theoretischer Mittelwert: ${nf(mittelwert, 1, 1)} g<br>Intervallgrösse: ${nf(intervallGroesse, 1, 1)} g`;
  // Nur Visualisierung neu zeichnen, nicht die Zufallsverteilung neu generieren
  drawVisualization();
}

/**
 * Aktualisiert den Mittelwert
 */
function updateMittelwert() {
  mittelwert = mittelwertSlider.value();
  document.getElementById('mittelwertValue').textContent = nf(mittelwert, 1, 1);
  document.getElementById('infoText').innerHTML = `Theoretischer Mittelwert: ${nf(mittelwert, 1, 1)} g<br>Intervallgrösse: ${nf(intervallGroesse, 1, 1)} g`;
  generatePackungen();
  drawVisualization();
}

/**
 * Generiert die Packungen mit Normalverteilung
 */
function generatePackungen() {
  // Die Gewichte sind Fliesskommazahlen (z.B. 1009.3427...), werden aber bei der Darstellung auf den Packungen auf 1 Dezimalstelle gerundet angezeigt. Die Packung 1010.49 wird also als 1010.5g angezeigt, aber dem Intervall von 1009.5 ≤ bis < 1010.5g zugeteilt.
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
  
  // Flächenaufteilung zeichnen (vor der Kurve, damit sie darunter liegt)
  drawFlaechenaufteilung(backgroundLayer);
  
  // Normalverteilungskurve zeichnen
  drawNormalCurve(backgroundLayer);
  
  // Histogramm/Packungen zeichnen
  drawHistogram(backgroundLayer, currentHistogram);

  // Intervall-Linien zeichnen (falls aktiviert)
  drawIntervallLinien(backgroundLayer);

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
  pg.text("3K6 Standardabweichung erkunden", canvasWidth / 2, 10);
  
  pg.stroke(100);
  pg.strokeWeight(2);
  
  // X-Achse
  pg.line(margin -30, canvasHeight - margin, canvasWidth, canvasHeight - margin);
  pg.line(0, canvasHeight - margin, margin - 50, canvasHeight - margin);
  
  // Y-Achse
  pg.line(margin - 25, canvasHeight - margin + 10, margin - 25, margin);
  
  // Beschriftungen
  if (font_polo) {
    pg.textFont(font_polo);
  }
  pg.fill(0);
  pg.noStroke();
  pg.textSize(14);
  
  // X-Achse Intervallbeschriftung (Masse in g)
  let stepX = 5;
  
  for (let m = minMasse; m <= maxMasse; m += stepX) {
    let x = map(m, minMasse, maxMasse, margin, canvasWidth-margin);
    pg.noStroke();
    pg.textAlign(CENTER, TOP);
    pg.text(m, x, canvasHeight - margin + 5);
    
    // Linie sowohl oberhalb als auch unterhalb der X-Achse
    pg.stroke(100);
    pg.strokeWeight(1);
    pg.line(x, canvasHeight - margin + 5, x, canvasHeight - margin - 5);
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
        // y = canvasHeight - margin - (anzahl - 0.5) * packungHoehe;
        y = canvasHeight - margin - (anzahl) * packungHoehe;
      }
    } else if (effektiveAnzahl < wechsel_balken) {
      if (anzahl === 0) {
        y = canvasHeight - margin;
      } else {
        y = map(anzahl, 0, maxHoehe, canvasHeight - margin, margin);
      }
    } else {
      // Säulen-Modus: normale kontinuierliche Skalierung
      y = map(anzahl, 0, maxHoehe, canvasHeight - margin, margin);
    }
    // Zahlen
    pg.noStroke();
    pg.text(Math.round(anzahl), margin - 35, y);

    // Linien
    pg.stroke(100);
    pg.strokeWeight(1);
    pg.line(margin - 30, y, margin - 20, y);
  }
  
  // Achsenbeschriftung
  pg.noStroke();
  pg.textSize(16);
  pg.textAlign(CENTER, TOP);
  pg.text("Masse (g)", canvasWidth / 2, canvasHeight - 30);
  
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
  // Erweitere den Zeichenbereich deutlich über die Achsenbeschriftung hinaus
  for (let m = minMasse - 4; m <= maxMasse + 4; m += 0.5) {
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
  
  // Median Linie zeichnen (wenn aktiviert)
  if (showMedian) {
    pg.stroke(medianColor);
    pg.strokeWeight(2);
    pg.drawingContext.setLineDash([5, 5]);
    let xMedian = map(median, minMasse, maxMasse, margin, canvasWidth - margin);
    pg.line(xMedian, canvasHeight - margin, xMedian, margin);
    pg.drawingContext.setLineDash([]);
    
    // Beschriftung
    pg.noStroke();
    pg.textSize(12);
    pg.textAlign(CENTER, BOTTOM);
    pg.fill(medianColor);
    pg.text('Median: ' + nf(median, 1, 1) + 'g', xMedian, margin - 5);
  }
  
  // Mittelwert Linie zeichnen (wenn aktiviert)
  if (showMittelwert) {
    pg.stroke(mittelwertColor);
    pg.strokeWeight(2);
    pg.drawingContext.setLineDash([10, 5]);
    let xMittelwert = map(berechneteMittelwert, minMasse, maxMasse, margin, canvasWidth - margin);
    pg.line(xMittelwert, canvasHeight - margin, xMittelwert, margin);
    pg.drawingContext.setLineDash([]);
    
    // Beschriftung
    pg.noStroke();
    pg.textSize(12);
    pg.textAlign(CENTER, BOTTOM);
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
 * Zeichnet die Intervall-Linien (gespiegelt um den Mittelwert)
 * und berechnet die Anteile
 */
function drawIntervallLinien(pg) {
  if (!showIntervallLinien) return;

  pg.push();

  // Berechne die Positionen der beiden Linien
  let untereGrenze = mittelwert - intervallAbstand;
  let obereGrenze = mittelwert + intervallAbstand;

  let xUnten = map(untereGrenze, minMasse, maxMasse, margin, canvasWidth - margin);
  let xOben = map(obereGrenze, minMasse, maxMasse, margin, canvasWidth - margin);
  let xMitte = map(mittelwert, minMasse, maxMasse, margin, canvasWidth - margin);

  // Schattierter Bereich zwischen den Linien
  pg.fill(intervallLinienColor[0], intervallLinienColor[1], intervallLinienColor[2], 30);
  pg.noStroke();
  pg.rect(xUnten, margin, xOben - xUnten, canvasHeight - 2 * margin);

  // Linien zeichnen (durchgezogen, gut sichtbar)
  pg.stroke(intervallLinienColor);
  pg.strokeWeight(2.5);
  pg.drawingContext.setLineDash([]);

  // Untere Linie
  pg.line(xUnten, canvasHeight - margin, xUnten, margin);
  // Obere Linie
  pg.line(xOben, canvasHeight - margin, xOben, margin);

  // Mittelwert-Linie (dünn, gestrichelt)
  pg.stroke(intervallLinienColor[0], intervallLinienColor[1], intervallLinienColor[2], 100);
  pg.strokeWeight(1);
  pg.drawingContext.setLineDash([3, 3]);
  pg.line(xMitte, canvasHeight - margin, xMitte, margin);
  pg.drawingContext.setLineDash([]);

  // Beschriftungen an den Linien
  pg.noStroke();
  pg.fill(intervallLinienColor);
  pg.textSize(11);
  pg.textAlign(CENTER, TOP);
  pg.text(nf(untereGrenze, 1, 1) + 'g', xUnten, canvasHeight - margin + 22);
  pg.text(nf(obereGrenze, 1, 1) + 'g', xOben, canvasHeight - margin + 22);

  // Berechne theoretischen Anteil (aus Normalverteilung)
  // P(μ - d ≤ X ≤ μ + d) = 2 * Φ(d/σ) - 1
  let zWert = intervallAbstand / standardabweichung;
  let theoretischerAnteil = erf(zWert / Math.sqrt(2)) * 100;

  // Berechne experimentellen Anteil (aus den generierten Daten)
  let anzahlImIntervall = 0;
  for (let gewicht of packungen) {
    if (gewicht >= untereGrenze && gewicht <= obereGrenze) {
      anzahlImIntervall++;
    }
  }
  let experimentellerAnteil = packungen.length > 0 ? (anzahlImIntervall / packungen.length * 100) : 0;

  // Aktualisiere die Anzeige im Control Panel
  let anteilElement = document.getElementById('anteilAnzeige');
  if (anteilElement) {
    let sigmaVielfaches = intervallAbstand / standardabweichung;
    anteilElement.innerHTML =
      `<b>±${nf(sigmaVielfaches, 1, 2)}σ</b> (±${nf(intervallAbstand, 1, 1)}g)<br>` +
      `Theoretisch: <b>${nf(theoretischerAnteil, 1, 1)}%</b><br>` +
      `Experimentell: <b>${nf(experimentellerAnteil, 1, 1)}%</b> (${anzahlImIntervall}/${packungen.length})`;
  }

  pg.pop();
}

/**
 * Zeichnet die Flächenaufteilung unter der Normalverteilungskurve
 */
function drawFlaechenaufteilung(pg) {
  if (!showFlaechenaufteilung) return;

  pg.push();

  // Berechne die erwartete maximale Höhe (am Mittelwert)
  let maxErwarteteHoehe = anzahlPackungen * intervallGroesse * normalDensity(mittelwert, mittelwert, standardabweichung);
  
  let kurvenSkalierung;
  if (fixedCurveHeight) {
    kurvenSkalierung = maxHoehe;
  } else {
    kurvenSkalierung = Math.min(maxErwarteteHoehe, maxHoehe);
  }

  // Zeichne linke Fläche (hellrot)
  pg.fill(flaecheLinksColor);
  pg.noStroke();
  pg.beginShape();
  
  // Startpunkt unten links - deutlich weiter links als minMasse
  let xStart = map(minMasse - 4, minMasse, maxMasse, margin, canvasWidth - margin);
  pg.vertex(xStart, canvasHeight - margin);
  
  // Kurve von links bis zum Cut-off
  for (let m = minMasse - 4; m <= cutoffPunkt; m += 0.5) {
    let x = map(m, minMasse, maxMasse, margin, canvasWidth - margin);
    let density = normalDensity(m, mittelwert, standardabweichung);
    
    let skalierteAnzahl;
    if (fixedCurveHeight) {
      skalierteAnzahl = density / normalDensity(mittelwert, mittelwert, standardabweichung) * maxHoehe;
    } else {
      skalierteAnzahl = anzahlPackungen * intervallGroesse * density;
      skalierteAnzahl = Math.min(skalierteAnzahl, maxHoehe);
    }
    
    let y = map(skalierteAnzahl, 0, maxHoehe, canvasHeight - margin, margin);
    pg.vertex(x, y);
  }
  
  // Runter zum Cut-off auf der X-Achse
  let xCutoff = map(cutoffPunkt, minMasse, maxMasse, margin, canvasWidth - margin);
  pg.vertex(xCutoff, canvasHeight - margin);
  
  pg.endShape(CLOSE);

  // Zeichne rechte Fläche (hellblau)
  pg.fill(flaecheRechtsColor);
  pg.noStroke();
  pg.beginShape();
  
  // Startpunkt am Cut-off auf X-Achse
  pg.vertex(xCutoff, canvasHeight - margin);
  
  // Kurve vom Cut-off bis rechts
  for (let m = cutoffPunkt; m <= maxMasse + 4; m += 0.5) {
    let x = map(m, minMasse, maxMasse, margin, canvasWidth - margin);
    let density = normalDensity(m, mittelwert, standardabweichung);
    
    let skalierteAnzahl;
    if (fixedCurveHeight) {
      skalierteAnzahl = density / normalDensity(mittelwert, mittelwert, standardabweichung) * maxHoehe;
    } else {
      skalierteAnzahl = anzahlPackungen * intervallGroesse * density;
      skalierteAnzahl = Math.min(skalierteAnzahl, maxHoehe);
    }
    
    let y = map(skalierteAnzahl, 0, maxHoehe, canvasHeight - margin, margin);
    pg.vertex(x, y);
  }
  
  // Runter zu rechts auf der X-Achse - deutlich weiter rechts als maxMasse
  let xEnd = map(maxMasse + 4, minMasse, maxMasse, margin, canvasWidth - margin);
  pg.vertex(xEnd, canvasHeight - margin);
  
  pg.endShape(CLOSE);

  // Trennlinie am Cut-off
  pg.stroke(100, 100, 100, 200);
  pg.strokeWeight(2);
  pg.drawingContext.setLineDash([8, 4]);
  pg.line(xCutoff, canvasHeight - margin, xCutoff, margin);
  pg.drawingContext.setLineDash([]);

  // Beschriftung am Cut-off
  pg.noStroke();
  pg.fill(80);
  pg.textSize(11);
  pg.textAlign(CENTER, TOP);
  pg.text(nf(cutoffPunkt, 1, 1) + 'g', xCutoff, canvasHeight - margin + 22);

  // Berechne experimentelle Prozente (aus den Stichproben)
  let anzahlLinks = 0;
  let anzahlRechts = 0;
  for (let gewicht of packungen) {
    if (gewicht < cutoffPunkt) {
      anzahlLinks++;
    } else {
      anzahlRechts++;
    }
  }
  let prozentLinks = packungen.length > 0 ? (anzahlLinks / packungen.length * 100) : 0;
  let prozentRechts = packungen.length > 0 ? (anzahlRechts / packungen.length * 100) : 0;

  // Berechne theoretische Prozente (aus der Normalverteilung)
  // P(X < cutoff) = Φ((cutoff - μ) / σ)
  let zWert = (cutoffPunkt - mittelwert) / standardabweichung;
  let theoretischLinks = (0.5 * (1 + erf(zWert / Math.sqrt(2)))) * 100;
  let theoretischRechts = 100 - theoretischLinks;

  // Aktualisiere die Anzeige im Control Panel
  let flaechenElement = document.getElementById('flaechenAnzeige');
  if (flaechenElement) {
    flaechenElement.innerHTML =
      `<div style="color: rgb(200, 50, 50); font-weight: bold; margin-bottom: 5px;">◀ Links (< ${nf(cutoffPunkt, 1, 1)}g):</div>` +
      `Theoretisch: <b>${nf(theoretischLinks, 1, 1)}%</b><br>` +
      `Experimentell: <b>${nf(prozentLinks, 1, 1)}%</b> (${anzahlLinks}/${packungen.length})<br><br>` +
      `<div style="color: rgb(50, 100, 200); font-weight: bold; margin-bottom: 5px;">▶ Rechts (≥ ${nf(cutoffPunkt, 1, 1)}g):</div>` +
      `Theoretisch: <b>${nf(theoretischRechts, 1, 1)}%</b><br>` +
      `Experimentell: <b>${nf(prozentRechts, 1, 1)}%</b> (${anzahlRechts}/${packungen.length})`;
  }

  pg.pop();
}

/**
 * Fehlerfunktion (erf) für die Normalverteilung
 * Approximation nach Abramowitz and Stegun
 */
function erf(x) {
  // Konstanten für die Approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  // Vorzeichen speichern
  let sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  // Approximation
  let t = 1.0 / (1.0 + p * x);
  let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
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
      
      if (showFlaechenaufteilung) {
        pg.noFill();
        pg.stroke(color1[0], color1[1], color1[2], 255);
        pg.strokeWeight(2);
      } else {
        pg.fill(color1);
        pg.stroke(50);
        pg.strokeWeight(1);
      }
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
      
      if (showFlaechenaufteilung) {
        pg.noFill();
        pg.stroke(color2[0], color2[1], color2[2], 255);
        pg.strokeWeight(1.5);
      } else {
        pg.fill(color2);
        pg.noStroke();
      }
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
    
    if (showFlaechenaufteilung) {
      pg.noFill();
      pg.stroke(color1[0], color1[1], color1[2], 255);
      pg.strokeWeight(2);
    } else {
      pg.fill(color2);
      pg.stroke(200, 100, 50);  // Feiner oranger Rand
      pg.strokeWeight(0.5);
    }
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
    let tooltipText = `Anzahl: ${hoveredCount}\n${smartFormat(untereGrenze)}g ≤ Gewicht < ${smartFormat(obereGrenze)}g`;

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

// Zeigt beim Tooltip nur so viele Nachkommastellen wie nötig (max. 2)
function smartFormat(num) {
  return num % 1 === 0 ? nf(num, 1, 0) : 
         (num * 10) % 1 === 0 ? nf(num, 1, 1) : 
         nf(num, 1, 2);
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