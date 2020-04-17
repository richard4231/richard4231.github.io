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
let posx = []
let posy = []

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
	button = createButton('neu');
	button.position(19, 19);
	button.mousePressed(newPackage);
	noLoop();

}

function draw() {

	average = 10 // either 10 for 12g packages or 8 for 10g packages
	num = round(randomGaussian(average,0.5));
	if (num < average - 2) {
		num = average - 2;
	} else if (num > average + 2) {
		num = average + 2;
	}
	posx[0] = random(50,450);
	posy[0] = random(50,450);
	
	for (let i = 1; i < num; i++) {
		posx[i] = random(50,450);
		posy[i] = random(50,450);
		// create array and check for near duplicates
		counter = 0;
		while (counter < i) {
			for (let j = 0; j < i; j++) {
				if (abs(posx[i]-posx[j])<50 && abs(posy[i]-posy[j])<50){
					posx[i] = random(50,450);
					posy[i] = random(50,450);
				} else {
					counter = counter + 1;
				}
			}
		}
	}

	for (let i = 0; i < num; i++) {
			push();
			
			//translate(randomGaussian(250,80),randomGaussian(250,80));
			// check for similar coordinates
			translate(posx[i],posy[i])
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
