let bg = 50;
let img = [];
let bears = [];
let histogram = [];
const HISTOGRAM_Y = 450;
const COLUMN_WIDTH = 60;
const PLAY_AREA = 400;

// Konfiguration für verschiedene Packungsgrößen
const packageConfigs = {
  '8g': { average: 6, stdDev: 0.3, scale: 0.8, deviation: 1 },   // kleinste
  '10g': { average: 8, stdDev: 0.3, scale: 0.85, deviation: 1 }, // klein
  '15g': { average: 12, stdDev: 0.5, scale: 0.95, deviation: 2 } // normal
};
let selectedPackage = '10g';

class GummyBear {
  constructor(x, y, type, rotation, scale) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.rotation = rotation;
    this.baseWidth = 56;
    this.baseHeight = 82;
    this.scale = scale;
    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
    this.active = true;
  }

  display() {
      push();
      translate(this.x, this.y);
      rotate(this.rotation);
      tint(this.active? 100 : 50, this.active? 255 : 1);  
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
  bgImage = loadImage('assets/hintergrund.png');
}

function createButtons() {
  const buttonHolder = select('#button-holder');
  
  // Überschrift/Titel
  let titleButton = createButton('Neue Gummibärchenpackung');
  titleButton.parent(buttonHolder);
  titleButton.class('fancy-button title');
  titleButton.attribute('disabled', '');
  
  // Container für die Größen-Buttons
  let sizeButtonContainer = createDiv('');
  sizeButtonContainer.parent(buttonHolder);
  sizeButtonContainer.class('size-button-container');
  
  // Größen-Buttons erstellen
  Object.keys(packageConfigs).forEach(size => {
    let button = createButton(size);
    button.parent(sizeButtonContainer);
    button.class('fancy-button size');
    if (size === selectedPackage) {
      button.addClass('active');
    }
    button.mousePressed(() => {
      // Entferne active Klasse von allen Buttons
      selectAll('.fancy-button.size').forEach(b => b.removeClass('active'));
      // Füge active Klasse zum geklickten Button hinzu
      button.addClass('active');
      selectedPackage = size;
      newPackage();
    });
  });
}

function setup() {
  angleMode(DEGREES);
  let canvas = createCanvas(500, 600, {
    willReadFrequently: true
  });
  canvas.parent('sketch-holder');
  colorMode(HSB);
  background(bgImage);
  
  createButtons();
  
  let style = createElement('style');
  style.html(`
    #button-holder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }
    
    .size-button-container {
      display: flex;
      gap: 15px;
      margin-top: 5px;
      justify-content: center;
      width: 100%;
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
      margin: 4px 2px;
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
      background: linear-gradient(45deg, #FFE97F, #FFDD45);
      opacity: 0.9;
      min-width: 300px;
    }
    
    .fancy-button.title:hover {
      transform: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .fancy-button.size {
      padding: 12px 24px;
      font-size: 18px;
    }

    .fancy-button.size.active {
      border: 4px solid #FDB931;
      background: linear-gradient(45deg, #FDB931, #FFD700);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
  `);
  
  resetHistogram();
}

function draw() {
  background(bgImage);
  
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
    // Convert touch coordinates to canvas coordinates
    let touch = touches[0];
    let rect = document.querySelector('#defaultCanvas0').getBoundingClientRect();
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;
    return handleInteraction(x, y);
  }
  return true;
}

function drawHistogram() {
  const colorOrder = [6, 5, 2, 1, 3, 4];
  
  for (let i = 0; i < 6; i++) {
    let x = (i + 0.5) * COLUMN_WIDTH + 80; // Mehr Abstand vom linken Rand
    let colorIndex = colorOrder[i];
    let h = histogram[colorIndex] * 30;
    
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
    rect(x - COLUMN_WIDTH/4, height - h - 50, COLUMN_WIDTH/2, h);
    
    if (histogram[colorIndex] > 0) {
      fill(0, 0, 100);
      textAlign(CENTER);
      text(histogram[colorIndex], x, height - h - 60);
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

function createPositions(num) {
  let positions = [];
  for (let i = 0; i < num; i++) {
    let pos = {
      x: random(50, 50 + PLAY_AREA),
      y: random(50, 50 + PLAY_AREA)
    };
    
    let attempts = 0;
    while (attempts < 100 && positions.some(p => 
      dist(p.x, p.y, pos.x, pos.y) < 50)) {
      pos.x = random(50, 50 + PLAY_AREA);
      pos.y = random(50, 50 + PLAY_AREA);
      attempts++;
    }
    
    positions.push(pos);
  }
  return positions;
}