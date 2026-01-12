// Visualisierung der Ziffern in Pi: Jede Zffer bestimmt einen Raumvektor, der den weiteren Verlauf der Linie festlegt.
// Die Raumvektoren sind eine Annäherung an 10 möglichst äquidistante Punkte auf einer Kugel.

function preload() {
  pistring;
}

let slider1;
let slider2;
let slider3;
let slider4;
let sliderx;
let slidery;
let sliderz;
let dirs = [[0,0,1],[-0.865,0,0.5],[0,-0.865,0.5],[0.865,0,0.5],[0,0.865,0.5],[-0.6125,0.6125,-0.5],[-0.6125,-0.6125,-0.5],[0.6125,-0.6125,-0.5],[0.6125,0.6125,-0.5],[0,0,-1]];

function setup() {

  colorMode(HSL);
  createCanvas(windowWidth, windowHeight,WEBGL);

  setAttributes('antialias', true);
	setAttributes('perPixelLighting', true);
  smooth();

  // Erklärtext hinzufügen
  let infoText = createDiv('Pi als Pfad: Jede Ziffer entspricht einer Richtung (0-9), die den nächsten Schritt der entstehenden Linie bestimmt.<br>' + 'Der Beginn der Linie ist immer in roter Farbe <br>' + '<br>' +
                            'Steuerung:<br>' +
                          '- Länge: Bestimmt die Größe der Struktur.<br>' + '  Pro Schritt wird die Kette um den Faktor 10 länger.<br>' +
                          '- Liniendicke: Ändert die Stärke der Linien<br>' +
                          '- Transparenz: Regelt die Durchsichtigkeit<br>' +
                          '- Zoom: Vergrößert oder verkleinert die Ansicht<br>' +
                          '- X/Y/Z Position: Verschiebt das Objekt im Raum<br>' +
                          '- Drehgeschwindigkeit: Steuert die Rotation');

  infoText.position(windowWidth - 350, 20);
  infoText.style('color', '#bbbbbb');
  infoText.style('font-family', 'Helvetica');
  infoText.style('font-size', '12px');
  infoText.style('background-color', 'rgba(0,0,0,0.5)');
  infoText.style('padding', '10px');
  infoText.style('border-radius', '5px');
  infoText.style('width', '300px'); // Breite des Textfeldes begrenzen
  infoText.style('overflow', 'auto'); // Scrollen ermöglichen, falls der Tex

  slider1 = createSlider(1, 4, 2, 1); // ab 5 verlangsamt die meisten Computer zu non repsonsive anymore
  slider1.position(10, 30);
  slider1.style('width', '80px');
  createDiv('Länge (10^x)').position(100, 30).style('color', '#bbbbbb').style('font-family', 'Helvetica');

  slider2 = createSlider(1, 10, 1, 1);
  slider2.position(10, 60);
  slider2.style('width', '80px');
  createDiv('Liniendicke').position(100, 60).style('color', '#bbbbbb').style('font-family', 'Helvetica');

  slider3 = createSlider(0, 255, 200, 10);
  slider3.position(10, 90);
  slider3.style('width', '80px');
  createDiv('Transparenz').position(100, 90).style('color', '#bbbbbb').style('font-family', 'Helvetica');

  slider4 = createSlider(0.1, 100, 70, 0.1);
  slider4.position(10, 120);
  slider4.style('width', '80px');
  createDiv('Zoom').position(100, 120).style('color', '#bbbbbb').style('font-family', 'Helvetica');

  sliderx = createSlider(-600, 600, 0, 10);
  sliderx.position(10, 170);
  sliderx.style('width', '80px');
  createDiv('X Position').position(100, 170).style('color', '#bbbbbb').style('font-family', 'Helvetica');

  slidery = createSlider(-400, 400, 0, 10);
  slidery.position(10, 200);
  slidery.style('width', '80px');
  createDiv('Y Position').position(100, 200).style('color', '#bbbbbb').style('font-family', 'Helvetica');

  sliderz = createSlider(-400, 400, 0, 10);
  sliderz.position(10, 230);
  sliderz.style('width', '80px');
  createDiv('Z Position').position(100, 230).style('color', '#bbbbbb').style('font-family', 'Helvetica');

  slider5 = createSlider(0, 0.02, 0.0, 0.001);
  slider5.position(10, 280);
  slider5.style('width', '80px');
  createDiv('Drehgeschwindigkeit').position(100, 280).style('color', '#bbbbbb').style('font-family', 'Helvetica');
  
}

function draw() {

  //console.log(frameRate());

  pointLight(256,256,256,-100,-100,100);

  if (!isMouseOverGui()) {
      orbitControl(0.5,0.5,0.5);
      rotateZ(frameCount * slider5.value()*0.1);
      rotateX(frameCount * slider5.value()*0.1);
      rotateY(frameCount * slider5.value());;
  } else if (isMouseOverGui()) {
      rotateZ(frameCount * slider5.value()*0.1);
      rotateX(frameCount * slider5.value()*0.1);
      rotateY(frameCount * slider5.value());
  }

  if (slider1.value() > 5) { //no influence on frameRate...
    pixelDensity(1);
    setAttributes('antialias', false);
    setAttributes('perPixelLighting', false);
    noSmooth();
  } else {
    setAttributes('antialias', true);
    setAttributes('perPixelLighting', true);
    smooth();
  }

  background(40);
  strokeWeight(10);
  //translate(windowWidth/2,windowHeight/2);
  translate(sliderx.value(),slidery.value(),sliderz.value());


  for (let i1 = 0; i1 < pow(10,slider1.value()); i1++) { 
  nthdigit = parseInt(pistring.slice(i1,i1+1));
  
  strokeWeight(slider2.value());

  rainbow = floor(340/pow(10,slider1.value())*i1);
  alpha_hue = round(slider3.value()/255,2);
  c = color(rainbow, 100, 50, alpha_hue);
  stroke(c);
  x1 = dirs[nthdigit][0]*slider4.value();
  y1 = dirs[nthdigit][1]*slider4.value();
  z1 = dirs[nthdigit][2]*slider4.value();

  line(0,0,0,x1,y1,z1);
  translate(x1,y1,z1);
  }

  //save(canv, 'PiPaths.jpg');
	//noLoop;
}

function isMouseOverGui() {
  if (mouseX < 200 && mouseY < 330) {
    return true;
  }
  return false;
}

//dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}