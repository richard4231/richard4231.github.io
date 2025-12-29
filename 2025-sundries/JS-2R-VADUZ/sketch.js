
// Globale Variablen
let cards = [];
let selectedCard = null;
let ghostCard = null;
let isDragging = false;

// Layout-Konstanten
let CARD_WIDTH = 60;
let CARD_HEIGHT = 80;
let PADDING = 70;
let GROUP_GAP = 80;
let START_X;
const START_Y1 = 20;
const START_Y2 = 170;
const SNAP_DISTANCE = 40;

// Farben
const cardColors = {
    row1: { group1: '#ECABB3', group2: '#BCE4FA' },
    row2: { group1: '#FFEC76', group2: '#C5CE70' }
};
const previewColor = '#D0D0D0';

function calculateStartX() {
    const group1Width = (CARD_WIDTH * 2) + PADDING;
    const group2Width = (CARD_WIDTH * 3) + (PADDING * 2);
    const totalWidth = group1Width + GROUP_GAP + group2Width;
    return width / 2 - (group1Width + GROUP_GAP + CARD_WIDTH/2) + 50;
}

class Card {
    constructor(value, position) {
        this.value = value;
        this.position = position;
        this.width = CARD_WIDTH;
        this.height = CARD_HEIGHT;
        this.revealed = true;
        this.isPreview = false;
        this.previewOffsetY = 0;
        this.targetPreviewOffsetY = 0;
        this.updatePosition();
    }

    updatePosition() {
        this.targetX = START_X + (this.position[1] * PADDING) + (this.position[1] >= 2 ? GROUP_GAP : 0);
        this.targetY = this.position[0] === 0 ? START_Y1 : START_Y2;
        this.x = this.targetX;
        this.y = this.targetY;
        // Farbe bleibt unverändert - wird nur bei Neuverteilung gesetzt
    }

    getCardColor() {
        const row = this.position[0];
        const col = this.position[1];
        return row === 0 
            ? (col < 2 ? cardColors.row1.group1 : cardColors.row1.group2)
            : (col < 2 ? cardColors.row2.group1 : cardColors.row2.group2);
    }

    display() {
        push();
        translate(this.x, this.y + this.previewOffsetY);
        
        let cardColor = this.isPreview ? previewColor : this.color;
        let alpha = this === selectedCard ? 50 : (this.isPreview ? 200 : 255);
        
        fill(red(cardColor), green(cardColor), blue(cardColor), alpha);
        stroke(0);
        strokeWeight(1);
        rect(0, 0, this.width, this.height, 5);
        
        if (this.revealed) {
            fill(0, 0, 0, alpha);
            noStroke();
            textSize(32);
            textAlign(CENTER, CENTER);
            text(this.value, this.width/2, this.height/2);
        } else {
            fill(200, 200, 200, alpha);
            noStroke();
        }
        
        pop();
    }

    contains(px, py) {
        return px > this.x && px < this.x + this.width &&
                py > this.y && py < this.y + this.height;
    }

    update() {
        if (!isDragging || this !== selectedCard) {
            this.x = lerp(this.x, this.targetX, 0.2);
            this.y = lerp(this.y, this.targetY, 0.2);
        }
        this.previewOffsetY = lerp(this.previewOffsetY, this.targetPreviewOffsetY, 0.15);
    }

    setPosition(newPosition) {
        this.position = newPosition;
        this.targetX = START_X + (this.position[1] * PADDING) + (this.position[1] >= 2 ? GROUP_GAP : 0);
        this.targetY = this.position[0] === 0 ? START_Y1 : START_Y2;
        // Farbe bleibt unverändert beim Verschieben
    }

    setPreview(isPreview) {
        this.isPreview = isPreview;
        this.targetPreviewOffsetY = isPreview ? 15 : 0;
    }
}

class GhostCard {
    constructor(card, mouseX, mouseY) {
        this.value = card.value;
        this.width = card.width;
        this.height = card.height;
        this.color = card.color; // Behält die ursprüngliche Kartenfarbe
        this.x = mouseX - this.width/2;
        this.y = mouseY - this.height/2;
    }

    update(mouseX, mouseY) {
        this.x = mouseX - this.width/2;
        this.y = mouseY - this.height/2;
    }

    display() {
        push();
        translate(this.x + this.width/2, this.y + this.height/2);
        rotate(-0.1);
        scale(1.1);
        
        // Shadow
        push();
        translate(3, 3);
        fill(0, 0, 0, 50);
        noStroke();
        rect(-this.width/2, -this.height/2, this.width, this.height, 5);
        pop();
        
        // Ghost Card
        fill(red(this.color), green(this.color), blue(this.color), 200);
        stroke(0, 0, 0, 200);
        strokeWeight(1);
        rect(-this.width/2, -this.height/2, this.width, this.height, 5);
        
        fill(0, 0, 0, 200);
        noStroke();
        textSize(32);
        textAlign(CENTER, CENTER);
        text(this.value, 0, 0);
        
        pop();
    }
}

function setup() {
    createCanvas(min (600, windowWidth * 0.9), min(400, windowHeight * 0.8));
    document.getElementById('percentage').classList.toggle('visible');
    updateDimensions();
    initializeCards();
    redistributeCards();
}

function updateDimensions() {
    let scale = min(1, windowWidth / 800);
    CARD_WIDTH = 60 * scale;
    CARD_HEIGHT = 80 * scale;
    PADDING = 70 * scale;
    GROUP_GAP = 80 * scale;
    START_X = calculateStartX();
}

function windowResized() {
    resizeCanvas(min (600, windowWidth * 0.9), min(400, windowHeight * 0.8));
    updateDimensions();
    cards.forEach(card => {
        card.width = CARD_WIDTH;
        card.height = CARD_HEIGHT;
        card.updatePosition();
    });
}

function initializeCards() {
    cards = [];
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
            cards.push(new Card(row * 5 + col, [row, col]));
        }
    }
}

function redistributeCards() {
    let values = [...Array(10).keys()];
    shuffle(values, true);
    
    cards.forEach((card, index) => {
        let row = Math.floor(index / 5);
        let col = index % 5;
        card.setPosition([row, col]);
        card.value = values[index];
        card.revealed = false;
        card.setPreview(false);
        // Farbe neu setzen basierend auf der neuen Position
        card.color = card.getCardColor();
    });

    setTimeout(() => {
        cards.forEach(card => card.revealed = true);
        calculatePercentage();
    }, 1000);
}

function draw() {
    background(240);
    drawSlots();
    
    // Cursor management
    if (isDragging) {
        cursor('grabbing');
    } else {
        let overCard = cards.some(card => card.contains(mouseX, mouseY));
        cursor(overCard ? 'grab' : 'default');
    }
    
    cards.forEach(card => {
        card.update();
        card.display();
    });
    
    if (ghostCard) {
        ghostCard.display();
    }
}

function drawSlots() {
    for (let row = 0; row < 2; row++) {
        let y = row === 0 ? START_Y1 : START_Y2;
        
        for (let col = 0; col < 5; col++) {
            let x = START_X + (col * PADDING) + (col >= 2 ? GROUP_GAP : 0);
            fill(200, 200, 255, 100);
            noStroke();
            ellipse(x + CARD_WIDTH/2, y + CARD_HEIGHT/2, 10, 10);
        }
        
        let percentX = START_X + (PADDING * 2) + (GROUP_GAP / 2.5);
        textSize(16 * min(1, windowWidth / 800));
        textAlign(CENTER, CENTER);
        fill(0);
        noStroke();
        textStyle(BOLD);
        text("% von", percentX, y + CARD_HEIGHT/2);
        textStyle(NORMAL);
    }
}

function findNearestSlot(x, y) {
    let minDist = Infinity;
    let nearestPos = null;
    
    for (let row = 0; row < 2; row++) {
        let slotY = row === 0 ? START_Y1 : START_Y2;
        for (let col = 0; col < 5; col++) {
            let slotX = START_X + (col * PADDING) + (col >= 2 ? GROUP_GAP : 0);
            let d = dist(x, y, slotX + CARD_WIDTH/2, slotY + CARD_HEIGHT/2);
            if (d < minDist) {
                minDist = d;
                nearestPos = [row, col];
            }
        }
    }
    
    return minDist < SNAP_DISTANCE ? nearestPos : null;
}

function updatePreview() {
    cards.forEach(card => card.setPreview(false));
    
    if (!ghostCard || !selectedCard) return;
    
    let nearestPos = findNearestSlot(mouseX, mouseY);
    if (nearestPos) {
        let cardAtTarget = cards.find(c => 
            c.position[0] === nearestPos[0] && c.position[1] === nearestPos[1]
        );
        if (cardAtTarget && cardAtTarget !== selectedCard) {
            cardAtTarget.setPreview(true);
        }
    }
}

function mousePressed() {
    for (let card of cards) {
        if (card.contains(mouseX, mouseY)) {
            selectedCard = card;
            isDragging = true;
            ghostCard = new GhostCard(card, mouseX, mouseY);
            break;
        }
    }
}

function mouseDragged() {
    if (isDragging && selectedCard && ghostCard) {
        ghostCard.update(mouseX, mouseY);
        updatePreview();
    }
}

function mouseReleased() {
    if (selectedCard) {
        let nearestPos = findNearestSlot(mouseX, mouseY);

        if (nearestPos) {
            let oldPos = selectedCard.position;
            if (nearestPos[0] !== oldPos[0] || nearestPos[1] !== oldPos[1]) {
                let cardAtTarget = cards.find(c => 
                    c.position[0] === nearestPos[0] && c.position[1] === nearestPos[1]
                );
                
                if (cardAtTarget) {
                    cardAtTarget.setPosition(oldPos);
                }
                selectedCard.setPosition(nearestPos);
                calculatePercentage();
            }
        }
    }
    
    ghostCard = null;
    selectedCard = null;
    isDragging = false;
    cards.forEach(card => card.setPreview(false));
}

function calculatePercentage() {
    let sortedCards = [...cards].sort((a, b) => {
        if (a.position[0] !== b.position[0]) {
            return a.position[0] - b.position[0];
        }
        return a.position[1] - b.position[1];
    });

    let firstRow = sortedCards.slice(0, 5);
    let secondRow = sortedCards.slice(5);
    
    let num1 = parseInt(firstRow.slice(0, 2).map(c => c.value).join(''));
    let num2 = parseInt(firstRow.slice(2, 5).map(c => c.value).join(''));
    let num3 = parseInt(secondRow.slice(0, 2).map(c => c.value).join(''));
    let num4 = parseInt(secondRow.slice(2, 5).map(c => c.value).join(''));
    
    let result1 = (num1 / 100) * num2;
    let result2 = (num3 / 100) * num4;
    let difference = Math.abs(result1 - result2);
    
    document.getElementById('percentage').innerHTML = 
        `<div class="result-line">${num1}% von ${num2} = ${result1.toFixed(2)}</div>` +
        `<div class="result-line">${num3}% von ${num4} = ${result2.toFixed(2)}</div>` +
        `<div class="difference">Differenz: ${difference.toFixed(2)}</div>`;
}

// Touch Events
function touchStarted() { mousePressed(); return false; }
function touchMoved() { mouseDragged(); return false; }
function touchEnded() { mouseReleased(); return false; }