//
//
//

/*
Ideen:
- Grösse ändern, wenn Fenster geäandert wird
- Bei der letzten Figur die Möglichkeit einbauen, Häuschen anzubauen
- GUI mit schöneren slidern verwenden
*/



var bg = 25;
let img1;

/*function preload() {
  img1 = loadImage('assets/orange.jpg');
}
*/


function setup() {
	createCanvas(500, 500);
	colorMode(HSB);
	background(bg);
	img1 = loadImage('assets/orange.jpg');

}

function draw() {

	image(img1, 250, 250);

}
