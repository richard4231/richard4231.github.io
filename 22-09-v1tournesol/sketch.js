/*
 * @name Tournesol P5 version with gui sliders (p5.gui library required)

planned features:

- Winkel verändern lassen (in den richtigen Schritten)
- Radien der Kreis anpassen, damit sie sich nicht überschneiden bei grossen n => VErhältnis i/n problematisch

 */

 // seed color and alpha
 var seedColor = [360, 100, 100];//'#3300dd';
 var bgColor = [195,45,35]; //2. Wert wäre alpha Kanal (opacity)
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

 // seed opacity RGB
 // var opacity = 150;

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

 // set opacity range with magic variables RGB
 // var opacityMax = 255;

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

 function setup() {

   //HSB color mode
   colorMode(HSB);

   // all angles in degrees (0 .. 360)
   //angleMode(DEGREES);
   angleMode(RADIANS);

   // create a canvas that fills the window
   createCanvas(windowWidth, windowHeight);

   // smooth();
   // create the GUI
   gui = createGui('Tournesol');
   gui.setPosition(width -220, 20);
   // gui.hide(); // completely hidden
   gui.addGlobals('seeds', 'angle', 'factor1', 'zoom', 'radius', 'seedColor', 'opacity', 'bgColor', 'rotation_speed', 'expColor');
   gui.show(); // completely hidden
   // only call draw when the gui is changed
   // noLoop();
   // frameRate(24);
  count = 0;
   // only draw shapes, without outline
   //noStroke();

 }

function draw() {

  // hello darkness my old friend
  background(bgColor);

  //set gui Position here for change
  // gui.setPosition(width -200, 0);

  //determine size
  if (windowWidth < windowHeight) {
    var size = (windowWidth) * 0.8* zoom;
  } else {
    var size = (windowHeight) * 0.8* zoom;
  }

  var q = factor1/1000; //wert zwischen 0.98 und 0.999

  var n = seeds;
  var phi = (sqrt(5)-1)/2;
  
  for (var i = 0; i < n; i++) {
    push();
    

    var x1 = pow(q, i) * cos(angle * PI * phi * i + count);
    var y1 = pow(q, i) * sin(angle * PI * phi * i + count);
    var x2 = (width/2 + x1 * size/2); // new: centered, before (width/2 - 110 + x1 * size/2)
    var y2 = (height/2 + y1 * size/2);
    var r = size /300 * radius*(1 - sqrt(i/n));

    // let the seeds be filleth
    var c = color(seedColor);
    var d = i/expColor - floor(i/expColor);
    fill(360*d, saturation(c), brightness(c),  opacity);
    stroke(0, opacity);
    
    circle(x2,y2,r);
    pop();
  }
  count = count +2*PI*rotation_speed/3600;

}

// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gui.setPosition(width -220, 20);
  gui.hide();
}
