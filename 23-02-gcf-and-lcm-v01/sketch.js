var x_offset = 50; //define distance from left border
var slider1a; //first factor
var slider1b; //number of repetitions
var slider2a; //second factor
var slider2b; //number of repetitions
var slider3a; //multiples
var slider3b; //number of repetitions
var slider_zoom;

var maxlength = 400;
var sl3max = 17;
var sl4max = 19; //Maximum for slider 4, second number
var mult3 = maxlength/sl4max; //number of times, number 1 can be displayed
var mult4 = maxlength/sl4max;
var x1;
var canvas_y = 400;


function setup() {
  cnv = createCanvas(windowWidth, canvas_y);
  //cnv.mouseWheel(slideHorizontally); // attach listener for activity on canvas only
  //createCanvas(2000, canvas_y); //old canvas
  slider1a = createSlider(0,mult3,1,1);
  slider1b = createSlider(1,sl3max,3,1);
  slider2a = createSlider(0,20,1,1);
  slider2b = createSlider(1,sl4max,4,1);
  slider3a = createSlider(0,maxlength,0,maxlength);
  slider3b = createSlider(1,sl4max,sl4max,1);
  slider_zoom = createSlider(10,40,30,1);

}

function draw() {
  background(220);
  stroke (0,0,0);
  strokeWeight(1);
  line(x_offset-20,200,(maxlength+40)*slider_zoom.value()+x_offset,200);
  
  for (let i = 0; i < maxlength + 40; i++) {
    if (i % 5 == 0) {
    strokeWeight(2);
    if (i % 10 == 0) {
      strokeWeight(3);
    }
    }
    line(x_offset+slider_zoom.value()*i,190,x_offset+slider_zoom.value()*i,210);
    strokeWeight(1);
  }
  
  for (let j = 0; j < slider1a.value(); j ++) {
  noFill();
  stroke(255, 0, 0, 256-256/slider1a.value()*j);
  strokeWeight(3); //let color fade out
  bezier(x_offset+slider_zoom.value()*slider1b.value()*j,200,x_offset+slider_zoom.value()*slider1b.value()*j+10,160,x_offset+slider_zoom.value()*slider1b.value()*(j+1)-10,160,x_offset+slider_zoom.value()*slider1b.value()*(j+1),200);
  strokeWeight(0.2);
  fill(255, 0, 0, 256-256/slider1a.value()*j);
  text(slider1b.value()*(j+1),x_offset+slider_zoom.value()*slider1b.value()*(j+1)-5,170);


  }

  for (let j = 0; j < slider2a.value(); j ++) {
    noFill();
    stroke(20, 0, 256, 256-256/slider2a.value()*j);
    strokeWeight(3);
    bezier(x_offset+slider_zoom.value()*slider2b.value()*j,200,x_offset+slider_zoom.value()*slider2b.value()*j+10,240,x_offset+slider_zoom.value()*slider2b.value()*(j+1)-10,240,x_offset+slider_zoom.value()*slider2b.value()*(j+1),200);
    strokeWeight(0.2);
    fill(20, 0, 256, 256-256/slider2a.value()*j);
    text(slider2b.value()*(j+1),x_offset+slider_zoom.value()*slider2b.value()*(j+1)-5,230);
    
    }

    for (let j = 0; j < slider3a.value(); j ++) {
      noFill();
      stroke(0, 0, 0, 200-200/slider3a.value()*j);
      strokeWeight(2);
      bezier(x_offset+slider_zoom.value()*slider3b.value()*j,200,x_offset+slider_zoom.value()*slider3b.value()*j+10,270,x_offset+slider_zoom.value()*slider3b.value()*(j+1)-10,270,x_offset+slider_zoom.value()*slider3b.value()*(j+1),200);
      strokeWeight(0.2);
      fill(0, 0, 0, 256-256/slider3a.value()*j);
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
  if (mouseY < canvas_y-100) {
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
