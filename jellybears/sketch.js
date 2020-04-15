//
//
//
// https://de.khanacademy.org/computing/computer-programming/programming-natural-simulations/programming-randomness/a/normal-distribution-of-random-numbers

// todo:
// add launch button
// ?

var bg = 50;
var img = [];
let button;

function preload() {
  img[1] = loadImage('assets/orange.png');
	img[2] = loadImage('assets/gelb.png');
	img[3] = loadImage('assets/hellrot.png');
	img[4] = loadImage('assets/dunkelrot.png');
	img[5] = loadImage('assets/gruen.png');
	img[6] = loadImage('assets/weiss.png');
}



function setup() {
	angleMode(DEGREES);
	createCanvas(500, 500);
	colorMode(HSB);
	background(bg);
	button = createButton('neu laden');
	button.position(19, 19);
	button.mousePressed(newPackage);
	noLoop();

}

function draw() {

	average = 9
	num = round(randomGaussian(average,0.5));
	if (num < average - 2) {
	num = average - 2;
	}
	if (num > average - 2) {
	num = average + 2
	}

	for (let i = 0; i < num; i++) {
			push();
			//translate(randomGaussian(250,80),randomGaussian(250,80));
			// check for similar coordinates
			translate(random(50,450),random(50,450))
			rotate(random()*360);
			j = random([1,2,3,4,5,6]);
			image(img[j], 0, 0, 56,82);
			pop();
	}

}

function newPackage() {
			clear();
			background(bg);
			draw();
}
