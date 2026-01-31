// Color definitions
const COLORS = {
  blue: '#8AC7E4',
  green: '#C5CE70',
  yellow: '#FFEC76',
  white: '#FFFFFF'
};

// Konstante Linienstärke für alle Elemente
//const STROKE_WIDTH = 0.5; //wird im css definiert und überschreibt diesen Wert
const STROKE = "#888";

// Figure definitions
const figures = [
  {
    id: 'grid',
    name: 'Figur 1',
    svgContent: createFigure1svg,
  },
  {
    id: 'grid2',
    name: 'Figur 1a',
    svgContent: createFigure1asvg,
  },
  {
    id: 'grid1b',
    name: 'Figur 1b',
    svgContent: createFigure1bsvg,
  },
  {
    id: 'diagonal-square',
    name: 'Figur 2',
    svgContent: createFigure2Svg,
  },
  {
    id: 'horizontal-diagonal',
    name: 'Figur 3',
    svgContent: createFigure3Svg, 
  },
  {
    id: 'triangle',
    name: 'Figur 4',
    svgContent: createFigure4Svg, 
  },
  {
    id: 'star',
    name: 'Figur 5',
    svgContent: createFigure5Svg,
  },
  {
    id: 'circle-quarters',
    name: 'Figur 6',
    svgContent: createFigure6svg, 
  },
  {
    id: 'circle-segments',
    name: 'Figur 7',
    svgContent: createFigure7svg,
  },
  {
    id: 'circle-grid',
    name: 'Figur 8',
    svgContent: createFigure8svg, 
  },
  {
    id: 'rectangle-diagonal',
    name: 'Figur 9',
    svgContent: createFigure9Svg,
  },
  {
    id: 'octagon',
    name: 'Figur 10',
    svgContent: createFigure10Svg,  
  },
  {
    id: 'figure11',
    name: 'Figur 11',
    svgContent: createFigure11Svg,
  },
  {
    id: 'figure12',
    name: 'Figur 12',
    svgContent: createFigure12Svg,
  }
];

// SVG Creation Functions 
function createFigure1svg() { 
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");
  
  // Quadrate zeichnen
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", j * 25);
      rect.setAttribute("y", i * 25);
      rect.setAttribute("width", 25);
      rect.setAttribute("height", 25);
      rect.setAttribute("fill", COLORS.white);
      rect.setAttribute("stroke", STROKE);
      rect.setAttribute("class", "segment");
      rect.setAttribute("data-area", "1");
      svg.appendChild(rect);
    }
  }
  
  return svg;
}

// SVG Creation Functions
function createFigure1asvg() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");

  const segments = 8;
  // Innere Quadrate darüber zeichnen
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", j * 100 / segments);
      rect.setAttribute("y", i * 100 / segments);
      rect.setAttribute("width", 100 / segments);
      rect.setAttribute("height", 100 / segments);
      rect.setAttribute("fill", COLORS.white);
      rect.setAttribute("stroke", STROKE);
      rect.setAttribute("class", "segment");
      rect.setAttribute("data-area", "1");
      svg.appendChild(rect);
    }
  }

  return svg;
}

function createFigure1bsvg() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");

  // 1. Ecken: 10x10 Quadrate (4 Ecken)
  const corners = [
    { startX: 0, endX: 40, startY: 0, endY: 40 },     // Oben links
    { startX: 60, endX: 100, startY: 0, endY: 40 },   // Oben rechts
    { startX: 0, endX: 40, startY: 60, endY: 100 },   // Unten links
    { startX: 60, endX: 100, startY: 60, endY: 100 }  // Unten rechts
  ];

  corners.forEach(corner => {
    for (let i = corner.startY; i < corner.endY; i += 10) {
      for (let j = corner.startX; j < corner.endX; j += 10) {
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", j);
        rect.setAttribute("y", i);
        rect.setAttribute("width", 10);
        rect.setAttribute("height", 10);
        rect.setAttribute("fill", COLORS.white);
        rect.setAttribute("stroke", STROKE);
        rect.setAttribute("class", "segment");
        rect.setAttribute("data-area", "4"); // 10x10 = 100, 100/25 = 4
        svg.appendChild(rect);
      }
    }
  });

  // 2. Horizontale Streifen: 10x5 Rechtecke (links und rechts)
  const hStrips = [
    { startX: 0, endX: 40 },    // Links
    { startX: 60, endX: 100 }   // Rechts
  ];
  const yPositions = [40, 45, 50, 55];

  hStrips.forEach(strip => {
    for (let i = 0; i < yPositions.length; i++) {
      for (let j = strip.startX; j < strip.endX; j += 10) {
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", j);
        rect.setAttribute("y", yPositions[i]);
        rect.setAttribute("width", 10);
        rect.setAttribute("height", 5);
        rect.setAttribute("fill", COLORS.white);
        rect.setAttribute("stroke", STROKE);
        rect.setAttribute("class", "segment");
        rect.setAttribute("data-area", "2"); // 10x5 = 50, 50/25 = 2
        svg.appendChild(rect);
      }
    }
  });

  // 3. Vertikale Streifen: 5x10 Rechtecke (oben und unten)
  const vStrips = [
    { startY: 0, endY: 40 },    // Oben
    { startY: 60, endY: 100 }   // Unten
  ];
  const xPositions = [40, 45, 50, 55];

  vStrips.forEach(strip => {
    for (let i = 0; i < xPositions.length; i++) {
      for (let j = strip.startY; j < strip.endY; j += 10) {
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", xPositions[i]);
        rect.setAttribute("y", j);
        rect.setAttribute("width", 5);
        rect.setAttribute("height", 10);
        rect.setAttribute("fill", COLORS.white);
        rect.setAttribute("stroke", STROKE);
        rect.setAttribute("class", "segment");
        rect.setAttribute("data-area", "2"); // 5x10 = 50, 50/25 = 2
        svg.appendChild(rect);
      }
    }
  });

  // 4. Mitte: 5x5 Quadrate (4x4 Raster)
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", 40 + j * 5);
      rect.setAttribute("y", 40 + i * 5);
      rect.setAttribute("width", 5);
      rect.setAttribute("height", 5);
      rect.setAttribute("fill", COLORS.white);
      rect.setAttribute("stroke", STROKE);
      rect.setAttribute("class", "segment");
      rect.setAttribute("data-area", "1"); // 5x5 = 25, 25/25 = 1 (Basiseinheit)
      svg.appendChild(rect);
    }
  }

  return svg;
}

function createFigure2Svg() { 
  // Quadrat mit Diagonalen
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");
  
  // Äußeres Rechteck mit weißer Füllung und Rand
  let outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  outline.setAttribute("x", 0);
  outline.setAttribute("y", 0);
  outline.setAttribute("width", 100);
  outline.setAttribute("height", 100);
  outline.setAttribute("fill", "#ffffff");
  svg.appendChild(outline);
  
  // Diagonal lines
  let diag1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  diag1.setAttribute("x1", 0);
  diag1.setAttribute("y1", 0);
  diag1.setAttribute("x2", 100);
  diag1.setAttribute("y2", 100);
  svg.appendChild(diag1);
  
  let diag2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  diag2.setAttribute("x1", 100);
  diag2.setAttribute("y1", 0);
  diag2.setAttribute("x2", 0);
  diag2.setAttribute("y2", 100);
  svg.appendChild(diag2);
  
  // Horizontal middle line
  let hLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  hLine.setAttribute("x1", 0);
  hLine.setAttribute("y1", 50);
  hLine.setAttribute("x2", 100);
  hLine.setAttribute("y2", 50);
  svg.appendChild(hLine);
  
  // Create the triangular segments
  const points = [
    "0,0 50,50 0,50", // Top left
    "0,0 100,0 50,50", // Top
    "50,50 100,50 100,0", // Top right 
    "100,50 100,100 50,50", // Bottom right
    "0,100 50,50 100,100", // Bottom
    "50,50 0,50 0,100" // Bottom left
  ];
  
  // Areas should reflect their relative size
  const areas = [0.125, 0.25, 0.125, 0.125, 0.25, 0.125];
  
  for (let i = 0; i < points.length; i++) {
    let poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", points[i]);
    poly.setAttribute("fill", COLORS.white);
    poly.setAttribute("stroke", STROKE);
    poly.setAttribute("class", "segment");
    poly.setAttribute("data-area", areas[i]);
    svg.appendChild(poly);
  }
  
  return svg;
}

function createFigure3Svg() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");

  // Create regions //Dies Flächen werden überlagert und sind für die überprüfung der Summen benötigt.
  const regions = [
    // Top row
    { points: "0,0 100,0 75,25 0,25", area: 7/32 },
    { points: "100,0 100,25 75,25", area: 1/32 },
    
    // Second row
    { points: "0,25 75,25 50,50 0,50", area: 5/32 },
    { points: "75,25 100,25 100,50 50,50", area: 3/32 },
    
    // Third row
    { points: "0,50 50,50 25,75 0,75", area: 3/32 },
    { points: "50,50 50,75 25,75", area: 1/32 },
    { points: "50,50 100,50 100,75 50,75", area: 4/32 },
    
    // Fourth row
    { points: "0,75 25,75 0,100", area: 1/32 },
    { points: "25,75 50,75 50,100 0,100", area: 3/32 },
    { points: "50,75 100,75 100,100 50,100", area: 4/32 }
  ];
  
  regions.forEach((region, index) => {
    let poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", region.points);
    poly.setAttribute("fill", COLORS.white);
    poly.setAttribute("stroke", STROKE);
    poly.setAttribute("class", "segment");
    poly.setAttribute("data-area", region.area);
    svg.appendChild(poly);
  });
  
  return svg;
}

function createFigure4Svg() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-10 -10 120 120");

  // Segments
  const segments = [
    { points: "50,0 21.1,50 78.9,50", area: 1 },  // Top triangle
    { points: "-7.8,100 50,100 21.1,50", area: 1 }, // Bottom left
    { points: "21.1,50 50,100 78.9,50", area: 1 }, // Center
    { points: "78.9,50 50,100 78.9,100", area: 0.5 },  // Bottom left small
    { points: "78.9,50 78.9,100 107.8,100", area: 0.5 }, // Bottom right small
  ];
  
  segments.forEach(segment => {
    let poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", segment.points);
    poly.setAttribute("fill", COLORS.white);
    poly.setAttribute("stroke", STROKE);
    poly.setAttribute("class", "segment");
    poly.setAttribute("data-area", segment.area);
    svg.appendChild(poly);
  });
  
  return svg;
}

// Stern
function createFigure5Svg() { 
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");
  
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 48;
  const innerRadius = 15; // Innerer Radius für die Sternspitzen
  const points = 16;

  // Einzelnes Polygon für den Stern erstellen
  let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  let pointsString = "";
  
  // Punkte für den Stern generieren, abwechselnd äußerer und innerer Radius
  for (let i = 0; i < points * 2; i++) {
    // Äußerer Radius für gerade Indizes, innerer Radius für ungerade
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points;
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    pointsString += `${x},${y} `;
  }
  
  polygon.setAttribute("points", pointsString.trim());
  polygon.setAttribute("stroke", STROKE);
  svg.appendChild(polygon);

  // Dreiecke hinzufügen: Zentrum -> Innerer Radius -> Äußerer Radius -> Zentrum
  for (let i = 0; i < points; i++) {
    // Winkel für die beiden Punkte des Dreiecks
    const angle1 = (i * 2 * Math.PI) / points;
    const angle2 = ((i * 2 + 1) * Math.PI) / points;
    const angle3 = (((i + 1) * 2 + 1) * Math.PI) / points;
    
    // Koordinaten für inneren und äußeren Punkt
    const xInner = centerX + innerRadius * Math.cos(angle2);
    const yInner = centerY + innerRadius * Math.sin(angle2);
    const xInner2 = centerX + innerRadius * Math.cos(angle3);
    const yInner2 = centerY + innerRadius * Math.sin(angle3);
    const xOuter = centerX + outerRadius * Math.cos(angle1);
    const yOuter = centerY + outerRadius * Math.sin(angle1);
    
    let triangle = document.createElementNS("http://www.w3.org/2000/svg", "path");
    triangle.setAttribute("d", `M ${centerX},${centerY} L ${xInner},${yInner} L ${xOuter},${yOuter} Z`);
    triangle.setAttribute("fill", COLORS.white); // Leicht hellere Farbe für die Dreiecke
    triangle.setAttribute("stroke", "none"); // Keine Umrandung
    triangle.setAttribute("class", "segment");
    triangle.setAttribute("data-area", "1");
    svg.appendChild(triangle);
  }

  // Dreiecke hinzufügen: Zentrum -> Innerer Radius -> Äußerer Radius -> Zentrum
  for (let i = 0; i < points; i++) {
    // Winkel für die beiden Punkte des Dreiecks
    const angle1 = (i * 2 * Math.PI) / points;
    const angle2 = (((i - 1) * 2 + 1) * Math.PI) / points;
    
    // Koordinaten für inneren und äußeren Punkt
    const xInner = centerX + innerRadius * Math.cos(angle2);
    const yInner = centerY + innerRadius * Math.sin(angle2);
    const xOuter = centerX + outerRadius * Math.cos(angle1);
    const yOuter = centerY + outerRadius * Math.sin(angle1);
    
    let triangle = document.createElementNS("http://www.w3.org/2000/svg", "path");
    triangle.setAttribute("d", `M ${centerX},${centerY} L ${xInner},${yInner} L ${xOuter},${yOuter} Z`);
    triangle.setAttribute("fill", COLORS.white); // Leicht hellere Farbe für die Dreiecke
    triangle.setAttribute("stroke", "none"); // Optionale Umrandung
    triangle.setAttribute("class", "segment");
    triangle.setAttribute("data-area", "1");
    svg.appendChild(triangle);
  }
    
  return svg;
}

function createFigure6svg() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");
  
  const centerX = 50;
  const centerY = 50;
  const radius = 48;
  
  // Create path segments for each section
  const sections = [
    { startAngle: 0, endAngle: Math.PI/4, area: 0.5 },         // Bottom right top small
    { startAngle: Math.PI/4, endAngle: Math.PI/2, area: 0.5 },  // Bottom right bottom small
    { startAngle: Math.PI/2, endAngle: Math.PI, area: 1 },      // Bottom left
    { startAngle: Math.PI, endAngle: 3*Math.PI/2, area: 1 },    // Top lefz
    { startAngle: 3*Math.PI/2, endAngle: 2*Math.PI, area: 1 }   // Top right
  ];
  
  sections.forEach(section => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const largeArcFlag = section.endAngle - section.startAngle > Math.PI ? 1 : 0;
    
    const startX = centerX + radius * Math.cos(section.startAngle);
    const startY = centerY + radius * Math.sin(section.startAngle);
    const endX = centerX + radius * Math.cos(section.endAngle);
    const endY = centerY + radius * Math.sin(section.endAngle);
    
    path.setAttribute("d", `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`);
    path.setAttribute("fill", COLORS.white);
    path.setAttribute("stroke", STROKE);
    path.setAttribute("class", "segment");
    path.setAttribute("data-area", section.area);
    svg.appendChild(path);
  });
  
  return svg;
}

function createFigure7svg() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");

  const centerX = 50;
  const centerY = 50;
  const radius = 48;
  const rotation = -Math.PI / 3; // Start bei -150° (statt -90°)
  const twelfthSegments = 2; // 2 Zwölftel
  const sixthSegments = 5; // 5 Sechstel

  // Circle outline
  let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", centerX);
  circle.setAttribute("cy", centerY);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill", "none");
  svg.appendChild(circle);

  // Create 2 Zwölftel segments
  // Erstes Segment (i=0) OHNE Winkelhalbierende (Linie bei -135° entfernt)
  // Zweites Segment (i=1) MIT Winkelhalbierende
  for (let i = 0; i < twelfthSegments; i++) {
    const segmentStart = -Math.PI/2 + rotation + (i * 2 * Math.PI) / 12;
    const segmentEnd = -Math.PI/2 + rotation + ((i + 1) * 2 * Math.PI) / 12;
    const middleAngle = (segmentStart + segmentEnd) / 2; // Winkelhalbierende

    // Zeichne die äußeren Linien
    const startX = centerX + radius * Math.cos(segmentStart);
    const startY = centerY + radius * Math.sin(segmentStart);
    const endX = centerX + radius * Math.cos(segmentEnd);
    const endY = centerY + radius * Math.sin(segmentEnd);
    const midX = centerX + radius * Math.cos(middleAngle);
    const midY = centerY + radius * Math.sin(middleAngle);

    // Line from center to start
    let line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line1.setAttribute("x1", centerX);
    line1.setAttribute("y1", centerY);
    line1.setAttribute("x2", startX);
    line1.setAttribute("y2", startY);
    svg.appendChild(line1);

    if (i === 0) {
      // Erstes Segment OHNE Winkelhalbierende (ganzes Segment)
      let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 0,1 ${endX},${endY} Z`);
      path.setAttribute("fill", COLORS.white);
      path.setAttribute("stroke", STROKE);
      path.setAttribute("class", "segment");
      path.setAttribute("data-area", "1"); // 1/12 der Gesamtfläche
      svg.appendChild(path);
    } else {
      // Andere Segmente MIT Winkelhalbierende
      // Winkelhalbierende
      let bisector = document.createElementNS("http://www.w3.org/2000/svg", "line");
      bisector.setAttribute("x1", centerX);
      bisector.setAttribute("y1", centerY);
      bisector.setAttribute("x2", midX);
      bisector.setAttribute("y2", midY);
      svg.appendChild(bisector);

      // Erstes halbes Segment
      let path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path1.setAttribute("d", `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 0,1 ${midX},${midY} Z`);
      path1.setAttribute("fill", COLORS.white);
      path1.setAttribute("stroke", STROKE);
      path1.setAttribute("class", "segment");
      path1.setAttribute("data-area", "0.5"); // 1/24 der Gesamtfläche
      svg.appendChild(path1);

      // Zweites halbes Segment
      let path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path2.setAttribute("d", `M ${centerX},${centerY} L ${midX},${midY} A ${radius},${radius} 0 0,1 ${endX},${endY} Z`);
      path2.setAttribute("fill", COLORS.white);
      path2.setAttribute("stroke", STROKE);
      path2.setAttribute("class", "segment");
      path2.setAttribute("data-area", "0.5"); // 1/24 der Gesamtfläche
      svg.appendChild(path2);
    }
  }

  // Create 5 Sechstel segments with Winkelhalbierende (each divided in half)
  for (let i = 0; i < sixthSegments; i++) {
    const segmentStart = -Math.PI/2 + rotation + (twelfthSegments * 2 * Math.PI) / 12 + (i * 2 * Math.PI) / 6;
    const segmentEnd = -Math.PI/2 + rotation + (twelfthSegments * 2 * Math.PI) / 12 + ((i + 1) * 2 * Math.PI) / 6;
    const middleAngle = (segmentStart + segmentEnd) / 2; // Winkelhalbierende

    const startX = centerX + radius * Math.cos(segmentStart);
    const startY = centerY + radius * Math.sin(segmentStart);
    const endX = centerX + radius * Math.cos(segmentEnd);
    const endY = centerY + radius * Math.sin(segmentEnd);
    const midX = centerX + radius * Math.cos(middleAngle);
    const midY = centerY + radius * Math.sin(middleAngle);

    // Line from center to start
    let line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line1.setAttribute("x1", centerX);
    line1.setAttribute("y1", centerY);
    line1.setAttribute("x2", startX);
    line1.setAttribute("y2", startY);
    svg.appendChild(line1);

    // Winkelhalbierende
    let bisector = document.createElementNS("http://www.w3.org/2000/svg", "line");
    bisector.setAttribute("x1", centerX);
    bisector.setAttribute("y1", centerY);
    bisector.setAttribute("x2", midX);
    bisector.setAttribute("y2", midY);
    svg.appendChild(bisector);

    // Erstes halbes Segment
    let path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 0,1 ${midX},${midY} Z`);
    path1.setAttribute("fill", COLORS.white);
    path1.setAttribute("stroke", STROKE);
    path1.setAttribute("class", "segment");
    path1.setAttribute("data-area", "1"); // 1/12 der Gesamtfläche
    svg.appendChild(path1);

    // Zweites halbes Segment
    let path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path2.setAttribute("d", `M ${centerX},${centerY} L ${midX},${midY} A ${radius},${radius} 0 0,1 ${endX},${endY} Z`);
    path2.setAttribute("fill", COLORS.white);
    path2.setAttribute("stroke", STROKE);
    path2.setAttribute("class", "segment");
    path2.setAttribute("data-area", "1"); // 1/12 der Gesamtfläche
    svg.appendChild(path2);
  }

  return svg;
}

function createFigure8svg() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-5 0 110 100");
  
  const rows = 2;
  const cols = 8;
  const radius = 6;
  const space = radius/cols;
  const spacing = 2 * radius + space;
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = radius + c * spacing - ((c) % 2) * space *0.99;
      const cy = 50 + r * spacing - ((r) % 2) * space *0.99;
      
      let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", radius);
      circle.setAttribute("fill", COLORS.white);
      circle.setAttribute("stroke", STROKE);
      circle.setAttribute("class", "segment");
      circle.setAttribute("data-area", "1");
      svg.appendChild(circle);
    }
  }
  
  return svg;
}

function createFigure9Svg() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  
  // Segments
  const segments = [
    { points: "1,37.5 50,37.5 50,50 1,50", area: 1 },   // Left rectangle
    { points: "50,37.5 99,37.5 50,50", area: 0.5 },       // Top right triangle
    { points: "99,37.5 50,50 99,50", area: 0.5 },       // lower top right triangle
    { points: "1,50 1,62.5 50,50", area: 0.5 },          // left bottom triangle
    { points: "1,62.5 50,62.5 50,50", area: 0.5 },       // right bottom triangle
    { points: "50,50 50,62.5 99,62.5 99,50", area: 1 },    // right rectangle
  ]
  
  segments.forEach(segment => {
    let poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", segment.points);
    poly.setAttribute("fill", COLORS.white);
    poly.setAttribute("stroke", STROKE);
    poly.setAttribute("class", "segment");
    poly.setAttribute("data-area", segment.area);
    svg.appendChild(poly);
  });
  
  return svg;
}

function createFigure10Svg() {
  // Oktagon
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");

  const centerX = 50;
  const centerY = 50;
  const radius = 45;
  const sides = 8;
  const rotation = -Math.PI / 4; // -45° Drehung

  // Calculate octagon points
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / sides + rotation;
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }

  // Draw octagon outline
  let octagon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  let pointsStr = points.map(p => `${p.x},${p.y}`).join(" ");
  octagon.setAttribute("points", pointsStr);
  octagon.setAttribute("fill", "none");
  octagon.setAttribute("stroke", STROKE);
  octagon.setAttribute("stroke-width", "1");
  octagon.setAttribute("stroke-linecap", "butt");
  svg.appendChild(octagon);

  // Combined shape 1: Dreiecke 7, 0, 1, 2
  let combinedShape1 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  combinedShape1.setAttribute("points", `${centerX},${centerY} ${points[7].x},${points[7].y} ${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y} ${points[3].x},${points[3].y}`);
  combinedShape1.setAttribute("fill", COLORS.white);
  combinedShape1.setAttribute("stroke", STROKE);
  combinedShape1.setAttribute("class", "segment");
  combinedShape1.setAttribute("data-area", "4"); // 4 Dreiecke zusammengefasst
  svg.appendChild(combinedShape1);

  // Combined shape 2: Dreiecke 5, 6 (Linie bei Punkt 6 = -112.5° = 247.5° entfernt)
  let combinedShape2 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  combinedShape2.setAttribute("points", `${centerX},${centerY} ${points[5].x},${points[5].y} ${points[6].x},${points[6].y} ${points[7].x},${points[7].y}`);
  combinedShape2.setAttribute("fill", COLORS.white);
  combinedShape2.setAttribute("stroke", STROKE);
  combinedShape2.setAttribute("class", "segment");
  combinedShape2.setAttribute("data-area", "2"); // 2 Dreiecke zusammengefasst
  svg.appendChild(combinedShape2);

  // Draw remaining individual triangles (skip indices 7, 0, 1, 2, 5, 6)
  for (let i = 0; i < sides; i++) {
    // Skip the triangles that are now combined (7, 0, 1, 2, 5, 6)
    if (i === 7 || i === 0 || i === 1 || i === 2 || i === 5 || i === 6) continue;

    const j = (i + 1) % sides;

    let triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    triangle.setAttribute("points", `${centerX},${centerY} ${points[i].x},${points[i].y} ${points[j].x},${points[j].y}`);
    triangle.setAttribute("fill", COLORS.white);
    triangle.setAttribute("stroke", STROKE);
    triangle.setAttribute("class", "segment");
    triangle.setAttribute("data-area", "1");
    svg.appendChild(triangle);
  }

  return svg;
}

function createFigure11Svg() {
  // 16-seitiges Polygon
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");

  const centerX = 50;
  const centerY = 50;
  const radius = 45;
  const sides = 16;

  // Create clickable triangles
  for (let i = 0; i < sides; i++) {
    const angle1 = ((i - 1) * 2 * Math.PI) / sides - Math.PI / sides;
    const angle2 = (i  * 2 * Math.PI) / sides - Math.PI / sides;
    let x1 = centerX + radius * Math.cos(angle1);
    let y1 = centerY + radius * Math.sin(angle1);
    let x2 = centerX + radius * Math.cos(angle2);
    let y2 = centerY + radius * Math.sin(angle2);

    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    path.setAttribute("d", `M ${centerX},${centerY} L ${x1},${y1} L ${x2},${y2} Z`);
    path.setAttribute("fill", COLORS.white);
    path.setAttribute("stroke", STROKE);
    path.setAttribute("class", "segment");
    path.setAttribute("data-area", "1");
    svg.appendChild(path);
    }

  return svg;
}

function createFigure12Svg() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-1 -1 102 102");

  // Rechtecke mit Diagonalen unterteilt
  const rectangles = [
    // Linke Hälfte: 1/2 → 4 Dreiecke à 1/8
    { x1: 0, y1: 0, x2: 50, y2: 100, area: 1 },
    // Rechte obere Hälfte: 1/4 → 4 Dreiecke à 1/16
    { x1: 50, y1: 0, x2: 100, y2: 50, area: 0.5 },
    // Rechte mittlere: 1/8 → 4 Dreiecke à 1/32
    { x1: 50, y1: 50, x2: 100, y2: 75, area: 0.25 },
    // Rechte untere: 1/8 → 4 Dreiecke à 1/32
    { x1: 50, y1: 75, x2: 100, y2: 100, area: 0.25 }
  ];

  rectangles.forEach(rect => {
    const cx = (rect.x1 + rect.x2) / 2;
    const cy = (rect.y1 + rect.y2) / 2;

    // Zeichne beide Diagonalen
    let diag1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    diag1.setAttribute("x1", rect.x1);
    diag1.setAttribute("y1", rect.y1);
    diag1.setAttribute("x2", rect.x2);
    diag1.setAttribute("y2", rect.y2);
    diag1.setAttribute("stroke", STROKE);
    svg.appendChild(diag1);

    let diag2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    diag2.setAttribute("x1", rect.x2);
    diag2.setAttribute("y1", rect.y1);
    diag2.setAttribute("x2", rect.x1);
    diag2.setAttribute("y2", rect.y2);
    diag2.setAttribute("stroke", STROKE);
    svg.appendChild(diag2);

    // Zeichne Umriss
    let outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    outline.setAttribute("x", rect.x1);
    outline.setAttribute("y", rect.y1);
    outline.setAttribute("width", rect.x2 - rect.x1);
    outline.setAttribute("height", rect.y2 - rect.y1);
    outline.setAttribute("fill", "none");
    outline.setAttribute("stroke", STROKE);
    svg.appendChild(outline);

    // 4 Dreiecke durch Diagonalen
    const triangles = [
      // Oben
      { points: `${rect.x1},${rect.y1} ${rect.x2},${rect.y1} ${cx},${cy}` },
      // Rechts
      { points: `${rect.x2},${rect.y1} ${rect.x2},${rect.y2} ${cx},${cy}` },
      // Unten
      { points: `${rect.x2},${rect.y2} ${rect.x1},${rect.y2} ${cx},${cy}` },
      // Links
      { points: `${rect.x1},${rect.y2} ${rect.x1},${rect.y1} ${cx},${cy}` }
    ];

    triangles.forEach(triangle => {
      let poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("points", triangle.points);
      poly.setAttribute("fill", COLORS.white);
      poly.setAttribute("stroke", STROKE);
      poly.setAttribute("class", "segment");
      poly.setAttribute("data-area", rect.area);
      svg.appendChild(poly);
    });
  });

  return svg;
}

// Initialize the application
function init() {
  const container = document.getElementById('figures-container');

  figures.forEach(figure => {
    // Create figure container
    const figureBox = document.createElement('div');
    figureBox.classList.add('figure-box');
    
    // Add figure name
    const titleEl = document.createElement('h3');
    titleEl.textContent = figure.name;
    figureBox.appendChild(titleEl);
    
    // Create figure SVG container
    const figureContainer = document.createElement('div');
    figureContainer.classList.add('figure-container');
    figureContainer.id = `figure-${figure.id}`;
    
    // Add SVG to container
    const svg = figure.svgContent();
    figureContainer.appendChild(svg);
    figureBox.appendChild(figureContainer);
    
    // Add controls
    const controls = document.createElement('div');
    controls.classList.add('controls');
    
    // Color buttons
    const colorButtons = document.createElement('div');
    colorButtons.classList.add('color-buttons');
    
    // Hier werden die Farbbuttons erstellt, aber wir filtern den weißen Button raus
    Object.entries(COLORS).forEach(([color, value]) => {
      // Überspringe den weißen Farbbutton
      if (color === 'white') {
        return;
      }
      
      const button = document.createElement('div');
      button.classList.add('color-button');
      button.dataset.color = color;
      button.style.backgroundColor = value;
      
      // Make blue the active color by default
      if (color === 'blue') {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        colorButtons.querySelectorAll('.color-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
      });
      
      colorButtons.appendChild(button);
    });
    
    controls.appendChild(colorButtons);
    
    // Action buttons
    const actionButtons = document.createElement('div');
    actionButtons.classList.add('action-buttons');
    
    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Zurücksetzen';
    resetBtn.addEventListener('click', () => {
      resetFigure(figure.id);
      // Clear message
      const messageEl = figureBox.querySelector('.message');
      messageEl.textContent = '';
      messageEl.classList.remove('success', 'error');
    });
    actionButtons.appendChild(resetBtn);
    
    // Check button
    const checkBtn = document.createElement('button');
    checkBtn.textContent = 'Überprüfen';
    checkBtn.addEventListener('click', () => {
      checkFigure(figure.id, figureBox);
    });
    actionButtons.appendChild(checkBtn);
    
    controls.appendChild(actionButtons);
    figureBox.appendChild(controls);
    
    // Add message container
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    figureBox.appendChild(messageEl);
    
    // Add to container
    container.appendChild(figureBox);
    
    // Setup interaction for segments
    setupSegmentInteraction(figure.id);
  });
}

// Reset all segments in a figure to white
function resetFigure(figureId) {
  const container = document.getElementById(`figure-${figureId}`);
  const segments = container.querySelectorAll('.segment');
  
  segments.forEach(segment => {
    segment.setAttribute('fill', COLORS.white);
    segment.dataset.colorCode = '';
  });
}

// Check if a figure has the correct coloring
function checkFigure(figureId, figureBox) {
  const container = document.getElementById(`figure-${figureId}`);
  const segments = container.querySelectorAll('.segment');
  const messageEl = figureBox.querySelector('.message');
  
  // Calculate area totals
  let totalArea = 0;
  let blueArea = 0;
  let greenArea = 0;
  let yellowArea = 0;
  let whiteArea = 0;
  
  segments.forEach(segment => {
    const area = parseFloat(segment.dataset.area || 1);
    totalArea += area;
    
    const fill = segment.getAttribute('fill');
    if (fill === COLORS.blue) {
      blueArea += area;
    } else if (fill === COLORS.green) {
      greenArea += area;
    } else if (fill === COLORS.yellow) {
      yellowArea += area;
    } else if (fill === COLORS.white) {
      whiteArea += area;
    }
  });

  // Calculate proportions
  const blueProp = blueArea / totalArea;
  const greenProp = greenArea / totalArea;
  const yellowProp = yellowArea / totalArea;
  const whiteProp = whiteArea / totalArea;
  
  // Check if correct (tolerance must be smaller than 1/400 = 0.0025 for Figur 1b)
  const tol = 0.001;
  const isCorrect =
    Math.abs(blueProp - 0.5) < tol &&
    Math.abs(greenProp - 0.25) < tol &&
    Math.abs(yellowProp - 0.125) < tol &&
    Math.abs(whiteProp - 0.125) < tol;

  const blueIncorrect =
    Math.abs(blueProp - 0.5) > tol &&
    Math.abs(greenProp - 0.25) < tol &&
    Math.abs(yellowProp - 0.125) < tol;

  const greenIncorrect =
    Math.abs(blueProp - 0.5) < tol &&
    Math.abs(greenProp - 0.25) > tol &&
    Math.abs(yellowProp - 0.125) < tol;

  const yellowIncorrect =
    Math.abs(blueProp - 0.5) < tol &&
    Math.abs(greenProp - 0.25) < tol &&
    Math.abs(yellowProp - 0.125) > tol;

  const bgIncorrect =
    Math.abs(blueProp - 0.5) > tol &&
    Math.abs(greenProp - 0.25) > tol &&
    Math.abs(yellowProp - 0.125) < tol;

  const byIncorrect =
    Math.abs(blueProp - 0.5) > tol &&
    Math.abs(greenProp - 0.25) < tol &&
    Math.abs(yellowProp - 0.125) > tol;

  const gyIncorrect =
    Math.abs(blueProp - 0.5) < tol &&
    Math.abs(greenProp - 0.25) > tol &&
    Math.abs(yellowProp - 0.125) > tol;

  const bgyIncorrect =
    Math.abs(blueProp - 0.5) > tol &&
    Math.abs(greenProp - 0.25) > tol &&
    Math.abs(yellowProp - 0.125) > tol &&
    Math.abs(whiteProp) < 0.99;
  
  // Display result
  if (isCorrect) {
    messageEl.textContent = 'Vollständig korrekt!';
    messageEl.classList.add('success');
    messageEl.classList.remove('error');
  } else if (blueIncorrect) {
    messageEl.textContent = 'Kontrolliere die blauen Felder.';
    messageEl.classList.add('error');
    messageEl.classList.remove('success');
  } else if (greenIncorrect) {
    messageEl.textContent = 'Kontrolliere die grünen Felder.';
    messageEl.classList.add('error');
    messageEl.classList.remove('success');
  } else if (yellowIncorrect) {
    messageEl.textContent = 'Kontrolliere die gelben Felder.';
    messageEl.classList.add('error');
    messageEl.classList.remove('success');
  } else if (bgIncorrect) {
    messageEl.textContent = 'Kontrolliere die blauen und grünen Felder.';
    messageEl.classList.add('error');
    messageEl.classList.remove('success');
  } else if (byIncorrect) {
    messageEl.textContent = 'Kontrolliere die blauen und gelben Felder.';
    messageEl.classList.add('error');
    messageEl.classList.remove('success');
  } else if (gyIncorrect) {
    messageEl.textContent = 'Kontrolliere die grünen und gelben Felder.';
    messageEl.classList.add('error');
    messageEl.classList.remove('success');
  } else if (bgyIncorrect) {
    messageEl.textContent = 'Kontrolliere die markierten Felder.';
    messageEl.classList.add('error');
    messageEl.classList.remove('success');
  } else if (whiteArea == totalArea) {
    messageEl.textContent = 'Markiere zuerst die Felder.';
    messageEl.classList.add('error');
    messageEl.classList.remove('success');
  }
}

// Set up interaction for segments - supporting both mouse and touch
function setupSegmentInteraction(figureId) {
  const container = document.getElementById(`figure-${figureId}`);
  const segments = container.querySelectorAll('.segment');
  let isDrawing = false;
  let isErasing = false; // true when dragging should erase (set to white)
  let currentColor = 'blue'; // Default color
  let lastInteractedSegment = null; // Track last interacted segment
  
  // Helper to get the currently selected color
  function getActiveColor() {
    const colorButton = container.parentNode.querySelector('.color-button.active');
    return colorButton ? colorButton.dataset.color : 'blue';
  }
  
  // Helper to find a segment at coordinates
  function findSegmentAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (element && element.classList.contains('segment') && 
        element.closest(`#figure-${figureId}`)) {
      return element;
    }
    return null;
  }
  
  // Start drawing/coloring (used for both mouse and touch)
  function startDrawing(segment) {
    isDrawing = true;
    currentColor = getActiveColor();
    // Determine mode: if segment already has current color, we erase; otherwise we paint
    isErasing = (segment.dataset.colorCode === currentColor);
    toggleSegmentColor(segment, currentColor);
    lastInteractedSegment = segment;
  }

  // Move over segments while drawing (used for both mouse and touch)
  function moveDrawing(x, y) {
    if (!isDrawing) return;

    const segment = findSegmentAtPoint(x, y);
    if (segment && segment !== lastInteractedSegment) {
      if (isErasing) {
        segment.setAttribute('fill', COLORS.white);
        segment.dataset.colorCode = '';
      } else {
        segment.setAttribute('fill', COLORS[currentColor]);
        segment.dataset.colorCode = currentColor;
      }
      lastInteractedSegment = segment;
    }
  }

  // End drawing (used for both mouse and touch)
  function endDrawing() {
    isDrawing = false;
    isErasing = false;
    lastInteractedSegment = null;
  }
  
  // Add event listeners with proper options for touch events
  segments.forEach(segment => {
    // Mouse events
    segment.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startDrawing(segment);
    });
    
    segment.addEventListener('mouseenter', () => {
      if (isDrawing) {
        if (isErasing) {
          segment.setAttribute('fill', COLORS.white);
          segment.dataset.colorCode = '';
        } else {
          segment.setAttribute('fill', COLORS[currentColor]);
          segment.dataset.colorCode = currentColor;
        }
        lastInteractedSegment = segment;
      }
    });
    
    // Touch events - use { passive: false } to ensure preventDefault works
    segment.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrawing(segment);
    }, { passive: false });
  });
  
  // Touch move handling with throttling
  let lastMoveTime = 0;
  const moveThrottle = 30; // ms between checks
  
  container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    // Throttle for performance
    const now = Date.now();
    if (now - lastMoveTime < moveThrottle) return;
    lastMoveTime = now;
    
    if (isDrawing) {
      const touch = e.touches[0];
      moveDrawing(touch.clientX, touch.clientY);
    }
  }, { passive: false });
  
  // End events
  document.addEventListener('mouseup', endDrawing);
  document.addEventListener('touchend', endDrawing);
  document.addEventListener('touchcancel', endDrawing);
  
  // Mouse movement
  document.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const now = Date.now();
    if (now - lastMoveTime < moveThrottle) return;
    lastMoveTime = now;
    
    moveDrawing(e.clientX, e.clientY);
  });
}

// Helper function to toggle segment color
function toggleSegmentColor(segment, currentColor) {
  // Wenn schon die aktuelle Farbe, dann weiß
  if (segment.dataset.colorCode === currentColor) {
    segment.setAttribute('fill', COLORS.white);
    segment.dataset.colorCode = '';
  } else {
    // Sonst die aktuelle Farbe setzen
    segment.setAttribute('fill', COLORS[currentColor]);
    segment.dataset.colorCode = currentColor;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);