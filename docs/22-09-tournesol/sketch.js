/*
 * @name Tournesol P5 version with gui sliders (p5.gui library required)
ready for p5.js 2.1.1
gui working without colorpicker

planned features:

- Winkel verändern lassen (in den richtigen Schritten)
- Radien der Kreis anpassen, damit sie sich nicht überschneiden bei grossen n => VErhältnis i/n problematisch
- Regler für brighness.

*/

 // seed color and alpha
var seedColorS = 100;
var seedColorB = 100;

var bgColorH = 195;
var bgColorS = 45;
var bgColorB = 35;
 // https://hslpicker.com/#327c95

 // phi
 

 // inital seeds
 var seeds = 370;

 // angle
 var angle = 2.0;

 // angle (phi)
 var factor1 = 996;

 // radius of the seed
 var radius = 23;

 // scale
 var zoom = 1;

  // seed saturation HSB
var seedColorS = 100;

 // seed brightness HSB
 var seedColorB = 100;

 // seed opacity HSB
 var opacity = 0.7;

 // rotation speed
 var rotation_speed = 6;

 // experimental color slider
 var expColor = 646;

 ////////////////////////////////////////////////////////////////////////////////

 // This is where the magic happens ...

 // set slider range with magic variables
 var seedsMin = 50;
 var seedsMax = 500;

 // set angle range with magic variables
 var angleMin = 1.5;
 var angleMax = 2.5;
 var angleStep = 0.01;

 // set factor1 range and step with magic variables
 var factor1Min = 980;
 var factor1Max = 999;
 var factor1Step = 0.5;

 // set radius range and step with magic variables
 var radiusMin = 0;
 var radiusMax = 50;
 var radiusStep = 0.5;

 // set step range with magic variables
 var zoomMin = 0.2;
 var zoomMax = 5;
 var zoomStep = 0.1;

 // set saturation range with magic variables HSB
 var seedColorSMin = 0;
 var seedColorSMax = 100;
 var seedColorSStep = 1;

  // set brightness range with magic variables HSB
 var seedColorBMin = 0;
 var seedColorBMax = 100;
 var seedColorBStep = 1;

 //set background hue range with magic variables HSB
 var bgColorHMin = 0;
 var bgColorHMax = 360;
 var bgColorHStep = 1;

 // set opacity range with magic variables HSB
 var opacityMin = 0;
 var opacityMax = 1;
 var opacityStep = 0.1

 //
 var rotation_speedMin = -25;
 var rotation_speedMax = 25;
 var rotation_speedStep = 1;

 //
 var expColorMin = 1;
 var expColorMax = 3000;
 var expColorStep = 1;

 ////////////////////////////////////////////////////////////////////////////////


// the gui object
var gui;
// globaler Zähler für Animation
var count = 0;

function setup() {
  
  angleMode(RADIANS);

  // create a canvas that fills the window
  createCanvas(windowWidth, windowHeight);
  // create the GUI
  gui = createGui('Tournesol');
  gui.setPosition(width -220, 20);
  gui.addGlobals('seeds', 'angle', 'factor1', 'zoom', 'radius', 'seedColorS', 'seedColorB', 'bgColorH', 'opacity', 'rotation_speed', 'expColor');
  gui.show();
  // Zähler initialisieren
  count = 0;

  // Hintergrundfarbe setzen (HSB)
  colorMode(HSB, 360, 100, 100, 1);
  background(bgColorH, bgColorS, bgColorB);
}

function draw() {
  // Hintergrundfarbe setzen (HSB)
  background(bgColorH, bgColorS, bgColorB);
  //determine size
  let size = (windowWidth < windowHeight)
    ? windowWidth * 0.8 * zoom
    : windowHeight * 0.8 * zoom;
  let q = factor1 / 1000; //wert zwischen 0.98 und 0.999
  let n = seeds;
  let phi = (sqrt(5) - 1) / 2;

  for (let i = 0; i < n; i++) {
    push();
    let x1 = pow(q, i) * cos(angle * PI * phi * i + count);
    let y1 = pow(q, i) * sin(angle * PI * phi * i + count);
    let x2 = width / 2 + x1 * size / 2;
    let y2 = height / 2 + y1 * size / 2;
    let r = size / 300 * radius * (1 - sqrt(i / n));
    // Farbverlauf für die Seeds
    let d = i / expColor - floor(i / expColor);
    let h = 360 * d;
    fill(h, seedColorS, seedColorB, opacity);
    stroke(0, opacity);
    circle(x2, y2, r);
    pop();
  }
  count += 2 * PI * rotation_speed / 3600;
}

// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gui.setPosition(width -220, 20);
}
