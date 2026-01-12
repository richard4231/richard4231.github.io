// Pi-Pfad WebGPU Implementation
import { createIcosphere, generateInstanceData } from './geometry.js';

// wgpuMatrix wird global von <script> geladen
const { mat4, vec3 } = window.wgpuMatrix;

// Globale Variablen
let device, context, canvas;
let renderPipeline, uniformBuffer, instanceBuffer, vertexBuffer, indexBuffer, normalBuffer;
let bindGroup, depthTexture;
let gui, params;
let piDigits = null;
let camera, frameCount = 0;
let sphereGeometry;
let numInstances = 100;

// Richtungsvektoren
const DIRECTIONS = [
    [0, 0, 1], [-0.865, 0, 0.5], [0, -0.865, 0.5], [0.865, 0, 0.5], [0, 0.865, 0.5],
    [-0.6125, 0.6125, -0.5], [-0.6125, -0.6125, -0.5], [0.6125, -0.6125, -0.5], [0.6125, 0.6125, -0.5], [0, 0, -1]
];

// Parameter
params = {
    laenge: 2,
    skalierung: 10.0,
    transparenz: 1.0,
    drehgeschwindigkeit: 0.0,
    posX: 0,
    posY: 0,
    posZ: 0,
    ueberlappung: 0.9,
    zeigeInfo: true,
    lichtstaerke: 1.0,      // Lichtintensität (0-2)
    farbschema: 'rainbow',  // Farbschema
    glowIntensity: 0.0,     // Glow-Effekt Intensität (0-2)
    discoMode: false        // Disco-Effekt an/aus
};

// Kamera
camera = {
    rotation: { x: 0.3, y: 0.3 },
    distance: 500,
    position: { x: 0, y: 0, z: 0 },  // Kameraposition im Weltkoordinatensystem
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
    keys: {}  // Gedrückte Tasten
};

async function init() {
    canvas = document.getElementById('canvas');

    if (!navigator.gpu) {
        showError('WebGPU wird nicht unterstützt. Bitte Chrome Canary/Edge verwenden.');
        return;
    }

    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) throw new Error('Kein GPU-Adapter gefunden');

        device = await adapter.requestDevice();
        context = canvas.getContext('webgpu');
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

        context.configure({
            device,
            format: canvasFormat,
            alphaMode: 'premultiplied'
        });

        // Canvas-Größe setzen BEVOR Pipeline erstellt wird
        // Erhöhte Auflösung: 2x devicePixelRatio für schärferes Bild
        const resolution = devicePixelRatio * 2;
        canvas.width = window.innerWidth * resolution;
        canvas.height = window.innerHeight * resolution;

        await loadPiData();
        await setupGeometry();
        await setupPipeline();
        setupGUI();
        setupEvents();

        document.getElementById('loading').style.display = 'none';
        if (params.zeigeInfo) {
            document.getElementById('info').classList.add('visible');
        }

        requestAnimationFrame(render);

    } catch (error) {
        showError(`Fehler: ${error.message}`);
        console.error(error);
    }
}

async function loadPiData() {
    const response = await fetch('piDigits.json');
    const data = await response.json();
    piDigits = data.piDigits;
    console.log(`✓ Pi-Daten geladen: ${piDigits.length.toLocaleString()} Ziffern`);
}

async function setupGeometry() {
    // Icosphere erstellen
    sphereGeometry = createIcosphere(2);

    // Vertex Buffer (Positionen)
    vertexBuffer = device.createBuffer({
        size: sphereGeometry.positions.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(sphereGeometry.positions);
    vertexBuffer.unmap();

    // Normal Buffer
    normalBuffer = device.createBuffer({
        size: sphereGeometry.normals.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });
    new Float32Array(normalBuffer.getMappedRange()).set(sphereGeometry.normals);
    normalBuffer.unmap();

    // Index Buffer
    indexBuffer = device.createBuffer({
        size: sphereGeometry.indices.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true
    });
    new Uint32Array(indexBuffer.getMappedRange()).set(sphereGeometry.indices);
    indexBuffer.unmap();

    // Instance Buffer
    await updateInstances();

    // Uniform Buffer
    // WGSL benötigt 112 bytes wegen Struct-Alignment
    uniformBuffer = device.createBuffer({
        size: 112,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
}

async function setupPipeline() {
    // Shader laden
    const shaderCode = await (await fetch('shaders.wgsl')).text();
    const shaderModule = device.createShaderModule({ code: shaderCode });

    // Pipeline Layout
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: { type: 'uniform' }
        }]
    });

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
    });

    // Render Pipeline
    renderPipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
            module: shaderModule,
            entryPoint: 'vertexMain',
            buffers: [
                {
                    arrayStride: 12,
                    attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }]
                },
                {
                    arrayStride: 12,
                    attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' }]
                },
                {
                    arrayStride: 32,
                    stepMode: 'instance',
                    attributes: [
                        { shaderLocation: 2, offset: 0, format: 'float32x3' },
                        { shaderLocation: 3, offset: 12, format: 'float32' },
                        { shaderLocation: 4, offset: 16, format: 'float32x4' }
                    ]
                }
            ]
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fragmentMain',
            targets: [{
                format: navigator.gpu.getPreferredCanvasFormat(),
                blend: {
                    color: {
                        srcFactor: 'src-alpha',
                        dstFactor: 'one-minus-src-alpha',
                        operation: 'add'
                    },
                    alpha: {
                        srcFactor: 'one',
                        dstFactor: 'one-minus-src-alpha',
                        operation: 'add'
                    }
                }
            }]
        },
        primitive: {
            topology: 'triangle-list',
            cullMode: 'back'
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus'
        }
    });

    // Bind Group
    bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer }
        }]
    });

    // Depth Texture
    createDepthTexture();
}

function createDepthTexture() {
    // Alte Texture zerstören falls vorhanden
    if (depthTexture) {
        depthTexture.destroy();
    }

    depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });
}

async function updateInstances() {
    numInstances = Math.pow(10, params.laenge);
    const instanceData = generateInstanceData(
        piDigits,
        numInstances,
        params.skalierung,
        params.ueberlappung,
        DIRECTIONS,
        params.farbschema  // Farbschema übergeben
    );

    if (instanceBuffer) instanceBuffer.destroy();

    instanceBuffer = device.createBuffer({
        size: instanceData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    });
    new Float32Array(instanceBuffer.getMappedRange()).set(instanceData);
    instanceBuffer.unmap();
}

function setupGUI() {
    gui = new lil.GUI();

    const renderFolder = gui.addFolder('Rendering');
    renderFolder.add(params, 'laenge', 1, 6, 1).name('Länge (10^x)').onChange(() => updateInstances());
    renderFolder.add(params, 'skalierung', 0.1, 15, 0.05).name('Skalierung').onChange(() => updateInstances());
    renderFolder.add(params, 'transparenz', 0, 1, 0.1).name('Transparenz');
    renderFolder.add(params, 'ueberlappung', 0.5, 1.5, 0.05).name('Überlappung').onChange(() => updateInstances());
    renderFolder.open();

    const colorFolder = gui.addFolder('Farben & Effekte');
    colorFolder.add(params, 'farbschema', {
        'Regenbogen': 'rainbow',
        'Dunkler über Länge': 'fade',
        'Size matters': 'size',
        'Glow': 'glow',
        'Disco': 'disco'
    }).name('Farbschema').onChange(() => {
        // Bei Disco-Modus: Glow automatisch aktivieren und discoMode setzen
        if (params.farbschema === 'disco') {
            params.discoMode = true;
            if (params.glowIntensity < 0.5) {
                params.glowIntensity = 0.8;
            }
        } else if (params.farbschema === 'glow') {
            params.discoMode = false;
            if (params.glowIntensity < 0.5) {
                params.glowIntensity = 1.0;
            }
        } else {
            params.discoMode = false;
        }
        updateInstances();
    });
    colorFolder.add(params, 'glowIntensity', 0, 2, 0.1).name('Glow-Intensität');
    colorFolder.add(params, 'lichtstaerke', 0, 2, 0.1).name('Lichtstärke');
    colorFolder.open();

    const posFolder = gui.addFolder('Position');
    posFolder.add(params, 'posX', -400, 400, 10).name('X-Position');
    posFolder.add(params, 'posY', -400, 400, 10).name('Y-Position');
    posFolder.add(params, 'posZ', -400, 400, 10).name('Z-Position');

    const animFolder = gui.addFolder('Animation');
    animFolder.add(params, 'drehgeschwindigkeit', -0.02, 0.02, 0.001).name('Drehgeschw.');

    gui.add(params, 'zeigeInfo').name('Info anzeigen').onChange((val) => {
        document.getElementById('info').classList.toggle('visible', val);
    });
}

function setupEvents() {
    // Maussteuerung - Rotation durch Ziehen
    canvas.addEventListener('mousedown', e => {
        camera.isDragging = true;
        camera.lastMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', e => {
        if (!camera.isDragging) return;
        const dx = e.clientX - camera.lastMouse.x;
        const dy = e.clientY - camera.lastMouse.y;
        camera.rotation.y += dx * 0.005;
        camera.rotation.x += dy * 0.005;
        camera.lastMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mouseup', () => camera.isDragging = false);
    canvas.addEventListener('mouseleave', () => camera.isDragging = false);

    // Mausrad - Zoom
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        camera.distance += e.deltaY * 0.5;
        camera.distance = Math.max(50, Math.min(3000, camera.distance));
    });

    // Tastatursteuerung - Bewegung relativ zur Blickrichtung
    window.addEventListener('keydown', e => {
        camera.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', e => {
        camera.keys[e.key.toLowerCase()] = false;
    });

    // Resize
    window.addEventListener('resize', () => {
        const resolution = devicePixelRatio * 2;
        canvas.width = window.innerWidth * resolution;
        canvas.height = window.innerHeight * resolution;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        createDepthTexture();
    });

    // Initial style (Größe wurde bereits in init() gesetzt)
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
}

let lastTime = 0;
function render(time) {
    frameCount++;

    // FPS und Info
    if (params.zeigeInfo) {
        const fps = time - lastTime > 0 ? (1000 / (time - lastTime)).toFixed(1) : '60.0';
        document.getElementById('info').innerHTML = `
            FPS: ${fps}<br>
            Kugeln: ${numInstances.toLocaleString()}<br>
            <div class="controls">
                <b>Steuerung:</b><br>
                WASD/Pfeile: Bewegen<br>
                Q/E: Runter/Hoch<br>
                Maus ziehen: Rotieren<br>
                Mausrad: Zoomen<br>
                R: Reset Kamera
            </div>
        `;
        lastTime = time;
    }

    // Automatische Rotation
    camera.rotation.x += params.drehgeschwindigkeit * 0.1;
    camera.rotation.y += params.drehgeschwindigkeit;

    // Tastatursteuerung - Bewegung relativ zur Blickrichtung
    const moveSpeed = 5.0;

    // Berechne Vorwärts-, Rechts- und Oben-Vektoren basierend auf Rotation
    const forward = [
        Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x),
        Math.sin(camera.rotation.x),
        Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x)
    ];

    const right = [
        Math.cos(camera.rotation.y),
        0,
        -Math.sin(camera.rotation.y)
    ];

    // W/ArrowUp - Vorwärts
    if (camera.keys['w'] || camera.keys['arrowup']) {
        camera.position.x += forward[0] * moveSpeed;
        camera.position.y += forward[1] * moveSpeed;
        camera.position.z += forward[2] * moveSpeed;
    }

    // S/ArrowDown - Rückwärts
    if (camera.keys['s'] || camera.keys['arrowdown']) {
        camera.position.x -= forward[0] * moveSpeed;
        camera.position.y -= forward[1] * moveSpeed;
        camera.position.z -= forward[2] * moveSpeed;
    }

    // A/ArrowLeft - Links
    if (camera.keys['a'] || camera.keys['arrowleft']) {
        camera.position.x -= right[0] * moveSpeed;
        camera.position.y -= right[1] * moveSpeed;
        camera.position.z -= right[2] * moveSpeed;
    }

    // D/ArrowRight - Rechts
    if (camera.keys['d'] || camera.keys['arrowright']) {
        camera.position.x += right[0] * moveSpeed;
        camera.position.y += right[1] * moveSpeed;
        camera.position.z += right[2] * moveSpeed;
    }

    // Q - Runter
    if (camera.keys['q']) {
        camera.position.y -= moveSpeed;
    }

    // E - Hoch
    if (camera.keys['e']) {
        camera.position.y += moveSpeed;
    }

    // R - Kamera-Reset
    if (camera.keys['r']) {
        camera.position = { x: 0, y: 0, z: 0 };
        camera.rotation = { x: 0.3, y: 0.3 };
        camera.distance = 500;
        camera.keys['r'] = false; // Einmaliges Drücken
    }

    // Matrices
    const aspect = canvas.width / canvas.height;
    const projection = mat4.perspective(Math.PI / 4, aspect, 0.1, 5000);

    // Kameraposition relativ zum Fokuspunkt + eigene Position
    const eye = [
        camera.position.x + Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x) * camera.distance,
        camera.position.y + Math.sin(camera.rotation.x) * camera.distance,
        camera.position.z + Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x) * camera.distance
    ];

    const target = [camera.position.x, camera.position.y, camera.position.z];
    const view = mat4.lookAt(eye, target, [0, 1, 0]);
    const viewProjection = mat4.multiply(projection, view);

    // Update uniforms (112 bytes = 28 floats)
    const uniformData = new Float32Array(28);
    uniformData.set(viewProjection, 0);  // mat4 = 16 floats (0-15)
    uniformData[16] = params.posX;       // vec3 offset
    uniformData[17] = params.posY;
    uniformData[18] = params.posZ;
    uniformData[19] = time;              // time (für Disco-Effekt)
    uniformData[20] = params.transparenz; // transparency
    uniformData[21] = params.lichtstaerke; // lightIntensity
    uniformData[22] = params.glowIntensity; // glowIntensity
    uniformData[23] = params.discoMode ? 1.0 : 0.0; // discoMode
    // uniformData[24-27] = padding (4 floats = 16 bytes)

    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    // Render
    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
        }],
        depthStencilAttachment: {
            view: depthTexture.createView(),
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store'
        }
    });

    renderPass.setPipeline(renderPipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setVertexBuffer(1, normalBuffer);
    renderPass.setVertexBuffer(2, instanceBuffer);
    renderPass.setIndexBuffer(indexBuffer, 'uint32');
    renderPass.drawIndexed(sphereGeometry.indexCount, numInstances);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}

init();
