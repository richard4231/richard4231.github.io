//https://www.reddit.com/r/processing/

let s = 480;
let width = 700
let depth = 6;
let slider1;

function setup() {
  createCanvas(700, 700);

  slider1 = createSlider(1, depth, 4, 1);
	slider1.position(10, 30);
	slider1.style('width', '200px');
}

function draw() {
  background(60);
  translate(20,(width-s)/2);
  level = 3*pow(2,slider1.value()-1);
  drawFigure1(level);
}

function drawFigure1(y) {
  strokeWeight(0.2);
  stroke(150);
  fill(200);
  power = pow(2,slider1.value()-1)
  x = (s / y);
  for (var i = 0; i < y; i++) {
    for (var j = 0; j < y; j++) {
      rect(x*i,x*j,x,x);
    }
  }

  //colored squares
  for (var i = slider1.value()-1; i >= 0; i--) {
    
    push();
    colorMode(HSL);
    fill(360/depth*i,50,50,100);
    power1 = pow(2,i); 
    x1 = (s / (3*(pow(2,i))));
    translate(x1,x1);
    for (var j = 0; j < 3*(power1); j++) {
      for (var k = 0; k < 3*(power1); k++) {
        if (j % 3 == 0 && k % 3 == 0) {
          rect(x1*j, x1*k,x1,x1);
        }
      }
    }
    pop();

    //hide obsolete squares
    if (i - 2 > 0) {
      push();
      fill(200);
      power2 = pow(2,i-3); 
      x1 = (s / (3*pow(2,i-3)));
      translate(x1,x1);
      for (var j = 0; j < 3*(power2); j++) {
        for (var k = 0; k < 3*(power2); k++) {
          if (j % 3 == 0 && k % 3 == 0) {
            rect(x1*(j-0.25), x1*k,1.5*x1,x1);
            rect(x1*j, x1*(k-0.25),x1,1.5*x1);
          }
        }
      }
      pop();
    }
  }
  
  //grid
  strokeWeight(0.2);
  stroke(150);
  fill(0,0,0,0);
  power = pow(2,slider1.value()-1)
  x = (s / y);
  for (var i = 0; i < y; i++) {
    for (var j = 0; j < y; j++) {
      rect(x*i,x*j,x,x);
    }
  }
}