// Cache DOM queries and frequently used calculations
let size, n;
const margin = 20;

// Use more efficient data structures
const matrices = {
  2: [1,2,2,1],
  4: [1,2,3,4,2,1,4,3,3,4,1,2,4,3,2,1],
  8: [/* A8 matrix */],
  16: [/* A16 matrix */],
  32: [/* A32 matrix */],
  64: [/* A64 matrix */]
};

// Configuration object
const config = {
  slider1x: 1,
  slider1y: 1,
  slider1z: 1,
  speed: 0,
  power: 3,
  orbControl: 1
};

// Debounce the resize handler
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function setup() {
  // Reduce canvas size for mobile
  const isMobile = window.innerWidth < 768;
  const canvasWidth = windowWidth - 2 * margin;
  const canvasHeight = windowHeight - 2 * margin;
  
  createCanvas(canvasWidth, canvasHeight, WEBGL);
  
  // Optimize WebGL settings
  setAttributes('antialias', true);
  setAttributes('perPixelLighting', true);
  
  // Adjust camera for mobile
  const camDistance = isMobile ? 800 : 1100;
  camera(-440, -160, camDistance, -100, 0, 0, 0, 1, 0);
  
  // Use RGB color mode with alpha
  colorMode(RGB, 255, 255, 255, 100);
  
  setupGUI();
}

function setupGUI() {
  const gui = createGui('Controls');
  gui.setPosition(width - 220, 40);
  
  // Add GUI controls with optimized ranges for mobile
  const isMobile = window.innerWidth < 768;
  const stepSize = isMobile ? 0.1 : 0.05;
  
  gui.addObject(config);
}

function draw() {
  // Calculate n only when power changes
  n = pow(2, config.power);
  
  // Clear background
  clear();
  background(220);
  
  // Handle controls
  if (config.orbControl === 1) {
    orbitControl(1, 1, 1);
    rotateY(frameCount * 0.01 * config.speed);
  }
  
  // Calculate size once
  size = 50 * 16 / n;
  
  // Optimize transformations
  translate(-0.5 * n * size, -0.5 * n * size, -0.5 * n * size);
  
  // Setup lights more efficiently
  setupLights();
  
  // Draw the sponge
  drawSponge();
}

function setupLights() {
  // Reduce number of lights for better performance
  directionalLight(0, 255, 255, -100, 100, -100);
  directionalLight(255, 0, 0, 0, 100, 0);
  ambientLight(255, 80, 80, 30);
}

function drawSponge() {
  normalMaterial();
  fill(100, 200, 255, 100);
  
  const size1 = 50 * 16 / n;
  const matrix = matrices[n];
  
  // Use more efficient loop
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      push();
      const a = i + j * n;
      translate(
        i * size1 * config.slider1x,
        matrix[a] * size1 * config.slider1y,
        j * size1 * config.slider1z
      );
      strokeWeight(0.2);
      stroke(51);
      box(size1);
      pop();
    }
  }
}

// Optimized resize handler
const windowResized = debounce(() => {
  const canvasWidth = windowWidth - 2 * margin;
  const canvasHeight = windowHeight - 2 * margin;
  resizeCanvas(canvasWidth, canvasHeight);
  
  const isMobile = window.innerWidth < 768;
  const camDistance = isMobile ? 800 : 1100;
  camera(-440, -160, camDistance, -100, 0, 0, 0, 1, 0);
}, 250);