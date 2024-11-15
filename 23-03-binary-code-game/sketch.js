/* 
Partly based on Dan Shiffman's video 6.7 p5.js clicking on objects
Code for video https://vimeo.com/channels/learningp5js/141919520
*/

//Copyright 2023 Andreas Richard

var bubbles = [];
var sum = 0;
var sum1 = 0;
var length = 6;
var randListElement = Math.floor(Math.random()*12); //number to be found
var list_num = [1,17,19,22,9,8,12,32,63,10,24,16];
var targetNumber = list_num[randListElement];
var counter = 0;
var counter1 = 0;
var flag = 0;

function setup() {
  createCanvas(600, 600);
  for (var i = 0; i < length; i++) {
    var x = 70 + i * 60;
    var y = 100;
    bubbles.push(new Bubble(x, y,i));
  }
  button1 = createButton('Überprüfen');
  button1.position(450, 90);
}

function mouseClicked() {
  for (var i = 0; i < bubbles.length; i++) {
    bubbles[i].clicked();
    if (bubbles[i].click) {
      if (i == 0) {
        bubbles[i+1].change();
      }
      else if (i > 0 && i < (bubbles.length - 1)) {
      bubbles[i-1].change();
      bubbles[i+1].change();
      }
      else if (i == (bubbles.length -1)) {
        bubbles[i-1].change();
      }
    }
    bubbles[i].unclick();
  }
  for (var i = 0; i < bubbles.length; i++) {
    if (bubbles[i].c) {
      sum = sum + pow(2,bubbles.length - 1 - i);
    }
  }
  //print(sum);
  sum = 0;
}

function check_answer() {
  for (var i = 0; i < bubbles.length; i++) {
    if (bubbles[i].c) {
      sum1 = sum1 + pow(2,bubbles.length - 1 - i);
    }
  }
  print(sum1);
  print(targetNumber);
  fill(200);
  textSize(18);
  textAlign(LEFT,CENTER);
  if (sum1 == targetNumber){
    flag = 1;
    counter1 = counter1 + 1;
    if (counter1 == 2) {
      window.location.reload();
    }
  }
  else if (sum1 != targetNumber){
    flag = 2;
    counter = counter + 1;
    if (counter == 2) {
      window.location.reload();
    }
    
  }
  sum1 = 0;
  print(counter);
}

function draw() {
  background(30);
  for (var i = 0; i < bubbles.length; i++) {
    bubbles[i].display();
  }
  fill(200);
  textSize(60);
  textAlign(CENTER,CENTER);
  text(list_num[randListElement],200,320);
  textSize(18);
  textAlign(LEFT,CENTER);
  

  text("Versucht die angegebene Zahl mit Binärcode darzustellen.",30,400);
  text("Klickt dazu abwechslungsweise auf einen Stellenwert.",30,425);
  text("Wie viele Versuche braucht ihr?",30,470);

  if (flag ==1) {
    text("Korrekt!",450,130);
    }
    else if (flag == 2) {
    text("Leider falsch!",450,130);
    }
    else {
      fill(0); 
    }

  button1.mousePressed(check_answer);
}

/////
function Bubble(x, y, i) {
  this.x = x;
  this.y = y;
  this.i = i;
  this.col = color(255, 100);
  this.c = false;
  this.click = false;

  this.display = function() {
    stroke(255);
    fill(this.col);
    ellipse(this.x, this.y, 48, 48);
    textSize(22);
    textAlign(CENTER,TOP);
    text(2, this.x,160);
    textSize(16);
    textAlign(LEFT,BASELINE);
    text(length-1-i, this.x+5,160);
    textSize(22);
    textAlign(CENTER,CENTER);
    text(pow(2,(length-1-this.i)), this.x,230);
  }
  
  this.clicked = function() {
    var d = dist(mouseX, mouseY, this.x, this.y);
    if (d < 24 && !this.c) {
      this.click = true;
      this.col = color(255, 0, 200);
      this.c = !this.c;
    }
    else if (d < 24 && this.c) {
      this.click = true;
      this.col = color(255,100);
      this.c = !this.c;
    }
  }

  this.change = function() {
    if (this.c) {
      this.col = color(255,100);
      this.c = !this.c;
    }
    else if (!this.c) {
      this.col = color(255,0,200);
      this.c = !this.c;
    }
  }

  this.unclick = function() {
    this.click = false;
  }

}