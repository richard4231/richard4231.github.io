let currentEquation = 2; // Start with equation 2 (multiplication)
let cards = []; // Array to store the digit cards
let placeholders = []; // Array to store placeholder positions for each equation
let draggedCard = null; // Currently dragged card
let snapThreshold = 20; // Threshold for snapping in pixels
let equationDropdown;
let solutionButton;
let dragOffsetX = 0;
let dragOffsetY = 0;
let solutionText = ""; // To display solution on canvas

function setup() {
  createCanvas(1000, 500);
  textFont('PoloCEF-Regular');
  
  // Create dropdown centered
  equationDropdown = createSelect();
  equationDropdown.position(width/2 - 400, 20);
  equationDropdown.style('width', '800px');
  equationDropdown.style('text-align', 'center');
  equationDropdown.style('font-family', 'PoloCEF-Regular');
  equationDropdown.style('padding', '8px');
  equationDropdown.style('border-radius', '5px');
  equationDropdown.style('border', '1px solid #ccc');
  
  equationDropdown.option("[ ] ( [ ] x + [ ] ) + ( [ ] x + [ ] ) = ( [ ] x + [ ] ) + ( [ ] x + [ ] )", 1);
  equationDropdown.option("[ ] ( [ ] x + [ ] ) · ( [ ] x + [ ] ) = ( [ ] x + [ ] ) · ( [ ] x + [ ] )", 2);
  equationDropdown.option("( [ ] x + [ ] ) = ( [ ] x + [ ] )", 3);
  equationDropdown.option("[ ] ( [ ] x + [ ] ) = [ ] ( [ ] x + [ ] )", 4);
  equationDropdown.option("[ ] x + [ ] = [ ]", 5);
  equationDropdown.option("[ ] x + [ ] = [ ] x", 6);
  equationDropdown.option("[ ] ( [ ] x + [ ] ) = [ ]", 7);
  equationDropdown.option("[ ] ( [ ] x + [ ] ) = [ ] x", 8);
  equationDropdown.changed(changeEquation);
  equationDropdown.selected("[ ] ( [ ] x + [ ] ) · ( [ ] x + [ ] ) = ( [ ] x + [ ] ) · ( [ ] x + [ ] )");
  
  // Create solution button - now positioned under the equation
  solutionButton = createButton("Lösung");
  solutionButton.position(width/2 - 50, 280);
  solutionButton.style('font-family', 'PoloCEF-Regular');
  solutionButton.style('padding', '10px 20px');
  solutionButton.style('font-size', '16px');
  solutionButton.style('background-color', '#4CAF50');
  solutionButton.style('color', 'white');
  solutionButton.style('border', 'none');
  solutionButton.style('border-radius', '5px');
  solutionButton.style('cursor', 'pointer');
  solutionButton.style('transition', 'all 0.3s');
  
  // Add hover effect
  solutionButton.mouseOver(() => {
    solutionButton.style('background-color', '#45a049');
    solutionButton.style('transform', 'scale(1.05)');
  });
  
  solutionButton.mouseOut(() => {
    solutionButton.style('background-color', '#4CAF50');
    solutionButton.style('transform', 'scale(1)');
  });
  
  solutionButton.mousePressed(showSolution);
  
  // Initialize cards with more space between them
  for (let i = 0; i < 10; i++) {
    cards.push({
      digit: i,
      x: 245 + i * 60, // Spread out more (60px between cards)
      y: height - 80,
      width: 40,
      height: 50,
      isPlaced: false,
      placedAt: null // Index of the placeholder where this card is placed
    });
  }
  
  // Initialize empty placeholders array for each equation type
  placeholders = [[], [], [], [], [], [], [], []];
  equationDropdown.changed(changeEquation);
  
  // The actual placeholder positions will be set in drawPlaceholders
}

function draw() {
  // Create gradient background
  let c1 = color(240, 240, 250);
  let c2 = color(220, 225, 235);
  for(let y = 0; y < height; y++){
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // Draw placeholders (which now includes the equation structure)
  drawPlaceholders();
  
  // Draw cards
  drawCards();
  
  // Draw solution text if available
  if (solutionText !== "") {
    fill(50, 50, 50);
    textSize(18);
    textAlign(CENTER, TOP);
    text(solutionText, width/2, 330, 500, 100);
  }
}

function mousePressed() {
  // Check if a card is clicked
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    if (mouseX > card.x && mouseX < card.x + card.width &&
        mouseY > card.y && mouseY < card.y + card.height) {
      if (card.isPlaced) {
        // If the card is placed, remove it from the placeholder
        placeholders[currentEquation - 1][card.placedAt].value = null;
      }
      draggedCard = card;
      // Calculate the offset from the corner of the card to maintain position under cursor
      dragOffsetX = mouseX - card.x;
      dragOffsetY = mouseY - card.y;
      card.isPlaced = false;
      card.placedAt = null;
      break;
    }
  }
}

function mouseDragged() {
  // Move the dragged card while maintaining the offset
  if (draggedCard) {
    draggedCard.x = mouseX - dragOffsetX;
    draggedCard.y = mouseY - dragOffsetY;
  }
}

function mouseReleased() {
  // Check if the card should snap to a placeholder
  if (draggedCard) {
    let snapped = false;
    for (let i = 0; i < placeholders[currentEquation - 1].length; i++) {
      let placeholder = placeholders[currentEquation - 1][i];
      if (dist(draggedCard.x + draggedCard.width / 2, draggedCard.y + draggedCard.height / 2,
               placeholder.x + placeholder.width / 2, placeholder.y + placeholder.height / 2) < snapThreshold &&
          placeholder.value === null) {
        placeholder.value = draggedCard.digit;
        draggedCard.isPlaced = true;
        draggedCard.placedAt = i;
        draggedCard.x = placeholder.x + (placeholder.width - draggedCard.width) / 2; // Center in placeholder
        draggedCard.y = placeholder.y + (placeholder.height - draggedCard.height) / 2; // Center in placeholder
        snapped = true;
        break;
      }
    }
    
    if (!snapped) {
      // Return the card to its initial position if not snapped
      draggedCard.x = 245 + draggedCard.digit * 60;
      draggedCard.y = height - 80;
      draggedCard.isPlaced = false;
      draggedCard.placedAt = null;
    }
    
    draggedCard = null;
  }
}

function initializePlaceholders() {
  // This function is now just a placeholder.
  // The actual placeholder positions are set dynamically in drawPlaceholders()
}

function changeEquation() {
  currentEquation = parseInt(equationDropdown.value());
  
  // Reset placed cards
  for (let card of cards) {
    if (card.isPlaced) {
      card.isPlaced = false;
      card.placedAt = null;
      card.x = 245 + card.digit * 60; // Use consistent spacing (60px)
      card.y = height - 80;
    }
  }
  
  // Reset placeholder values - but we need to make sure the array exists first
  if (placeholders[currentEquation - 1]) {
    for (let placeholder of placeholders[currentEquation - 1]) {
      placeholder.value = null;
    }
  }
  
  // Clear solution text
  solutionText = "";
}

function drawEquationStructure() {
  // We don't draw the structure separately anymore - it's all done in drawPlaceholders()
}

function drawPlaceholders() {
  // Draw the complete equation structure with placeholders
  textSize(30);
  textAlign(CENTER, CENTER);
  fill(0);
  
  // Define common placeholder dimensions
  const placeholderWidth = 50;
  const placeholderHeight = 60;
  const placeholderSpacing = 10;
  const yPosition = 180;
  
  // Clear any old placeholder positions before redefining
  placeholders[currentEquation - 1] = [];
  
  // Position tracking variables
  let xPos = 50;
  
  switch (currentEquation) {
    case 1:
      // ( ax + b ) + ( cx + d ) = ( ex + f ) + ( gx + h )
      
      // First group: ( ax + b )
      text("(", xPos, yPosition); xPos += 10;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 25;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Plus
      text("+", xPos, yPosition); xPos += 25;
      
      // Second group: ( cx + d )
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Equals
      text("=", xPos, yPosition); xPos += 25;
      
      // Third group: ( ex + f )
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Plus
      text("+", xPos, yPosition); xPos += 25;
      
      // Fourth group: ( gx + h )
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition);
      break;
      
    case 2:
      // (ax + b) · (cx + d) = (ex + f) · (gx + h)
      
      // First group: ( ax + b )
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Multiplication
      text("·", xPos, yPosition); xPos += 25;
      
      // Second group: ( cx + d )
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Equals
      text("=", xPos, yPosition); xPos += 25;
      
      // Third group: ( ex + f )
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Multiplication
      text("·", xPos, yPosition); xPos += 25;
      
      // Fourth group: ( gx + h )
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition);
      break;
      
    case 3:
      // ( ax + b ) = ( ex + f )
      xPos = 150;
      
      // First group: ( ax + b )
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Equals
      text("=", xPos, yPosition); xPos += 25;
      
      // Second group: ( ex + f )
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition);
      break;
      
    case 4:
      // a ( bx + c ) = d ( ex + f )
      xPos = 150;
      
      // First group: a ( bx + c )
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Equals
      text("=", xPos, yPosition); xPos += 25;
      
      // Second group: d ( ex + f )
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition);
      break;
      
    case 5:
      // ax + b = c
      xPos = 200;
      
      // ax + b
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      
      // Equals c
      text("=", xPos, yPosition); xPos += 25;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      break;
      
    case 6:
      // ax + b = cx
      xPos = 200;
      
      // ax + b
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      
      // Equals cx
      text("=", xPos, yPosition); xPos += 25;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x", xPos, yPosition);
      break;
      
    case 7:
      // a (bx + c ) = d
      xPos = 200;
      
      // a (bx + c)
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Equals d
      text("=", xPos, yPosition); xPos += 25;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      break;
      
    case 8:
      // a (bx + c ) = dx
      xPos = 200;
      
      // a (bx + c)
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("(", xPos, yPosition); xPos += 20;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x +", xPos, yPosition); xPos += 40;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text(")", xPos, yPosition); xPos += 25;
      
      // Equals dx
      text("=", xPos, yPosition); xPos += 25;
      placeholders[currentEquation - 1].push({ x: xPos, y: yPosition - placeholderHeight/2, width: placeholderWidth, height: placeholderHeight, value: null });
      xPos += placeholderWidth + 15;
      text("x", xPos, yPosition);
      break;
  }
  
  // Draw the placeholders and their content
  rectMode(CORNER);
  for (let placeholder of placeholders[currentEquation - 1]) {
    // Draw the white box with shadow effect
    push();
    fill(240);
    rect(placeholder.x + 2, placeholder.y + 2, placeholder.width, placeholder.height); // Shadow
    stroke(0);
    fill(255);
    rect(placeholder.x, placeholder.y, placeholder.width, placeholder.height); // Main box
    
    // Draw a double border to make it look nicer
    noFill();
    stroke(220);
    rect(placeholder.x + 2, placeholder.y + 2, placeholder.width - 4, placeholder.height - 4);
    pop();
    
    if (placeholder.value !== null) {
      fill(0);
      textSize(28);
      textAlign(CENTER, CENTER);
      text(placeholder.value, placeholder.x + placeholder.width / 2, placeholder.y + placeholder.height / 2);
    }
  }
}

function drawCards() {
  // Draw the cards
  rectMode(CORNER);
  for (let card of cards) {
    // Draw all cards, whether placed or not
    // Create shadow effect for cards
    push();
    fill(200);
    rect(card.x + 3, card.y + 3, card.width, card.height); // Shadow
    
    // Gradient fill for card
    let c1 = color(255, 255, 255);
    let c2 = color(240, 240, 240);
    
    // Create gradient rectangle
    noStroke();
    for (let i = 0; i < card.height; i++) {
      let inter = map(i, 0, card.height, 0, 1);
      let c = lerpColor(c1, c2, inter);
      fill(c);
      rect(card.x, card.y + i, card.width, 1);
    }
    
    stroke(0);
    noFill();
    rect(card.x, card.y, card.width, card.height); // Border
    
    // Add inner shadow
    stroke(220);
    line(card.x + 1, card.y + 1, card.x + card.width - 1, card.y + 1);
    line(card.x + 1, card.y + 1, card.x + 1, card.y + card.height - 1);
    
    // Add digit
    fill(50, 50, 120);
    textSize(28);
    textAlign(CENTER, CENTER);
    text(card.digit, card.x + card.width / 2, card.y + card.height / 2);
    pop();
  }
}

function showSolution() {
  // Get the values from the placeholders
  let values = placeholders[currentEquation - 1].map(p => p.value === null ? null : p.value);
  
  // Check if all placeholders have values
  if (values.includes(null)) {
    solutionText = "Bitte fülle alle Platzhalter aus!";
    return;
  }
  
  // Solve the equation based on the current equation and values
  solutionText = solveEquation(currentEquation, values);
  
  // Show some visual feedback for the button (pulse effect)
  solutionButton.style('transform', 'scale(1.1)');
  setTimeout(() => {
    solutionButton.style('transform', 'scale(1)');
  }, 300);
}

function solveEquation(equation, values) {
  // Convert values to numbers
  values = values.map(v => parseInt(v));
  
  let result = "";
  
  switch (equation) {
    case 1:
      // ( ax + b ) + ( cx + d ) = ( ex + f ) + ( gx + h )
      // a, b, c, d, e, f, g, h = values[0] to values[7]
      let coefA1 = values[0] + values[2] - values[4] - values[6];
      let constB1 = values[1] + values[3] - values[5] - values[7];
      
      if (coefA1 === 0 && constB1 === 0) {
        result = "Anzahl Lösungen: x-beliebig\nDie Gleichung ist für alle Werte von x erfüllt.";
      } else if (coefA1 === 0 && constB1 !== 0) {
        result = "Anzahl Lösungen: keine\nDie Gleichung hat keine Lösung.";
      } else {
        let solution = -constB1 / coefA1;
        result = "Anzahl Lösungen: 1\nLösung: x = " + solution;
      }
      break;
      
    case 2:
      // (ax + b) · (cx + d) = (ex + f) · (gx + h)
      // a, b, c, d, e, f, g, h = values[0] to values[7]
      let a2 = values[0] * values[2] - values[4] * values[6]; // acx² - egx²
      let b2 = values[0] * values[3] + values[1] * values[2] - values[4] * values[7] - values[5] * values[6]; // adx + bcx - ehx - fgx
      let c2 = values[1] * values[3] - values[5] * values[7]; // bd - fh
      
      if (a2 === 0 && b2 === 0 && c2 === 0) {
        result = "Anzahl Lösungen: x-beliebig\nDie Gleichung ist für alle Werte von x erfüllt.";
      } else if (a2 === 0 && b2 === 0 && c2 !== 0) {
        result = "Anzahl Lösungen: keine\nDie Gleichung hat keine Lösung.";
      } else if (a2 === 0 && b2 !== 0) {
        // Linear equation
        let solution = -c2 / b2;
        result = "Anzahl Lösungen: 1\nLösung: x = " + solution;
      } else {
        // Quadratic equation
        let discriminant = b2 * b2 - 4 * a2 * c2;
        
        if (discriminant < 0) {
          result = "Anzahl Lösungen: keine\nKeine reelle Lösung.";
        } else if (discriminant === 0) {
          let solution = -b2 / (2 * a2);
          result = "Anzahl Lösungen: 1\nLösung: x = " + solution;
        } else {
          let solution1 = (-b2 + Math.sqrt(discriminant)) / (2 * a2);
          let solution2 = (-b2 - Math.sqrt(discriminant)) / (2 * a2);
          result = "Anzahl Lösungen: 2\nLösungen: x = " + solution1 + " oder x = " + solution2;
        }
      }
      break;
      
    case 3:
      // ( ax + b ) = ( ex + f )
      // a, b, e, f = values[0] to values[3]
      let coefA3 = values[0] - values[2];
      let constB3 = values[1] - values[3];
      
      if (coefA3 === 0 && constB3 === 0) {
        result = "Anzahl Lösungen: x-beliebig\nDie Gleichung ist für alle Werte von x erfüllt.";
      } else if (coefA3 === 0 && constB3 !== 0) {
        result = "Anzahl Lösungen: keine\nDie Gleichung hat keine Lösung.";
      } else {
        let solution = -constB3 / coefA3;
        result = "Anzahl Lösungen: 1\nLösung: x = " + solution;
      }
      break;
      
    case 4:
      // a ( bx + c ) = d ( ex + f )
      // a, b, c, d, e, f = values[0] to values[5]
      let coefA4 = values[0] * values[1] - values[3] * values[4];
      let constB4 = values[0] * values[2] - values[3] * values[5];
      
      if (coefA4 === 0 && constB4 === 0) {
        result = "Anzahl Lösungen: x-beliebig\nDie Gleichung ist für alle Werte von x erfüllt.";
      } else if (coefA4 === 0 && constB4 !== 0) {
        result = "Anzahl Lösungen: keine\nDie Gleichung hat keine Lösung.";
      } else {
        let solution = -constB4 / coefA4;
        result = "Anzahl Lösungen: 1\nLösung: x = " + solution;
      }
      break;
      
    case 5:
      // ax + b = c
      // a, b, c = values[0] to values[2]
      if (values[0] === 0 && values[1] === values[2]) {
        result = "Anzahl Lösungen: x-beliebig\nDie Gleichung ist für alle Werte von x erfüllt.";
      } else if (values[0] === 0 && values[1] !== values[2]) {
        result = "Anzahl Lösungen: keine\nDie Gleichung hat keine Lösung.";
      } else {
        let solution = (values[2] - values[1]) / values[0];
        result = "Anzahl Lösungen: 1\nLösung: x = " + solution;
      }
      break;
      
    case 6:
      // ax + b = cx
      // a, b, c = values[0] to values[2]
      let coefA6 = values[0] - values[2];
      
      if (coefA6 === 0 && values[1] === 0) {
        result = "Anzahl Lösungen: x-beliebig\nDie Gleichung ist für alle Werte von x erfüllt.";
      } else if (coefA6 === 0 && values[1] !== 0) {
        result = "Anzahl Lösungen: keine\nDie Gleichung hat keine Lösung.";
      } else {
        let solution = -values[1] / coefA6;
        result = "Anzahl Lösungen: 1\nLösung: x = " + solution;
      }
      break;
      
    case 7:
      // a (bx + c ) = d
      // a, b, c, d = values[0] to values[3]
      if (values[0] * values[1] === 0 && values[0] * values[2] === values[3]) {
        result = "Anzahl Lösungen: x-beliebig\nDie Gleichung ist für alle Werte von x erfüllt.";
      } else if (values[0] * values[1] === 0 && values[0] * values[2] !== values[3]) {
        result = "Anzahl Lösungen: keine\nDie Gleichung hat keine Lösung.";
      } else {
        let solution = (values[3] - values[0] * values[2]) / (values[0] * values[1]);
        result = "Anzahl Lösungen: 1\nLösung: x = " + solution;
      }
      break;
      
    case 8:
      // a (bx + c ) = dx
      // a, b, c, d = values[0] to values[3]
      let coefA8 = values[0] * values[1] - values[3];
      
      if (coefA8 === 0 && values[0] * values[2] === 0) {
        result = "Anzahl Lösungen: x-beliebig\nDie Gleichung ist für alle Werte von x erfüllt.";
      } else if (coefA8 === 0 && values[0] * values[2] !== 0) {
        result = "Anzahl Lösungen: keine\nDie Gleichung hat keine Lösung.";
      } else {
        let solution = -(values[0] * values[2]) / coefA8;
        result = "Anzahl Lösungen: 1\nLösung: x = " + solution;
      }
      break;
  }
  
  return result;
}