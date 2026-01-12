//Andreas Richard
//https://richard4231.github.io

//pistring = "31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

/*
Verbesserungen:
1) Die Kugeln sollen sich alle leicht überschneiden. Im Moment berühren sie sich zum Teil, zum Teil überschneiden sie sich. Weshalb ist mir im Moment nicht klar.
2) Schöneres, beschriftetes GUI.
3) Bessere Kamerasteuerung
4) Bewegen der Figur ermöglichen (oder über Kamerasteuerung)

Features
1) Eine Lichtquelle die mit der Kamera mitgeht? Beleuchtung allgemein.
2) Alternative Farbschemen: Wie länger die Kette, desto dunkler. Wie grösser die Kugel desto kräftiger (oder glow Effekt?
3) Tiefenunschärfe? Möglich?
4) Keine Hintergrundfläche, die die Kugeln verschwinden lässt.
5) Übersetzung auf WebGPU
6) Kamerafahrt dem Pi Pfad entlang.
7) Weitere Ideen wie sound?

*/


// Pi-Daten werden asynchron geladen
let pistring = null; // wird beim Laden gefüllt
let dataLoaded = false;
let loadingError = null;

// Asynchrone Daten laden
async function loadPiData() {
  try {
    const response = await fetch('piDigits.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    pistring = data.piDigits;
    dataLoaded = true;
    console.log(`✓ Pi-Daten geladen: ${pistring.length.toLocaleString()} Ziffern`);
  } catch (error) {
    loadingError = error.message;
    console.error('Fehler beim Laden der Pi-Daten:', error);
  }
}

function preload() {
  // p5.js wartet automatisch auf diese Funktion
  loadPiData();
}

// GUI-Parameter
let params = {
  laenge: 2,           // 10^x Kugeln
  skalierung: 10.0,    // Größe der Kugeln
  transparenz: 255,    // Alpha-Wert
  drehgeschwindigkeit: 0.0,
  posX: 0,
  posY: 0,
  posZ: 0,
  ueberlappung: 0.9,   // Überlappungsfaktor
  zeigeInfo: true      // FPS und Anzahl anzeigen
};

let gui;
let infoDiv;
let dirs = [[0,0,1],[-0.865,0,0.5],[0,-0.865,0.5],[0.865,0,0.5],[0,0.865,0.5],[-0.6125,0.6125,-0.5],[-0.6125,-0.6125,-0.5],[0.6125,-0.6125,-0.5],[0.6125,0.6125,-0.5],[0,0,-1]];

function setup() {
  colorMode(HSL);
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
  setAttributes('perPixelLighting', true);
  smooth();

  // dat.GUI erstellen
  gui = new dat.GUI();

  // Rendering-Parameter
  let renderFolder = gui.addFolder('Rendering');
  renderFolder.add(params, 'laenge', 1, 4, 1).name('Länge (10^x)');
  renderFolder.add(params, 'skalierung', 0.1, 15, 0.05).name('Skalierung');
  renderFolder.add(params, 'transparenz', 0, 255, 10).name('Transparenz');
  renderFolder.add(params, 'ueberlappung', 0.5, 1.5, 0.05).name('Überlappung');
  renderFolder.open();

  // Position
  let posFolder = gui.addFolder('Position');
  posFolder.add(params, 'posX', -400, 400, 10).name('X-Position');
  posFolder.add(params, 'posY', -400, 400, 10).name('Y-Position');
  posFolder.add(params, 'posZ', -400, 400, 10).name('Z-Position');

  // Animation
  let animFolder = gui.addFolder('Animation');
  animFolder.add(params, 'drehgeschwindigkeit', -0.02, 0.02, 0.001).name('Drehgeschw.');

  // Info
  gui.add(params, 'zeigeInfo').name('Info anzeigen');

  // Info-Div erstellen
  infoDiv = createDiv('');
  infoDiv.position(10, 10);
  infoDiv.style('color', 'rgba(255, 255, 255, 0.8)');
  infoDiv.style('font-family', 'monospace');
  infoDiv.style('font-size', '12px');
  infoDiv.style('background-color', 'rgba(0, 0, 0, 0.5)');
  infoDiv.style('padding', '8px');
  infoDiv.style('border-radius', '4px');
  infoDiv.style('pointer-events', 'none');
}

function draw() {
  // Prüfen ob Daten geladen sind
  if (!dataLoaded) {
    background(50);

    if (loadingError) {
      // Fehlermeldung
      fill(255, 100, 100);
      textAlign(CENTER, CENTER);
      textSize(20);
      text(`Fehler beim Laden:\n${loadingError}`, 0, 0);
      textSize(14);
      fill(200);
      text('\nBitte Console öffnen (F12) für Details', 0, 60);
    } else {
      // Ladeanimation
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(24);
      text('π', 0, -40);

      textSize(16);
      fill(200);
      text('Lade Pi-Daten...', 0, 10);

      // Animierter Kreis
      noFill();
      stroke(217, 78, 31); // Projekt-Farbe
      strokeWeight(3);
      let angle = frameCount * 0.1;
      arc(0, 60, 40, 40, angle, angle + PI);
    }
    return;
  }

  // Performance-Optimierung: Dynamische Qualität
  let numSpheres = pow(10, params.laenge);

  if (numSpheres > 1000) {
    // Bei vielen Kugeln: Niedrige Qualität
    pixelDensity(1);
    setAttributes('antialias', false);
    setAttributes('perPixelLighting', false);
  } else {
    // Bei wenigen Kugeln: Hohe Qualität
    setAttributes('antialias', true);
    setAttributes('perPixelLighting', true);
  }

  orbitControl(0.3, 0.3, 0.3);
  ambientLight(30, 30, 30);
  pointLight(255, 255, 255, -100, -100, 100);

  rotateZ(frameCount * params.drehgeschwindigkeit * 0.1);
  rotateX(frameCount * params.drehgeschwindigkeit * 0.1);
  rotateY(frameCount * params.drehgeschwindigkeit);

  background(50);
  noStroke();

  translate(params.posX, params.posY, params.posZ);

  // numSpheres bereits oben deklariert
  for (let i1 = 0; i1 < numSpheres; i1++) {
    let nthdigit = parseInt(pistring.slice(i1, i1 + 1));
    let nthdigit1 = parseInt(pistring.slice(i1 + 1, i1 + 2));

    // Farbverlauf über die gesamte Länge
    let rainbow = floor(200 / numSpheres * i1);
    let alpha_hue = round(params.transparenz / 255, 2);
    let c = color(rainbow, 100, 50, alpha_hue);

    ambientMaterial(c);
    fill(c);

    // Aktuelle und nächste Kugel-Radien
    let currentRadius = nthdigit * params.skalierung/2;
    let nextRadius = nthdigit1 * params.skalierung/2;

    // Überlappung gemäß GUI-Parameter
    let distance = (currentRadius + nextRadius) * params.ueberlappung;

    // Richtung basiert auf aktueller Ziffer
    let changedir = (round(i1 / 100)) % 10;
    let newnthdigit = (nthdigit + changedir) % 10;

    let x1 = dirs[newnthdigit][0] * distance;
    let y1 = dirs[newnthdigit][1] * distance;
    let z1 = dirs[newnthdigit][2] * distance;

    sphere(currentRadius);
    translate(x1, y1, z1);
  }

  // Info-Anzeige aktualisieren
  if (params.zeigeInfo) {
    let fps = frameRate().toFixed(1);
    infoDiv.html(`FPS: ${fps}<br>Kugeln: ${numSpheres.toLocaleString()}`);
    infoDiv.show();
  } else {
    infoDiv.hide();
  }
}

//dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}