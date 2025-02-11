export function pentakisDodecahedron() {
    vertices = [[0,0,1.070466],[0.7136442,0,0.7978784],[-0.3568221,0.618034,0.7978784],[-0.3568221,-0.618034,0.7978784],[0.7978784,0.618034,0.3568221],[0.7978784,-0.618034,0.3568221],[-0.9341724,0.381966,0.3568221],[0.1362939,1,0.3568221],[0.1362939,-1,0.3568221],[-0.9341724,-0.381966,0.3568221],[0.9341724,0.381966,-0.3568221],[0.9341724,-0.381966,-0.3568221],[-0.7978784,0.618034,-0.3568221],[-0.1362939,1,-0.3568221],[-0.1362939,-1,-0.3568221],[-0.7978784,-0.618034,-0.3568221],[0.3568221,0.618034,-0.7978784],[0.3568221,-0.618034,-0.7978784],[-0.7136442,0,-0.7978784],[0,0,-1.070466],[0.25819888,0.4472136,0.6759734],[-0.5163978,0,0.6759734],[0.25819888,-0.4472136,0.6759734],[0.83554916,0,0.15957568],[-0.41777458,0.7236068,0.15957568],[-0.41777458,-0.7236068,0.15957568],[0.41777458,0.7236068,-0.15957568],[0.41777458,-0.7236068,-0.15957568],[-0.83554916,0,-0.15957568],[0.5163978,0,-0.6759734],[-0.25819888,0.4472136,-0.6759734],[-0.25819888,-0.4472136,-0.6759734]];
    edges = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,6],[2,7],[3,8],[3,9],[4,7],[4,10],[5,8],[5,11],[6,9],[6,12],[7,13],[8,14],[9,15],[10,11],[10,16],[11,17],[12,13],[12,18],[13,16],[14,15],[14,17],[15,18],[16,19],[17,19],[18,19]];
    faces = [[0,1,20],[1,4,20],[4,7,20],[7,2,20],[2,0,20],[0,2,21],[2,6,21],[6,9,21],[9,3,21],[3,0,21],[0,3,22],[3,8,22],[8,5,22],[5,1,22],[1,0,22],[1,5,23],[5,11,23],[11,10,23],[10,4,23],[4,1,23],[2,7,24],[7,13,24],[13,12,24],[12,6,24],[6,2,24],[3,9,25],[9,15,25],[15,14,25],[14,8,25],[8,3,25],[4,10,26],[10,16,26],[16,13,26],[13,7,26],[7,4,26],[5,8,27],[8,14,27],[14,17,27],[17,11,27],[11,5,27],[6,12,28],[12,18,28],[18,15,28],[15,9,28],[9,6,28],[10,11,29],[11,17,29],[17,19,29],[19,16,29],[16,10,29],[12,13,30],[13,16,30],[16,19,30],[19,18,30],[18,12,30],[14,15,31],[15,18,31],[18,19,31],[19,17,31],[17,14,31]];
  
    if (windowWidth < windowHeight) {
      var q = (windowWidth) * 0.3;
    } else {
      var q = (windowHeight) * 0.3;
    }
  
    // Vorberechnung der Farbzuweisung für jeden Zacken
    let spikeColors = new Array(12).fill(-1);
    
    // Implementierung des Greedy-Coloring-Algorithmus
    for(let spike = 0; spike < 12; spike++) {
      const adjacentSpikes = getAdjacentSpikes(spike);
      const usedColors = new Set(adjacentSpikes.map(adj => spikeColors[adj]));
      
      // Finde die erste verfügbare Farbe
      for(let color = 0; color < 5; color++) {
        if(!usedColors.has(color)) {
          spikeColors[spike] = color;
          break;
        }
      }
    }
  
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
        case 4:
          selectedColor = colorPicker5.color();
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