let slider1, slider2, slider3;
let colorPicker1, colorPicker2, colorPicker3, colorPicker4;
let lightRotation;
let orbControl;

const spikeColorMapping = [
  1,  // Zacken 0
  2,  // Zacken 1
  3,  // Zacken 2
  4,  // Zacken 3
  4,  // Zacken 4
  1,  // Zacken 5
  2,  // Zacken 6
  2,  // Zacken 7
  3,  // Zacken 8
  3,  // Zacken 9
  1,  // Zacken 10
  4   // Zacken 11
];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
  setAttributes('perPixelLighting', true);
  camera(-600, 0, 1200, 0, 0, 0, 0, 1, 0);
  colorMode(RGB, 255, 255, 255, 100);
  
  // Zackenlänge-Slider
  createDiv('Zackenlänge').position(100, 30).style('color', '#bbbbbb').style('font-family', 'Helvetica');
  slider1 = createSlider(0.01, 4, 2.3, 0.01);
  slider1.position(10, 30);
  slider1.style('width', '80px');
  
  // Transparenz-Slider
  createDiv('Transparenz').position(100, 60).style('color', '#bbbbbb').style('font-family', 'Helvetica');
  slider2 = createSlider(10, 100, 100, 1);
  slider2.position(10, 60);
  slider2.style('width', '80px');
  
  // Rotatiosngeschwindigkeit-Slider
  createDiv('Drehgeschwindigkeit').position(100, 90).style('color', '#bbbbbb').style('font-family', 'Helvetica');
  slider3 = createSlider(0, 0.05, 0.01, 0.01);
  slider3.position(10, 90);
  slider3.style('width', '80px');

  // Ambient Light Slider
  createDiv('Umgebungslicht').position(100, 120).style('color', '#bbbbbb').style('font-family', 'Helvetica');
  slider4 = createSlider(0, 255, 80, 1);
  slider4.position(10, 120);
  slider4.style('width', '80px');

  // Vier Farbwähler mit harmonischen Farben
  colorPicker1 = createColorPicker('#0AC2FF');  // Hellblau
  colorPicker1.position(10, 150);
  
  colorPicker2 = createColorPicker('#B558EE');  // Helles Violett
  colorPicker2.position(10, 180);
  
  colorPicker3 = createColorPicker('#EACB76');  // Helles Gelb
  colorPicker3.position(10, 210);
  
  colorPicker4 = createColorPicker('#EC657D');  // Helles Rosa
  colorPicker4.position(10, 240);
  
  lightRotation = 0;
  orbControl = 1;
}

function isMouseOverGui() {
  if (mouseX < 100 && mouseY < 220) {
    return true;
  }
  return false;
}

function draw() {
  background(30);
  
  if (orbControl === 1 && !isMouseOverGui()) {
    orbitControl(1, 1, 1);
    rotateY(frameCount * 0.01 * slider3.value());
  } else if (orbControl === 1 && isMouseOverGui()) {
    rotateY(frameCount * 0.01 * slider3.value());
  }

  ambientLight(slider4.value());
  pointLight(255, 255, 255, 
    cos(lightRotation) * 400, 
    sin(lightRotation) * 400, 
    200);
  pointLight(200, 200, 255, 
    -cos(lightRotation) * 400, 
    -sin(lightRotation) * 400, 
    200);
  
  lightRotation += 0.01;

  push();
  rotateZ(frameCount * slider3.value() * 0.1);
  rotateX(frameCount * slider3.value() * 0.1);
  
  pentakisDodecahedron();
  pop();
}

function pentakisDodecahedron() {

  if (windowWidth < windowHeight) {
    var q = (windowWidth) * 0.3;
  } else {
    var q = (windowHeight) * 0.3;
  }

  specularMaterial(150);
  shininess(60);

  for (var i = 0; i < 60; i++) {
    const phase = i / 60;
    const brightness = 0.7 + 0.3 * sin(phase * PI * 2);
    
    const spikeIndex = Math.floor(i / 5);
    let selectedColor;
    switch(spikeColorMapping[spikeIndex]) {
      case 0:
        selectedColor = colorPicker1.color();
        break;
      case 1:
        selectedColor = colorPicker2.color();
        break;
      case 2:
        selectedColor = colorPicker3.color();
        break;
      case 3:
        selectedColor = colorPicker4.color();
        break;
      default:
        selectedColor = colorPicker1.color();
    }
    
    fill(
      red(selectedColor) * brightness,
      green(selectedColor) * brightness,
      blue(selectedColor) * brightness,
      slider2.value()
    );

    v1 = createVector(vertices[faces[i][0]][0], vertices[faces[i][0]][1], vertices[faces[i][0]][2]);
    v2 = createVector(vertices[faces[i][1]][0], vertices[faces[i][1]][1], vertices[faces[i][1]][2]);
    v3 = createVector(vertices[faces[i][2]][0], vertices[faces[i][2]][1], vertices[faces[i][2]][2]);
    
    v1.mult(q);
    v2.mult(q);
    v3.mult(q * slider1.value());

    beginShape();
    vertex(v1.x, v1.y, v1.z);
    vertex(v2.x, v2.y, v2.z);
    vertex(v3.x, v3.y, v3.z);
    endShape(CLOSE);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}