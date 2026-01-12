// Pi-Pfad Shaders - WebGPU WGSL

struct Uniforms {
    viewProjection: mat4x4f,  // 64 bytes (Offset 0)
    modelOffset: vec3f,       // 12 bytes (Offset 64)
    time: f32,                // 4 bytes  (Offset 76) - für Disco-Effekt
    transparency: f32,        // 4 bytes  (Offset 80)
    lightIntensity: f32,      // 4 bytes  (Offset 84) - Lichtstärke
    glowIntensity: f32,       // 4 bytes  (Offset 88) - Glow-Stärke
    discoMode: f32,           // 4 bytes  (Offset 92) - 1.0 = aktiv, 0.0 = inaktiv
    // Total: 96 bytes, aber Pipeline erwartet 112
    // Füge weitere 16 bytes Padding hinzu
    _padding4: vec4f,         // 16 bytes (Offset 96)
}

struct InstanceInput {
    @location(2) position: vec3f,
    @location(3) radius: f32,
    @location(4) color: vec4f,
}

struct VertexInput {
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
}

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) worldPos: vec3f,
    @location(1) normal: vec3f,
    @location(2) color: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(
    vert: VertexInput,
    inst: InstanceInput
) -> VertexOutput {
    var output: VertexOutput;

    // Scale vertex by instance radius
    let scaledPos = vert.position * inst.radius;

    // Translate to instance position + model offset
    let worldPos = scaledPos + inst.position + uniforms.modelOffset;

    // Transform to clip space
    output.position = uniforms.viewProjection * vec4f(worldPos, 1.0);
    output.worldPos = worldPos;
    output.normal = vert.normal; // Already normalized for sphere
    output.color = inst.color;
    output.color.a *= uniforms.transparency;

    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    // Drei Lichtquellen mit Phong shading
    let light1Dir = normalize(vec3f(-1.0, 1.0, 1.0));   // Hauptlicht (oben links vorne)
    let light2Dir = normalize(vec3f(1.0, -0.5, 0.8));   // Fülllicht (oben rechts vorne)
    let light3Dir = normalize(vec3f(0.0, 0.5, -1.0));   // Gegenlicht (unten hinten)

    let viewDir = normalize(vec3f(0.0, 0.0, 1.0)); // Simplified
    let normal = normalize(input.normal);

    // Disco-Effekt: Farbe animieren basierend auf Zeit und Position
    var baseColor = input.color.rgb;
    if (uniforms.discoMode > 0.5) {
        let timePhase = uniforms.time * 0.001;  // Langsame Animation
        let posPhase = (input.worldPos.x + input.worldPos.y + input.worldPos.z) * 0.01;
        let wave = sin(timePhase + posPhase) * 0.5 + 0.5;

        // HSV-Rotation simulieren
        let hueShift = fract(timePhase * 0.1 + posPhase * 0.05);
        baseColor = rotateHue(baseColor, hueShift);

        // Pulsieren
        baseColor *= 0.7 + wave * 0.6;
    }

    // Lichtstärke aus Uniforms
    let intensity = uniforms.lightIntensity;

    // Ambient (nur einmal, nicht pro Licht)
    let ambient = vec3f(0.08 + 0.08 * intensity);

    // Licht 1: Hauptlicht (100% Intensität)
    let diff1 = max(dot(normal, light1Dir), 0.0);
    let diffuse1 = diff1 * intensity * vec3f(1.0);

    let halfDir1 = normalize(light1Dir + viewDir);
    let spec1 = pow(max(dot(normal, halfDir1), 0.0), 32.0);
    let specular1 = spec1 * intensity * vec3f(0.3);

    // Licht 2: Fülllicht (60% Intensität, leicht wärmer)
    let diff2 = max(dot(normal, light2Dir), 0.0);
    let diffuse2 = diff2 * intensity * 0.6 * vec3f(1.0, 0.95, 0.9);

    let halfDir2 = normalize(light2Dir + viewDir);
    let spec2 = pow(max(dot(normal, halfDir2), 0.0), 32.0);
    let specular2 = spec2 * intensity * 0.6 * vec3f(0.2);

    // Licht 3: Gegenlicht (40% Intensität, leicht kühler)
    let diff3 = max(dot(normal, light3Dir), 0.0);
    let diffuse3 = diff3 * intensity * 0.4 * vec3f(0.9, 0.95, 1.0);

    let halfDir3 = normalize(light3Dir + viewDir);
    let spec3 = pow(max(dot(normal, halfDir3), 0.0), 32.0);
    let specular3 = spec3 * intensity * 0.4 * vec3f(0.15);

    // Alle Lichtquellen kombinieren
    let lighting = ambient +
                   (diffuse1 + specular1) +
                   (diffuse2 + specular2) +
                   (diffuse3 + specular3);

    var finalColor = baseColor * lighting;

    // Glow-Effekt: Additive Aufhellung basierend auf Intensität
    if (uniforms.glowIntensity > 0.01) {
        let glowAmount = uniforms.glowIntensity;
        let rimLightRaw = 1.0 - abs(dot(normal, viewDir));
        let rimLight = pow(rimLightRaw, 3.0);
        finalColor += baseColor * rimLight * glowAmount * 0.8;
    }

    return vec4f(finalColor, input.color.a);
}

// Hilfsfunktion: Hue Rotation für Disco-Effekt
fn rotateHue(color: vec3f, shift: f32) -> vec3f {
    // RGB zu HSV
    let maxC = max(max(color.r, color.g), color.b);
    let minC = min(min(color.r, color.g), color.b);
    let delta = maxC - minC;

    if (delta < 0.00001) {
        return color;  // Graustufen
    }

    var h: f32;
    if (maxC == color.r) {
        h = ((color.g - color.b) / delta) / 6.0;
    } else if (maxC == color.g) {
        h = (2.0 + (color.b - color.r) / delta) / 6.0;
    } else {
        h = (4.0 + (color.r - color.g) / delta) / 6.0;
    }
    h = fract(h + shift);

    let s = delta / maxC;
    let v = maxC;

    // HSV zu RGB
    let hh = h * 6.0;
    let i = floor(hh);
    let f = hh - i;
    let p = v * (1.0 - s);
    let q = v * (1.0 - s * f);
    let t = v * (1.0 - s * (1.0 - f));

    if (i < 1.0) {
        return vec3f(v, t, p);
    } else if (i < 2.0) {
        return vec3f(q, v, p);
    } else if (i < 3.0) {
        return vec3f(p, v, t);
    } else if (i < 4.0) {
        return vec3f(p, q, v);
    } else if (i < 5.0) {
        return vec3f(t, p, v);
    } else {
        return vec3f(v, p, q);
    }
}
