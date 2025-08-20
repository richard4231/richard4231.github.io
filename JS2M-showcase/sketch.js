// Globale Einstellungen und Variablen
let unit = 10;                   // Pixel pro Einheit (Karo)
let r = 10;                       // Radius in "echten" Einheiten
let screen = 800;
let cols, rows;                 // Anzahl Spalten und Zeilen im Raster
let midX, midY;                 // Mittelpunkt des Kreises (in Pixeln)

let halbeZaehlen = true;        // true: grüne Karos zählen halb, false: nur ab 50% zählt ganz

let currentRow = 0;
let currentCol = 0;
let filledCount = 0;            // gezählte (auch halbe) Karos

let speed = 1;                  // Anzahl Karos pro Frame (Steuerung der Animation)

let leftBound, rightBound, topBound, bottomBound; // Begrenzung auf Umquadrat des Kreises
let backgroundLayer;            // Zwischenspeicher für alle fixen Grafikelemente

// UI-Elemente
let radiusInput;
let halbeCheckbox;
let startButton;
let controlPanel;
let isRunning = false;          // Animation läuft

/**
 * setup(): Initialisiert das Programm.
 * Keine Eingabeparameter.
 * Kein Rückgabewert.
 */
function setup() {
  createCanvas(screen, screen);
  
  // Kontrollpanel erstellen
  controlPanel = createDiv();
  controlPanel.style('position', 'absolute');
  controlPanel.style('top', '10px');
  controlPanel.style('left', '10px');
  controlPanel.style('background', 'rgba(255, 255, 255, 0.9)');
  controlPanel.style('padding', '15px');
  controlPanel.style('border-radius', '8px');
  controlPanel.style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)');
  controlPanel.style('font-family', 'Arial, sans-serif');
  controlPanel.style('font-size', '14px');
  controlPanel.style('z-index', '1000');
  
  // Label für Radius
  let radiusLabel = createP('Radius r (1-200):');
  radiusLabel.parent(controlPanel);
  radiusLabel.style('margin', '0 0 5px 0');
  radiusLabel.style('font-weight', 'bold');
  
  // Radius-Eingabefeld
  radiusInput = createInput(str(r));
  radiusInput.parent(controlPanel);
  radiusInput.size(80);
  radiusInput.style('margin-bottom', '10px');
  radiusInput.style('padding', '5px');
  radiusInput.style('border', '1px solid #ccc');
  radiusInput.style('border-radius', '4px');
  radiusInput.input(validateRadius);
  radiusInput.changed(updateVisualization);
  
  // Checkbox für halbe Häuschen
  halbeCheckbox = createCheckbox('halbe Häuschen zählen', halbeZaehlen);
  halbeCheckbox.parent(controlPanel);
  halbeCheckbox.style('margin-bottom', '15px');
  halbeCheckbox.style('display', 'block');
  halbeCheckbox.changed(updateHalbeZaehlen);
  
  // Start-Button
  startButton = createButton('Auszählung starten');
  startButton.parent(controlPanel);
  startButton.style('background', '#4CAF50');
  startButton.style('color', 'white');
  startButton.style('padding', '8px 16px');
  startButton.style('border', 'none');
  startButton.style('border-radius', '4px');
  startButton.style('cursor', 'pointer');
  startButton.style('font-size', '14px');
  startButton.mousePressed(startAnimation);
  
  // Hover-Effekt für Button
  startButton.mouseOver(() => {
    if (!isRunning) startButton.style('background', '#45a049');
  });
  startButton.mouseOut(() => {
    if (!isRunning) startButton.style('background', '#4CAF50');
  });
  
  // Initial setup
  initializeVisualization();
  noLoop(); // Animation startet erst nach Button-Klick
}

/**
 * Validiert die Radius-Eingabe während der Eingabe
 */
function validateRadius() {
  let value = int(radiusInput.value());
  if (value < 1) {
    radiusInput.value('1');
  } else if (value > 200) {
    radiusInput.value('200');
  }
}

/**
 * Aktualisiert die Visualisierung wenn der Radius geändert wird
 */
function updateVisualization() {
  let newR = int(radiusInput.value());
  if (newR >= 1 && newR <= 200 && newR !== r) {
    r = newR;
    initializeVisualization();
    resetAnimation();
  }
}

/**
 * Aktualisiert die halbeZaehlen Variable
 */
function updateHalbeZaehlen() {
  halbeZaehlen = halbeCheckbox.checked();
  resetAnimation();
}

/**
 * Startet die Animation
 */
function startAnimation() {
  if (!isRunning) {
    resetAnimation();
    isRunning = true;
    startButton.html('Animation läuft...');
    startButton.style('background', '#ff9800');
    startButton.style('cursor', 'default');
    startButton.attribute('disabled', '');
    loop();
  }
}

/**
 * Setzt die Animation zurück
 */
function resetAnimation() {
  isRunning = false;
  currentRow = topBound;
  currentCol = leftBound;
  filledCount = 0;
  startButton.html('Auszählung starten');
  startButton.style('background', '#4CAF50');
  startButton.style('cursor', 'pointer');
  startButton.removeAttribute('disabled');
  noLoop();
  
  // Hintergrund neu zeichnen
  backgroundLayer = createGraphics(width, height);
  backgroundLayer.background(255);
  drawGrid(backgroundLayer);
  drawCircle(backgroundLayer);
  drawRadiusSquare(backgroundLayer);
  
  redraw();
}

/**
 * Initialisiert die Visualisierung mit den aktuellen Parametern
 */
function initializeVisualization() {
  unit = min(50, floor(screen / (2.5*r))); // Bestimme die Karo-Größe, sodass der Kreis gut ins Bild passt
  cols = width / unit;
  rows = height / unit;
  midX = floor(cols / 2) * unit;
  midY = floor(rows / 2) * unit;
  frameRate(60);
  speed = max(1, floor(r*r/100.0*3.0)); // Geschwindigkeit abhängig von der Kreisfläche wählen

  // Grenzen für die Überprüfung festlegen (nur das Umquadrat des Kreises wird untersucht)
  leftBound = max(0, floor(cols / 2) - r - 1);
  rightBound = min(cols, floor(cols / 2) + r + 1);
  topBound = max(0, floor(rows / 2) - r - 1);
  bottomBound = min(rows, floor(rows / 2) + r + 1);
  
  // Hintergrund vorbereiten
  backgroundLayer = createGraphics(width, height);
  backgroundLayer.background(255);
  drawGrid(backgroundLayer);
  drawCircle(backgroundLayer);
  drawRadiusSquare(backgroundLayer);
}

/**
 * draw(): Wird automatisch immer wieder aufgerufen, bis noLoop() erreicht ist.
 * Keine Eingabeparameter.
 * Kein Rückgabewert.
 */
function draw() {
  image(backgroundLayer, 0, 0);

  if (isRunning) {
    for (let i = 0; i < speed; i++) {
      if (currentRow >= bottomBound) { // Wenn alle relevanten Zeilen bearbeitet sind: Stopp
        isRunning = false;
        startButton.html('Auszählung beendet');
        startButton.style('background', '#2196F3');
        startButton.style('cursor', 'default');
        noLoop();
        break;
      }

      let cx = currentCol * unit;
      let cy = currentRow * unit;
      let fraction = getCircleFraction(cx, cy); // Kreisanteil für aktuelles Karo berechnen

      if (halbeZaehlen) {
        if (fraction > 0.25) { // Nur wenn mindestens 25 % im Kreis liegen
          backgroundLayer.noStroke();
          if (fraction > 0.75) { // Mehr als 75 % → ganz im Kreis
            backgroundLayer.fill(100, 150, 255, 100); // hellblau
            filledCount += 1.0;
          } else { // Zwischen 25 % und 75 % → halb im Kreis
            backgroundLayer.fill(0, 200, 0, 100);     // grün
            filledCount += 0.5;
          }
          backgroundLayer.rect(cx, cy, unit, unit);
        }
      } else {
        if (fraction >= 0.5) { // Alternative: Nur ab 50 % → hellblau, ganz zählen
          backgroundLayer.noStroke();
          backgroundLayer.fill(100, 150, 255, 100);
          backgroundLayer.rect(cx, cy, unit, unit);
          filledCount += 1.0;
        }
      }

      currentCol++; // nächstes Karo in der Zeile
      if (currentCol >= rightBound) { // Zeile fertig → nächste Zeile beginnen
        currentCol = leftBound;
        currentRow++;
      }
    }
  }

  drawCount(); // Anzeige aktualisieren
}

/**
 * drawGrid(pg): Zeichnet das Raster.
 * pg: p5.Graphics-Objekt, auf das gezeichnet werden soll
 * Kein Rückgabewert.
 */
function drawGrid(pg) {
  pg.stroke(225);
  for (let x = 0; x <= width; x += unit) {
    pg.line(x, 0, x, height);
  }
  for (let y = 0; y <= height; y += unit) {
    pg.line(0, y, width, y);
  }
}

/**
 * drawCircle(pg): Zeichnet den Kreis mit Radius r um den Mittelpunkt.
 * pg: p5.Graphics-Objekt, auf das gezeichnet werden soll
 * Kein Rückgabewert.
 */
function drawCircle(pg) {
  pg.noFill();
  pg.stroke(0, 0, 255);
  pg.strokeWeight(2);
  pg.ellipse(midX, midY, 2 * r * unit, 2 * r * unit);
  pg.strokeWeight(1);
}

/**
 * drawRadiusSquare(pg): Zeichnet das Radiusquadrat ab dem Mittelpunkt.
 * pg: p5.Graphics-Objekt, auf das gezeichnet werden soll
 * Kein Rückgabewert.
 */
function drawRadiusSquare(pg) {
  pg.stroke(255, 0, 0);
  pg.strokeWeight(2);
  pg.noFill();
  pg.rect(midX, midY, r * unit, r * unit);
  pg.strokeWeight(1);
}

/**
 * getCircleFraction(x, y): Schätzt, wie viel vom Karo innerhalb des Kreises liegt.
 * x, y: linke obere Ecke des Karos in Pixeln
 * Rückgabewert: Anteil (zwischen 0.0 und 1.0) der Fläche innerhalb des Kreises
 */
function getCircleFraction(x, y) {
  // Schritt 1: Schnelle Vorprüfung mit den vier Ecken
  // Wenn alle Ecken im Kreis liegen → ganz im Kreis
  // Wenn keine Ecke im Kreis liegt → komplett außerhalb

  // Array mit den vier Eckpunkten des Karos
  let corners = [
    [x, y],
    [x + unit, y],
    [x, y + unit],
    [x + unit, y + unit]
  ];

  let insideCorners = 0; // Zähle Ecken im Kreis
  for (let i = 0; i < 4; i++) {
    let dx = corners[i][0] - midX;
    let dy = corners[i][1] - midY;
    if (dx * dx + dy * dy <= (r * unit) * (r * unit)) {
      insideCorners++;
    }
  }

  if (insideCorners === 4) return 1.0; // Ganzes Karo im Kreis
  if (insideCorners === 0) return 0.0; // Ganzes Karo außerhalb

  // Schritt 2: Samplingverfahren für genauere Abschätzung
  // 10×10 gleichmäßig verteilte Punkte im Karo untersuchen

  let inside = 0;     // Zähler für Punkte im Kreis
  let total = 100;    // Anzahl der Punkte insgesamt

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let px = x + i * unit / 10 + unit / 20; // X-Position des Samplepunkts (zentriert im Kästchen)
      let py = y + j * unit / 10 + unit / 20; // Y-Position des Samplepunkts
      let dx = px - midX;                    // Abstand zum Mittelpunkt horizontal
      let dy = py - midY;                    // Abstand zum Mittelpunkt vertikal
      if (dx * dx + dy * dy <= (r * unit) * (r * unit)) {
        inside++; // Punkt liegt im Kreis
      }
    }
  }

  // Ergebnis: Anteil der Fläche innerhalb des Kreises
  return inside / 100.0;
}

/**
 * drawCount(): Zeigt die aktuelle Anzahl Karos (ganz oder anteilig) an.
 * Keine Eingabeparameter.
 * Kein Rückgabewert.
 */
function drawCount() {
  fill(0);
  textSize(16);
  textAlign(RIGHT, TOP);
  text("Anzahl Karos im Kreis: " + nf(filledCount, 1, 1), width - 10, 10);
  text("Anzahl Karos im Radiusquadrat: " + (r * r), width - 10, 30);
  textAlign(CENTER, TOP);
  textSize(24);
  text("Radius r = " + (r), width /2, 10);
}

/**
 * Reagiert auf Mausklicks außerhalb der UI-Elemente
 */
function mousePressed() {
  // Überprüfe ob auf den Canvas geklickt wurde (triggert Neuzeichnung)
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    updateVisualization();
  }
}