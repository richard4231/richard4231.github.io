var vertices = [[]];
var edges = [[]];
var faces = [[]];
let slider1, slider2, slider3;
let colorPicker1, colorPicker2, colorPicker3, colorPicker4;
let metallicSlider;
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
  vertices = [[0,0,1.070466],[0.7136442,0,0.7978784],[-0.3568221,0.618034,0.7978784],[-0.3568221,-0.618034,0.7978784],[0.7978784,0.618034,0.3568221],[0.7978784,-0.618034,0.3568221],[-0.9341724,0.381966,0.3568221],[0.1362939,1,0.3568221],[0.1362939,-1,0.3568221],[-0.9341724,-0.381966,0.3568221],[0.9341724,0.381966,-0.3568221],[0.9341724,-0.381966,-0.3568221],[-0.7978784,0.618034,-0.3568221],[-0.1362939,1,-0.3568221],[-0.1362939,-1,-0.3568221],[-0.7978784,-0.618034,-0.3568221],[0.3568221,0.618034,-0.7978784],[0.3568221,-0.618034,-0.7978784],[-0.7136442,0,-0.7978784],[0,0,-1.070466],[0.25819888,0.4472136,0.6759734],[-0.5163978,0,0.6759734],[0.25819888,-0.4472136,0.6759734],[0.83554916,0,0.15957568],[-0.41777458,0.7236068,0.15957568],[-0.41777458,-0.7236068,0.15957568],[0.41777458,0.7236068,-0.15957568],[0.41777458,-0.7236068,-0.15957568],[-0.83554916,0,-0.15957568],[0.5163978,0,-0.6759734],[-0.25819888,0.4472136,-0.6759734],[-0.25819888,-0.4472136,-0.6759734]];
  edges = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,6],[2,7],[3,8],[3,9],[4,7],[4,10],[5,8],[5,11],[6,9],[6,12],[7,13],[8,14],[9,15],[10,11],[10,16],[11,17],[12,13],[12,18],[13,16],[14,15],[14,17],[15,18],[16,19],[17,19],[18,19]];
  faces = [[0,1,20],[1,4,20],[4,7,20],[7,2,20],[2,0,20],[0,2,21],[2,6,21],[6,9,21],[9,3,21],[3,0,21],[0,3,22],[3,8,22],[8,5,22],[5,1,22],[1,0,22],[1,5,23],[5,11,23],[11,10,23],[10,4,23],[4,1,23],[2,7,24],[7,13,24],[13,12,24],[12,6,24],[6,2,24],[3,9,25],[9,15,25],[15,14,25],[14,8,25],[8,3,25],[4,10,26],[10,16,26],[16,13,26],[13,7,26],[7,4,26],[5,8,27],[8,14,27],[14,17,27],[17,11,27],[11,5,27],[6,12,28],[12,18,28],[18,15,28],[15,9,28],[9,6,28],[10,11,29],[11,17,29],[17,19,29],[19,16,29],[16,10,29],[12,13,30],[13,16,30],[16,19,30],[19,18,30],[18,12,30],[14,15,31],[15,18,31],[18,19,31],[19,17,31],[17,14,31]];

  if (windowWidth < windowHeight) {
    var q = (windowWidth) * 0.3;
  } else {
    var q = (windowHeight) * 0.3;
  }

  //const metallic = metallicSlider.value();
  specularMaterial(255);
  shininess(100);

  // Optimierte Farbzuweisung mit genau 3 Vorkommen pro Farbe
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