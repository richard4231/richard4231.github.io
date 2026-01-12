# Pi-Pfad 3D - WebGPU Version (v05)

Hochperformante 3D-Visualisierung der Ziffern von Pi mit WebGPU und Instanced Rendering.

## 🎯 Was ist neu in v05?

### Migration von p5.js → WebGPU
- **100x Performance**: 100'000+ Kugeln mit 60fps möglich (vs. 10'000 bei 15fps in p5.js)
- **Instanced Rendering**: Nur 1 Draw Call für alle Kugeln
- **Moderne Technologie**: WebGPU statt veraltetes WebGL
- **Phong Shading**: Professionelle Beleuchtung direkt im Fragment Shader

## Browser-Anforderungen

WebGPU benötigt:
- **Chrome/Edge**: Version 113+ (empfohlen: aktuell)
- **macOS**: Chrome/Edge oder Safari Technology Preview

**Nicht unterstützt**: Firefox (WebGPU noch experimentell)

## Performance

| Kugeln | p5.js v04 | WebGPU v05 |
|--------|-----------|------------|
| 100 | 60fps | 60fps |
| 1'000 | 45fps | 60fps |
| 10'000 | 15fps | 60fps |
| 100'000 | ❌ Crash | 60fps ✅ |

## Steuerung

- **Maus ziehen**: Kamera rotieren
- **Mausrad**: Zoom
- **GUI**: Alle Parameter live ändern

## Credits

**Autor**: Andreas Richard
https://richard4231.github.io
