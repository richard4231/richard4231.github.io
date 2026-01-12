let slider1, slider2, slider3;
let colorPicker1, colorPicker2, colorPicker3, colorPicker4;
//let metallicSlider;
let lightRotation;
let orbControl;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
  setAttributes('perPixelLighting', true);
  camera(-600, 0, 1200, 0, 0, 0, 0, 1, 0);
  colorMode(RGB, 255, 255, 255, 100);
  
  // Hauptform-Slider
  slider1 = createSlider(0.01, 4, 2.3, 0.01);
  slider1.position(10, 30);
  slider1.style('width', '80px');
  
  // Transparenz-Slider
  slider2 = createSlider(0, 100, 100, 1);
  slider2.position(10, 60);
  slider2.style('width', '80px');
  
  // Rotationsgeschwindigkeit-Slider
  slider3 = createSlider(0, 0.02, 0.01, 0.001);
  slider3.position(10, 90);
  slider3.style('width', '80px');
  
  // Vier Farbwähler mit harmonischen Farben
  colorPicker1 = createColorPicker('#0AC2FF');  // Hellblau
  colorPicker1.position(10, 120);
  
  colorPicker2 = createColorPicker('#E6C7FF');  // Helles Violett
  colorPicker2.position(10, 150);
  
  colorPicker3 = createColorPicker('#FFF4BD');  // Helles Gelb
  colorPicker3.position(10, 180);
  
  colorPicker4 = createColorPicker('#FFB5C2');  // Helles Rosa
  colorPicker4.position(10, 210);
  
  // Metallic-Effekt Slider
  //metallicSlider = createSlider(0, 1, 0.5, 0.01);
  //metallicSlider.position(10, 240);
  //metallicSlider.style('width', '80px');
  
  // Lichtrotation und Orbit Control
  lightRotation = 0;
  orbControl = 1;
}

function isMouseOverGui() {
  if (mouseX < 100 && mouseY < 270) {
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

  ambientLight(80);
  pointLight(255, 255, 255, 
    cos(lightRotation) * 300, 
    sin(lightRotation) * 300, 
    200);
  pointLight(200, 200, 255, 
    -cos(lightRotation) * 300, 
    -sin(lightRotation) * 300, 
    200);
  
  lightRotation += 0.01;

  push();
  rotateZ(frameCount * slider3.value() * 0.1);
  rotateX(frameCount * slider3.value() * 0.1);
  
  pentakisDodecahedron();
  pop();
}

function getAdjacentSpikes(spikeIndex) {
  const adjacencyMap = {
    0: [1, 2, 3, 4],
    1: [0, 4, 5, 6],
    2: [0, 3, 7, 8],
    3: [0, 2, 8, 9],
    4: [0, 1, 6, 7],
    5: [1, 6, 10, 11],
    6: [1, 4, 5, 7],
    7: [2, 4, 6, 8],
    8: [2, 3, 7, 9],
    9: [3, 8, 10, 11],
    10: [5, 9, 11],
    11: [5, 9, 10]
  };
  return adjacencyMap[spikeIndex] || [];
}

function isColorValid(spikeIndex, color, colors, colorCounts) {
  // Prüfe, ob die Farbe bereits dreimal verwendet wurde
  if (colorCounts[color] >= 3) return false;
  
  // Prüfe, ob ein Nachbar die gleiche Farbe hat
  const adjacentSpikes = getAdjacentSpikes(spikeIndex);
  return !adjacentSpikes.some(adj => colors[adj] === color);
}

function findValidColorAssignment() {
  const colors = new Array(12).fill(-1);
  const colorCounts = new Array(4).fill(0);
  
  function assignColors(spikeIndex) {
    if (spikeIndex === 12) {
      // Prüfe, ob jede Farbe genau dreimal verwendet wurde
      return colorCounts.every(count => count === 3);
    }
    
    // Versuche alle Farben (0-3) für diesen Zacken
    for (let color = 0; color < 4; color++) {
      if (isColorValid(spikeIndex, color, colors, colorCounts)) {
        colors[spikeIndex] = color;
        colorCounts[color]++;
        
        if (assignColors(spikeIndex + 1)) return true;
        
        colors[spikeIndex] = -1;
        colorCounts[color]--;
      }
    }
    return false;
  }
  
  assignColors(0);
  return colors;
}

function pentakisDodecahedron() {
  if (windowWidth < windowHeight) {
    var q = (windowWidth) * 0.3;
  } else {
    var q = (windowHeight) * 0.3;
  }

  specularMaterial(255);
  shininess(100);

  const spikeColors = findValidColorAssignment();

  for (var i = 0; i < 60; i++) {
    const phase = i / 60;
    const brightness = 0.7 + 0.3 * sin(phase * PI * 2);
    
    const spikeIndex = Math.floor(i / 5);
    let selectedColor;
    switch(spikeColors[spikeIndex]) {
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

    // Hier die Korrektur mit let
    let v1 = createVector(vertices[faces[i][0]][0], vertices[faces[i][0]][1], vertices[faces[i][0]][2]);
    let v2 = createVector(vertices[faces[i][1]][0], vertices[faces[i][1]][1], vertices[faces[i][1]][2]);
    let v3 = createVector(vertices[faces[i][2]][0], vertices[faces[i][2]][1], vertices[faces[i][2]][2]);
    
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