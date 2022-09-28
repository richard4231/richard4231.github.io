//https://www.youtube.com/watch?v=DZlw-IS5OkI
//https://www.paulwheeler.us/articles/custom-3d-geometry-in-p5js/

let m;
let cam;
let nsteps = 10;
let radius = 200;
let hslice = radius / nsteps;
let slider1;

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	cam = createCamera();
	camera(-75,-525,1100,1.5*radius,0,0,0,1,0);
	slider1 = createSlider(0, 60, 0, 1);
	slider1.position(10, 30);
	slider1.style('width', '80px');
}

function draw() {
  background(80);
  orbitControl(2, 1, 0.05);
  ambientLight(50);
  
	// Shine a light in the direction the camera is pointing
	directionalLight(240, 240, 240, cam.centerX - cam.eyeX, cam.centerY - cam.eyeY, cam.centerZ - cam.eyeZ);
	//print(cam.eyeX,cam.eyeY,cam.eyeZ,cam.centerX,cam.centerY,cam.centerZ);
	
	//semisphere
	for (let j = 0; j < nsteps; j++) {
		let h2 = hslice * j;
		let r1 = sqrt(Math.pow(radius,2)- Math.pow(h2,2));
		let r2 = 0;
		let h1 = radius / nsteps;
		let voffset = -(h1 + slider1.value())*j;
  		createRing(r1,h1,r2,voffset, 36);
	}
	translate(radius*3,0,0);
	//tori
	for (let j = 0; j < nsteps; j++) {
		let h2 = hslice * j;
		//let r1 = sqrt(Math.pow(radius,2)- Math.pow(h2,2));
		let r2 = h2;
		let h1 = radius / nsteps;
		let voffset = -(h1 + slider1.value())*j;
  		createRing(radius,h1,r2,voffset, 36);
	}

}


function createRing(radius, hslice, iradius, offset, steps) {
	const angle = 2 * PI / steps;
	from = color(255, 252, 212, 256);
	to = color(109 ,44, 76, 256);

	c2 = lerpColor(from, to, 0.66);
	fill(c2);
	noStroke;
	for (let i = 0; i <= steps; i++) {
		let u = i * angle;
		c1 = lerpColor(from, to, i/59);
		fill(c1);
		stroke(c1);
		//let origin = (0,0,0);
		let x = Math.sin(u)*radius;
		let z = Math.cos(u)*radius;
		let y = offset;

		let x1 = Math.sin(u+angle)*radius;
		let z1 = Math.cos(u+angle)*radius;
		let y1 = offset;

		let x2 = Math.sin(u+angle)*iradius;
		let z2 = Math.cos(u+angle)*iradius;
		let y2 = offset;

		let x3 = Math.sin(u)*iradius;
		let z3 = Math.cos(u)*iradius;
		let y3 = offset;

		let x4 = x;
		let z4 = z;
		let y4 = y + hslice;

		let x5 = x1;
		let z5 = z1;
		let y5 = y1 + hslice;

		let x6 = x2;
		let z6 = z2;
		let y6 = y2 + hslice;

		let x7 = x3;
		let z7 = z3;
		let y7 = y3 + hslice;
		
		beginShape();
		vertex(x,y,z);
		vertex(x1,y1,z1);
		vertex(x2,y2,z2);
		vertex(x3,y3,z3);
    	endShape(CLOSE);

		beginShape();
    	vertex(x,y,z);
    	vertex(x4,y4,z4);
		vertex(x5,y5,z5);
    	vertex(x1,y1,z1);
		endShape(CLOSE);

		beginShape();
    	vertex(x4,y4,z4);
		vertex(x5,y5,z5);
    	vertex(x6,y6,z6);
		vertex(x7,y7,z7);
		endShape(CLOSE);

		beginShape();
    	vertex(x2,y2,z2);
		vertex(x3,y3,z3);
		vertex(x7,y7,z7);
    	vertex(x6,y6,z6);
		endShape(CLOSE);
		
		}
	
}

// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}