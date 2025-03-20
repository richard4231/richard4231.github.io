// ========== KONSTANTEN & GLOBALE VARIABLEN ==========
// Hintergrundfarbe
let bg = 80;

// Arrays und Objekte für Spielzustand
let img = [];                // Speichert die Bilder der Schokolinsen
let buttons = {};           // Speichert Referenzen zu UI-Buttons
let beans = [];             // Liste aller Schokolinsen im Spiel
let histogram = [];         // Speichert die Anzahl der Schokolinsen pro Farbe
let activeDot;             // UI-Element für aktive Auswahl

// Tastatureingabe-Verarbeitung
let keyBuffer = '';                    // Puffer für Tastatureingaben
const targetSequence = 'h';        // Zielsequenz für Schnellauswahl
const bufferTimeout = 2000;            // Zeitlimit für Tastatureingabe (2 Sekunden)
let resetBufferTimer = null;           // Timer für Puffer-Reset

// Konfiguration der verschiedenen Packungsgrößen
const packageConfigs = {
  '15g': { average: 40, stdDev: 0.6, scale: 0.6, deviationleft: 3, deviationright: 3, margin: 0.1 }, // Kleine Packung. Nicht benötigt, da anderer Ansatz
  '38g': { average: 100, stdDev: 0.7, scale: 0.4, deviationleft: 4, deviationright: 4, margin: 0.1 }  // Normale Packung
};
let selectedPackage = '15g';  // Standardmäßig ausgewählte Packungsgröße

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

// ========== Schokolinsen-KLASSE ==========
class Chocolatebean {
  /**
   * Berechnet die Basis-Größe eines Schokolinsens
   * @param {number} canvasWidth - Breite des Canvas
   * @returns {Object} Objekt mit width und height Eigenschaften
   */
  static getBaseSize(canvasWidth) {
    const baseWidth = canvasWidth * 0.112;  // 56px bei 500px Breite
    const baseHeight = baseWidth * 1.0;   // Verhältnis beibehalten (82/56)
    return { width: baseWidth, height: baseHeight };
  }

  /**
   * Erstellt ein neue Schokolinse
   * @param {number} x - X-Position
   * @param {number} y - Y-Position
   * @param {number} type - Typ/Farbe des Schokolinsens
   * @param {number} rotation - Rotation in Grad
   * @param {number} scale - Skalierungsfaktor
   */
  constructor(x, y, type, rotation, scale) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.rotation = rotation;
    const baseSize = Chocolatebean.getBaseSize(width);
    this.baseWidth = baseSize.width;
    this.baseHeight = baseSize.height;
    this.scale = scale;
    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
    this.active = true;
  }

  /**
   * Zeichnet die Schokolinse
   */
  display() {
    let grayscale = 0.35; // Graustufe für inaktive Schokolinsen als alpha Wert [0,1]
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    if (!this.active) {
      drawingContext.globalAlpha = grayscale;
    }
    image(img[this.type], -this.width/2, -this.height/2, this.width, this.height);
    pop();
  }

  /**
   * Prüft, ob ein Punkt innerhalb der SChokolinse liegt
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
  img[2] = loadImage('assets/gruen.png');
  img[3] = loadImage('assets/gelb.png');
  img[4] = loadImage('assets/rot.png');
  img[5] = loadImage('assets/braun.png');
  img[6] = loadImage('assets/violett.png');
  img[7] = loadImage('assets/blau.png');
  img[8] = loadImage('assets/pink.png');
}

/**
 * Erstellt den "Speichern"-Button
 * @returns {p5.Element} Der erstellte Button
 */
function createSaveButton() {
  let saveButton = createButton('Bild speichern');
  saveButton.class('save-button');
  saveButton.parent('sketch-holder');
  saveButton.mousePressed(() => saveCanvas('schokolinsen', 'png'));
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
  let titleButton = createButton('Schokolinsenpackung wählen');
  titleButton.parent(outerContainer);
  titleButton.class('fancy-button title');
  titleButton.attribute('disabled', '');
  titleButton.style('background', 'linear-gradient(45deg,rgb(50, 98, 146),rgb(40, 79, 134))');
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
      border: 1px rgb(35, 128, 220);
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
      background: linear-gradient(45deg,rgb(15, 89, 169),rgb(76, 123, 173));
      border: 2px rgb(56, 49, 253);
      color: #fff;
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
      background: linear-gradient(45deg,rgb(19, 107, 195),rgb(95, 129, 242));
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    .fancy-button.title {
      cursor: default;
      font-size: 20px;
      padding: 15px 30px;
      width: 470px;
      height: 80px;
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
      border: 2px solidrgb(58, 95, 208);
      border-radius: 4px;
      padding: 8px 8px;
      cursor: pointer;
      font-size: 14px;
      display: none;
    }

    .save-button:hover {
      background:linear-gradient(45deg,rgb(15, 89, 169),rgb(76, 123, 173));
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
  
  for (let bean of beans) {
    bean.display();
  }
  
  drawHistogram();
}

/**
 * Gibt zufällige frequentistisch basierte Packunsggrösse für 10g aus. Allenfalls auf Schokolinsen anpassen.
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
  for (let bean of beans) {
    if (bean.contains(x, y) && bean.active) {
      bean.active = false;
      histogram[bean.type]++;
  
      // Prüfen ob alle Linsen deaktiviert sind
      if (!beans.some(b => b.active)) {
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
 * Erstellt zufällige Positionen für die Schokolinsen
 * @param {number} num - Anzahl der zu erstellenden Positionen
 * @returns {Array} Array von Positionen {x, y}
 */
function createPositions(num) {
  let positions = [];
  let margin = getPlayAreaMargin();
  let playArea = getPlayAreaWidth();
  let playAreah = getPlayAreaHeight();

  // Berechne Mindestabstand basierend auf der Bärchengröße
  const baseSize = Chocolatebean.getBaseSize(width);
  const scale = packageConfigs[selectedPackage].scale;
  const beanWidth = baseSize.width * scale;
  const beanHeight = baseSize.height * scale;

  // Mindestabstand für minimale Überlappung
  const overlapFactor = 1;
  const minDistance = ((beanWidth + beanHeight) / 2) * overlapFactor;

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
 * Zeichnet das Histogramm der Schokolinsen-Verteilung
 */
function drawHistogram() {
  const colorOrder = [1, 2, 3, 4, 5, 6, 7, 8];  // Reihenfolge: Weiß, Grün, Gelb, Orange, Hellrot, Dunkelrot
  const columnWidth = getColumnWidth();
  
  // Gesamtbreite des Histogramms berechnen
  const histogramWidth = columnWidth * 8;
  
  // Zentrieren: Startposition berechnen
  const startX = (width - histogramWidth) / 2;
  if (selectedPackage === '38g') {
    histoScaling = 0.038;
  } else {
    histoScaling = 0.05;
  }

  for (let i = 0; i < 8; i++) {
    let x = startX + (i + 0.5) * columnWidth;
    let colorIndex = colorOrder[i];
    let h = histogram[colorIndex] * (height * histoScaling);
    
    push();
    noStroke();
    switch(colorIndex) {
      case 1: fill('rgba(246, 129, 12, 80)'); break;  // Orange
      case 2: fill('rgba(35, 165, 11, 90)'); break;  // Grün
      case 3: fill('rgba(254, 225, 56, 100)'); break;  // Gelb
      case 4: fill('rgba(193, 21, 27, 100)'); break;    // Rot
      case 5: fill('rgba(116, 79, 53, 90)'); break;   // Braun
      case 6: fill('rgba(136, 129, 176, 80)'); break; // Violett
      case 7: fill('rgba(89, 174, 204, 80)'); break;   // Blau
      case 8: fill('rgba(223, 86, 128, 80)'); break  // Pink
    }
    
    rect(x - columnWidth/4, height - h - height * 0.083, columnWidth/2, h);
    
    if (histogram[colorIndex] > 0) {
      fill(0, 0, 0);
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
  histogram = Array(9).fill(0);
}

/**
 * Erstellt eine neue Packung
 */
function newPackage() {
  beans = [];
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
    let type = random([1, 2, 3, 4, 5, 6, 7, 8]);
    let bean = new Chocolatebean(
      positions[i].x,
      positions[i].y,
      type,
      random(360),
      config.scale
    );
    beans.push(bean);
  }
}

/**
 * Deaktiviert alle aktiven Schokolinsen 
 */
function deactivateAllbeans() {
  for (let bean of beans) {
    if (bean.active) {
      bean.active = false;
      histogram[bean.type]++;
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
      deactivateAllbeans();
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