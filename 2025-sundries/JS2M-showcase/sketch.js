// Globale Einstellungen und Variablen
let unit = 10;                   // Pixel pro Einheit (Karo)
let r = 10;       
let maxRadius = 300;                // Radius in "echten" Einheiten
let screen = 800;
let cols, rows;                 // Anzahl Spalten und Zeilen im Raster
let midX, midY;                 // Mittelpunkt des Kreises (in Pixeln)
let offset = 0;              // Offset für den Kreis-Mittelpunkt

let halbeZaehlen = false;        // true: grüne Karos zählen halb, false: nur ab 50% zählt ganz

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
let radiusPanel;
let isRunning = false;          // Animation läuft
//let color1 = [138, 199, 228, 100]; // hellblau
//let color2 = [190, 208, 219, 100]; // 50%
let color1 = [0, 135, 191, 100]; // 
let color2 = [138, 199, 228, 100];

let color3 = 'rgba(224, 224, 224, 0.9)'; // Kontrollpanel Hintergrund

let font_polo;

/**
 * setup(): Initialisiert das Programm.
 * Keine Eingabeparameter.
 * Kein Rückgabewert.
 */
async function setup() {
  font_polo = await loadFont('./assets/PoloCEF-Regular.otf');
  
  // Font für CSS verfügbar machen
  let fontFace = new FontFace('PoloCEF', 'url(./assets/PoloCEF-Regular.otf)');
  await fontFace.load();
  document.fonts.add(fontFace);

  createCanvas(screen, screen);
  
  // Kontrollpanel links oben für Checkbox und Button
  controlPanel = createDiv();
  controlPanel.style('position', 'absolute');
  controlPanel.style('top', '680px');
  controlPanel.style('left', '20px');
  controlPanel.style('background', 'rgba(219, 219, 219, 0.9)');
  controlPanel.style('padding', '15px');
  controlPanel.style('border-radius', '8px');
  controlPanel.style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)');
  controlPanel.style('font-family', 'PoloCEF, Arial, sans-serif');
  controlPanel.style('font-size', '16px');
  controlPanel.style('z-index', '1000');
  
  // Checkbox für halbe Häuschen
  halbeCheckbox = createCheckbox('halbe Häuschen zählen', halbeZaehlen);
  halbeCheckbox.parent(controlPanel);
  halbeCheckbox.style('margin-bottom', '15px');
  halbeCheckbox.style('display', 'block');
  halbeCheckbox.changed(updateHalbeZaehlen);
  
  // Start-Button
  startButton = createButton('Auszählung starten');
  startButton.parent(controlPanel);
  startButton.style('background', '#AEBE38');
  startButton.style('color', 'white');
  startButton.style('padding', '8px 16px');
  startButton.style('border', 'none');
  startButton.style('border-radius', '4px');
  startButton.style('cursor', 'pointer');
  startButton.style('font-family', 'PoloCEF, Arial, sans-serif');
  startButton.style('font-size', '16px');
  startButton.mousePressed(startAnimation);
  
  // Radius-Panel 
  radiusPanel = createDiv();
  radiusPanel.style('position', 'absolute');
  radiusPanel.style('top', '10px');
  radiusPanel.style('left', '20px');
  radiusPanel.style('background', color3);
  radiusPanel.style('padding', '12px 10px');
  radiusPanel.style('border-radius', '8px');
  radiusPanel.style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)');
  radiusPanel.style('font-family', 'PoloCEF, Arial, sans-serif');
  radiusPanel.style('font-size', '16px');
  radiusPanel.style('z-index', '1000');
  radiusPanel.style('min-width', '200px');
  radiusPanel.style('text-align', 'center');
  
  // Label für Radius
  let radiusLabel = createP(`Radius r (1 – ${maxRadius}):`);
  radiusLabel.parent(radiusPanel);
  radiusLabel.style('margin', '0 0 3px 0');
  radiusLabel.style('font-weight', 'bold');
  radiusLabel.style('text-align', 'center');
  
  // Radius-Eingabefeld
  radiusInput = createInput(str(r));
  radiusInput.parent(radiusPanel);
  radiusInput.size(120);
  radiusInput.style('margin', '0 auto 3px auto');
  radiusInput.style('padding', '6px');
  radiusInput.style('border', '1px solid #ccc');
  radiusInput.style('border-radius', '4px');
  radiusInput.style('display', 'block');
  radiusInput.style('text-align', 'center');
  radiusInput.style('font-size', '16px');
  radiusInput.input(validateRadius);
  radiusInput.changed(updateVisualization);
  
  // Hover-Effekt für Button
  startButton.mouseOver(() => {
    if (!isRunning) startButton.style('background', '#AEBE38');
  });
  startButton.mouseOut(() => {
    if (!isRunning) startButton.style('background', '#AEBE38');
  });

  textFont(font_polo);
  
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
  } else if (value > maxRadius) {
    radiusInput.value(maxRadius);
  }
}

/**
 * Aktualisiert die Visualisierung wenn der Radius geändert wird
 */
function updateVisualization() {
  let newR = int(radiusInput.value());
  if (newR >= 1 && newR <= maxRadius && newR !== r) {
    r = newR;
    initializeVisualization();
    resetAnimation();
  }
  radiusInput.elt.blur(); // Fokus vom Eingabefeld entfernen
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
    startButton.html('Auszählung läuft...');
    startButton.style('background', '#EEAC88');
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
  startButton.style('background', '#AEBE38');
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
  unit = min(50, (screen / (2.5*r))); // Bestimme die Karo-Größe, sodass der Kreis gut ins Bild passt
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
        startButton.html('Auszählung starten'); // Button zurücksetzen
        startButton.style('background', '#AEBE38');
        startButton.style('cursor', 'pointer');
        startButton.removeAttribute('disabled');
        
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
            backgroundLayer.fill(color1); // hellblau
            filledCount += 1.0;
          } else { // Zwischen 25 % und 75 % → halb im Kreis
            backgroundLayer.fill(color2);     // 50%
            filledCount += 0.5;
          }
          backgroundLayer.rect(cx, cy, unit, unit);
        }
      } else {
        if (fraction >= 0.5) { // Alternative: Nur ab 50 % → hellblau, ganz zählen
          backgroundLayer.noStroke();
          backgroundLayer.fill(color1);
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
  if (r > 100) {
  pg.strokeWeight(0.5);
  }
  else if (r > 180) {
  pg.strokeWeight(0.2);
  }
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
  pg.stroke(97, 167, 211);

  pg.strokeWeight(3);
  if (r > 100) {
  pg.strokeWeight(1.5);
  }
  else if (r > 180) {
  pg.strokeWeight(0.5);
  }
  
  pg.ellipse(midX, midY, 2 * r * unit, 2 * r * unit);
  pg.strokeWeight(1);
}

/**
 * drawRadiusSquare(pg): Zeichnet das Radiusquadrat ab dem Mittelpunkt.
 * pg: p5.Graphics-Objekt, auf das gezeichnet werden soll
 * Kein Rückgabewert.
 */
function drawRadiusSquare(pg) {
  pg.stroke(217, 67, 104);
  
  pg.strokeWeight(3);
  if (r > 100) {
  pg.strokeWeight(1.5);
  }
  else if (r > 180) {
  pg.strokeWeight(0.5);
  }

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
