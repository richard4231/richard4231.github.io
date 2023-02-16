var x_offset = 50; //define distance from left border
var slider1a; //first factor
var slider1b; //number of repetitions

var slider2a;//second factor
var slider2b; //number of repetitions

var slider3a; //opacity of multiples
var slider3b; //multiples
var slider_zoom;

var maxlength = 400;
var sl3max = 30;
var sl4max = 45; //Maximum for slider 2a, second number
var mult3 = 40; //number of times, number 1 can be displayed
var mult4 = 40;
var x1;
var canvas_y = 400;


function setup() {
  cnv = createCanvas(windowWidth, canvas_y);
  //cnv.mouseWheel(slideHorizontally); // attach listener for activity on canvas only
  //createCanvas(2000, canvas_y); //old canvas
  //var mult3 = floor(maxlength/sl4max+20); //number of times, number 1 can be displayed
  //var mult4 = floor(maxlength/sl4max+20);
  
  slider1a = createSlider(1,sl3max,3,1);
  slider1a.position(20, 20);
  slider1b = createSlider(0,mult3,1,1);
  slider1b.position(20, 40);

  slider2a = createSlider(1,sl4max,4,1);
  slider2a.position(320, 20);
  slider2b = createSlider(0,mult4,1,1);
  slider2b.position(320, 40);

  slider3a = createSlider(0,224,224,16);
  slider3a.position(320, 340);
  slider3b = createSlider(1,sl4max,sl4max,1);
  slider3b.position(320, 360);
  
  slider_zoom = createSlider(5,40,30,1);
  slider_zoom.position(20, 360);

}

function draw() {
  background(220);
  stroke (0,0,0);
  fill(0);
  strokeWeight(0);  
  text('Zoom', slider_zoom.x + slider_zoom.width + 20, slider_zoom.y+13);
  text('Transparenz', slider3a.x + slider3a.width + 20, slider3a.y+13);
  text('Teiler', slider3b.x + slider3b.width + 20, slider3b.y+13);
  strokeWeight(1);
  line(x_offset-(20*slider_zoom.value()/30),200,(maxlength+40)*slider_zoom.value()+x_offset,200);
  
  for (let i = 0; i < maxlength + 40; i++) {
    if (i % 5 == 0) {
    strokeWeight(2);
    height = 8
    if (i % 10 == 0) {
      strokeWeight(3);
      height = 10
    }
    }
    line(x_offset+slider_zoom.value()*i,200-height,x_offset+slider_zoom.value()*i,200+ height);
    strokeWeight(1);
    height = 7;
  }
  
  stroke(255, 0, 0);
  fill(256,0,0);
  strokeWeight(0);
  text('Zahl 1', slider1a.x + slider1a.width +20, slider1a.y+13);
  text('Wiederholungen', slider1b.x * 2 + slider1b.width, slider1b.y+13);
  for (let j = 0; j < slider1b.value(); j ++) {
    noFill();
    stroke(255, 0, 0, 256-256/slider1b.value()*j);
    strokeWeight(3); //let color fade out
    bezier(x_offset+slider_zoom.value()*slider1a.value()*j,200,x_offset+slider_zoom.value()*slider1a.value()*j+slider1a.value()*2.5*slider_zoom.value()/30,160,x_offset+slider_zoom.value()*slider1a.value()*(j+1)-slider1a.value()*2.5*slider_zoom.value()/30,160,x_offset+slider_zoom.value()*slider1a.value()*(j+1),200);
    strokeWeight(0.2);
    fill(255, 0, 0, 256-256/slider1b.value()*j);
    text(slider1a.value()*(j+1),x_offset+slider_zoom.value()*slider1a.value()*(j+1)-5,170);
  }
  
  stroke(20, 0, 256);
  fill(20,0,256);
  strokeWeight(0);
  text('Zahl 2', slider2a.x + slider2a.width + 20, slider2a.y+13);
  text('Wiederholungen', slider2b.x + slider2b.width + 20, slider2b.y+13);
  
  // the blue number
  for (let j = 0; j < slider2b.value(); j ++) {
    noFill();
    stroke(20, 0, 256, 256-256/slider2b.value()*j);
    strokeWeight(3);
    bezier(x_offset+slider_zoom.value()*slider2a.value()*j,200,x_offset+slider_zoom.value()*slider2a.value()*j+slider2a.value()*2.5*slider_zoom.value()/30,240,x_offset+slider_zoom.value()*slider2a.value()*(j+1)-slider2a.value()*2.5*slider_zoom.value()/30,240,x_offset+slider_zoom.value()*slider2a.value()*(j+1),200);
    strokeWeight(0.2);
    fill(20, 0, 256, 256-256/slider2b.value()*j);
    text(slider2a.value()*(j+1),x_offset+slider_zoom.value()*slider2a.value()*(j+1)-5,230);
  }
  
  // putting the multiples on the canvas
  for (let j = 0; j < maxlength / slider3b.value(); j ++) {
    noFill();
    stroke(0, 0, 0, 224 - slider3a.value());
    strokeWeight(2);
    bezier(x_offset+slider_zoom.value()*slider3b.value()*j,200,x_offset+slider_zoom.value()*slider3b.value()*j+slider3b.value()*2.5*slider_zoom.value()/30,270,x_offset+slider_zoom.value()*slider3b.value()*(j+1)-slider3b.value()*2.5*slider_zoom.value()/30,270,x_offset+slider_zoom.value()*slider3b.value()*(j+1),200);
    strokeWeight(0.2);
    fill(0, 0, 0, slider3a.value());
    text(slider3b.value(),(x_offset+slider_zoom.value()*slider3b.value()*(j)+x_offset+slider_zoom.value()*slider3b.value()*(j+1))/2-5,280);
    /*if (j == 0) {
      text(slider3b.value(),x_offset+slider_zoom.value()*slider3b.value()-5,250);
    }*/
  }
}

function mousePressed() {
  x1 = mouseX;
  x_offset_old = x_offset;
}

function mouseDragged() {
  if (mouseY < canvas_y-110 && mouseY > 150) {
    x_offset = x_offset_old+mouseX-x1;
    redraw();
  }
}

function slideHorizontally(event){ 
    x_offset = x_offset_old+mouseX-x1;
    redraw();
}

/*
function mouseWheel() {
  slider1b.value() = 10;
}
*/

function windowResized() {
  resizeCanvas(windowWidth, canvas_y);
}
