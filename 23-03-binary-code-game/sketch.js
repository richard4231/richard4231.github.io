/* 
Based on Dan Shiffman's video 6.7 p5.js clicking on objects
Code for video https://vimeo.com/channels/learningp5js/141919520
*/

var bubbles = [];
var sum = 0;
var length = 6;

function setup() {
  createCanvas(600, 600);
  for (var i = 0; i < length; i++) {
    var x = 50 + i * 60;
    var y = 100;
    bubbles.push(new Bubble(x, y,i));
    
  }
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
  print(sum);
  sum = 0;
}

function draw() {
  background(0);
  for (var i = 0; i < bubbles.length; i++) {
    bubbles[i].display();
  }
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
    textSize(20);
    textAlign(CENTER,CENTER)
    text(pow(2,(length-1-this.i)), this.x,160);
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