// ============================================
// WebGPU Clustered Forward Shading
// ============================================

/*
GUI as library.
double cklicking for toggling of gui (like lin-gui)
sprites more noise in theor movement (non linear)
*/

// --- Configuration ---
const CONFIG = {
    maxLights: 2048,
    clusterCountX: 16,
    clusterCountY: 9,
    clusterCountZ: 24,
    maxLightsPerCluster: 100,
    nearPlane: 0.1,
    farPlane: 100.0,
};

// --- Shader Code ---
const SHADERS = {
    // Cluster bounds computation shader
    clusterBounds: /* wgsl */`
        struct ClusterBounds {
            minBounds: vec3f,
            maxBounds: vec3f,
        }
        
        struct CameraUniforms {
            viewMatrix: mat4x4f,
            projMatrix: mat4x4f,
            invProjMatrix: mat4x4f,
            screenSize: vec2f,
            nearPlane: f32,
            farPlane: f32,
            clusterSize: vec3u,
            _pad: u32,
        }
        
        @group(0) @binding(0) var<uniform> camera: CameraUniforms;
        @group(0) @binding(1) var<storage, read_write> clusterBounds: array<ClusterBounds>;
        
        fn screenToView(screenCoord: vec2f, depth: f32) -> vec3f {
            let ndc = vec4f(
                (screenCoord.x / camera.screenSize.x) * 2.0 - 1.0,
                1.0 - (screenCoord.y / camera.screenSize.y) * 2.0,
                depth,
                1.0
            );
            var viewPos = camera.invProjMatrix * ndc;
            viewPos /= viewPos.w;
            return viewPos.xyz;
        }
        
        fn getClusterDepth(slice: u32) -> f32 {
            let sliceRatio = f32(slice) / f32(camera.clusterSize.z);
            return camera.nearPlane * pow(camera.farPlane / camera.nearPlane, sliceRatio);
        }
        
        @compute @workgroup_size(8, 8, 1)
        fn main(@builtin(global_invocation_id) id: vec3u) {
            if (id.x >= camera.clusterSize.x || id.y >= camera.clusterSize.y || id.z >= camera.clusterSize.z) {
                return;
            }
            
            let tileSize = vec2f(
                camera.screenSize.x / f32(camera.clusterSize.x),
                camera.screenSize.y / f32(camera.clusterSize.y)
            );
            
            let minScreenXY = vec2f(f32(id.x), f32(id.y)) * tileSize;
            let maxScreenXY = minScreenXY + tileSize;
            
            let nearDepth = getClusterDepth(id.z);
            let farDepth = getClusterDepth(id.z + 1);
            
            // Convert screen-space tile to view-space AABB
            let minDepthNDC = (camera.projMatrix[2][2] * -nearDepth + camera.projMatrix[3][2]) / nearDepth;
            let maxDepthNDC = (camera.projMatrix[2][2] * -farDepth + camera.projMatrix[3][2]) / farDepth;
            
            let corners = array<vec3f, 8>(
                screenToView(minScreenXY, minDepthNDC),
                screenToView(vec2f(maxScreenXY.x, minScreenXY.y), minDepthNDC),
                screenToView(vec2f(minScreenXY.x, maxScreenXY.y), minDepthNDC),
                screenToView(maxScreenXY, minDepthNDC),
                screenToView(minScreenXY, maxDepthNDC),
                screenToView(vec2f(maxScreenXY.x, minScreenXY.y), maxDepthNDC),
                screenToView(vec2f(minScreenXY.x, maxScreenXY.y), maxDepthNDC),
                screenToView(maxScreenXY, maxDepthNDC)
            );
            
            var minBounds = corners[0];
            var maxBounds = corners[0];
            for (var i = 1u; i < 8u; i++) {
                minBounds = min(minBounds, corners[i]);
                maxBounds = max(maxBounds, corners[i]);
            }
            
            let clusterIndex = id.x + id.y * camera.clusterSize.x + id.z * camera.clusterSize.x * camera.clusterSize.y;
            clusterBounds[clusterIndex].minBounds = minBounds;
            clusterBounds[clusterIndex].maxBounds = maxBounds;
        }
    `,
    
    // Light culling compute shader
    lightCulling: /* wgsl */`
        struct ClusterBounds {
            minBounds: vec3f,
            maxBounds: vec3f,
        }
        
        struct Light {
            position: vec3f,
            radius: f32,
            color: vec3f,
            intensity: f32,
        }
        
        struct LightGrid {
            offset: u32,
            count: u32,
        }
        
        struct CameraUniforms {
            viewMatrix: mat4x4f,
            projMatrix: mat4x4f,
            invProjMatrix: mat4x4f,
            screenSize: vec2f,
            nearPlane: f32,
            farPlane: f32,
            clusterSize: vec3u,
            _pad: u32,
        }
        
        struct LightUniforms {
            lightCount: u32,
        }
        
        @group(0) @binding(0) var<uniform> camera: CameraUniforms;
        @group(0) @binding(1) var<storage, read> clusterBounds: array<ClusterBounds>;
        @group(0) @binding(2) var<storage, read> lights: array<Light>;
        @group(0) @binding(3) var<uniform> lightUniforms: LightUniforms;
        @group(0) @binding(4) var<storage, read_write> lightGrid: array<LightGrid>;
        @group(0) @binding(5) var<storage, read_write> lightIndices: array<u32>;
        @group(0) @binding(6) var<storage, read_write> globalLightIndexCount: atomic<u32>;
        
        const MAX_LIGHTS_PER_CLUSTER: u32 = 100u;
        
        fn sphereIntersectsAABB(center: vec3f, radius: f32, aabbMin: vec3f, aabbMax: vec3f) -> bool {
            let closestPoint = clamp(center, aabbMin, aabbMax);
            let distSq = dot(center - closestPoint, center - closestPoint);
            return distSq <= radius * radius;
        }
        
        @compute @workgroup_size(8, 8, 1)
        fn main(@builtin(global_invocation_id) id: vec3u) {
            if (id.x >= camera.clusterSize.x || id.y >= camera.clusterSize.y || id.z >= camera.clusterSize.z) {
                return;
            }
            
            let clusterIndex = id.x + id.y * camera.clusterSize.x + id.z * camera.clusterSize.x * camera.clusterSize.y;
            let bounds = clusterBounds[clusterIndex];
            
            var visibleLightCount = 0u;
            var visibleLightIndices: array<u32, 100>;
            
            for (var i = 0u; i < lightUniforms.lightCount; i++) {
                let light = lights[i];
                
                // Transform light to view space
                let lightPosView = (camera.viewMatrix * vec4f(light.position, 1.0)).xyz;
                
                if (sphereIntersectsAABB(lightPosView, light.radius, bounds.minBounds, bounds.maxBounds)) {
                    if (visibleLightCount < MAX_LIGHTS_PER_CLUSTER) {
                        visibleLightIndices[visibleLightCount] = i;
                        visibleLightCount++;
                    }
                }
            }
            
            // Allocate space in the global light index list
            let offset = atomicAdd(&globalLightIndexCount, visibleLightCount);
            
            lightGrid[clusterIndex].offset = offset;
            lightGrid[clusterIndex].count = visibleLightCount;
            
            // Write light indices
            for (var i = 0u; i < visibleLightCount; i++) {
                lightIndices[offset + i] = visibleLightIndices[i];
            }
        }
    `,
    
    // Reset global counter
    resetCounter: /* wgsl */`
        @group(0) @binding(0) var<storage, read_write> globalLightIndexCount: atomic<u32>;
        
        @compute @workgroup_size(1)
        fn main() {
            atomicStore(&globalLightIndexCount, 0u);
        }
    `,
    
    // Vertex shader for scene rendering
    sceneVertex: /* wgsl */`
        struct CameraUniforms {
            viewMatrix: mat4x4f,
            projMatrix: mat4x4f,
            invProjMatrix: mat4x4f,
            screenSize: vec2f,
            nearPlane: f32,
            farPlane: f32,
            clusterSize: vec3u,
            _pad: u32,
        }
        
        struct VertexInput {
            @location(0) position: vec3f,
            @location(1) normal: vec3f,
            @location(2) color: vec2f,
        }

        struct VertexOutput {
            @builtin(position) clipPosition: vec4f,
            @location(0) worldPosition: vec3f,
            @location(1) normal: vec3f,
            @location(2) color: vec2f,
            @location(3) viewPosition: vec3f,
        }
        
        @group(0) @binding(0) var<uniform> camera: CameraUniforms;
        
        @vertex
        fn main(input: VertexInput) -> VertexOutput {
            var output: VertexOutput;

            output.worldPosition = input.position;
            output.normal = input.normal;
            output.color = input.color;

            let viewPos = camera.viewMatrix * vec4f(input.position, 1.0);
            output.viewPosition = viewPos.xyz;
            output.clipPosition = camera.projMatrix * viewPos;

            return output;
        }
    `,
    
    // Light sprite vertex shader
    lightSpriteVertex: /* wgsl */`
        struct Light {
            position: vec3f,
            radius: f32,
            color: vec3f,
            intensity: f32,
        }
        
        struct CameraUniforms {
            viewMatrix: mat4x4f,
            projMatrix: mat4x4f,
            invProjMatrix: mat4x4f,
            screenSize: vec2f,
            nearPlane: f32,
            farPlane: f32,
            clusterSize: vec3u,
            _pad: u32,
        }
        
        struct SpriteUniforms {
            lightCount: u32,
            spriteSize: f32,
            spriteGlow: f32,
            _pad: f32,
        }
        
        struct VertexOutput {
            @builtin(position) position: vec4f,
            @location(0) color: vec3f,
            @location(1) uv: vec2f,
            @location(2) intensity: f32,
        }
        
        @group(0) @binding(0) var<uniform> camera: CameraUniforms;
        @group(0) @binding(1) var<storage, read> lights: array<Light>;
        @group(0) @binding(2) var<uniform> sprite: SpriteUniforms;
        
        @vertex
        fn main(
            @builtin(vertex_index) vertexIndex: u32,
            @builtin(instance_index) instanceIndex: u32
        ) -> VertexOutput {
            var output: VertexOutput;
            
            if (instanceIndex >= sprite.lightCount) {
                output.position = vec4f(0.0, 0.0, -1000.0, 1.0);
                return output;
            }
            
            let light = lights[instanceIndex];
            
            // Quad vertices (two triangles)
            let quadVertices = array<vec2f, 6>(
                vec2f(-1.0, -1.0),
                vec2f( 1.0, -1.0),
                vec2f( 1.0,  1.0),
                vec2f(-1.0, -1.0),
                vec2f( 1.0,  1.0),
                vec2f(-1.0,  1.0)
            );
            
            let cornerOffset = quadVertices[vertexIndex];
            output.uv = cornerOffset * 0.5 + 0.5;
            
            // Transform light position to view space
            let viewPos = camera.viewMatrix * vec4f(light.position, 1.0);
            
            // Billboard: offset in view space
            let size = sprite.spriteSize * 0.15;
            let billboardOffset = vec4f(cornerOffset.x * size, cornerOffset.y * size, 0.0, 0.0);
            let offsetViewPos = viewPos + billboardOffset;
            
            output.position = camera.projMatrix * offsetViewPos;
            output.color = light.color;
            output.intensity = light.intensity;
            
            return output;
        }
    `,
    
    // Light sprite fragment shader
    lightSpriteFragment: /* wgsl */`
        struct SpriteUniforms {
            lightCount: u32,
            spriteSize: f32,
            spriteGlow: f32,
            _pad: f32,
        }

        struct VertexOutput {
            @builtin(position) position: vec4f,
            @location(0) color: vec3f,
            @location(1) uv: vec2f,
            @location(2) intensity: f32,
        }

        @group(0) @binding(2) var<uniform> sprite: SpriteUniforms;

        @fragment
        fn main(input: VertexOutput) -> @location(0) vec4f {
            // Distance from center
            let center = vec2f(0.5, 0.5);
            let dist = distance(input.uv, center) * 2.0;

            // Soft circular falloff with glow (adjusted by spriteGlow)
            let coreFalloff = 1.0 - smoothstep(0.0, 0.3, dist);
            let glowFalloff = 1.0 - smoothstep(0.0, 1.0, dist);

            // Combine core (bright center) with glow (soft outer), scaled by spriteGlow
            let alpha = coreFalloff * 2.0 + glowFalloff * 0.5 * sprite.spriteGlow;

            // Discard fully transparent pixels
            if (alpha < 0.01) {
                discard;
            }

            // HDR color with intensity, scaled by spriteGlow
            let hdrColor = input.color * input.intensity * alpha * 1.5 * sprite.spriteGlow;

            return vec4f(hdrColor, alpha);
        }
    `,
    
    // Fragment shader with clustered lighting
    sceneFragment: /* wgsl */`
        struct Light {
            position: vec3f,
            radius: f32,
            color: vec3f,
            intensity: f32,
        }
        
        struct LightGrid {
            offset: u32,
            count: u32,
        }
        
        struct CameraUniforms {
            viewMatrix: mat4x4f,
            projMatrix: mat4x4f,
            invProjMatrix: mat4x4f,
            screenSize: vec2f,
            nearPlane: f32,
            farPlane: f32,
            clusterSize: vec3u,
            _pad: u32,
        }
        
        struct SceneUniforms {
            cameraPosition: vec3f,
            time: f32,
            debugMode: u32,
            useClustered: u32,
            lightCount: u32,
            _pad: u32,
        }
        
        @group(0) @binding(0) var<uniform> camera: CameraUniforms;
        @group(1) @binding(0) var<uniform> scene: SceneUniforms;
        @group(1) @binding(1) var<storage, read> lights: array<Light>;
        @group(1) @binding(2) var<storage, read> lightGrid: array<LightGrid>;
        @group(1) @binding(3) var<storage, read> lightIndices: array<u32>;
        
        struct VertexOutput {
            @builtin(position) clipPosition: vec4f,
            @location(0) worldPosition: vec3f,
            @location(1) normal: vec3f,
            @location(2) color: vec2f,
            @location(3) viewPosition: vec3f,
        }
        
        fn getClusterIndex(fragCoord: vec2f, viewZ: f32) -> u32 {
            let x = u32(fragCoord.x / (camera.screenSize.x / f32(camera.clusterSize.x)));
            let y = u32(fragCoord.y / (camera.screenSize.y / f32(camera.clusterSize.y)));
            
            let logRatio = log(camera.farPlane / camera.nearPlane);
            let z = u32(log(-viewZ / camera.nearPlane) / logRatio * f32(camera.clusterSize.z));
            
            let clampedX = min(x, camera.clusterSize.x - 1);
            let clampedY = min(y, camera.clusterSize.y - 1);
            let clampedZ = min(z, camera.clusterSize.z - 1);
            
            return clampedX + clampedY * camera.clusterSize.x + clampedZ * camera.clusterSize.x * camera.clusterSize.y;
        }
        
        fn calculateLight(light: Light, worldPos: vec3f, normal: vec3f, viewDir: vec3f) -> vec3f {
            let lightDir = light.position - worldPos;
            let distance = length(lightDir);
            let normalizedLightDir = lightDir / distance;
            
            // Attenuation with smooth falloff
            let attenuation = max(0.0, 1.0 - distance / light.radius);
            let smoothAttenuation = attenuation * attenuation;
            
            // Diffuse
            let NdotL = max(dot(normal, normalizedLightDir), 0.0);
            
            // Specular (Blinn-Phong)
            let halfDir = normalize(normalizedLightDir + viewDir);
            let NdotH = max(dot(normal, halfDir), 0.0);
            let specular = pow(NdotH, 32.0) * 0.5;
            
            return light.color * light.intensity * smoothAttenuation * (NdotL + specular);
        }
        
        fn heatmapColor(t: f32) -> vec3f {
            let c = clamp(t, 0.0, 1.0);
            if (c < 0.25) {
                return mix(vec3f(0.0, 0.0, 0.2), vec3f(0.0, 0.0, 1.0), c * 4.0);
            } else if (c < 0.5) {
                return mix(vec3f(0.0, 0.0, 1.0), vec3f(0.0, 1.0, 0.0), (c - 0.25) * 4.0);
            } else if (c < 0.75) {
                return mix(vec3f(0.0, 1.0, 0.0), vec3f(1.0, 1.0, 0.0), (c - 0.5) * 4.0);
            } else {
                return mix(vec3f(1.0, 1.0, 0.0), vec3f(1.0, 0.0, 0.0), (c - 0.75) * 4.0);
            }
        }
        
        fn clusterDebugColor(clusterIdx: u32) -> vec3f {
            let h = f32(clusterIdx % 256u) / 256.0;
            let s = 0.7;
            let v = 0.9;
            
            let c = v * s;
            let x = c * (1.0 - abs(fract(h * 6.0) * 2.0 - 1.0));
            let m = v - c;
            
            var rgb: vec3f;
            let h6 = h * 6.0;
            if (h6 < 1.0) { rgb = vec3f(c, x, 0.0); }
            else if (h6 < 2.0) { rgb = vec3f(x, c, 0.0); }
            else if (h6 < 3.0) { rgb = vec3f(0.0, c, x); }
            else if (h6 < 4.0) { rgb = vec3f(0.0, x, c); }
            else if (h6 < 5.0) { rgb = vec3f(x, 0.0, c); }
            else { rgb = vec3f(c, 0.0, x); }
            
            return rgb + vec3f(m);
        }
        
        @fragment
        fn main(input: VertexOutput) -> @location(0) vec4f {
            let normal = normalize(input.normal);
            let viewDir = normalize(scene.cameraPosition - input.worldPosition);

            // Base material color - use vertex color for spheres, checkerboard for room
            var baseColor: vec3f;

            // Check if this is a colored sphere vertex (color.x or color.y > 0.6 indicates pastel)
            if (input.color.x > 0.4 || input.color.y > 0.4) {
                // Sphere with pastel color from vertex
                baseColor = vec3f(input.color.x, input.color.y, input.color.x * 0.7 + input.color.y * 0.3);
            } else {
                // Room walls/floor with checkerboard pattern
                let checker = floor(input.color.x * 4.0) + floor(input.color.y * 4.0);
                let checkerMod = checker - floor(checker / 2.0) * 2.0;
                baseColor = mix(vec3f(0.15, 0.15, 0.18), vec3f(0.25, 0.25, 0.28), checkerMod);
            }
            
            var totalLight = vec3f(0.02); // Ambient
            
            let clusterIndex = getClusterIndex(input.clipPosition.xy, input.viewPosition.z);
            
            if (scene.useClustered == 1u) {
                // Clustered lighting
                let grid = lightGrid[clusterIndex];
                
                for (var i = 0u; i < grid.count; i++) {
                    let lightIdx = lightIndices[grid.offset + i];
                    totalLight += calculateLight(lights[lightIdx], input.worldPosition, normal, viewDir);
                }
            } else {
                // Naive lighting (all lights)
                for (var i = 0u; i < scene.lightCount; i++) {
                    totalLight += calculateLight(lights[i], input.worldPosition, normal, viewDir);
                }
            }
            
            var finalColor = baseColor * totalLight;
            
            // Debug modes
            if (scene.debugMode == 1u) {
                // Cluster visualization
                finalColor = mix(finalColor, clusterDebugColor(clusterIndex), 0.5);
            } else if (scene.debugMode == 2u) {
                // Heat map (lights per cluster)
                let grid = lightGrid[clusterIndex];
                let heat = f32(grid.count) / 50.0;
                finalColor = mix(finalColor, heatmapColor(heat), 0.7);
            }
            
            // Tone mapping
            finalColor = finalColor / (finalColor + vec3f(1.0));
            
            // Gamma correction
            finalColor = pow(finalColor, vec3f(1.0 / 2.2));
            
            return vec4f(finalColor, 1.0);
        }
    `,
};

// --- Main Application ---
class ClusteredShadingApp {
    constructor() {
        this.canvas = document.getElementById('webgpu-canvas');
        this.device = null;
        this.context = null;
        this.format = null;
        
        // Settings
        this.settings = {
            lightCount: 1168,
            lightIntensity: 1.0,
            lightRadius: 1.5,
            useClustered: true,
            debugMode: 0, // 0: normal, 1: clusters, 2: heat
            renderLightSprites: true,
            spriteSize: 2.2,
            spriteSpeed: 2.7,
            spriteGlow: 0.8,
        };
        
        // Camera
        this.camera = {
            position: [0, 3, 15],
            rotation: [0, 0], // Start rotation
            fov: 60 * Math.PI / 180,
        };
        
        // Input
        this.keys = {};
        this.mouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Stats
        this.frameCount = 0;
        this.lastFpsTime = performance.now();
        this.fps = 0;
        this.frameTime = 0;
        
        // Lights
        this.lights = [];
        this.lightVelocities = [];
        
        this.init();
    }
    
    async init() {
        if (!navigator.gpu) {
            console.error('WebGPU is not supported in this browser');
            document.getElementById('error-message').classList.add('visible');
            document.getElementById('error-message').querySelector('p').textContent =
                'WebGPU is not available. Please ensure you are using Chrome 113+ or Edge 113+ with WebGPU enabled in flags.';
            return;
        }

        try {
            const adapter = await navigator.gpu.requestAdapter({
                powerPreference: 'high-performance'
            });

            if (!adapter) {
                console.error('Failed to get GPU adapter');
                console.log('Trying with default power preference...');

                // Try again without power preference
                const fallbackAdapter = await navigator.gpu.requestAdapter();
                if (!fallbackAdapter) {
                    throw new Error('No GPU adapter found. Your GPU might not support WebGPU or it might be disabled.');
                }
                this.adapter = fallbackAdapter;
            } else {
                this.adapter = adapter;
            }

            console.log('GPU Adapter found:', this.adapter);

            this.device = await this.adapter.requestDevice();
            console.log('GPU Device acquired:', this.device);

            this.context = this.canvas.getContext('webgpu');
            this.format = navigator.gpu.getPreferredCanvasFormat();

            this.context.configure({
                device: this.device,
                format: this.format,
                alphaMode: 'premultiplied',
            });

            this.resize();
            this.createResources();
            this.createPipelines();
            this.initLights();
            this.setupEventListeners();
            this.render();

        } catch (error) {
            console.error('WebGPU initialization failed:', error);
            document.getElementById('error-message').classList.add('visible');
            document.getElementById('error-message').querySelector('p').textContent =
                `WebGPU initialization failed: ${error.message}. Check console for details.`;
        }
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.floor(this.canvas.clientWidth * dpr);
        this.canvas.height = Math.floor(this.canvas.clientHeight * dpr);
        
        this.createDepthTexture();
    }
    
    createDepthTexture() {
        if (this.depthTexture) this.depthTexture.destroy();
        
        this.depthTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }
    
    createResources() {
        const totalClusters = CONFIG.clusterCountX * CONFIG.clusterCountY * CONFIG.clusterCountZ;
        
        // Camera uniform buffer
        this.cameraUniformBuffer = this.device.createBuffer({
            size: 256, // Padded for alignment
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        // Scene uniform buffer
        this.sceneUniformBuffer = this.device.createBuffer({
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        // Light uniforms
        this.lightUniformBuffer = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        // Sprite uniforms
        this.spriteUniformBuffer = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        // Light buffer
        this.lightBuffer = this.device.createBuffer({
            size: CONFIG.maxLights * 32, // vec3 pos + radius + vec3 color + intensity
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        
        // Cluster bounds buffer
        this.clusterBoundsBuffer = this.device.createBuffer({
            size: totalClusters * 32, // 2x vec3f padded
            usage: GPUBufferUsage.STORAGE,
        });
        
        // Light grid buffer
        this.lightGridBuffer = this.device.createBuffer({
            size: totalClusters * 8, // offset + count per cluster
            usage: GPUBufferUsage.STORAGE,
        });
        
        // Light indices buffer
        this.lightIndicesBuffer = this.device.createBuffer({
            size: totalClusters * CONFIG.maxLightsPerCluster * 4,
            usage: GPUBufferUsage.STORAGE,
        });
        
        // Global light index counter
        this.globalLightIndexCountBuffer = this.device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.STORAGE,
        });
        
        // Create scene geometry (room)
        this.createSceneGeometry();
    }
    
    // Simple noise function for organic surfaces
    noise3D(x, y, z) {
        // Simple pseudo-random noise based on position
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return n - Math.floor(n);
    }

    smoothNoise(x, y, z) {
        // Sample surrounding points for smoother noise
        const corners = (
            this.noise3D(x - 1, y - 1, z - 1) + this.noise3D(x + 1, y - 1, z - 1) +
            this.noise3D(x - 1, y + 1, z - 1) + this.noise3D(x + 1, y + 1, z - 1) +
            this.noise3D(x - 1, y - 1, z + 1) + this.noise3D(x + 1, y - 1, z + 1) +
            this.noise3D(x - 1, y + 1, z + 1) + this.noise3D(x + 1, y + 1, z + 1)
        ) / 16;
        const sides = (
            this.noise3D(x, y - 1, z - 1) + this.noise3D(x, y + 1, z - 1) +
            this.noise3D(x - 1, y, z - 1) + this.noise3D(x + 1, y, z - 1) +
            this.noise3D(x, y - 1, z + 1) + this.noise3D(x, y + 1, z + 1) +
            this.noise3D(x - 1, y, z + 1) + this.noise3D(x + 1, y, z + 1) +
            this.noise3D(x - 1, y - 1, z) + this.noise3D(x + 1, y - 1, z) +
            this.noise3D(x - 1, y + 1, z) + this.noise3D(x + 1, y + 1, z)
        ) / 12;
        const center = this.noise3D(x, y, z) / 4;
        return corners + sides + center;
    }

    perlinNoise(x, y, z, octaves = 3) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.smoothNoise(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return total / maxValue;
    }

    createSceneGeometry() {
        // Create a room with floor, ceiling, and walls
        const roomSize = 30; //Raumgrösse
        const roomHeight = 12;
        const halfSize = roomSize / 2;

        const vertices = [];
        const indices = [];
        let vertexOffset = 0;
        
        const addQuad = (p1, p2, p3, p4, normal, uvScale = 1) => {
            const baseIndex = vertexOffset;

            // Calculate UV based on position for checkerboard
            const uv1 = [(p1[0] + halfSize) / roomSize * uvScale, (p1[2] + halfSize) / roomSize * uvScale];
            const uv2 = [(p2[0] + halfSize) / roomSize * uvScale, (p2[2] + halfSize) / roomSize * uvScale];
            const uv3 = [(p3[0] + halfSize) / roomSize * uvScale, (p3[2] + halfSize) / roomSize * uvScale];
            const uv4 = [(p4[0] + halfSize) / roomSize * uvScale, (p4[2] + halfSize) / roomSize * uvScale];

            vertices.push(
                ...p1, ...normal, uv1[0], uv1[1],
                ...p2, ...normal, uv2[0], uv2[1],
                ...p3, ...normal, uv3[0], uv3[1],
                ...p4, ...normal, uv4[0], uv4[1]
            );
            
            indices.push(
                baseIndex, baseIndex + 1, baseIndex + 2,
                baseIndex, baseIndex + 2, baseIndex + 3
            );
            
            vertexOffset += 4;
        };
        
        // Floor
        addQuad(
            [-halfSize, 0, -halfSize],
            [halfSize, 0, -halfSize],
            [halfSize, 0, halfSize],
            [-halfSize, 0, halfSize],
            [0, 1, 0], 4
        );
        
        // Ceiling
        addQuad(
            [-halfSize, roomHeight, halfSize],
            [halfSize, roomHeight, halfSize],
            [halfSize, roomHeight, -halfSize],
            [-halfSize, roomHeight, -halfSize],
            [0, -1, 0], 4
        );
        
        // Back wall
        addQuad(
            [-halfSize, 0, -halfSize],
            [-halfSize, roomHeight, -halfSize],
            [halfSize, roomHeight, -halfSize],
            [halfSize, 0, -halfSize],
            [0, 0, 1], 3
        );
        
        // Front wall
        addQuad(
            [halfSize, 0, halfSize],
            [halfSize, roomHeight, halfSize],
            [-halfSize, roomHeight, halfSize],
            [-halfSize, 0, halfSize],
            [0, 0, -1], 3
        );
        
        // Left wall
        addQuad(
            [-halfSize, 0, halfSize],
            [-halfSize, roomHeight, halfSize],
            [-halfSize, roomHeight, -halfSize],
            [-halfSize, 0, -halfSize],
            [1, 0, 0], 3
        );
        
        // Right wall
        addQuad(
            [halfSize, 0, -halfSize],
            [halfSize, roomHeight, -halfSize],
            [halfSize, roomHeight, halfSize],
            [halfSize, 0, halfSize],
            [-1, 0, 0], 3
        );
        
        // Add clustered spheres
        const spheres = [];
        const numClusters = 5; // Number of cluster centers
        const spheresPerCluster = Math.floor(Math.random() * 3) + 3; // 3-5 spheres per cluster
        const minDistance = 2.5; // Minimum distance between sphere surfaces

        // Generate cluster centers
        const clusterCenters = [];
        for (let c = 0; c < numClusters; c++) {
            clusterCenters.push([
                (Math.random() - 0.5) * (roomSize * 0.6),
                Math.random() * (roomHeight * 0.5) + 1,
                (Math.random() - 0.5) * (roomSize * 0.6)
            ]);
        }

        // Generate spheres around cluster centers
        for (const center of clusterCenters) {
            for (let s = 0; s < spheresPerCluster; s++) {
                let attempts = 0;
                let validPosition = false;
                let sphere;

                while (!validPosition && attempts < 50) {
                    // Random offset from cluster center
                    const offsetRadius = Math.random() * 5 + 1;
                    const offsetAngle = Math.random() * Math.PI * 2;
                    const offsetHeight = (Math.random() - 0.5) * 3;

                    const radius = 0.5 + Math.random() * 1.2; // 0.5 to 1.7
                    const x = center[0] + Math.cos(offsetAngle) * offsetRadius;
                    const y = center[1] + offsetHeight;
                    const z = center[2] + Math.sin(offsetAngle) * offsetRadius;

                    sphere = { x, y, z, radius };

                    // Check if sphere is within room bounds
                    if (Math.abs(x) > halfSize - radius ||
                        y < radius || y > roomHeight - radius ||
                        Math.abs(z) > halfSize - radius) {
                        attempts++;
                        continue;
                    }

                    // Check collision with existing spheres
                    validPosition = true;
                    for (const other of spheres) {
                        const dx = sphere.x - other.x;
                        const dy = sphere.y - other.y;
                        const dz = sphere.z - other.z;
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        const minDist = sphere.radius + other.radius + minDistance;

                        if (dist < minDist) {
                            validPosition = false;
                            break;
                        }
                    }

                    attempts++;
                }

                if (validPosition) {
                    spheres.push(sphere);
                }
            }
        }

        // Generate sphere geometry with noise and color variation
        const sphereSegments = 48;
        const sphereRings = 36;

        for (const sphere of spheres) {
            const baseVertexOffset = vertexOffset;

            // Generate sphere vertices with noise displacement
            for (let ring = 0; ring <= sphereRings; ring++) {
                const phi = (ring / sphereRings) * Math.PI;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                for (let seg = 0; seg <= sphereSegments; seg++) {
                    const theta = (seg / sphereSegments) * Math.PI * 2;
                    const sinTheta = Math.sin(theta);
                    const cosTheta = Math.cos(theta);

                    // Base normal
                    const nx = cosTheta * sinPhi;
                    const ny = cosPhi;
                    const nz = sinTheta * sinPhi;

                    // Apply multiple layers of noise for more organic, terrain-like displacement
                    const noiseScale1 = 2.0;
                    const noiseScale2 = 5.0;
                    const noiseScale3 = 10.0;

                    const noise1 = this.perlinNoise(
                        nx * noiseScale1 + sphere.x * 0.1,
                        ny * noiseScale1 + sphere.y * 0.1,
                        nz * noiseScale1 + sphere.z * 0.1,
                        3
                    );
                    const noise2 = this.perlinNoise(
                        nx * noiseScale2 + sphere.x * 0.2,
                        ny * noiseScale2 + sphere.y * 0.2,
                        nz * noiseScale2 + sphere.z * 0.2,
                        4
                    );
                    const noise3 = this.perlinNoise(
                        nx * noiseScale3,
                        ny * noiseScale3,
                        nz * noiseScale3,
                        2
                    );

                    // Combine multiple noise layers for complex terrain
                    const combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;

                    // More dramatic displacement (up to 60% of radius)
                    const displacement = (combinedNoise - 0.5) * sphere.radius * 0.6;
                    const displacedRadius = sphere.radius + displacement;

                    // Position with noise displacement
                    const px = sphere.x + nx * displacedRadius;
                    const py = sphere.y + ny * displacedRadius;
                    const pz = sphere.z + nz * displacedRadius;

                    // Calculate distance from sphere center for terrain-based coloring
                    const distFromCenter = displacedRadius / sphere.radius;

                    // Terrain-based coloring: Ocean (blue) → Land (brown/green) → Mountain (gray) → Snow (white)
                    let r, g, b;

                    if (distFromCenter < 0.75) {
                        // Deep ocean - dark blue
                        const t = distFromCenter / 0.75;
                        r = 0.1 + t * 0.15;
                        g = 0.2 + t * 0.25;
                        b = 0.4 + t * 0.2;
                    } else if (distFromCenter < 0.95) {
                        // Shallow water to shore - lighter blue to sandy brown
                        const t = (distFromCenter - 0.75) / 0.2;
                        const waterR = 0.25, waterG = 0.45, waterB = 0.6;
                        const sandR = 0.6, sandG = 0.5, sandB = 0.35;
                        r = waterR + (sandR - waterR) * t;
                        g = waterG + (sandG - waterG) * t;
                        b = waterB + (sandB - waterB) * t;
                    } else if (distFromCenter < 1.05) {
                        // Land - brown and green
                        const t = (distFromCenter - 0.95) / 0.1;
                        const sandR = 0.6, sandG = 0.5, sandB = 0.35;
                        const grassR = 0.35, grassG = 0.5, grassB = 0.3;
                        r = sandR + (grassR - sandR) * t;
                        g = sandG + (grassG - sandG) * t;
                        b = sandB + (grassB - sandB) * t;
                    } else if (distFromCenter < 1.2) {
                        // Forest to mountain - green to gray
                        const t = (distFromCenter - 1.05) / 0.15;
                        const grassR = 0.35, grassG = 0.5, grassB = 0.3;
                        const rockR = 0.45, rockG = 0.45, rockB = 0.48;
                        r = grassR + (rockR - grassR) * t;
                        g = grassG + (rockG - grassG) * t;
                        b = grassB + (rockB - grassB) * t;
                    } else if (distFromCenter < 1.35) {
                        // Mountain - gray
                        const t = (distFromCenter - 1.2) / 0.15;
                        const rockR = 0.45, rockG = 0.45, rockB = 0.48;
                        const snowR = 0.85, snowG = 0.85, snowB = 0.9;
                        r = rockR + (snowR - rockR) * t;
                        g = rockG + (snowG - rockG) * t;
                        b = rockB + (snowB - rockB) * t;
                    } else {
                        // Snow peak - white
                        const t = Math.min((distFromCenter - 1.35) / 0.15, 1.0);
                        r = 0.85 + t * 0.12;
                        g = 0.85 + t * 0.12;
                        b = 0.9 + t * 0.08;
                    }

                    // Add subtle noise variation to colors for more natural look
                    const colorNoise = noise3 * 0.08;
                    r = Math.max(0, Math.min(1, r + colorNoise));
                    g = Math.max(0, Math.min(1, g + colorNoise));

                    vertices.push(px, py, pz, nx, ny, nz, r, g);
                    vertexOffset++;
                }
            }

            // Generate sphere indices
            for (let ring = 0; ring < sphereRings; ring++) {
                for (let seg = 0; seg < sphereSegments; seg++) {
                    const current = baseVertexOffset + ring * (sphereSegments + 1) + seg;
                    const next = current + sphereSegments + 1;

                    indices.push(
                        current, next, current + 1,
                        current + 1, next, next + 1
                    );
                }
            }
        }
        
        this.vertexBuffer = this.device.createBuffer({
            size: vertices.length * 4,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(this.vertexBuffer, 0, new Float32Array(vertices));
        
        this.indexBuffer = this.device.createBuffer({
            size: indices.length * 4,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(this.indexBuffer, 0, new Uint32Array(indices));
        
        this.indexCount = indices.length;
    }
    
    createPipelines() {
        // Create shader modules
        const clusterBoundsModule = this.device.createShaderModule({ code: SHADERS.clusterBounds });
        const lightCullingModule = this.device.createShaderModule({ code: SHADERS.lightCulling });
        const resetCounterModule = this.device.createShaderModule({ code: SHADERS.resetCounter });
        const sceneVertexModule = this.device.createShaderModule({ code: SHADERS.sceneVertex });
        const sceneFragmentModule = this.device.createShaderModule({ code: SHADERS.sceneFragment });
        
        // Cluster bounds pipeline
        this.clusterBoundsPipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: { module: clusterBoundsModule, entryPoint: 'main' },
        });
        
        this.clusterBoundsBindGroup = this.device.createBindGroup({
            layout: this.clusterBoundsPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
                { binding: 1, resource: { buffer: this.clusterBoundsBuffer } },
            ],
        });
        
        // Reset counter pipeline
        this.resetCounterPipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: { module: resetCounterModule, entryPoint: 'main' },
        });
        
        this.resetCounterBindGroup = this.device.createBindGroup({
            layout: this.resetCounterPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.globalLightIndexCountBuffer } },
            ],
        });
        
        // Light culling pipeline
        this.lightCullingPipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: { module: lightCullingModule, entryPoint: 'main' },
        });
        
        this.lightCullingBindGroup = this.device.createBindGroup({
            layout: this.lightCullingPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
                { binding: 1, resource: { buffer: this.clusterBoundsBuffer } },
                { binding: 2, resource: { buffer: this.lightBuffer } },
                { binding: 3, resource: { buffer: this.lightUniformBuffer } },
                { binding: 4, resource: { buffer: this.lightGridBuffer } },
                { binding: 5, resource: { buffer: this.lightIndicesBuffer } },
                { binding: 6, resource: { buffer: this.globalLightIndexCountBuffer } },
            ],
        });
        
        // Scene render pipeline
        this.scenePipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: sceneVertexModule,
                entryPoint: 'main',
                buffers: [{
                    arrayStride: 32, // 3 pos + 3 normal + 2 uv
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: 'float32x3' },
                        { shaderLocation: 1, offset: 12, format: 'float32x3' },
                        { shaderLocation: 2, offset: 24, format: 'float32x2' },
                    ],
                }],
            },
            fragment: {
                module: sceneFragmentModule,
                entryPoint: 'main',
                targets: [{ format: this.format }],
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back',
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
        });
        
        this.sceneCameraBindGroup = this.device.createBindGroup({
            layout: this.scenePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
            ],
        });
        
        this.sceneBindGroup = this.device.createBindGroup({
            layout: this.scenePipeline.getBindGroupLayout(1),
            entries: [
                { binding: 0, resource: { buffer: this.sceneUniformBuffer } },
                { binding: 1, resource: { buffer: this.lightBuffer } },
                { binding: 2, resource: { buffer: this.lightGridBuffer } },
                { binding: 3, resource: { buffer: this.lightIndicesBuffer } },
            ],
        });
        
        // Light sprite pipeline
        const lightSpriteVertexModule = this.device.createShaderModule({ code: SHADERS.lightSpriteVertex });
        const lightSpriteFragmentModule = this.device.createShaderModule({ code: SHADERS.lightSpriteFragment });
        
        this.lightSpritePipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: lightSpriteVertexModule,
                entryPoint: 'main',
            },
            fragment: {
                module: lightSpriteFragmentModule,
                entryPoint: 'main',
                targets: [{
                    format: this.format,
                    blend: {
                        color: {
                            srcFactor: 'src-alpha',
                            dstFactor: 'one',
                            operation: 'add',
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one',
                            operation: 'add',
                        },
                    },
                }],
            },
            primitive: {
                topology: 'triangle-list',
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: false,
                depthCompare: 'less',
            },
        });
        
        this.lightSpriteBindGroup = this.device.createBindGroup({
            layout: this.lightSpritePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
                { binding: 1, resource: { buffer: this.lightBuffer } },
                { binding: 2, resource: { buffer: this.spriteUniformBuffer } },
            ],
        });
    }
    
    initLights() {
        this.lights = [];
        this.lightVelocities = [];
        
        const roomSize = 28;
        const roomHeight = 9;
        
        for (let i = 0; i < CONFIG.maxLights; i++) {
            // Random position in room
            const x = (Math.random() - 0.5) * roomSize;
            const y = Math.random() * roomHeight + 0.5;
            const z = (Math.random() - 0.5) * roomSize;
            
            // Pastel colors (closer to white, less saturated)
            const hue = Math.random();
            const saturation = 0.7 + Math.random() * 0.2; // 0.3-0.5 saturation for pastel
            const lightness = 0.6 + Math.random() * 0.15; // 0.75-0.9 lightness for brightness
            const r = this.hueToRGB(hue, saturation, lightness, 0);
            const g = this.hueToRGB(hue, saturation, lightness, 1);
            const b = this.hueToRGB(hue, saturation, lightness, 2);
            
            this.lights.push({
                position: [x, y, z],
                radius: this.settings.lightRadius,
                color: [r, g, b],
                intensity: this.settings.lightIntensity,
            });
            
            // Random velocity
            this.lightVelocities.push([
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 2,
            ]);
        }
    }
    
    hueToRGB(h, s, l, n) {
        const k = (n + h * 12) % 12;
        const a = s * Math.min(l, 1 - l);
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    }
    
    updateLights(dt) {
        const roomSize = 28;
        const roomHeight = 9;
        const halfSize = roomSize / 2;

        for (let i = 0; i < this.settings.lightCount; i++) {
            const light = this.lights[i];
            const vel = this.lightVelocities[i];

            // Update position with speed multiplier
            light.position[0] += vel[0] * dt * this.settings.spriteSpeed;
            light.position[1] += vel[1] * dt * this.settings.spriteSpeed;
            light.position[2] += vel[2] * dt * this.settings.spriteSpeed;
            
            // Bounce off walls
            if (light.position[0] < -halfSize || light.position[0] > halfSize) {
                vel[0] *= -1;
                light.position[0] = Math.max(-halfSize, Math.min(halfSize, light.position[0]));
            }
            if (light.position[1] < 0.5 || light.position[1] > roomHeight) {
                vel[1] *= -1;
                light.position[1] = Math.max(0.5, Math.min(roomHeight, light.position[1]));
            }
            if (light.position[2] < -halfSize || light.position[2] > halfSize) {
                vel[2] *= -1;
                light.position[2] = Math.max(-halfSize, Math.min(halfSize, light.position[2]));
            }
            
            // Update intensity and radius from settings
            light.intensity = this.settings.lightIntensity;
            light.radius = this.settings.lightRadius;
        }
        
        // Upload light data
        const lightData = new Float32Array(this.settings.lightCount * 8);
        for (let i = 0; i < this.settings.lightCount; i++) {
            const light = this.lights[i];
            lightData[i * 8 + 0] = light.position[0];
            lightData[i * 8 + 1] = light.position[1];
            lightData[i * 8 + 2] = light.position[2];
            lightData[i * 8 + 3] = light.radius;
            lightData[i * 8 + 4] = light.color[0];
            lightData[i * 8 + 5] = light.color[1];
            lightData[i * 8 + 6] = light.color[2];
            lightData[i * 8 + 7] = light.intensity;
        }
        this.device.queue.writeBuffer(this.lightBuffer, 0, lightData);
        
        // Update light uniform
        this.device.queue.writeBuffer(this.lightUniformBuffer, 0, new Uint32Array([this.settings.lightCount]));
        
        // Update sprite uniform
        const spriteData = new ArrayBuffer(16);
        const spriteDataU32 = new Uint32Array(spriteData);
        const spriteDataF32 = new Float32Array(spriteData);
        spriteDataU32[0] = this.settings.lightCount;
        spriteDataF32[1] = this.settings.spriteSize;
        spriteDataF32[2] = this.settings.spriteGlow;
        this.device.queue.writeBuffer(this.spriteUniformBuffer, 0, new Uint8Array(spriteData));
    }
    
    updateCamera() {
        const moveSpeed = 0.15;

        // Calculate forward and right vectors based on camera yaw (horizontal rotation)
        const yaw = this.camera.rotation[1]; // Horizontal rotation
        const yawCos = Math.cos(yaw);
        const yawSin = Math.sin(yaw);

        // Forward vector (in XZ plane, Y=0 for horizontal movement)
        const forward = [yawSin, 0, yawCos];
        // Right vector (perpendicular to forward in XZ plane)
        const right = [yawCos, 0, -yawSin];

        // Calculate movement based on WASD/Arrow keys
        let moveForward = 0;
        let moveRight = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveForward -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveForward += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveRight -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveRight += 1;

        // Apply movement relative to camera direction
        this.camera.position[0] += (forward[0] * moveForward + right[0] * moveRight) * moveSpeed;
        this.camera.position[2] += (forward[2] * moveForward + right[2] * moveRight) * moveSpeed;

        // Space: Move up
        if (this.keys['Space']) {
            this.camera.position[1] += moveSpeed;
        }
        // Shift: Move down
        if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
            this.camera.position[1] -= moveSpeed;
        }

        // Clamp camera height
        this.camera.position[1] = Math.max(0.5, Math.min(9.5, this.camera.position[1]));
        
        // Build matrices
        const aspect = this.canvas.width / this.canvas.height;
        const projMatrix = this.perspectiveMatrix(this.camera.fov, aspect, CONFIG.nearPlane, CONFIG.farPlane);
        const viewMatrix = this.viewMatrix(this.camera.position, this.camera.rotation);
        const invProjMatrix = this.invertMatrix(projMatrix);
        
        // Upload camera uniforms
        const cameraData = new Float32Array(64);
        cameraData.set(viewMatrix, 0);
        cameraData.set(projMatrix, 16);
        cameraData.set(invProjMatrix, 32);
        cameraData[48] = this.canvas.width;
        cameraData[49] = this.canvas.height;
        cameraData[50] = CONFIG.nearPlane;
        cameraData[51] = CONFIG.farPlane;
        
        const cameraDataU32 = new Uint32Array(cameraData.buffer);
        cameraDataU32[52] = CONFIG.clusterCountX;
        cameraDataU32[53] = CONFIG.clusterCountY;
        cameraDataU32[54] = CONFIG.clusterCountZ;
        
        this.device.queue.writeBuffer(this.cameraUniformBuffer, 0, cameraData);
        
        // Update scene uniforms
        const sceneData = new Float32Array(8);
        sceneData[0] = this.camera.position[0];
        sceneData[1] = this.camera.position[1];
        sceneData[2] = this.camera.position[2];
        sceneData[3] = performance.now() / 1000;
        
        const sceneDataU32 = new Uint32Array(sceneData.buffer);
        sceneDataU32[4] = this.settings.debugMode;
        sceneDataU32[5] = this.settings.useClustered ? 1 : 0;
        sceneDataU32[6] = this.settings.lightCount;
        
        this.device.queue.writeBuffer(this.sceneUniformBuffer, 0, sceneData);
    }
    
    perspectiveMatrix(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const rangeInv = 1 / (near - far);
        
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, far * rangeInv, -1,
            0, 0, near * far * rangeInv, 0
        ]);
    }
    
    viewMatrix(position, rotation) {
        const cx = Math.cos(rotation[0]);
        const sx = Math.sin(rotation[0]);
        const cy = Math.cos(rotation[1]);
        const sy = Math.sin(rotation[1]);
        
        const rotX = [
            1, 0, 0, 0,
            0, cx, sx, 0,
            0, -sx, cx, 0,
            0, 0, 0, 1
        ];
        
        const rotY = [
            cy, 0, -sy, 0,
            0, 1, 0, 0,
            sy, 0, cy, 0,
            0, 0, 0, 1
        ];
        
        const trans = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -position[0], -position[1], -position[2], 1
        ];
        
        // view = rotX * rotY * trans
        const temp = this.multiplyMatrices(rotY, trans);
        return new Float32Array(this.multiplyMatrices(rotX, temp));
    }
    
    multiplyMatrices(a, b) {
        const result = new Array(16).fill(0);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 4; k++) {
                    result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
                }
            }
        }
        return result;
    }
    
    invertMatrix(m) {
        const inv = new Float32Array(16);
        
        inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
        inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
        inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
        inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
        
        inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
        inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
        inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
        inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
        
        inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
        inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
        inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
        inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
        
        inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
        inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
        inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
        inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];
        
        let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
        if (det === 0) return inv;
        
        det = 1.0 / det;
        for (let i = 0; i < 16; i++) {
            inv[i] *= det;
        }
        
        return inv;
    }
    
    setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse - Click and drag to rotate
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            e.preventDefault();
        });

        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.mouseDown) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;

                const sensitivity = 0.005;
                this.camera.rotation[1] += deltaX * sensitivity;
                this.camera.rotation[0] += deltaY * sensitivity;
                this.camera.rotation[0] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation[0]));

                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        // Mouse wheel for zoom (adjust FOV, same as W/S keys)
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const fovSpeed = 0.001;
            const minFov = 5 * Math.PI / 180;
            const maxFov = 130 * Math.PI / 180;

            // Scroll up (negative deltaY) = zoom in = decrease FOV
            this.camera.fov -= e.deltaY * fovSpeed;
            this.camera.fov = Math.max(minFov, Math.min(maxFov, this.camera.fov));
        }, { passive: false });
        
        // Resize
        window.addEventListener('resize', () => this.resize());
        
        // UI Controls
        const lightSlider = document.getElementById('light-slider');
        lightSlider.addEventListener('input', (e) => {
            this.settings.lightCount = parseInt(e.target.value);
            document.getElementById('light-slider-value').textContent = this.settings.lightCount;
            document.getElementById('light-count').textContent = this.settings.lightCount;
        });
        
        const intensitySlider = document.getElementById('intensity-slider');
        intensitySlider.addEventListener('input', (e) => {
            this.settings.lightIntensity = parseFloat(e.target.value);
            document.getElementById('intensity-slider-value').textContent = this.settings.lightIntensity.toFixed(1);
        });
        
        const radiusSlider = document.getElementById('radius-slider');
        radiusSlider.addEventListener('input', (e) => {
            this.settings.lightRadius = parseFloat(e.target.value);
            document.getElementById('radius-slider-value').textContent = this.settings.lightRadius.toFixed(1);
        });
        
        // Sprite size slider
        const spriteSizeSlider = document.getElementById('sprite-size-slider');
        spriteSizeSlider.addEventListener('input', (e) => {
            this.settings.spriteSize = parseFloat(e.target.value);
            document.getElementById('sprite-size-value').textContent = this.settings.spriteSize.toFixed(1);
        });

        // Sprite speed slider
        const spriteSpeedSlider = document.getElementById('sprite-speed-slider');
        spriteSpeedSlider.addEventListener('input', (e) => {
            this.settings.spriteSpeed = parseFloat(e.target.value);
            document.getElementById('sprite-speed-value').textContent = this.settings.spriteSpeed.toFixed(1);
        });

        // Sprite glow slider
        const spriteGlowSlider = document.getElementById('sprite-glow-slider');
        spriteGlowSlider.addEventListener('input', (e) => {
            this.settings.spriteGlow = parseFloat(e.target.value);
            document.getElementById('sprite-glow-value').textContent = this.settings.spriteGlow.toFixed(1);
        });

        // Light sprites toggle
        document.getElementById('btn-sprites-on').addEventListener('click', () => {
            this.settings.renderLightSprites = true;
            document.getElementById('btn-sprites-on').classList.add('active');
            document.getElementById('btn-sprites-off').classList.remove('active');
        });
        
        document.getElementById('btn-sprites-off').addEventListener('click', () => {
            this.settings.renderLightSprites = false;
            document.getElementById('btn-sprites-off').classList.add('active');
            document.getElementById('btn-sprites-on').classList.remove('active');
        });
        
        // Mode toggles
        document.getElementById('btn-clustered').addEventListener('click', (e) => {
            this.settings.useClustered = true;
            document.getElementById('btn-clustered').classList.add('active');
            document.getElementById('btn-naive').classList.remove('active');
        });
        
        document.getElementById('btn-naive').addEventListener('click', (e) => {
            this.settings.useClustered = false;
            document.getElementById('btn-naive').classList.add('active');
            document.getElementById('btn-clustered').classList.remove('active');
        });
        
        // Debug toggles
        const setDebugMode = (mode) => {
            this.settings.debugMode = mode;
            document.getElementById('btn-normal').classList.toggle('active', mode === 0);
            document.getElementById('btn-clusters').classList.toggle('active', mode === 1);
            document.getElementById('btn-heat').classList.toggle('active', mode === 2);
        };
        
        document.getElementById('btn-normal').addEventListener('click', () => setDebugMode(0));
        document.getElementById('btn-clusters').addEventListener('click', () => setDebugMode(1));
        document.getElementById('btn-heat').addEventListener('click', () => setDebugMode(2));
    }
    
    updateStats() {
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastFpsTime;
        
        if (elapsed >= 500) {
            this.fps = Math.round(this.frameCount / (elapsed / 1000));
            this.frameTime = (elapsed / this.frameCount).toFixed(2);
            this.frameCount = 0;
            this.lastFpsTime = now;
            
            document.getElementById('fps-display').textContent = this.fps;
            document.getElementById('frame-time').textContent = this.frameTime + 'ms';
        }
    }
    
    render = () => {
        const startTime = performance.now();
        const dt = Math.min((startTime - (this.lastFrameTime || startTime)) / 1000, 0.1);
        this.lastFrameTime = startTime;
        
        // Update
        this.updateLights(dt);
        this.updateCamera();
        
        // Get current texture
        const textureView = this.context.getCurrentTexture().createView();
        
        const commandEncoder = this.device.createCommandEncoder();
        
        // Compute passes
        const computePass = commandEncoder.beginComputePass();
        
        // 1. Reset global counter
        computePass.setPipeline(this.resetCounterPipeline);
        computePass.setBindGroup(0, this.resetCounterBindGroup);
        computePass.dispatchWorkgroups(1);
        
        // 2. Compute cluster bounds
        computePass.setPipeline(this.clusterBoundsPipeline);
        computePass.setBindGroup(0, this.clusterBoundsBindGroup);
        computePass.dispatchWorkgroups(
            Math.ceil(CONFIG.clusterCountX / 8),
            Math.ceil(CONFIG.clusterCountY / 8),
            CONFIG.clusterCountZ
        );
        
        // 3. Light culling
        computePass.setPipeline(this.lightCullingPipeline);
        computePass.setBindGroup(0, this.lightCullingBindGroup);
        computePass.dispatchWorkgroups(
            Math.ceil(CONFIG.clusterCountX / 8),
            Math.ceil(CONFIG.clusterCountY / 8),
            CONFIG.clusterCountZ
        );
        
        computePass.end();
        
        // Render pass
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.02, g: 0.02, b: 0.04, a: 1 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        });
        
        renderPass.setPipeline(this.scenePipeline);
        renderPass.setBindGroup(0, this.sceneCameraBindGroup);
        renderPass.setBindGroup(1, this.sceneBindGroup);
        renderPass.setVertexBuffer(0, this.vertexBuffer);
        renderPass.setIndexBuffer(this.indexBuffer, 'uint32');
        renderPass.drawIndexed(this.indexCount);
        
        // Render light sprites
        if (this.settings.renderLightSprites) {
            renderPass.setPipeline(this.lightSpritePipeline);
            renderPass.setBindGroup(0, this.lightSpriteBindGroup);
            // 6 vertices per quad (2 triangles), instanced for each light
            renderPass.draw(6, this.settings.lightCount);
        }
        
        renderPass.end();
        
        this.device.queue.submit([commandEncoder.finish()]);
        
        this.updateStats();
        requestAnimationFrame(this.render);
    }
}

// Start the application
new ClusteredShadingApp();