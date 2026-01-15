// WebGPU Pentakis Dodecahedron with lil-gui
import { mat4, vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm';

// Geometrie-Daten
const vertices = [[0,0,1.070466],[0.7136442,0,0.7978784],[-0.3568221,0.618034,0.7978784],[-0.3568221,-0.618034,0.7978784],[0.7978784,0.618034,0.3568221],[0.7978784,-0.618034,0.3568221],[-0.9341724,0.381966,0.3568221],[0.1362939,1,0.3568221],[0.1362939,-1,0.3568221],[-0.9341724,-0.381966,0.3568221],[0.9341724,0.381966,-0.3568221],[0.9341724,-0.381966,-0.3568221],[-0.7978784,0.618034,-0.3568221],[-0.1362939,1,-0.3568221],[-0.1362939,-1,-0.3568221],[-0.7978784,-0.618034,-0.3568221],[0.3568221,0.618034,-0.7978784],[0.3568221,-0.618034,-0.7978784],[-0.7136442,0,-0.7978784],[0,0,-1.070466],[0.25819888,0.4472136,0.6759734],[-0.5163978,0,0.6759734],[0.25819888,-0.4472136,0.6759734],[0.83554916,0,0.15957568],[-0.41777458,0.7236068,0.15957568],[-0.41777458,-0.7236068,0.15957568],[0.41777458,0.7236068,-0.15957568],[0.41777458,-0.7236068,-0.15957568],[-0.83554916,0,-0.15957568],[0.5163978,0,-0.6759734],[-0.25819888,0.4472136,-0.6759734],[-0.25819888,-0.4472136,-0.6759734]];

const faces = [[0,1,20],[1,4,20],[4,7,20],[7,2,20],[2,0,20],[0,2,21],[2,6,21],[6,9,21],[9,3,21],[3,0,21],[0,3,22],[3,8,22],[8,5,22],[5,1,22],[1,0,22],[1,5,23],[5,11,23],[11,10,23],[10,4,23],[4,1,23],[2,7,24],[7,13,24],[13,12,24],[12,6,24],[6,2,24],[3,9,25],[9,15,25],[15,14,25],[14,8,25],[8,3,25],[4,10,26],[10,16,26],[16,13,26],[13,7,26],[7,4,26],[5,8,27],[8,14,27],[14,17,27],[17,11,27],[11,5,27],[6,12,28],[12,18,28],[18,15,28],[15,9,28],[9,6,28],[10,11,29],[11,17,29],[17,19,29],[19,16,29],[16,10,29],[12,13,30],[13,16,30],[16,19,30],[19,18,30],[18,12,30],[14,15,31],[15,18,31],[18,19,31],[19,17,31],[17,14,31]];

const spikeColors = {
  crimsonRed: [0.863, 0.078, 0.235],
  royalBlue: [0.255, 0.412, 0.882],
  emeraldGreen: [0.314, 0.784, 0.471],
  goldenYellow: [1.0, 0.843, 0.0],
  purpleViolet: [0.576, 0.439, 0.859],
  turquoise: [0.251, 0.878, 0.816],
  coral: [1.0, 0.498, 0.314],
  lime: [0.196, 0.804, 0.196],
  hotPink: [1.0, 0.412, 0.706],
  orange: [1.0, 0.647, 0.0],
  skyBlue: [0.529, 0.808, 0.922],
  springGreen: [0.0, 1.0, 0.498]
};

const spikeColorMapping = [
  'crimsonRed', 'royalBlue', 'emeraldGreen', 'goldenYellow',
  'purpleViolet', 'turquoise', 'coral', 'lime',
  'hotPink', 'orange', 'skyBlue', 'springGreen'
];

// Parameter
const params = {
  spikeHeight: 3.0,
  opacity: 0,
  rotationSpeed: 0.01,
  metallic: 0.5,
  autoRotate: true,
  lightRotation: true,
  background: '#585858'
};

// WebGPU State
let device, context, pipeline, bindGroup;
let uniformBuffer, vertexBuffer, colorBuffer;
let depthTexture;
let frameCount = 0;
let lightRotation = 0;

// Kamera
const camera = {
  position: vec3.fromValues(-3, 0, 5),
  target: vec3.fromValues(0, 0, 0),
  up: vec3.fromValues(0, 1, 0),
  fov: 45 * Math.PI / 180,
  rotation: { x: 0, y: 0 },
  distance: 5,
  isDragging: false,
  lastX: 0,
  lastY: 0
};

const shaderCode = `
struct Uniforms {
  modelMatrix: mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  projectionMatrix: mat4x4<f32>,
  normalMatrix: mat4x4<f32>,
  lightPos1: vec3<f32>,
  lightPos2: vec3<f32>,
  cameraPos: vec3<f32>,
  metallic: f32,
  ambient: f32,
  opacity: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) color: vec3<f32>,
  @location(2) normal: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) color: vec3<f32>,
}

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  
  let worldPos = uniforms.modelMatrix * vec4<f32>(input.position, 1.0);
  output.worldPos = worldPos.xyz;
  output.position = uniforms.projectionMatrix * uniforms.viewMatrix * worldPos;
  output.normal = (uniforms.normalMatrix * vec4<f32>(input.normal, 0.0)).xyz;
  output.color = input.color;
  
  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  let normal = normalize(input.normal);
  let viewDir = normalize(uniforms.cameraPos - input.worldPos);
  
  // Ambient
  let ambient = input.color * uniforms.ambient;
  
  // Light 1
  let lightDir1 = normalize(uniforms.lightPos1 - input.worldPos);
  let diff1 = max(dot(normal, lightDir1), 0.0);
  let halfwayDir1 = normalize(lightDir1 + viewDir);
  let spec1 = pow(max(dot(normal, halfwayDir1), 0.0), 32.0 + uniforms.metallic * 96.0);
  
  // Light 2
  let lightDir2 = normalize(uniforms.lightPos2 - input.worldPos);
  let diff2 = max(dot(normal, lightDir2), 0.0);
  let halfwayDir2 = normalize(lightDir2 + viewDir);
  let spec2 = pow(max(dot(normal, halfwayDir2), 0.0), 32.0 + uniforms.metallic * 96.0);
  
  let diffuse = input.color * (diff1 + diff2 * 0.8);
  let specular = vec3<f32>(1.0) * (spec1 + spec2 * 0.8) * uniforms.metallic;
  
  let finalColor = ambient + diffuse + specular;
  return vec4<f32>(finalColor, uniforms.opacity);
}
`;

async function init() {
  const canvas = document.getElementById('canvas');
  let format;
  
  // WebGPU Support prüfen
  if (!navigator.gpu) {
    showError('WebGPU nicht unterstützt! Bitte Chrome 113+ oder Edge 113+ verwenden.');
    return;
  }
  
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      showError('Kein WebGPU-Adapter gefunden. GPU-Treiber möglicherweise veraltet.');
      return;
    }
    
    device = await adapter.requestDevice();
    if (!device) {
      showError('WebGPU-Device konnte nicht erstellt werden.');
      return;
    }
    
    context = canvas.getContext('webgpu');
    if (!context) {
      showError('WebGPU Canvas-Context konnte nicht erstellt werden.');
      return;
    }
    
    format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format,
      alphaMode: 'premultiplied',
    });
    
    updateGpuStatus('✅ WebGPU aktiv');
  } catch (e) {
    showError('WebGPU Fehler: ' + e.message);
    return;
  }
  
  // Shader Module
  const shaderModule = device.createShaderModule({ code: shaderCode });
  
  // Pipeline
  pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vertexMain',
      buffers: [{
        arrayStride: 36, // 9 floats * 4 bytes
        attributes: [
          { shaderLocation: 0, offset: 0, format: 'float32x3' },  // position
          { shaderLocation: 1, offset: 12, format: 'float32x3' }, // color
          { shaderLocation: 2, offset: 24, format: 'float32x3' }, // normal
        ]
      }]
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragmentMain',
      targets: [{
        format,
        blend: {
          color: {
            srcFactor: 'src-alpha',
            dstFactor: 'one-minus-src-alpha',
            operation: 'add',
          },
          alpha: {
            srcFactor: 'one',
            dstFactor: 'one-minus-src-alpha',
            operation: 'add',
          },
        },
      }]
    },
    primitive: {
      topology: 'triangle-list',
      cullMode: 'none', // Beide Seiten rendern für Transparenz
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    }
  });
  
  // Uniform Buffer
  uniformBuffer = device.createBuffer({
    size: 512, // Große genug für alle Uniforms
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  
  // Bind Group
  bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
      binding: 0,
      resource: { buffer: uniformBuffer }
    }]
  });
  
  setupGeometry();
  setupGUI();
  setupCamera(canvas);
  updateCameraPosition(); // Initiale Position berechnen
  resizeCanvas();
  
  // Lade-Meldung entfernen
  document.body.classList.add('loaded');
  
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(render);
}

function showError(message) {
  document.body.classList.add('loaded');
  const errorDiv = document.createElement('div');
  errorDiv.id = 'error';
  errorDiv.innerHTML = `
    <p>${message}</p>
    <button onclick="location.reload()" style="
      margin-top: 12px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #5078dc 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    ">Erneut versuchen</button>
  `;
  document.body.appendChild(errorDiv);
}

function setupGeometry() {
  const scale = 0.66; // Skalierungsfaktor für das Modell
  const vertexData = [];
  
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const spikeIndex = Math.floor(i / 5);
    const colorName = spikeColorMapping[spikeIndex];
    const color = spikeColors[colorName];
    
    const phase = i / 60;
    const brightness = 0.7 + 0.3 * Math.sin(phase * Math.PI * 2);
    
    const v1 = vec3.scale(vec3.create(), vertices[face[0]], scale);
    const v2 = vec3.scale(vec3.create(), vertices[face[1]], scale);
    const v3 = vec3.scale(vec3.create(), vertices[face[2]], scale * params.spikeHeight);
    
    // Normale berechnen
    const edge1 = vec3.sub(vec3.create(), v2, v1);
    const edge2 = vec3.sub(vec3.create(), v3, v1);
    const normal = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), edge1, edge2));
    
    // Vertex 1
    vertexData.push(...v1, color[0] * brightness, color[1] * brightness, color[2] * brightness, ...normal);
    // Vertex 2
    vertexData.push(...v2, color[0] * brightness, color[1] * brightness, color[2] * brightness, ...normal);
    // Vertex 3
    vertexData.push(...v3, color[0] * brightness, color[1] * brightness, color[2] * brightness, ...normal);
  }
  
  vertexBuffer = device.createBuffer({
    size: vertexData.length * 4,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  
  device.queue.writeBuffer(vertexBuffer, 0, new Float32Array(vertexData));
}

function setupCamera(canvas) {
  canvas.addEventListener('mousedown', (e) => {
    camera.isDragging = true;
    camera.lastX = e.clientX;
    camera.lastY = e.clientY;
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!camera.isDragging) return;
    
    const deltaX = e.clientX - camera.lastX;
    const deltaY = e.clientY - camera.lastY;
    
    camera.rotation.y -= deltaX * 0.01; // Invertiert für natürliche Steuerung
    camera.rotation.x += deltaY * 0.01;
    
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    
    camera.lastX = e.clientX;
    camera.lastY = e.clientY;
    
    updateCameraPosition();
  });
  
  canvas.addEventListener('mouseup', () => {
    camera.isDragging = false;
  });
  
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.distance += e.deltaY * 0.01;
    camera.distance = Math.max(2, Math.min(20, camera.distance));
    updateCameraPosition();
  });
}

function updateCameraPosition() {
  const x = camera.distance * Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x);
  const y = camera.distance * Math.sin(camera.rotation.x);
  const z = camera.distance * Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x);
  
  vec3.set(camera.position, x, y, z);
}

function setupGUI() {
  const gui = new lil.GUI({ title: 'Einstellungen', width: 260 });
  
  // Geometrie Folder
  const geoFolder = gui.addFolder('Geometrie');
  geoFolder.add(params, 'spikeHeight', 0.5, 4, 0.01)
    .name('Spike Höhe')
    .onChange(() => setupGeometry());
  geoFolder.open();
  
  // Material Folder
  const matFolder = gui.addFolder('Material');
  matFolder.add(params, 'opacity', 0, 1, 0.01).name('Transparenz');
  matFolder.add(params, 'metallic', 0, 1, 0.01).name('Metallisch');
  matFolder.open();
  
  // Animation Folder
  const animFolder = gui.addFolder('Animation');
  animFolder.add(params, 'autoRotate').name('Spikey dreht');
  animFolder.add(params, 'rotationSpeed', 0, 0.05, 0.001).name('Geschwindigkeit');
  animFolder.add(params, 'lightRotation').name('Lichter kreisen');
  animFolder.open();
  
  // Szene Folder
  const sceneFolder = gui.addFolder('Szene');
  sceneFolder.addColor(params, 'background').name('Hintergrund');
  sceneFolder.open();
}

function resizeCanvas() {
  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  if (depthTexture) depthTexture.destroy();
  
  depthTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
}

let modelRotation = 0;

function render() {
  frameCount++;
  
  // Lichtrotation nur wenn aktiviert
  if (params.lightRotation) {
    lightRotation += 0.02;
  }
  
  // Spikey-Rotation nur wenn autoRotate aktiviert
  if (params.autoRotate) {
    modelRotation += params.rotationSpeed;
  }
  
  // Matrizen
  const modelMatrix = mat4.create();
  mat4.rotateY(modelMatrix, modelMatrix, modelRotation);
  mat4.rotateZ(modelMatrix, modelMatrix, modelRotation * 0.3);
  mat4.rotateX(modelMatrix, modelMatrix, modelRotation * 0.2);
  
  const viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, camera.position, camera.target, camera.up);
  
  const canvas = document.getElementById('canvas');
  const aspect = canvas.width / canvas.height;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, camera.fov, aspect, 0.1, 100);
  
  const normalMatrix = mat4.create();
  mat4.transpose(normalMatrix, mat4.invert(mat4.create(), modelMatrix));
  
  // Light positions
  const lightPos1 = [
    Math.cos(lightRotation) * 3,
    Math.sin(lightRotation) * 3,
    2
  ];
  
  const lightPos2 = [
    -Math.cos(lightRotation) * 3,
    -Math.sin(lightRotation) * 3,
    2
  ];
  
  // Uniforms aktualisieren
  const uniformData = new Float32Array(512 / 4);
  uniformData.set(modelMatrix, 0);
  uniformData.set(viewMatrix, 16);
  uniformData.set(projectionMatrix, 32);
  uniformData.set(normalMatrix, 48);
  uniformData.set(lightPos1, 64);
  uniformData.set(lightPos2, 68);
  uniformData.set(camera.position, 72);
  uniformData[75] = params.metallic;
  uniformData[76] = 0.31; // ambient
  uniformData[77] = 1.0 - params.opacity; // opacity (invertiert: 0=opak, 1=transparent)
  
  device.queue.writeBuffer(uniformBuffer, 0, uniformData);
  
  // Render
  const commandEncoder = device.createCommandEncoder();
  
  const bgColor = hexToRgb(params.background);
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      clearValue: { r: bgColor.r, g: bgColor.g, b: bgColor.b, a: 1 },
      storeOp: 'store',
    }],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthClearValue: 1.0,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
    }
  });
  
  renderPass.setPipeline(pipeline);
  renderPass.setBindGroup(0, bindGroup);
  renderPass.setVertexBuffer(0, vertexBuffer);
  renderPass.draw(faces.length * 3, 1, 0, 0);
  renderPass.end();
  
  device.queue.submit([commandEncoder.finish()]);
  
  requestAnimationFrame(render);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0.12, g: 0.12, b: 0.12 };
}

function updateGpuStatus(status) {
  const statusEl = document.getElementById('gpu-status');
  if (statusEl) {
    statusEl.innerHTML = status;
  }
}

// Start mit kleinem Delay für stabilere Initialisierung
setTimeout(() => {
  init().catch(err => {
    console.error('WebGPU Init Error:', err);
    showError('WebGPU konnte nicht initialisiert werden.');
  });
}, 100);
