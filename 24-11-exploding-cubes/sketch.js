/*
planned improvements:
- touchoptimized
-OR: distinguish between mobile and desktop browsers

new:
-looks also nice on mobile browsers
-nicer gui
-nice colors
*/

var blauer_Quader = 1;
var grüner_Quader = 1;
var gelber_Quader = 1;

var Transparenz = 255;

var Drehgeschwindigkeit = 0;

var Grösse = 3; //2,4,8,16,32,64 default 2^3

var orbControl = 1;

var blauer_QuaderMin = 0;
var blauer_QuaderMax = 1;
var blauer_QuaderStep = 0.05;
var grüner_QuaderMin = 0;
var grüner_QuaderMax = 1;
var grüner_QuaderStep = 0.05;
var gelber_QuaderMin = 0;
var gelber_QuaderMax = 1;
var gelber_QuaderStep = 0.05;

var TransparenzMin = 0;
var TransparenzMax = 255;
var TransparenzStep = 5;

var DrehgeschwindigkeitMin = -2;
var DrehgeschwindigkeitMax = 2;
var DrehgeschwindigkeitStep = 0.5;

var GrösseMin = 1;
var GrösseMax = 61;
var GrösseStep = 5;

var orbControlMin = 0;
var orbControlMax = 1;
var orbControlStep = 1;

let camx;
let camy;
let camz;

let margin = 20;
p5.disableFriendlyErrors = true;

var gui;

function setup() {

	createCanvas(windowWidth-2*margin, windowHeight-2*margin,WEBGL);
  setAttributes('antialias', true);
	setAttributes('perPixelLighting', true);
	camera(-440,-160,1100,-100,0,0,0,1,0);
	//colorMode(RGB,255,255,255,100);

	gui = createGui('Regler');
	gui.setPosition(40, 40);
	gui.addGlobals('gelber_Quader','grüner_Quader','blauer_Quader', 'Transparenz', 'Drehgeschwindigkeit','Grösse','orbControl');

}

function draw() {

	n = (Grösse);
  
  ambientLight(100);
  pointLight(255, 255, 255, 1000, -1000, 1000);
  pointLight(255, 255, 255, -1000, -1000, 0
  );

	if (orbControl == 1 && mouseX > 220 ) {
    // Enable orbit control
    rotateY(frameCount * 0.01*Drehgeschwindigkeit);
		orbitControl([1], [1], [1]);
		//rotateZ(frameCount * 0.01*Drehgeschwindigkeit);
		//rotateX(frameCount * 0.01*Drehgeschwindigkeit);
		
  } 
  else if (orbControl == 1 && mouseX < 220 && mouseY < 415) {
  rotateY(frameCount * 0.01*Drehgeschwindigkeit);
  } else if (orbControl == 0) {
    rotateY(frameCount * 0.01*Drehgeschwindigkeit);
  }
  
	/**/

	size = 100;
  a = -(n-1)/2;

	translate(a*size,a*size,a*size);

	background(220); //ohne diese Zeile bleiben die alten Positionen angezeigt. alternativ: clear();


	hx = blauer_Quader;
	hy = grüner_Quader;
	hz = gelber_Quader;


	figurate_cubes(n,hx,hy,hz);
  console.log(frameRate());

 

  }

function figurate_cubes(n,hx,hy,hz) {
	normalMaterial();
	fill(100, 200, 255,100);
  str_weight = 1;
	size1 = 100;

	for (var i = 0; i < n; i++) { //Kernquader, ausgehöhlt
		for (var j = 0; j < n; j++) {
      for (var k = 0; k < n; k++) {
        
        if (i == 0 || j == 0 || k == 0 || i == n-1 || j == n-1 || k == n-1){
          push();
          translate(i*size1,j*size1,k*size1);
          strokeWeight(str_weight);
          stroke(51);
          col_grey = 150
          fill(col_grey, col_grey, col_grey,Transparenz);
          box(size1);
          pop();
        }
      }
		}
	}
  for (var i = -1; i < n; i++) { //gelber Quader
    for (var j = -1; j < n; j ++) {
        push();
        translate(i*size1,j*size1,n*size1 + size1*(hz)*5);
        strokeWeight(str_weight);
        stroke(51);
        fill(250, 210, 50,Transparenz);
        box(size1);
        pop();
    }
  }
  for (var i = -1; i < n; i++) { //grüner Quader
    for (var j = 0; j < n; j ++) {
        push();
        translate(-size1*(hy+0.2)*5,i*size1,j*size1);
        strokeWeight(str_weight);
        stroke(51);
        fill(25, 200, 50, Transparenz);
        box(size1);
        pop();
    }
  }
  
  for (var i = 0; i < n; i++) { //blauer Quader
    for (var j = 0; j < n; j ++) {
        push();
        translate(i*size1,-size1*(hx+0.2)*5,j*size1);
        strokeWeight(str_weight);
        stroke(51);
        fill(65, 165, 240, Transparenz);
        box(size1);
        pop();
    }
  }

}

// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth-2*margin, windowHeight-2*margin);
	camera(-440,-160,1100,-100,0,0,0,1,0);
}
