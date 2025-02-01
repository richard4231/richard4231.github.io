let bg = 50;
let img = [];
let button;
let bears = [];  // Array für alle Gummibärchen
let histogram = [];  // Array für das Säulendiagramm
const HISTOGRAM_Y = 450;  // Y-Position wo das Histogramm beginnt
const COLUMN_WIDTH = 60;  // Breite der Säulen
const PLAY_AREA = 400;  // Spielbereich für Gummibärchen

class GummyBear {
  constructor(x, y, type, rotation) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.rotation = rotation;
    this.width = 56;
    this.height = 82;
    this.active = true; // ob das Gummibärchen noch klickbar ist
  }

  display() {
    if (this.active) {
      push();
      translate(this.x, this.y);
      rotate(this.rotation);
      image(img[this.type], -this.width/2, -this.height/2, this.width, this.height);
      pop();
    }
  }

  contains(px, py) {
    if (!this.active) return false;
    
    let dx = px - this.x;
    let dy = py - this.y;
    // Berücksichtige die Rotation
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

function setup() {
  angleMode(DEGREES);
  let canvas = createCanvas(500, 600); // Erhöhte Höhe für Histogramm
  canvas.parent('sketch-holder');
  colorMode(HSB);
  background(bg);
  
  button = createButton('Neue Gummibärchenpackung');
  button.parent('button-holder');
  button.mousePressed(newPackage);
  button.class('fancy-button');
  
  let style = createElement('style');
  style.html(`
    .fancy-button {
      background: linear-gradient(45deg, #FFD700, #FDB931);
      border: 2px solid #FDB931;
      color: #000;
      padding: 8px 16px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;
      font-weight: bold;
      text-shadow: 1px 1px 1px rgba(255,255,255,0.3);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .fancy-button:hover {
      background: linear-gradient(45deg, #FDB931, #FFD700);
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
  `);
  
  resetHistogram();
  newPackage();
}

function draw() {
  background(bg);
  
  // Zeichne alle Gummibärchen
  for (let bear of bears) {
    bear.display();
  }
  
  // Zeichne das Säulendiagramm
  drawHistogram();
}

function mousePressed() {
  // Überprüfe von vorne nach hinten (damit vordere Bärchen Priorität haben)
  for (let bear of bears) {
    if (bear.contains(mouseX, mouseY) && bear.active) {
      // Deaktiviere das Gummibärchen und füge es zum Histogramm hinzu
      bear.active = false;
      histogram[bear.type]++;
      return; // Beende die Funktion nach dem ersten Treffer
    }
  }
}

function drawHistogram() {
  // Neue Reihenfolge: Weiss(6), Grün(5), Gelb(2), Orange(1), Hellrot(3), Dunkelrot(4)
  const colorOrder = [6, 5, 2, 1, 3, 4];
  
  for (let i = 0; i < 6; i++) {
    let x = (i + 0.5) * COLUMN_WIDTH + 50;
    let colorIndex = colorOrder[i];
    let h = histogram[colorIndex] * 30;  // Höhe pro Gummibärchen
    
    push();
    noStroke();
    // Verwende verschiedene Farben für verschiedene Typen
    switch(colorIndex) {
      case 6: fill(0, 0, 100); break;     // Weiß
      case 5: fill(120, 100, 80); break;  // Grün
      case 2: fill(60, 100, 100); break;  // Gelb
      case 1: fill(30, 100, 100); break;  // Orange
      case 3: fill(0, 100, 90); break;    // Hellrot
      case 4: fill(0, 100, 60); break;    // Dunkelrot (dunkler gemacht)
    }
    rect(x - COLUMN_WIDTH/4, height - h - 50, COLUMN_WIDTH/2, h);
    
    // Zeichne den Zähler über der Säule
    if (histogram[colorIndex] > 0) {
      fill(0, 0, 100);
      textAlign(CENTER);
      text(histogram[colorIndex], x, height - h - 60);
    }
    pop();
  }
}

function resetHistogram() {
  // Setze alle Werte auf 0
  histogram = Array(7).fill(0);
}

function newPackage() {
  // Lösche alte Gummibärchen und reset Histogram
  bears = [];
  resetHistogram();
  
  // Erstelle neue Gummibärchen
  let average = 10; // entweder 10 für 12g Packungen oder 8 für 10g Packungen
  let num = round(randomGaussian(average, 0.5));
  num = constrain(num, average - 2, average + 2);
  
  // Erstelle neue Positionen
  let positions = createPositions(num);
  
  // Erstelle neue Gummibärchen
  for (let i = 0; i < num; i++) {
    let type = random([1, 2, 3, 4, 5, 6]);
    let bear = new GummyBear(
      positions[i].x,
      positions[i].y,
      type,
      random(360)
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
    
    // Überprüfe Überlappungen
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