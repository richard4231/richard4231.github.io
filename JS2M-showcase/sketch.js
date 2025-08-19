// Globale Einstellungen und Variablen
let unit = 10;                   // Pixel pro Einheit (Karo)
let r = 10;                      // Radius in "echten" Einheiten
let canvasSize = 600;            // Größe der Zeichenfläche
let cols, rows;                  // Anzahl Spalten und Zeilen im Raster
let midX, midY;                  // Mittelpunkt des Kreises (in Pixeln)
let gridOffsetX, gridOffsetY;    // Offset für zentriertes Raster

let zaehlmodus = "innen";         // "innen", "alle", "halb"
let modeButtons = [];            // Array für die Modus-Buttons

let currentRow = 0;
let currentCol = 0;
let filledCount = 0;             // gezählte (auch halbe) Karos
let approximatePi = 0;           // Annäherung an Pi

let speed = 1;                   // Anzahl Karos pro Frame (Steuerung der Animation)
let isRunning = false;           // Status der Animation
let buttonStartStop;             // Start/Stop Button

let leftBound, rightBound, topBound, bottomBound; // Begrenzung auf Umquadrat des Kreises
let backgroundLayer;            // Zwischenspeicher für alle fixen Grafikelemente

let sliderRadius;                // Slider für Radius-Einstellung
let sliderSpeed;                 // Slider für Geschwindigkeit

// Farben aus der Vorlage
let eisblau, himbeerrot, ozeanblau, zitronengelb, hellblau, anthrazit, sliderrot;
let karoFarbeVoll, karoFarbeHalb, karoFarbeAussen;

// UI Container
let topContainer, bottomContainer, leftContainer, rightContainer;
let cnv; // Canvas-Referenz

// Layout-Variablen für responsive Gestaltung
let sidebarWidth = 220;
let canvasMargin = 20;


/**
 * setup(): Initialisiert das Programm.
 */
function setup() {
  // Standard Canvas-Größe setzen
  canvasSize = 600;
  
  // Canvas erstellen
  cnv = createCanvas(canvasSize, canvasSize);
  
  // Canvas positionieren
  let canvasX = (windowWidth - canvasSize) / 2;
  let canvasY = 100;
  cnv.position(canvasX, canvasY);
  
  // Farben definieren
  eisblau = color(0, 135, 191);      // Hauptfarbe für Kreis
  himbeerrot = color(217, 67, 104);   // Hauptfarbe für Radiusquadrat
  ozeanblau = color(52, 174, 214);    
  zitronengelb = color(255, 232, 67);
  hellblau = color(188, 228, 250);
  anthrazit = color(100, 100, 100);
  sliderrot = color(217, 78, 31);     // für Slider-Thumbs
  
  // Farben für Karos
  karoFarbeVoll = color(52, 174, 214, 150);    // ozeanblau transparent
  karoFarbeHalb = color(113, 162, 181, 150);   // petrolblaugrün transparent
  karoFarbeAussen = color(255, 232, 67, 100);  // zitronengelb transparent
  
  // UI-Elemente erstellen
  createUIElements();
  
  // Initial-Setup
  resetVisualization();
  
  frameRate(60);
}


/**
 * calculateResponsiveLayout(): Berechnet responsive Größen
 */
function calculateResponsiveLayout() {
  // Minimale Breite für Sidebars und Canvas
  let minTotalWidth = 2 * sidebarWidth + 400 + 2 * canvasMargin;
  
  if (windowWidth >= minTotalWidth) {
    // Genug Platz für alles
    let availableWidth = windowWidth - 2 * sidebarWidth - 4 * canvasMargin;
    let availableHeight = windowHeight - 250;
    canvasSize = min(max(400, min(availableWidth, availableHeight)), 700);
  } else {
    // Nicht genug Platz - fixe Größe verwenden
    canvasSize = 500;
  }
}


/**
 * positionCanvas(): Positioniert den Canvas zentriert
 */
function positionCanvas() {
  // Canvas immer zentriert positionieren
  let canvasX = (windowWidth - canvasSize) / 2;
  let canvasY = 100;
  cnv.position(canvasX, canvasY);
}


/**
 * windowResized(): Wird bei Fenstergrößenänderung aufgerufen
 */
function windowResized() {
  calculateResponsiveLayout();
  
  // Canvas-Größe anpassen
  resizeCanvas(canvasSize, canvasSize);
  positionCanvas();
  
  // UI-Elemente neu positionieren
  repositionUIElements();
  
  // Canvas neu zeichnen
  resetVisualization();
}


/**
 * repositionUIElements(): Positioniert UI-Elemente neu
 */
function repositionUIElements() {
  // Canvas-Position ermitteln
  let canvasX = (windowWidth - canvasSize) / 2;
  
  // Titel zentriert über Canvas
  let title = select('h2').parent();
  if (title) {
    title.position(canvasX, 20);
    title.style('width', canvasSize + 'px');
  }
  
  // Linker Container - links vom Canvas
  if (leftContainer) {
    let leftX = max(20, canvasX - sidebarWidth - canvasMargin);
    leftContainer.position(leftX, 100);
  }
  
  // Rechter Container - rechts vom Canvas
  if (rightContainer) {
    let rightX = min(windowWidth - sidebarWidth - 20, canvasX + canvasSize + canvasMargin);
    rightContainer.position(rightX, 100);
  }
  
  // Unterer Container - unter dem Canvas
  if (bottomContainer) {
    bottomContainer.position(canvasX, 100 + canvasSize + 20);
    bottomContainer.style('width', (canvasSize - 30) + 'px');
  }
}

/**
 * createUIElements(): Erstellt alle UI-Steuerelemente
 */
function createUIElements() {
  // Canvas-Position für UI-Platzierung
  let canvasX = (windowWidth - canvasSize) / 2;
  
  // Titel oben
  let title = createDiv('<h2 style="color: #0087bf; margin: 0;">Kreisfläche durch Karo-Zählung</h2>');
  title.position(canvasX, 20);
  title.style('width', canvasSize + 'px');
  title.style('text-align', 'center');
  
  // Linker Container für Steuerelemente
  leftContainer = createDiv('');
  let leftX = max(20, canvasX - sidebarWidth - canvasMargin);
  leftContainer.position(leftX, 100);
  leftContainer.class('ui-container');
  leftContainer.style('width', (sidebarWidth - 40) + 'px');
  
  // Radius-Slider
  let radiusContainer = createDiv('');
  radiusContainer.parent(leftContainer);
  radiusContainer.class('slider-container');
  
  let radiusLabel = createSpan('Raster:');
  radiusLabel.parent(radiusContainer);
  radiusLabel.class('slider-label');
  
  sliderRadius = createSlider(3, 100, 10, 1);
  sliderRadius.parent(radiusContainer);
  sliderRadius.input(() => {
    r = sliderRadius.value();
    resetVisualization();
    updateSliderValues();
  });
  
  let radiusValue = createSpan('10');
  radiusValue.parent(radiusContainer);
  radiusValue.class('slider-value');
  radiusValue.id('radiusValue');
  
  // Geschwindigkeits-Slider
  let speedContainer = createDiv('');
  speedContainer.parent(leftContainer);
  speedContainer.class('slider-container');
  
  let speedLabel = createSpan('Tempo:');
  speedLabel.parent(speedContainer);
  speedLabel.class('slider-label');
  
  sliderSpeed = createSlider(1, 40, 5, 1);
  sliderSpeed.parent(speedContainer);
  sliderSpeed.input(() => {
    speed = sliderSpeed.value();
    updateSliderValues();
  });
  
  let speedValue = createSpan('5');
  speedValue.parent(speedContainer);
  speedValue.class('slider-value');
  speedValue.id('speedValue');
  
  // Trennlinie
  let divider1 = createDiv('<hr style="border: 1px solid #eee; margin: 15px 0;">');
  divider1.parent(leftContainer);
  
  // Kontroll-Buttons
  let controlsLabel = createDiv('<strong style="color: #646464;">Animation:</strong>');
  controlsLabel.parent(leftContainer);
  controlsLabel.style('margin-bottom', '10px');
  
  buttonStartStop = createButton('▶ Starten');
  buttonStartStop.parent(leftContainer);
  buttonStartStop.class('control-button');
  buttonStartStop.style('background-color', '#34aed6');
  buttonStartStop.style('color', 'white');
  buttonStartStop.mousePressed(toggleAnimation);
  
  let buttonReset = createButton('↺ Zurücksetzen');
  buttonReset.parent(leftContainer);
  buttonReset.class('control-button');
  buttonReset.style('background-color', '#646464');
  buttonReset.style('color', 'white');
  buttonReset.mousePressed(resetVisualization);
  
  // Rechter Container für Zählmodus
  rightContainer = createDiv('');
  let rightX = min(windowWidth - sidebarWidth - 20, canvasX + canvasSize + canvasMargin);
  rightContainer.position(rightX, 100);
  rightContainer.class('ui-container');
  rightContainer.style('width', (sidebarWidth - 40) + 'px');
  
  let modeLabel = createDiv('<strong style="color: #646464;">Zählmodus:</strong>');
  modeLabel.parent(rightContainer);
  modeLabel.style('margin-bottom', '10px');
  
  // Modus-Buttons erstellen
  let modes = [
    { value: 'innen', label: 'Vollständig im Kreis', desc: 'Zählt nur Karos, die komplett im Kreis liegen' },
    { value: 'alle', label: 'Alle im und am Kreis', desc: 'Jedes angeschnittene Karo zählt als 1' },
    { value: 'halb', label: 'Differenziert', desc: 'Gestufte Zählung nach Überlappung' }
  ];
  
  modes.forEach(mode => {
    let btn = createButton(mode.label);
    btn.parent(rightContainer);
    btn.class('mode-button');
    btn.attribute('title', mode.desc);
    if (mode.value === 'innen') btn.addClass('active');
    
    btn.mousePressed(() => {
      zaehlmodus = mode.value;
      // Alle Buttons deaktivieren
      modeButtons.forEach(b => b.removeClass('active'));
      // Aktuellen Button aktivieren
      btn.addClass('active');
      resetVisualization();
    });
    
    modeButtons.push(btn);
  });
  
  // Unterer Container für Ergebnisse
  bottomContainer = createDiv('');
  bottomContainer.position(canvasX, 100 + canvasSize + 20);
  bottomContainer.style('width', (canvasSize - 30) + 'px');
  bottomContainer.class('info-box');
  bottomContainer.id('infoBox');
}


/**
 * toggleAnimation(): Startet oder stoppt die Animation
 */
function toggleAnimation() {
  isRunning = !isRunning;
  if (isRunning) {
    loop();
    buttonStartStop.html('⏸ Stoppen');
  } else {
    noLoop();
    buttonStartStop.html('▶ Starten');
  }
}


/**
 * resetVisualization(): Setzt die Visualisierung zurück
 */
function resetVisualization() {
  // Unit-Größe anpassen
  unit = canvasSize / 2 / r * 0.93;
  
  // Zentrum des Canvas
  midX = canvasSize / 2;
  midY = canvasSize / 2;
  
  // Raster-Offset berechnen, damit ein Karo-Mittelpunkt im Kreiszentrum liegt
  gridOffsetX = midX % unit;
  gridOffsetY = midY % unit;
  
  // Anzahl Spalten und Zeilen
  cols = ceil(canvasSize / unit) + 1;
  rows = ceil(canvasSize / unit) + 1;
  
  // Geschwindigkeit anpassen
  if (!sliderSpeed) {
    speed = max(1, floor(r * r / 100.0 * 3.0));
  } else {
    speed = sliderSpeed.value();
  }
  
  // Grenzen für die Überprüfung basierend auf dem Kreis
  let radiusInUnits = r * unit;
  leftBound = max(0, floor((midX - radiusInUnits - gridOffsetX) / unit) - 1);
  rightBound = min(cols, ceil((midX + radiusInUnits - gridOffsetX) / unit) + 1);
  topBound = max(0, floor((midY - radiusInUnits - gridOffsetY) / unit) - 1);
  bottomBound = min(rows, ceil((midY + radiusInUnits - gridOffsetY) / unit) + 1);
  
  currentRow = topBound;
  currentCol = leftBound;
  filledCount = 0;
  approximatePi = 0;
  
  backgroundLayer = createGraphics(canvasSize, canvasSize);
  backgroundLayer.background(255);
  drawGrid(backgroundLayer);
  drawCircle(backgroundLayer);
  drawRadiusSquare(backgroundLayer);
  
  isRunning = false;
  if (buttonStartStop) {
    buttonStartStop.html('▶ Starten');
  }
  noLoop();
  
  updateInfo();
  redraw();
}


/**
 * draw(): Hauptzeichenfunktion
 */
function draw() {
  image(backgroundLayer, 0, 0);
  
  if (isRunning) {
    for (let i = 0; i < speed; i++) {
      if (currentRow >= bottomBound) {
        isRunning = false;
        buttonStartStop.html('▶ Starten');
        noLoop();
        break;
      }
      
      processSquare();
      
      currentCol++;
      if (currentCol >= rightBound) {
        currentCol = leftBound;
        currentRow++;
      }
    }
  }
  
  drawCount();
  updateInfo();
}


/**
 * processSquare(): Verarbeitet ein einzelnes Karo basierend auf dem Zählmodus
 */
function processSquare() {
  let cx = currentCol * unit + gridOffsetX;
  let cy = currentRow * unit + gridOffsetY;
  let fraction = getCircleFraction(cx, cy);
  
  backgroundLayer.noStroke();
  
  switch(zaehlmodus) {
    case "innen":
      // Nur vollständig im Kreis liegende Karos zählen
      if (fraction >= 0.99) {
        backgroundLayer.fill(karoFarbeVoll);
        backgroundLayer.rect(cx, cy, unit, unit);
        filledCount += 1.0;
      }
      break;
      
    case "alle":
      // Alle angeschnittenen Karos zählen voll
      if (fraction > 0.01) {
        if (fraction >= 0.99) {
          // Vollständig im Kreis
          backgroundLayer.fill(karoFarbeVoll);
          filledCount += 1.0;
        } else if (fraction < 0.99) {
          // Überwiegend im Kreis (75-99%)
          backgroundLayer.fill(color(karoFarbeHalb));
          filledCount += 1.0;
        }
        backgroundLayer.rect(cx, cy, unit, unit);
      }
      break;
      
    case "halb":
      // Differenzierte Zählung
      if (fraction > 0.01) {
        if (fraction >= 0.99) {
          // Vollständig im Kreis
          backgroundLayer.fill(karoFarbeVoll);
          filledCount += 1.0;
        } else if (fraction > 0.75) {
          // Überwiegend im Kreis (75-99%)
          backgroundLayer.fill(color(52, 174, 214, 130));
          filledCount += 1.0;
        } else if (fraction > 0.5) {
          // Mehrheitlich im Kreis (50-75%)
          backgroundLayer.fill(karoFarbeHalb);
          filledCount += 0.75;
        } else if (fraction > 0.25) {
          // Teilweise im Kreis (25-50%)
          backgroundLayer.fill(color(113, 162, 181, 100));
          filledCount += 0.5;
        } else {
          // Minimal im Kreis (1-25%)
          backgroundLayer.fill(karoFarbeAussen);
          filledCount += 0.25;
        }
        backgroundLayer.rect(cx, cy, unit, unit);
      }
      break;
  }
}


/**
 * drawGrid(pg): Zeichnet das Raster zentriert am Kreismittelpunkt
 */
function drawGrid(pg) {
  pg.stroke(225);
  pg.strokeWeight(0.5);
  
  // Vertikale Linien
  for (let i = 0; i < cols; i++) {
    let x = i * unit + gridOffsetX;
    if (x >= 0 && x <= canvasSize) {
      pg.line(x, 0, x, canvasSize);
    }
  }
  
  // Horizontale Linien
  for (let j = 0; j < rows; j++) {
    let y = j * unit + gridOffsetY;
    if (y >= 0 && y <= canvasSize) {
      pg.line(0, y, canvasSize, y);
    }
  }

}


/**
 * drawCircle(pg): Zeichnet den Kreis
 */
function drawCircle(pg) {
  pg.noFill();
  pg.stroke(eisblau);
  pg.strokeWeight(3);
  pg.ellipse(midX, midY, canvasSize * 0.93, canvasSize * 0.93);
  pg.strokeWeight(1);
}


/**
 * drawRadiusSquare(pg): Zeichnet das Radiusquadrat
 */
function drawRadiusSquare(pg) {
  pg.stroke(himbeerrot);
  pg.strokeWeight(2);
  pg.noFill();
  
  // Quadrat vom Mittelpunkt aus
  pg.rect(midX, midY, (canvasSize * 0.93)/2, (canvasSize * 0.93)/2);
  
  // Beschriftung
  pg.fill(himbeerrot);
  pg.noStroke();
  pg.textAlign(LEFT, TOP);
  pg.textSize(16);
  pg.text('r', midX + (canvasSize * 0.93)/2 + 5, midY + (canvasSize * 0.93)/4 - 5);
  pg.text('r', midX + (canvasSize * 0.93)/4 - 5, midY + (canvasSize * 0.93)/2 + 5);
  pg.strokeWeight(1);
}


/**
 * getCircleFraction(x, y): Berechnet den Anteil des Karos im Kreis
 */
function getCircleFraction(x, y) {
  // Schnelle Vorprüfung mit Ecken
  let corners = [
    [x, y],
    [x + unit, y],
    [x, y + unit],
    [x + unit, y + unit]
  ];
  
  let insideCorners = 0;
  for (let i = 0; i < 4; i++) {
    let dx = corners[i][0] - midX;
    let dy = corners[i][1] - midY;
    if (dx * dx + dy * dy < (r * unit) * (r * unit)) {
      insideCorners++;
    }
  }
  
  if (insideCorners === 4) return 1.0;
  if (insideCorners === 0) return 0.0;
  
  // Genauere Abtastung mit 15x15 Punkten
  let inside = 0;
  let acc = 100
  let total = acc * acc;
  
  for (let i = 0; i < acc; i++) {
    for (let j = 0; j < acc; j++) {
      let px = x + i * unit / acc + unit / 2 / acc;
      let py = y + j * unit / acc + unit / 2 / acc;
      let dx = px - midX;
      let dy = py - midY;
      if (dx * dx + dy * dy <= (r * unit) * (r * unit)) {
        inside++;
      }
    }
  }
  
  return inside / total;
}


/**
 * drawCount(): Zeigt die Zählungen direkt auf dem Canvas an
 */
function drawCount() {
  fill(anthrazit);
  textSize(12);
  textAlign(LEFT, TOP);
  
  // Kleine Info-Box oben links im Canvas
  fill(255, 255, 255, 230);
  noStroke();
  rect(5, 5, 150, 60, 5);
  
  fill(anthrazit);
  text("Karos im Kreis: " + nf(filledCount, 1, 2), 10, 10);
  text("Karos im Quadrat: " + (r * r), 10, 25);
  
  // Pi-Annäherung anzeigen
  if (filledCount > 0) {
    approximatePi = filledCount / (r * r);
    fill(eisblau);
    textStyle(BOLD);
    text("π ≈ " + nf(approximatePi, 1, 4), 10, 45);
    textStyle(NORMAL);
  }
}


/**
 * updateInfo(): Aktualisiert die Info-Box
 */
function updateInfo() {
  updateSliderValues();
  
  let infoDiv = select('#infoBox');
  if (!infoDiv) return;
  
  let modusBeschreibung = "";
  switch(zaehlmodus) {
    case "innen":
      modusBeschreibung = "Nur vollständige Karos";
      break;
    case "alle":
      modusBeschreibung = "Alle angeschnittenen = 1";
      break;
    case "halb":
      modusBeschreibung = "Differenzierte Zählung";
      break;
  }
  
  let piError = abs(Math.PI - approximatePi);
  let piErrorPercent = approximatePi > 0 ? piError / Math.PI * 100 : 0;
  
  // Fortschrittsbalken berechnen
  let progress = 0;
  if (bottomBound > topBound && rightBound > leftBound) {
    let totalSquares = (bottomBound - topBound) * (rightBound - leftBound);
    let processedSquares = (currentRow - topBound) * (rightBound - leftBound) + (currentCol - leftBound);
    progress = (processedSquares / totalSquares) * 100;
  }
  
  infoDiv.html(
    '<div style="display: flex; justify-content: space-between;">' +
    '<div style="flex: 1; margin-right: 20px;">' +
    '<strong style="color: #0087bf;">Ergebnisse:</strong><br>' +
    'Modus: <span style="color: #d94e1f;">' + modusBeschreibung + '</span><br>' +
    'Fortschritt: <span style="color: #34aed6;">' + nf(progress, 1, 1) + '%</span>' +
    '</div>' +
    '<div style="flex: 1; margin-right: 20px;">' +
    '<strong style="color: #0087bf;">Kreisfläche:</strong><br>' +
    'Gezählt: <span style="color: #34aed6;">' + nf(filledCount, 1, 2) + '</span><br>' +
    'Exakt: <span style="color: #646464;">' + nf(Math.PI * r * r, 1, 2) + '</span>' +
    '</div>' +
    '<div style="flex: 1;">' +
    '<strong style="color: #0087bf;">π-Annäherung:</strong><br>' +
    'Berechnet: <span style="color: #34aed6; font-weight: bold;">' + nf(approximatePi, 1, 4) + '</span><br>' +
    'Exakt: <span style="color: #646464;">' + nf(Math.PI, 1, 4) + '</span><br>' +
    'Fehler: <span style="color: ' + (piErrorPercent < 1 ? '#34aed6' : '#d94e1f') + ';">' + nf(piErrorPercent, 1, 2) + '%</span>' +
    '</div>' +
    '</div>'
  );
}


/**
 * updateSliderValues(): Aktualisiert die Anzeige der Slider-Werte
 */
function updateSliderValues() {
  let radiusDiv = select('#radiusValue');
  if (radiusDiv) radiusDiv.html(sliderRadius.value());
  
  let speedDiv = select('#speedValue');
  if (speedDiv) speedDiv.html(sliderSpeed.value());
}