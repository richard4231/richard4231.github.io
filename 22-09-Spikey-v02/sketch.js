/*
Optimierungen:
- Schönere Farbwahl
*/

var vertices = [[]];
var edges = [[]];
var faces = [[]];
let slider1;
let slider2;

function setup() {
	createCanvas(windowWidth, windowHeight,WEBGL);
  setAttributes('antialias', true);
	setAttributes('perPixelLighting', true);
	camera(-300,0,600,0,0,0,0,1,0);
	//colorMode(HSB,360,100,100,100);
	colorMode(RGB,255,255,255,100);

  strokeWeight(1);
  background(100);

  //noStroke();
  stroke('grey');

	slider1 = createSlider(0.01, 4, 1, 0.01);
	slider1.position(10, 30);
	slider1.style('width', '80px');

	slider2 = createSlider(0,100, 100, 1);
	slider2.position(10, 60);
	slider2.style('width', '80px');

	slider3 = createSlider(0,0.02, 0.01, 0.001);
	slider3.position(10, 90);
	slider3.style('width', '80px');

	//noLoop();
}

function draw() {

  orbitControl();

	if (windowWidth < windowHeight) {
		var q = (windowWidth) * 0.8;
	} else {
		var q = (windowHeight) * 0.8;
	}

	//pointLight(256,256,256,-100,-100,100);

	push();
	rotateZ(frameCount * slider3.value()*0.1);
	rotateX(frameCount * slider3.value()*0.1);
	rotateY(frameCount * slider3.value());
	pentakisDodecahedron();
	strokeWeight(10); //from here
	stroke(255,200,6,9);
	beginShape();
    vertex(0,0,0);
    vertex(40,-50,10);
    endShape(CLOSE); //to here is just experimental
	pop();

	/*push();
	fill(200,200,200,50);
	beginShape();
	z = windowWidth/2*1.5;
	h = windowHeight/2*1.5;
	t = -300;
	vertex(-z,-h,t);
	vertex(-z,h,t);
	vertex(z,h,t-10);
	vertex(z,-h,t-10);
	endShape(CLOSE);
	pop();*/

}

function pentakisDodecahedron () {
	//buffer = createGraphics(width, height,WEBGL); is nix
	vertices = [[0,0,1.070466],[0.7136442,0,0.7978784],[-0.3568221,0.618034,0.7978784],[-0.3568221,-0.618034,0.7978784],[0.7978784,0.618034,0.3568221],[0.7978784,-0.618034,0.3568221],[-0.9341724,0.381966,0.3568221],[0.1362939,1,0.3568221],[0.1362939,-1,0.3568221],[-0.9341724,-0.381966,0.3568221],[0.9341724,0.381966,-0.3568221],[0.9341724,-0.381966,-0.3568221],[-0.7978784,0.618034,-0.3568221],[-0.1362939,1,-0.3568221],[-0.1362939,-1,-0.3568221],[-0.7978784,-0.618034,-0.3568221],[0.3568221,0.618034,-0.7978784],[0.3568221,-0.618034,-0.7978784],[-0.7136442,0,-0.7978784],[0,0,-1.070466],[0.25819888,0.4472136,0.6759734],[-0.5163978,0,0.6759734],[0.25819888,-0.4472136,0.6759734],[0.83554916,0,0.15957568],[-0.41777458,0.7236068,0.15957568],[-0.41777458,-0.7236068,0.15957568],[0.41777458,0.7236068,-0.15957568],[0.41777458,-0.7236068,-0.15957568],[-0.83554916,0,-0.15957568],[0.5163978,0,-0.6759734],[-0.25819888,0.4472136,-0.6759734],[-0.25819888,-0.4472136,-0.6759734]];
  edges = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,6],[2,7],[3,8],[3,9],[4,7],[4,10],[5,8],[5,11],[6,9],[6,12],[7,13],[8,14],[9,15],[10,11],[10,16],[11,17],[12,13],[12,18],[13,16],[14,15],[14,17],[15,18],[16,19],[17,19],[18,19]];
	faces = [[0,1,20],[1,4,20],[4,7,20],[7,2,20],[2,0,20],[0,2,21],[2,6,21],[6,9,21],[9,3,21],[3,0,21],[0,3,22],[3,8,22],[8,5,22],[5,1,22],[1,0,22],[1,5,23],[5,11,23],[11,10,23],[10,4,23],[4,1,23],[2,7,24],[7,13,24],[13,12,24],[12,6,24],[6,2,24],[3,9,25],[9,15,25],[15,14,25],[14,8,25],[8,3,25],[4,10,26],[10,16,26],[16,13,26],[13,7,26],[7,4,26],[5,8,27],[8,14,27],[14,17,27],[17,11,27],[11,5,27],[6,12,28],[12,18,28],[18,15,28],[15,9,28],[9,6,28],[10,11,29],[11,17,29],[17,19,29],[19,16,29],[16,10,29],[12,13,30],[13,16,30],[16,19,30],[19,18,30],[18,12,30],[14,15,31],[15,18,31],[18,19,31],[19,17,31],[17,14,31]];
	background(100);
	if (windowWidth < windowHeight) {
		var q = (windowWidth) * 0.3;
	} else {
		var q = (windowHeight) * 0.3;
	}
	from = color(255, 252, 212, slider2.value());
	to = color(109 ,44, 76, slider2.value());

	//c2 = lerpColor(from, to, 0.66);
  //durch alle Seiten durchiterieren
  for (var i = 0; i < 60; i++) {
		//colorMode(HSB,360,100,100);
		//ambientMaterial(256,256,0);
		//c1 = lerpColor(from, to, i/59);
		//fill(c1);
		fill(255,230,9,slider2.value());
		//fill(130+floor(slider2.value()*(-(i/30)^2+2*i/30)),60+i/5,60+i/5); //120*(-(i/30)^2+i)
    v1 = createVector(vertices[faces[i][0]][0],vertices[faces[i][0]][1],vertices[faces[i][0]][2]);
    v2 = createVector(vertices[faces[i][1]][0],vertices[faces[i][1]][1],vertices[faces[i][1]][2]);
    v3 = createVector(vertices[faces[i][2]][0],vertices[faces[i][2]][1],vertices[faces[i][2]][2]);
    v1.mult(q);
    v2.mult(q);
    v3.mult(q*slider1.value());


    beginShape();
    vertex(v1.x,v1.y,v1.z);
    vertex(v2.x,v2.y,v2.z);
    vertex(v3.x,v3.y,v3.z);
    endShape(CLOSE);
  }
}

// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function averageVector() {
	let on = 0;
	if (on == 1) {
		var v1;
		var v2;
		var v3;
		var v4;
		var v5;
		var v6;

		for (var i = 11; i < 12; i++) {
			v1 = createVector(vertices[faces1[i][0]][0],vertices[faces1[i][0]][1],vertices[faces1[i][0]][2]);
			v2 = createVector(vertices[faces1[i][1]][0],vertices[faces1[i][1]][1],vertices[faces1[i][1]][2]);
			v3 = createVector(vertices[faces1[i][2]][0],vertices[faces1[i][2]][1],vertices[faces1[i][2]][2]);
			v4 = createVector(vertices[faces1[i][3]][0],vertices[faces1[i][3]][1],vertices[faces1[i][3]][2]);
			v5 = createVector(vertices[faces1[i][4]][0],vertices[faces1[i][4]][1],vertices[faces1[i][4]][2]);
			let v6 = p5.Vector.add(v1,v2);
			v6.add(v3);
			v6.add(v4);
			v6.add(v5);
			v6.div(5);
			console.log(v6);
		}
	}

}
