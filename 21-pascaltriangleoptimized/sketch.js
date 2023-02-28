/*
 * @name Sierpinski modulo Pascal Dreieck; rekursiv; nur Modulowerte um Stackoverflow zu verhindern, stark optimierte Version.
 2020 Andreas Richard
 */

p5.disableFriendlyErrors = true; // disables FES

var startTime, endTime, resetTime;
var oldfC, newfC;
var pT1 = [[]];
var pT2 = [[]];
var buffer;

var counterx;
var countery;

var slider1;
var sl1Start = 100;
var sl1Min = 5;

let slider2;

let slider3;
let sl3Start = 1000;
let sl3Max = 2000;

let fast = 1;
let slider4;

let slider5;

let slider6;

let zoom;
var n;
var divisor1;
var divisor2;
var opacity1;
var opacity2;

let checkbox;

function setup() {

	// Canvas und ursprünglicher Hintergrund
	createCanvas(sl3Start,sl3Start);
	background(230);
	fill(137,137,137);

	// Textaussehen
	textFont('Helvetica');
	textSize(18);

	checkbox = createCheckbox('Schneller Computer', false);
  checkbox.changed(myCheckedEvent);
	checkbox.position(10, 300);

	button = createButton('Save Picture');
	button.position(10, 330);
	button.mousePressed(savePicture);

	// Grafikpuffer
	buffer = createGraphics(width, height);

	// Zeitstempel
	start();
	reset();

  noStroke();

	// slider für Zoom
  slider1 = createSlider(10, 400, sl1Start,10);
	slider1.position(10, 10);
  slider1.style('width', '80px');
	// slider für Divisior1
	slider2 = createSlider(1, 23, 2,1);
	slider2.position(10, 40);
	slider2.style('width', '80px');
	// slider für Divisior2
	slider4 = createSlider(1, 23, 3,1);
	slider4.position(10, 70);
	slider4.style('width', '80px');
	// slider für Canvas Grösse
	slider3 = createSlider(400, sl3Max, sl3Start, 100);
	slider3.position(10, 160);
	slider3.style('width', '80px');
	// slider für opacity1
	slider5 = createSlider(0, 256, 137, 1);
	slider5.position(10, 100);
	slider5.style('width', '80px');
	// slider für opacity2
	slider6 = createSlider(0, 256, 137, 1);
	slider6.position(10, 130);
	slider6.style('width', '80px');

}

function draw() {

	resizeCanvas(slider3.value()*fast, slider3.value()*fast);
	background(230);
	fill(137,137,137);

	zoom = slider1.value()/10 + sl1Min;
	divisor1 = slider2.value();
	divisor2 = slider4.value();
	opacity1 = slider5.value();
	opacity2 = slider6.value();

	text('Zoom: ' + zoom,100, 25);
	text('Div1 (rot): ' + divisor1,100, 55);
	text('Div2 (blau): ' + divisor2,100, 85);
	text('Deckkraft1: ' + opacity1,100, 115);
	text('Deckkraft2: ' + opacity2,100, 145);
	text('Grösse: ' + slider3.value()*fast,100, 175);

  let n = int(height/zoom);

	counterx = slider1.value()*slider2.value()*slider3.value()*slider4.value()*slider5.value()*slider6.value();

	if (counterx != countery && end2()>100) {
		pT1 = createPT(n,divisor1);
		pT2 = createPT(n,divisor2);

		buffer = createGraphics(width, height);
		buffer.translate(width/2,50);
		buffer.noStroke();

		for (var i = 0; i < n; i++) {
			for (var j = 0; j < i+1; j++) {

				if (pT1[i][j] != 0) {
				buffer.fill(256,0,0,opacity1);
				buffer.rect((-0.5*i+j-1)*zoom,Math.sqrt(3/4)*i*zoom,zoom,Math.sqrt(3/4)*zoom);
				}

				if (pT2[i][j] != 0) {
					buffer.fill(0,0,256,opacity2);
					buffer.rect((-0.5*i+j-1)*zoom,Math.sqrt(3/4)*i*zoom,zoom,Math.sqrt(3/4)*zoom);
				}

			}
		}

		countery = slider1.value()*slider2.value()*slider3.value()*slider4.value()*slider5.value()*slider6.value();
		reset();
		fCountReset();

	  }

	image(buffer,0,0);
	buffer.remove();

	/*
	Framerate anzeigen
	push();
	fill(50,50,50);
	textSize(24);
	text('FPS: ' + frameRate(), 10, 220);
	let avgFrameRate = round((fCountNew() / end1())*100)/100;
	text('AFPS: ' + avgFrameRate, 10, 250);
	pop();*/

}

// function to create Pascal Triangle
	function createPT (numRows,mod) {
		var pascalTriangleMod = [];

		for (var i = 0; i < numRows; i++) {
			pascalTriangleMod[i] = new Array(i+1);

			for (var j = 0; j < i+1; j++) {
				if (j === 0 || j === i) {
					pascalTriangleMod[i][j] = 1 % mod;
				} else {
					pascalTriangleMod[i][j] = (pascalTriangleMod[i-1][j-1] + pascalTriangleMod[i-1][j]) % mod;
				}
			}
		}
	  return pascalTriangleMod;
	}

	function start() {
	  startTime = new Date();
	};

	function reset() {
	  resetTime = new Date();
	};

	function end1() {
	  endTime = new Date();
	  var timeDiff = endTime - startTime; //in ms

		// strip the ms
	  timeDiff /= 1000;

	  // get seconds
	  //var seconds = Math.round(timeDiff);
		return timeDiff;
	}

	function end2() {
	  endTime = new Date();
	  var timeDiff = endTime - resetTime;
	  return timeDiff;
	}

	function fCountReset() {
		oldfC = frameCount;
		return oldfC;
	}

	function fCountNew() {
		newfC = frameCount - oldfC;
		return newfC;
	}

	function myCheckedEvent() {
	  if (this.checked()) {
			sl1Min = 0;
			slider1.value(60);
			fast = 2.5;
			slider3.value(400);

	  } else {
			sl1Min = 5;
			slider1.value(100);
			fast = 1;
			slider3.value(1000);
	  }
	}

	function savePicture() {
		save();
	}
