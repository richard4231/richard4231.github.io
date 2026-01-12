// Geometry utilities for sphere generation

export function createIcosphere(subdivisions = 2) {
    // Icosahedron base vertices (12 vertices)
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;

    let vertices = [
        [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
        [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
        [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];

    // Normalize
    vertices = vertices.map(v => normalize(v));

    // Icosahedron faces (20 triangles)
    let indices = [
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
        1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
        3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
        4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
    ];

    // Subdivide
    for (let i = 0; i < subdivisions; i++) {
        const newIndices = [];
        const midpointCache = new Map();

        for (let j = 0; j < indices.length; j += 3) {
            const v1 = indices[j];
            const v2 = indices[j + 1];
            const v3 = indices[j + 2];

            const a = getMidpoint(v1, v2, vertices, midpointCache);
            const b = getMidpoint(v2, v3, vertices, midpointCache);
            const c = getMidpoint(v3, v1, vertices, midpointCache);

            newIndices.push(v1, a, c);
            newIndices.push(v2, b, a);
            newIndices.push(v3, c, b);
            newIndices.push(a, b, c);
        }

        indices = newIndices;
    }

    // Convert to flat arrays
    const positions = new Float32Array(vertices.length * 3);
    const normals = new Float32Array(vertices.length * 3);

    for (let i = 0; i < vertices.length; i++) {
        positions[i * 3] = vertices[i][0];
        positions[i * 3 + 1] = vertices[i][1];
        positions[i * 3 + 2] = vertices[i][2];

        // For sphere, normals = normalized positions
        normals[i * 3] = vertices[i][0];
        normals[i * 3 + 1] = vertices[i][1];
        normals[i * 3 + 2] = vertices[i][2];
    }

    return {
        positions,
        normals,
        indices: new Uint32Array(indices),
        vertexCount: vertices.length,
        indexCount: indices.length
    };
}

function getMidpoint(i1, i2, vertices, cache) {
    const key = i1 < i2 ? `${i1}-${i2}` : `${i2}-${i1}`;

    if (cache.has(key)) {
        return cache.get(key);
    }

    const v1 = vertices[i1];
    const v2 = vertices[i2];
    const mid = normalize([
        (v1[0] + v2[0]) / 2,
        (v1[1] + v2[1]) / 2,
        (v1[2] + v2[2]) / 2
    ]);

    const index = vertices.length;
    vertices.push(mid);
    cache.set(key, index);

    return index;
}

function normalize(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
}

// Generate instance data from Pi digits
export function generateInstanceData(piDigits, numInstances, scale, overlapFactor, directions, colorScheme = 'rainbow') {
    const instanceData = new Float32Array(numInstances * 8); // position(3) + radius(1) + color(4)

    let x = 0, y = 0, z = 0;

    for (let i = 0; i < numInstances; i++) {
        const digit = parseInt(piDigits[i]);
        const nextDigit = parseInt(piDigits[i + 1]) || 0;

        const currentRadius = digit * scale / 2;
        const nextRadius = nextDigit * scale / 2;
        const distance = (currentRadius + nextRadius) * overlapFactor;

        // Direction modification (wie in p5.js Version)
        const changedir = Math.floor(i / 100) % 10;
        const modifiedDigit = (digit + changedir) % 10;
        const dir = directions[modifiedDigit];

        // Instance data: [x, y, z, radius, r, g, b, a]
        const offset = i * 8;
        instanceData[offset] = x;
        instanceData[offset + 1] = y;
        instanceData[offset + 2] = z;
        instanceData[offset + 3] = currentRadius;

        // Color basierend auf gewähltem Schema
        let rgb;
        const progress = i / numInstances;  // 0 bis 1
        const radiusNorm = digit / 9;       // 0 bis 1 (normalisierter Radius)

        switch(colorScheme) {
            case 'rainbow':
                // Original: Regenbogen über die Länge
                const hue = (200 / numInstances * i) % 360;
                rgb = hslToRgb(hue / 360, 1.0, 0.5);
                break;

            case 'fade':
                // Dunkler je länger die Kette - Gradient von Rot zu Gelb
                const brightness = 1.0 - progress * 0.7;  // 1.0 → 0.3
                const fadeHue = 0 + progress * 60;  // 0° (Rot) → 60° (Gelb)
                rgb = hslToRgb(fadeHue / 360, 0.9, 0.5 * brightness);
                break;

            case 'size':
                // Size matters - Kleine Kugeln gesättigt, grosse Kugeln blasser
                // Kohärenter Blau-Türkis Bereich (180° - 200°)
                const sizeHue = 180 + (i * 13) % 20;  // Enger Bereich um Cyan/Türkis
                const saturation = 1.0 - radiusNorm * 0.6;  // 1.0 → 0.4 (kleine → grosse)
                const lightness = 0.4 + radiusNorm * 0.2;   // 0.4 → 0.6
                rgb = hslToRgb(sizeHue / 360, saturation, lightness);
                break;

            case 'glow':
                // Leuchtende Farben für Glow-Effekt
                const glowHue = (i * 137.5) % 360;
                rgb = hslToRgb(glowHue / 360, 1.0, 0.6);
                break;

            case 'disco':
                // Basis-Farbe: Regenbogen-Gradient (wird im Shader animiert/rotiert)
                const discoHue = (200 / numInstances * i) % 360;
                rgb = hslToRgb(discoHue / 360, 1.0, 0.5);
                break;

            default:
                rgb = [1.0, 1.0, 1.0];
        }

        instanceData[offset + 4] = rgb[0];
        instanceData[offset + 5] = rgb[1];
        instanceData[offset + 6] = rgb[2];
        instanceData[offset + 7] = 1.0; // alpha

        // Update position for next sphere
        x += dir[0] * distance;
        y += dir[1] * distance;
        z += dir[2] * distance;
    }

    return instanceData;
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
}
