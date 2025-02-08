/*

geplante Anpassungen:
- jitter? https://p5js.org/examples/objects-array-of-objects.html
-

 */

 // core characteristics of high quality taeching of Mathematics
 var init = 0.5;
 var RGMU1 = init;
 var RGMU2 = init;
 var RGMU3 = init;
 var RGMU4 = init;
 var RGMU5 = init;
 var RGMU6 = init;
 var RGMU7 = init;
 var ARGM = [];
 var ARaster = [];
 var AFill0 = [[]];
 var ARing0 = [[]];
 var AFill1 = [[]];
 var ARing1 = [[]];
 var AFill2 = [[]];
 var ARing2 = [[]];
 var AFill3 = [[]];
 var ARing3 = [[]];
 var diam = 0;
 var index = 4;
 var reload = 1;

 ////////////////////////////////////////////////////////////////////////////////

 // the gui object
 var gui;

 function setup() {

   //HSB color mode
  colorMode(HSB, 360,100,100,100);

   // create a canvas that fills the window
   createCanvas(windowWidth, windowHeight);
   // createCanvas(800,800);

   //smooth();
   // create the GUI
   gui = createGui('mathematikdidaktische Heatmap');
   // set initial positioin here
   gui.setPosition(width - 220, 20);

   // initiate slidersr
   sliderRange(0,3,1);
   gui.addGlobals('RGMU1');
   gui.addGlobals('RGMU2');
   gui.addGlobals('RGMU3');
   gui.addGlobals('RGMU4');
   gui.addGlobals('RGMU5');
   gui.addGlobals('RGMU6');
   gui.addGlobals('RGMU7');


   // only call draw when the gui is changed
   noLoop();

   // only draw shapes, without outline
   //noStroke();

 }

function draw() {

  // hello darkness my old friend
  background(360,0,90,100);

  //set gui Position here for change
  //gui.setPosition(width - 220, 20);

  //determine size and adjust if necessary
  if (windowWidth < windowHeight) {
    var size = (windowWidth) * 0.75;
  } else {
    var size = (windowHeight) * 0.75;
  }

  let x0 = windowWidth/2;
  let y0 = windowHeight/2;
  var r = size/2;
  var une = 2; //unevenness of the lines
  // Idee: Die Slider verändern sowohl die Farbe wie auch das Gesamtbild, entweder Flächen die grösser werden, Vielfalt die mit Particles ansteigt oder Position in einem Koordinatensystem
  strokeWeight(1);
  stroke(80,20,0,40);
  var RGMnum = 7;
  diam = size/index;
  noFill();

  for (let i = 0; i < index-4; i++) {
    circle(windowWidth/2,windowHeight/2,diam*(i+1));
  }

  if (reload == 1) {
    let vertx = 90;
    for (let x = 0; x < vertx; x++) {
      for (let i = 0; i < 4; i++) {
      AFill0[x] = [];
      ARing0[x] = [];
      }
      let angle = 2*PI / vertx * x;
      AFill0[x][0] = random(200,220);
      AFill0[x][1] = 60;
      AFill0[x][2] = 60;
      AFill0[x][3] = random(60,80);
      ARing0[x][0] = x0+r*0.25*cos(angle)+random(-une,+une);
      ARing0[x][1] = y0+r*0.25*sin(angle)+random(-une,+une);
      ARing0[x][2] = random(1,4)*0.8;
    }
    vertx = 180;
    for (let x = 0; x < vertx; x++) {
      for (let i = 0; i < 4; i++) {
      AFill1[x] = [];
      ARing1[x] = [];
      }
      let angle = 2*PI / vertx * x;
      AFill1[x][0] = random(250,270);
      AFill1[x][1] = 70;
      AFill1[x][2] = 70;
      AFill1[x][3] = random(60,80);
      ARing1[x][0] = x0+r*0.5*cos(angle)+random(-une,+une);
      ARing1[x][1] = y0+r*0.5*sin(angle)+random(-une,+une);
      ARing1[x][2] = random(1,4)*0.85;
    }
    vertx = 270;
    for (let x = 0; x < vertx; x++) {
      for (let i = 0; i < 4; i++) {
      AFill2[x] = [];
      ARing2[x] = [];
      }
      let angle = 2*PI / vertx * x;
      AFill2[x][0] = random(300,320);
      AFill2[x][1] = 80;
      AFill2[x][2] = 80;
      AFill2[x][3] = random(60,80);
      ARing2[x][0] = x0+r*0.75*cos(angle)+random(-une,+une);
      ARing2[x][1] = y0+r*0.75*sin(angle)+random(-une,+une);
      ARing2[x][2] = random(1,4)*0.9;
    }
    vertx = 360;
    for (let x = 0; x < vertx; x++) {
      for (let i = 0; i < 4; i++) {
      AFill3[x] = [];
      ARing3[x] = [];
      }
      let angle = 2*PI / vertx * x;
      AFill3[x][0] = random(350,370);
      AFill3[x][1] = 90;
      AFill3[x][2] = 90;
      AFill3[x][3] = random(60,80);
      ARing3[x][0] = x0+r*cos(angle)+random(-une,+une);
      ARing3[x][1] = y0+r*sin(angle)+random(-une,+une);
      ARing3[x][2] = random(1,4);
    }
    reload = 0;
  }

  push();
  vertx = 90;
  strokeWeight(0.1);
    for (let i = 0; i < vertx; i++) {
      fill(AFill0[i][0],AFill0[i][1],AFill0[i][2],AFill0[i][3]);
      circle(ARing0[i][0],ARing0[i][1],ARing0[i][2]);
    }
  pop();

  push();
  vertx = 180;
  strokeWeight(0.1);
    for (let i = 0; i < vertx; i++) {
      fill(AFill1[i][0],AFill1[i][1],AFill1[i][2],AFill1[i][3]);
      circle(ARing1[i][0],ARing1[i][1],ARing1[i][2]);
    }
  pop();

  push();
  vertx = 270;
  strokeWeight(0.1);
    for (let i = 0; i < vertx; i++) {
      fill(AFill2[i][0],AFill2[i][1],AFill2[i][2],AFill2[i][3]);
      circle(ARing2[i][0],ARing2[i][1],ARing2[i][2]);
    }
  pop();

  push();
  vertx = 360;
  strokeWeight(0.1);
    for (let i = 0; i < vertx; i++) {
      fill(AFill3[i][0],AFill3[i][1],AFill3[i][2],AFill3[i][3]);
      circle(ARing3[i][0],ARing3[i][1],ARing3[i][2]);
    }
  pop();


  ARaster = ['kognitive\nAktivierung','Handlungs-\norientierung','Differenz-\nierung','kooperatives\nLernen','Erkenntnis-\nsicherung','förderorientierte\nBeurteilung','Verantwortung\nfür das eigene\nLernen'];
  textFont('Helvetica');
  for (let i = 0; i < RGMnum; i++) {
    angle = 2 * PI / (RGMnum) * i-PI/2;
    line(x0,y0,x0+r*1.05*cos(angle),y0+r*1.05*sin(angle));
    textSize(15);
    fill(0);
    textAlign(CENTER);
    text(ARaster[i], x0+r*1.2*cos(angle),y0+r*1.2*sin(angle));
  }

  var total = RGMU1+RGMU2+RGMU3+RGMU4+RGMU5+RGMU6+RGMU7;
  ARGM = [RGMU1,RGMU2,RGMU3,RGMU4,RGMU5,RGMU6,RGMU7];

  push();
  strokeWeight(1);
  stroke(220);
  beginShape();
  fill(200+total*10,16+total*4,16+total*4,50);
  for (let i = 0;i < RGMnum; i ++) {
    angle = 2 * PI / (RGMnum) * i-PI/2;
    vertex(x0+(ARGM[i]+1)*r/index*cos(angle),y0+(ARGM[i]+1)*r/index*sin(angle));
  }
  endShape(CLOSE);
  pop();
}

// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gui.setPosition(width - 220, 20);
  reload = 1;
}
