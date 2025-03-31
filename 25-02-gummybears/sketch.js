// ========== KONSTANTEN & GLOBALE VARIABLEN ==========
// Hintergrundfarbe
let bg = 50;

// Arrays und Objekte für Spielzustand
let img = [];                // Speichert die Bilder der Gummibärchen
let buttons = {};           // Speichert Referenzen zu UI-Buttons
let bears = [];             // Liste aller Gummibärchen im Spiel
let histogram = [];         // Speichert die Anzahl der Gummibärchen pro Farbe
let activeDot;             // UI-Element für aktive Auswahl

// Tastatureingabe-Verarbeitung
let keyBuffer = '';                    // Puffer für Tastatureingaben
const targetSequence = 'histo';        // Zielsequenz für Schnellauswahl
const bufferTimeout = 2000;            // Zeitlimit für Tastatureingabe (2 Sekunden)
let resetBufferTimer = null;           // Timer für Puffer-Reset

// Konfiguration der verschiedenen Packungsgrößen
const packageConfigs = {
  '8g': { average: 6, stdDev: 0.5, scale: 0.8, deviationleft: 1, deviationright: 2, margin: 0.18 },   // Kleinste Packung
  '10g': { average: 8, stdDev: 0.6, scale: 0.85, deviationleft: 1, deviationright: 3, margin: 0.14 }, // Kleine Packung. Nicht benötigt, da anderer Ansatz
  '15g': { average: 12, stdDev: 0.7, scale: 0.85, deviationleft: 2, deviationright: 2, margin: 0.1 }  // Normale Packung
};
let selectedPackage = '10g';  // Standardmäßig ausgewählte Packungsgröße

// ========== HILFS-FUNKTIONEN FÜR LAYOUT-BERECHNUNGEN ==========
/**
 * Berechnet die Breite des spielbaren Bereichs
 * @returns {number} Breite in Pixeln
 */
function getPlayAreaWidth() {
  let canvasWidth = min(500, windowWidth - 20);
  return canvasWidth * (1-2*packageConfigs[selectedPackage].margin);
}

/**
 * Berechnet die Höhe des spielbaren Bereichs
 * @returns {number} Höhe in Pixeln
 */
function getPlayAreaHeight() {
  let canvasHeight = min(600, windowHeight - 300);
  return canvasHeight * (1-2*packageConfigs[selectedPackage].margin);
}

/**
 * Berechnet den Randabstand des spielbaren Bereichs
 * @returns {number} Randabstand in Pixeln
 */
function getPlayAreaMargin() {
  let canvasWidth = min(500, windowWidth - 20);
  return canvasWidth * packageConfigs[selectedPackage].margin;
}

/**
 * Berechnet die Breite einer Histogramm-Spalte
 * @returns {number} Spaltenbreite in Pixeln
 */
function getColumnWidth() {
  let canvasWidth = min(500, windowWidth - 20);
  return canvasWidth * 0.12;
}

/**
 * Berechnet die optimale Canvas-Größe basierend auf der Fenstergröße
 * @returns {Object} Objekt mit width und height Eigenschaften
 */
function calculateCanvasSize() {
  const maxWidth = 500;
  const maxHeight = 600;
  
  let canvasWidth = min(maxWidth, windowWidth - 20);
  let canvasHeight = min(maxHeight, windowHeight - 220);
  
  return { width: canvasWidth, height: canvasHeight };
}

// ========== GUMMIBÄRCHEN-KLASSE ==========
class GummyBear {
  /**
   * Berechnet die Basis-Größe eines Gummibärchens
   * @param {number} canvasWidth - Breite des Canvas
   * @returns {Object} Objekt mit width und height Eigenschaften
   */
  static getBaseSize(canvasWidth) {
    const baseWidth = canvasWidth * 0.112;  // 56px bei 500px Breite
    const baseHeight = baseWidth * 1.464;   // Verhältnis beibehalten (82/56)
    return { width: baseWidth, height: baseHeight };
  }

  /**
   * Erstellt ein neues Gummibärchen
   * @param {number} x - X-Position
   * @param {number} y - Y-Position
   * @param {number} type - Typ/Farbe des Gummibärchens
   * @param {number} rotation - Rotation in Grad
   * @param {number} scale - Skalierungsfaktor
   */
  constructor(x, y, type, rotation, scale) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.rotation = rotation;
    const baseSize = GummyBear.getBaseSize(width);
    this.baseWidth = baseSize.width;
    this.baseHeight = baseSize.height;
    this.scale = scale;
    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
    this.active = true;
  }

  /**
   * Zeichnet das Gummibärchen
   */
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    if (!this.active) {
      drawingContext.globalAlpha = 0.6;
    }
    image(img[this.type], -this.width/2, -this.height/2, this.width, this.height);
    pop();
  }

  /**
   * Prüft, ob ein Punkt innerhalb des Gummibärchens liegt
   * @param {number} px - X-Koordinate des Punktes
   * @param {number} py - Y-Koordinate des Punktes
   * @returns {boolean} true wenn der Punkt innerhalb liegt
   */
  contains(px, py) {
    if (!this.active) return false;
    
    let dx = px - this.x;
    let dy = py - this.y;
    let rotatedX = dx * cos(-this.rotation) - dy * sin(-this.rotation);
    let rotatedY = dx * sin(-this.rotation) + dy * cos(-this.rotation);
    
    return abs(rotatedX) < this.width/2 && abs(rotatedY) < this.height/2;
  }
}

// ========== SETUP & INITIALISIERUNG ==========
/**
 * Lädt alle benötigten Bilder
 */
function preload() {
  img[1] = loadImage('assets/orange.png');
  img[2] = loadImage('assets/gelb.png');
  img[3] = loadImage('assets/hellrot.png');
  img[4] = loadImage('assets/dunkelrot.png');
  img[5] = loadImage('assets/gruen.png');
  img[6] = loadImage('assets/weiss.png');
}

/**
 * Erstellt den "Speichern"-Button
 * @returns {p5.Element} Der erstellte Button
 */
function createSaveButton() {
  let saveButton = createButton('Bild speichern');
  saveButton.class('save-button');
  saveButton.parent('sketch-holder');
  saveButton.mousePressed(() => saveCanvas('gummybears', 'png'));
  return saveButton;
}

/**
 * Erstellt alle UI-Buttons und deren Container
 */
function createButtons() {
  const buttonHolder = select('#button-holder');
  
  // Äußerer Container
  let outerContainer = createDiv('');
  outerContainer.class('outer-button-container');
  outerContainer.parent(buttonHolder);
  
  // Titel-Button
  let titleButton = createButton('Gummibärchenpackung wählen');
  titleButton.parent(outerContainer);
  titleButton.class('fancy-button title');
  titleButton.attribute('disabled', '');
  titleButton.style('background', 'linear-gradient(45deg, #FFE97F, #FFDD45)');
  titleButton.style('opacity', '0.9');
  
  // Container für Größen-Buttons
  let sizeButtonContainer = createDiv('');
  sizeButtonContainer.parent(outerContainer);
  sizeButtonContainer.class('size-button-container');
  
  // Aktiver Punkt
  activeDot = createDiv('');
  activeDot.class('active-dot');
  activeDot.parent(sizeButtonContainer);
  
  // Größen-Buttons erstellen
  Object.keys(packageConfigs).forEach(size => {
    let buttonContainer = createDiv('');
    buttonContainer.class('button-container');
    buttonContainer.parent(sizeButtonContainer);
    
    let button = createButton(size);
    button.class('fancy-button size');
    button.parent(buttonContainer);
    buttons[size] = buttonContainer;
    
    button.mousePressed(() => {
      selectedPackage = size;
      moveActiveDot(size);
      newPackage();
    });
  });
}

/**
 * Bewegt den aktiven Punkt zur ausgewählten Packungsgröße
 * @param {string} size - Ausgewählte Packungsgröße
 */
function moveActiveDot(size) {
  if (buttons[size]) {
    activeDot.style('display', 'block');
    
    let buttonRect = buttons[size].elt.getBoundingClientRect();
    let containerRect = buttons[size].elt.parentElement.getBoundingClientRect();
    
    activeDot.style('left', (buttonRect.left - containerRect.left + buttonRect.width/2 - 5) + 'px');
  }
}

/**
 * Setup-Funktion: Initialisiert das Spiel
 */
function setup() {
  angleMode(DEGREES);
  const canvasSize = calculateCanvasSize();
  let canvas = createCanvas(canvasSize.width, canvasSize.height, {
    willReadFrequently: true
  });
  canvas.parent('sketch-holder');
  createSaveButton();
  select('.save-button').style('display', 'none');

  colorMode(HSB);
  background(bg);
  
  createButtons();

  // Layout-Berechnungen initialisieren
  getPlayAreaWidth();
  getPlayAreaHeight();
  getPlayAreaMargin();
  getColumnWidth();
  
  // CSS-Styles erstellen
  let style = createElement('style');
  style.html(`
    #button-holder {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: -20px;
    }
    
    .outer-button-container {
      width: 465px;
      padding: 15px;
      border: 1px solid #FDB931;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      background-color: white;
    }

    .size-button-container {
      display: flex;
      gap: 10px;
      margin-top: 0px;
      justify-content: center;
      width: 100%;
      position: relative;
      padding: 10px;
    }
    
    .button-container {
      position: relative;
      display: inline-block;
    }
    
    .active-dot {
      position: absolute;
      width: 11px;
      height: 11px;
      background-color: red;
      border-radius: 50%;
      bottom: -8px;
      transition: left 0.3s ease;
      display: none;
    }
    
    .fancy-button {
      background: linear-gradient(45deg, #FFD700, #FDB931);
      border: 2px solid #FDB931;
      color: #000;
      padding: 12px 24px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 18px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;
      font-weight: bold;
      text-shadow: 1px 1px 1px rgba(255,255,255,0.3);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      min-width: 120px;
    }
    
    .fancy-button:hover:not([disabled]) {
      background: linear-gradient(45deg, #FDB931, #FFD700);
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    .fancy-button.title {
      cursor: default;
      font-size: 20px;
      padding: 15px 30px;
      width: 470px;
      height: 60px;
    }
    
    .fancy-button.title:hover {
      transform: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .fancy-button.size {
      padding: 12px 24px;
      font-size: 18px;
    }

    .save-button {
      position: absolute;
      top: 220px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #FDB931;
      border-radius: 4px;
      padding: 8px 8px;
      cursor: pointer;
      font-size: 14px;
      display: none;
    }

    .save-button:hover {
      background: #FDB931;
      color: white;
    }

    @media (max-width: 500px) {
      .fancy-button {
        padding: 6px 12px;
        font-size: 14px;
        min-width: 80px;
      }
      
      .fancy-button.title {
        font-size: 16px;
        padding: 10px 15px;
        width: 95vw;
      }
      
      .outer-button-container {
        width: 99%;
        padding: 15px;
        gap: 5px;
        border: none;
      }

      .save-button {
        position: absolute;
        top: 220px;
        height: 25px;
        padding: 4px 4px;
        cursor: pointer;
        font-size: 10px;
      }

      .active-dot {
        bottom: -14px;
      }
    }
  `);
  
  resetHistogram();
}

// ========== HAUPTSPIEL-FUNKTIONEN ==========
/**
 * Haupt-Zeichenschleife
 */
function draw() {
  background(bg);
  
  for (let bear of bears) {
    bear.display();
  }
  
  drawHistogram();
}

/**
 * Gibt zufällige frequentistisch basierte Packunsggrösse für 10g aus
 */
function getWeightedRandom() {
  const distribution = [
      { value: 6, probability: 0.015267176 },
      { value: 7, probability: 0.328244275 },
      { value: 8, probability: 0.503816794 },
      { value: 9, probability: 0.095419847 },
      { value: 10, probability: 0.045801527 },
      { value: 11, probability: 0.011450382 }
  ];
  
  const rand = random();
  let sum = 0;
  
  for (const item of distribution) {
      sum += item.probability;
      if (rand < sum) {
          return item.value;
      }
  }
  
  return distribution[distribution.length - 1].value;
}

/**
 * Verarbeitet Benutzerinteraktionen (Maus/Touch)
 * @param {number} x - X-Koordinate der Interaktion
 * @param {number} y - Y-Koordinate der Interaktion
 * @returns {boolean} false wenn die Interaktion verarbeitet wurde
 */
function handleInteraction(x, y) {
  for (let bear of bears) {
    if (bear.contains(x, y) && bear.active) {
      bear.active = false;
      bear.grayscale = 50;
      histogram[bear.type]++;
  
      // Prüfen ob alle Bären deaktiviert sind
      if (!bears.some(b => b.active)) {
        select('.save-button').style('display', 'block');
      }
      return false;
    }
  }
  return true;
}

/**
 * Mausklick-Handler
 */
function mousePressed() {
  return handleInteraction(mouseX, mouseY);
}

/**
 * Touch-Handler
 */
function touchStarted() {
  if (touches.length > 0) {
    let touch = touches[0];
    return handleInteraction(touch.x, touch.y);
  }
  return true;
}

/**
 * Erstellt zufällige Positionen für die Gummibärchen
 * @param {number} num - Anzahl der zu erstellenden Positionen
 * @returns {Array} Array von Positionen {x, y}
 */
function createPositions(num) {
  let positions = [];
  let margin = getPlayAreaMargin();
  let playArea = getPlayAreaWidth();
  let playAreah = getPlayAreaHeight();

  // Berechne Mindestabstand basierend auf der Bärchengröße
  const baseSize = GummyBear.getBaseSize(width);
  const scale = packageConfigs[selectedPackage].scale;
  const bearWidth = baseSize.width * scale;
  const bearHeight = baseSize.height * scale;

  // Mindestabstand für minimale Überlappung
  const overlapFactor = 1;
  const minDistance = ((bearWidth + bearHeight) / 2) * overlapFactor;

  for (let i = 0; i < num; i++) {
    let pos = {
      x: random(margin, margin + playArea),
      y: random(margin, margin + playAreah)
    };

    let attempts = 0;
    while (attempts < 100 && positions.some(p => 
      dist(p.x, p.y, pos.x, pos.y) < minDistance)) {
      pos.x = random(margin, margin + playArea);
      pos.y = random(margin, margin + playAreah);
      attempts++;
    }

    positions.push(pos);
  }
  return positions;
}

/**
 * Erstellt zufällige noisebasierte Positionen für die Gummibärchen (nicht aktiv)
 * @param {number} num - Anzahl der zu erstellenden Positionen
 * @returns {Array} Array von Positionen {x, y}
 */
function createNoisePositions(num) {
  let positions = [];
  let margin = getPlayAreaMargin();
  let playArea = getPlayAreaWidth();
  let playAreah = getPlayAreaHeight();
  
  // Berechne Mindestabstand basierend auf der Bärchengröße
  const baseSize = GummyBear.getBaseSize(width);
  const scale = packageConfigs[selectedPackage].scale;
  const bearWidth = baseSize.width * scale;
  const bearHeight = baseSize.height * scale;
  
  // Mindestabstand für minimale Überlappung
  const overlapFactor = 1;
  const minDistance = ((bearWidth + bearHeight) / 2) * overlapFactor;
  
  // Noise-Skalen für unterschiedliche Verteilungsmuster
  const noiseScale = 0.9;  // Kleinere Werte = sanftere Verteilung
  const timeOffset = random(1000);  // Zufälliger Startpunkt für Variation
  
  for (let i = 0; i < num; i++) {
    // Verwende verschiedene Dimensionen des Noise-Space
    let noiseX = noise((i * noiseScale) + timeOffset, 0) * playArea;
    let noiseY = noise(0, (i * noiseScale) + timeOffset) * playAreah;
    
    let pos = {
      x: margin + noiseX,
      y: margin + noiseY
    };
    
    let attempts = 0;
    while (attempts < 100 && positions.some(p => 
      dist(p.x, p.y, pos.x, pos.y) < minDistance)) {
      // Falls Kollision, leicht verschieben mit Noise
      let offsetAngle = noise(attempts * 0.1, i) * TWO_PI;
      let offsetDist = noise(i, attempts * 0.1) * minDistance;
      pos.x += cos(offsetAngle) * offsetDist;
      pos.y += sin(offsetAngle) * offsetDist;
      
      // Stelle sicher, dass die Position im Spielbereich bleibt
      pos.x = constrain(pos.x, margin, margin + playArea);
      pos.y = constrain(pos.y, margin, margin + playAreah);
      
      attempts++;
    }
    
    positions.push(pos);
  }
  return positions;
}

/**
 * Zeichnet das Histogramm der Gummibärchen-Verteilung
 */
function drawHistogram() {
  const colorOrder = [6, 5, 2, 1, 3, 4];  // Reihenfolge: Weiß, Grün, Gelb, Orange, Hellrot, Dunkelrot
  const columnWidth = getColumnWidth();
  
  // Gesamtbreite des Histogramms berechnen
  const histogramWidth = columnWidth * 6;
  
  // Zentrieren: Startposition berechnen
  const startX = (width - histogramWidth) / 2;
  
  for (let i = 0; i < 6; i++) {
    let x = startX + (i + 0.5) * columnWidth;
    let colorIndex = colorOrder[i];
    let h = histogram[colorIndex] * (height * 0.05);
    
    push();
    noStroke();
    switch(colorIndex) {
      case 6: fill(0, 0, 100); break;     // Weiß
      case 5: fill(120, 100, 80); break;  // Grün
      case 2: fill(60, 100, 100); break;  // Gelb
      case 1: fill(30, 100, 100); break;  // Orange
      case 3: fill(0, 100, 90); break;    // Hellrot
      case 4: fill(344, 90, 65); break;   // Dunkelrot
    }
    
    rect(x - columnWidth/4, height - h - height * 0.083, columnWidth/2, h);
    
    if (histogram[colorIndex] > 0) {
      fill(0, 0, 100);
      textAlign(CENTER);
      textSize(width * 0.024);
      text(histogram[colorIndex], x, height - h - height * 0.1);
    }
    pop();
  }
}

/**
 * Setzt das Histogramm zurück
 */
function resetHistogram() {
  histogram = Array(7).fill(0);
}

/**
 * Erstellt eine neue Packung Gummibärchen
 */
function newPackage() {
  bears = [];
  resetHistogram();
  select('.save-button').style('display', 'none');
  
  const config = packageConfigs[selectedPackage];
  let num;

  if (selectedPackage === '10g') {
    num = getWeightedRandom();
  } else {
    num = round(randomGaussian(config.average, config.stdDev));
    num = constrain(num, config.average - config.deviationleft, config.average + config.deviationright);
  }

  let positions = createPositions(num);
  
  for (let i = 0; i < num; i++) {
    let type = random([1, 2, 3, 4, 5, 6]);
    let bear = new GummyBear(
      positions[i].x,
      positions[i].y,
      type,
      random(360),
      config.scale
    );
    bears.push(bear);
  }
}

/**
 * Deaktiviert alle aktiven Gummibärchen
 */
function deactivateAllBears() {
  for (let bear of bears) {
    if (bear.active) {
      bear.active = false;
      histogram[bear.type]++;
    }
  }
  select('.save-button').style('display', 'block');
}

/**
 * Verarbeitet Tastatureingaben
 * @param {Event} event - Tastatureingabe-Event
 * @returns {boolean} false wenn die Eingabe verarbeitet wurde
 */
function keyPressed(event) {
  // Nur Buchstaben zum Buffer hinzufügen
  if (key.length === 1 && key.match(/[a-z]/i)) {
    keyBuffer += key.toLowerCase();
    
    // Timer zurücksetzen
    if (resetBufferTimer) clearTimeout(resetBufferTimer);
    resetBufferTimer = setTimeout(() => {
      keyBuffer = '';
      console.log('Buffer reset');
    }, bufferTimeout);
    
    // Prüfen ob die Zielsequenz im Buffer ist
    if (keyBuffer.includes(targetSequence)) {
      console.log('Sequence detected!');
      deactivateAllBears();
      keyBuffer = '';
      if (resetBufferTimer) clearTimeout(resetBufferTimer);
      return false;
    }
    
    // Buffer auf maximale Länge begrenzen
    if (keyBuffer.length > 10) {
      keyBuffer = keyBuffer.slice(-10);
    }
  }
  return true;
}

/**
 * Passt die Canvas-Größe an die Fenstergröße an
 */
function windowResized() {
  const canvasSize = calculateCanvasSize();
  resizeCanvas(canvasSize.width, canvasSize.height);
}

//