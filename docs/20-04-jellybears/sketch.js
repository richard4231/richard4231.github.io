// Bild speichern Knopf unten
// max-height oder height an vh anpassen.

let bg = 50; // background color
let img = [];
let buttons = {}; // saves button references
let bears = [];
let histogram = [];
let activeDot;

// Versuch shortcut
let keyBuffer = '';
const targetSequence = 'histo';
const bufferTimeout = 2000; // 2 Sekunden timeout

// Timer für das Zurücksetzen des Buffers
let resetBufferTimer = null;

// configuration of various packages
const packageConfigs = {
  '8g': { average: 6, stdDev: 0.3, scale: 0.8, deviation: 1, margin: 0.18 },   // kleinste
  '10g': { average: 8, stdDev: 0.3, scale: 0.85, deviation: 1, margin: 0.14 }, // klein
  '15g': { average: 12, stdDev: 0.5, scale: 0.95, deviation: 2, margin: 0.1 } // normal
};
let selectedPackage = '10g';

function getPlayAreaWidth() {
  let canvasWidth = min(500, windowWidth - 20);
  return canvasWidth * (1-2*packageConfigs[selectedPackage].margin); // 80% der Canvas-Breite
}

function getPlayAreaHeight() {
  let canvasHeight = min(600, windowHeight - 300);
  return canvasHeight * (1-2*packageConfigs[selectedPackage].margin); // 80% der Canvas-Höhe
}

function getPlayAreaMargin() {
  let canvasWidth = min(500, windowWidth - 20);
  return canvasWidth * packageConfigs[selectedPackage].margin; // 10% Rand auf jeder Seite
}

function getColumnWidth() {
  let canvasWidth = min(500, windowWidth - 20);
  return canvasWidth * 0.12; // 12% der Canvas-Breite für jede Spalte
}

function calculateCanvasSize() {
  const maxWidth = 500;
  const maxHeight = 600;
  
  let canvasWidth = min(maxWidth, windowWidth - 20);
  let canvasHeight = min(maxHeight , windowHeight - 220);
  
  return { width: canvasWidth, height: canvasHeight };
}

class GummyBear {
  static getBaseSize(canvasWidth) {
    const baseWidth = canvasWidth * 0.112;  // 56 bei 500px Breite
    const baseHeight = baseWidth * 1.464;   // Verhältnis beibehalten (82/56)
    return { width: baseWidth, height: baseHeight };
  }
  constructor(x, y, type, rotation, scale) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.rotation = rotation;
    // Basis-Größe an Canvas-Breite anpassen
    const baseSize = GummyBear.getBaseSize(width);
    this.baseWidth = baseSize.width;
    this.baseHeight = baseSize.height;
    this.scale = scale;
    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
    this.active = true;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    if (!this.active) {
      // Opacity über drawingContext steuern
      drawingContext.globalAlpha = 0.7;
    }
    image(img[this.type], -this.width/2, -this.height/2, this.width, this.height);
    pop();
  }

  contains(px, py) {
    if (!this.active) return false;
    
    let dx = px - this.x;
    let dy = py - this.y;
    let rotatedX = dx * cos(-this.rotation) - dy * sin(-this.rotation);
    let rotatedY = dx * sin(-this.rotation) + dy * cos(-this.rotation);
    
    return abs(rotatedX) < this.width/2 && abs(rotatedY) < this.height/2;
  }
}

function preload() {
  img[1] = loadImage('assets/orange.png');
  img[2] = loadImage('assets/gelb.png');
  img[3] = loadImage('assets/hellrot.png');
  img[4] = loadImage('assets/dunkelrot.png');
  img[5] = loadImage('assets/gruen.png');
  img[6] = loadImage('assets/weiss.png');
}

function createSaveButton() {
  let saveButton = createButton('Bild speichern');
  saveButton.class('save-button');
  saveButton.parent('sketch-holder');
  saveButton.mousePressed(() => saveCanvas('gummybears', 'png'));
  return saveButton;
}

function createButtons() {
  const buttonHolder = select('#button-holder');
  
  // Äußerer Container mit Rahmen
  let outerContainer = createDiv('');
  outerContainer.class('outer-button-container');
  outerContainer.parent(buttonHolder);
  
  // Überschrift/Titel
  let titleButton = createButton('Neue Gummibärchenpackung');
  titleButton.parent(outerContainer);
  titleButton.class('fancy-button title');
  titleButton.attribute('disabled', '');
  titleButton.style('background', 'linear-gradient(45deg, #FFE97F, #FFDD45)');
  titleButton.style('opacity', '0.9');
  
  // Container für die Größen-Buttons
  let sizeButtonContainer = createDiv('');
  sizeButtonContainer.parent(outerContainer);
  sizeButtonContainer.class('size-button-container');
  
  // Container für den roten Punkt
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

function moveActiveDot(size) {
  if (buttons[size]) {
    // Zeige den Punkt an
    activeDot.style('display', 'block');
    
    let buttonRect = buttons[size].elt.getBoundingClientRect();
    let containerRect = buttons[size].elt.parentElement.getBoundingClientRect();
    
    activeDot.style('left', (buttonRect.left - containerRect.left + buttonRect.width/2 - 5) + 'px');
  }
}

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

  getPlayAreaWidth();
  getPlayAreaHeight();
  getPlayAreaMargin();
  getColumnWidth();
  
  let style = createElement('style');
  style.html(`
    #button-holder {
      display: flex;
      flex-direction: column;
      align-items: center;
      //gap: 10px;
      margin-bottom: -20px; // Abstand zum canvas
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
      //background-color:rgb(250, 224, 75);  /* Goldener Hintergrund */
      padding: 10px;
      //border-radius: 8px;   
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
      bottom: -8px; /* distance to buttons */
      transition: left 0.3s ease;
      display: none; /* not shown in the beginning */
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
      bottom: -14px; /* distance to buttons */
    }

  `);
  
  resetHistogram();
}

function draw() {
  background(bg);
  
  for (let bear of bears) {
    bear.display();
  }
  
  drawHistogram();
}

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

function mousePressed() {
  return handleInteraction(mouseX, mouseY);
}

function touchStarted() {
  if (touches.length > 0) {
    let touch = touches[0];
    let x = touch.x;
    let y = touch.y;
    return handleInteraction(x, y);
  }
  return true;
}

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
  
  // Mindestabstand ist der Durchschnitt von Breite und Höhe, 
  // multipliziert mit einem Überlappungsfaktor (z.B. 0.7 für 30% Überlappung erlaubt, eigentlich minimale Sichtbarkeit)
  const overlapFactor = 1.0;
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

function drawHistogram() {
  const colorOrder = [6, 5, 2, 1, 3, 4];
  const columnWidth = getColumnWidth();
  
  // Gesamtbreite des Histogramms berechnen
  const histogramWidth = columnWidth * 6; // 6 Spalten
  
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
      case 4: fill(0, 100, 60); break;    // Dunkelrot
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

function resetHistogram() {
  histogram = Array(7).fill(0);
}

function newPackage() {
  bears = [];
  resetHistogram();
  select('.save-button').style('display', 'none');
  
  const config = packageConfigs[selectedPackage];
  let num = round(randomGaussian(config.average, config.stdDev));
  num = constrain(num, config.average - config.deviation, config.average + config.deviation);
  
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

function deactivateAllBears() {
  for (let bear of bears) {
    if (bear.active) {
      bear.active = false;
      histogram[bear.type]++;
    }
  }
  select('.save-button').style('display', 'block');
}

function keyPressed(event) {
  // Nur Buchstaben zum Buffer hinzufügen
  if (key.length === 1 && key.match(/[a-z]/i)) {
    // Buffer aktualisieren
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
      keyBuffer = ''; // Buffer zurücksetzen
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

function windowResized() {
  const canvasSize = calculateCanvasSize();
  resizeCanvas(canvasSize.width, canvasSize.height);
  
}