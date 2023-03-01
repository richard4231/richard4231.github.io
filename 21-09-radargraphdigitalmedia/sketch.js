/*

geplante Anpassungen:
- jitter? https://p5js.org/examples/objects-array-of-objects.html
-

 */

 // core characteristics of high quality teaching of Mathematics
 var init = 0.5;
 var FDPOT1 = init;
 var FDPOT2 = init;
 var FDPOT3 = init;
 var FDPOT4 = init;
 var FDPOT5 = init;
 var UDPOT1 = init;
 var UDPOT2 = init;
 var UDPOT3 = init;

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
   gui = createGui('fachdiaktissches\n und unterrichtsdidaktisches Potential');
   // set initial positioin here
   gui.setPosition(width - 220, 20);

   // initiate slidersr
   sliderRange(0,3,1);
   gui.addGlobals('FDPOT1');
   gui.addGlobals('FDPOT2');
   gui.addGlobals('FDPOT3');
   gui.addGlobals('FDPOT4');
   gui.addGlobals('FDPOT5');
   gui.addGlobals('UDPOT1');
   gui.addGlobals('UDPOT2');
   gui.addGlobals('UDPOT3');


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
  var une = 2; 

  strokeWeight(1);
  stroke(80,20,0,40);
  var RGMnum = 8;
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
      AFill0[x][0] = random(40,60);
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
      AFill1[x][0] = random(60,80);
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
      AFill2[x][0] = random(80,100);
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
      AFill3[x][0] = random(100,120);
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


  ARaster = ['FDPOT1 Darstellungen\nvernetzen','FDPOT2\nDarstellungen\nstrukturieren','FDPOT3\nmentale Operationen\nvirtuell darstellen','FDPOT4\nDenk- und Arbeitsprozesse\numlegen','FDPOT5 informativ fachspezifisch\nzurückmelden','UDPOT1 Material\nnutzen','UDPOT2\nInhalt und Ergebnisse\nveranschaulichen','UDPOT3 Lernprozesse\ndokumentieren'];
  textFont('Helvetica');
  for (let i = 0; i < RGMnum; i++) {
    angle = 2 * PI / (RGMnum) * i-PI/2;
    line(x0,y0,x0+r*1.02*cos(angle),y0+r*1.02*sin(angle));
    textSize(15);
    fill(0);
    textAlign(CENTER);
    text(ARaster[i], x0+r*1.2*cos(angle),y0+r*1.2*sin(angle));
  }

  var total = FDPOT1+FDPOT2+FDPOT3+FDPOT4+FDPOT5+UDPOT1+UDPOT2+UDPOT3;
  ARGM = [FDPOT1,FDPOT2,FDPOT3,FDPOT4,FDPOT5,UDPOT1,UDPOT2,UDPOT3];

  push();
  strokeWeight(1);
  stroke(220);
  beginShape();
  fill(100+total*5,16+total*4,16+total*4,50);
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
