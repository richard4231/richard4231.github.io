// Globale Einstellungen und Variablen
let canvasWidth = 800;
let canvasHeight = 600;
let margin = 60;  // Rand für Achsenbeschriftung

// Statistische Parameter (im Code anpassbar)
let mittelwert = 1010;  // in Gramm
let standardabweichung = 5;  // in Gramm (wird über Schieberegler gesteuert)

// Histogramm-Parameter
let binSize = 2;  // Intervallgröße in Gramm (im Code anpassbar: 0.5 bis 10g)
let intervallGroesse = binSize; // wird über Schieberegler gesteuert

// Parameter Übergänge
let wechsel_punkt = 50;   // Ab dieser Anzahl: Punktmodus
let wechsel_balken = 1000; // Ab dieser Anzahl: Balkenmodus

// Simulation
let anzahlPackungen = 1;
let packungen = [];  // Array mit Gewichten

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
let fixedCurveHeight = false;  // Toggle für fixe Kurvenhöhe

// Hover-Tracking
let hoveredBin = null;
let hoveredCount = 0;

// Farben (wie im Original)
let color1 = [0, 135, 191, 200]; // Blau für Packungen
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
 * Berechnet eine sinnvolle Schrittgröße für die Y-Achse
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
  
  // Anzahl Packungen Slider
  let anzahlLabel = createP('Anzahl Packungen: <span id="anzahlValue">1</span>');
  anzahlLabel.parent(controlPanel);
  anzahlLabel.style('margin', '0 0 5px 0');
  anzahlLabel.style('font-weight', 'bold');
  
  anzahlSlider = createSlider(1, 5000, 1, 1);
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
  
  // Intervallgröße Slider
  let intervallLabel = createP('Intervallgröße: <span id="intervallValue">2</span> g');
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
  infoText = createP(`Mittelwert: ${mittelwert} g<br>Intervallgröße: ${intervallGroesse} g`);
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
  anzahlPackungen = int(anzahlSlider.value());
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
 * Aktualisiert die Intervallgröße
 */
function updateIntervall() {
  intervallGroesse = intervallSlider.value();
  binSize = intervallGroesse; // Für Kompatibilität
  document.getElementById('intervallValue').textContent = nf(intervallGroesse, 1, 1);
  document.getElementById('infoText').innerHTML = `Mittelwert: ${mittelwert} g<br>Intervallgröße: ${nf(intervallGroesse, 1, 1)} g`;
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
  for (let i = 0; i < anzahlPackungen; i++) {
    let gewicht = gaussianRandom(mittelwert, standardabweichung);
    packungen.push(gewicht);
  }
  
  // Mittelwert berechnen
  let summe = packungen.reduce((a, b) => a + b, 0);
  berechneteMittelwert = summe / packungen.length;
  
  // Median berechnen
  let sortiert = [...packungen].sort((a, b) => a - b);
  if (sortiert.length % 2 === 0) {
    median = (sortiert[sortiert.length / 2 - 1] + sortiert[sortiert.length / 2]) / 2;
  } else {
    median = sortiert[Math.floor(sortiert.length / 2)];
  }
  
  // Legende aktualisieren
  updateLegende();
}

/**
 * Aktualisiert die Legende je nach Anzahl der Packungen
 */
function updateLegende() {
  let legendeElement = document.getElementById('legendeText');
  if (legendeElement) {
    if (anzahlPackungen <= wechsel_punkt) {
      legendeElement.innerHTML = '🔷 = 1 Packung<br>(mit Gewicht in g)';
    } else if (anzahlPackungen < wechsel_balken) {
      legendeElement.innerHTML = '🟠 = 1 Packung';
    } else {
      legendeElement.innerHTML = 'Säule = Anzahl Packungen<br>Breite = Intervallgröße';
    }
  }
}

/**
 * Erstellt Histogramm-Daten
 */
function createHistogram() {
  let histogram = {};
  
  for (let gewicht of packungen) {
    // Runde auf das nächste Intervall - Bins sind um ganze Werte zentriert
    // z.B. bei intervallGroesse = 1 und Mittelwert 1010:
    // Bin bei 1010 geht von 1009.5 bis 1010.5
    let key = Math.round(gewicht / intervallGroesse) * intervallGroesse;
    
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
}

/**
 * Zeichnet das Koordinatensystem
 */
function drawCoordinateSystem(pg) {
  pg.push();
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
  let stepY = getNiceStep(maxHoehe);
  
  for (let anzahl = 0; anzahl <= maxHoehe; anzahl += stepY) {
    let y = map(anzahl, 0, maxHoehe, canvasHeight - margin, margin);
    pg.text(anzahl, margin - 10, y);
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
  
  pg.pop();
}

/**
 * Zeichnet das Histogramm je nach Anzahl der Packungen
 */
function drawHistogram(pg, histogram) {
  if (anzahlPackungen <= 10) {
    drawPackungenMode(pg, histogram);
  } else if (anzahlPackungen < 1000) {
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
  
  let packungBreite = 40;  // Größere Breite
  let verfuegbareHoehe = canvasHeight - 2 * margin;
  
  // Adaptive Höhe: Bei wenigen Packungen groß, bei vielen kleiner
  let basePackungHoehe = 30;  // Größere Basishöhe
  let packungHoehe = Math.max(10, Math.min(basePackungHoehe, verfuegbareHoehe / (maxHoehe + 2)));
  
  let packungIndex = 0;
  for (let key in histogram) {
    let masse = parseFloat(key);
    let anzahl = histogram[key];
    let x = map(masse, minMasse, maxMasse, margin, canvasWidth - margin);
    
    // Stapel von unten nach oben
    for (let i = 0; i < anzahl; i++) {
      let yPos = canvasHeight - margin - (i + 1) * packungHoehe;
      
      pg.fill(color1);
      pg.stroke(50);
      pg.strokeWeight(1);
      pg.rect(x - packungBreite / 2, yPos, packungBreite, packungHoehe, 2);
      
      // Gewicht auf Packung schreiben - verwende das tatsächliche Gewicht
      if (packungIndex < packungen.length) {
        pg.fill(255);
        pg.noStroke();
        pg.textAlign(CENTER, CENTER);
        pg.textSize(10);
        pg.text(nf(packungen[packungIndex], 1, 1) + "g", x, yPos + packungHoehe / 2);
        packungIndex++;
      }
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
  
  // Adaptive Punktgröße: Bei wenigen Packungen groß, bei vielen kleiner
  let basePunktGroesse = 10;  // Größere Basispunktgröße
  let punktGroesse = Math.max(3, Math.min(basePunktGroesse, verfuegbareHoehe / (maxHoehe * 1.5)));
  let punktAbstand = punktGroesse + 1;
  
  for (let key in histogram) {
    let masse = parseFloat(key);
    let anzahl = histogram[key];
    let x = map(masse, minMasse, maxMasse, margin, canvasWidth - margin);
    
    // Punkte stapeln von unten nach oben
    for (let i = 0; i < anzahl; i++) {
      let yPos = canvasHeight - margin - (i + 0.5) * punktAbstand;
      
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
  
  // Berechne Säulenbreite basierend auf der tatsächlichen Intervallgröße
  // Die Breite in Pixeln entspricht der Intervallgröße auf der Masse-Skala
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
  
  // Hover-Anzeige
  if (hoveredBin !== null && hoveredCount > 0) {
    push();
    fill(0, 150);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    
    // Tooltip-Hintergrund
    let tooltipText = `Anzahl: ${hoveredCount}`;
    let textW = textWidth(tooltipText) + 10;
    let textH = 25;
    let tooltipX = mouseX + 15;
    let tooltipY = mouseY - 30;
    
    // Verhindere, dass Tooltip aus dem Canvas läuft
    if (tooltipX + textW > canvasWidth) tooltipX = mouseX - textW - 15;
    if (tooltipY < 0) tooltipY = mouseY + 15;
    
    fill(255, 240);
    stroke(100);
    strokeWeight(1);
    rect(tooltipX, tooltipY, textW, textH, 3);
    
    fill(0);
    noStroke();
    text(tooltipText, tooltipX + 5, tooltipY + 5);
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
  if (closestKey !== null && minDist < intervallGroesse * 1.5) {
    hoveredBin = closestKey;
    hoveredCount = currentHistogram[closestKey];
  }
  
  return false; // Verhindert Standard-Verhalten
}