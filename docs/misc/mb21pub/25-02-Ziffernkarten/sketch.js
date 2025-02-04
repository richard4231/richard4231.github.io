// Globale Variablen
let cards = [];
let cardPositions = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9]
];
let selectedCard = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Konstanten
const SNAP_DISTANCE = 30;
let CARD_WIDTH = 60;
let CARD_HEIGHT = 80;
let PADDING = 70;
let GROUP_GAP = 30;
let START_X; // Wird dynamisch berechnet
const START_Y1 = 5;
const START_Y2 = 155;

// Help-Sequenz
let keyBuffer = '';
const targetSequence = 'help';
const bufferTimeout = 2000;
let resetBufferTimer = null;

// Kartenfarben
const cardColors = {
    row1: {
        group1: '#ECABB3', // Rosa
        group2: '#BCE4FA'  // Hellblau
    },
    row2: {
        group1: '#FFEC76',  // Hellgelb
        group2: '#C5CE70', // Hellgrün
    }
};

// Berechne die Startposition für horizontale Zentrierung
function calculateStartX() {
    // Die erste Gruppe: 2 Karten mit 1 Abstand dazwischen
    const group1Width = (CARD_WIDTH * 2) + PADDING;
    
    // Die zweite Gruppe: 3 Karten mit 2 Abständen dazwischen
    const group2Width = (CARD_WIDTH * 3) + (PADDING * 2);
    
    // Gesamtbreite mit der Gruppenlücke
    const totalWidth = group1Width + GROUP_GAP + group2Width;
    
    // Canvas-Mitte
    const middleOfCanvas = width / 2;
    
    // Verschiebung nach links, damit die dritte Karte in/nahe der Mitte ist
    // Die 40 verschiebt alles etwas weiter nach links
    return middleOfCanvas - (group1Width + GROUP_GAP + CARD_WIDTH/2) + 50;
}

class Card {
    constructor(value, position) {
        this.value = value;
        this.position = position;
        this.x = this.getXFromPosition();
        this.y = this.getYFromPosition();
        this.targetX = this.x;
        this.targetY = this.y;
        this.width = CARD_WIDTH;
        this.height = CARD_HEIGHT;
        this.revealed = true;
        this.color = this.getCardColor();
    }

    getXFromPosition() {
        let x = START_X + (this.position[1] * PADDING);
        if (this.position[1] >= 2) {
            x += GROUP_GAP;
        }
        return x;
    }

    getYFromPosition() {
        return this.position[0] === 0 ? START_Y1 : START_Y2;
    }

    getCardColor() {
        const row = this.position[0];
        const col = this.position[1];
        if (row === 0) {
            return col < 2 ? cardColors.row1.group1 : cardColors.row1.group2;
        } else {
            return col < 2 ? cardColors.row2.group1 : cardColors.row2.group2;
        }
    }

    display() {
        push();
        translate(this.x, this.y);
        
        // Karte zeichnen
        fill(this.color);
        stroke(0);
        strokeWeight(1);
        rect(0, 0, this.width, this.height, 5);
        
        if (this.revealed) {
            fill(0);
            noStroke();
            textSize(32);
            textAlign(CENTER, CENTER);
            text(this.value, this.width/2, this.height/2);
        } else {
            fill(200);
            for(let i = 0; i < 5; i++) {
                for(let j = 0; j < 7; j++) {
                    ellipse(10 + i*10, 10 + j*10, 3, 3);
                }
            }
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
    }

    setPosition(newPosition) {
        this.position = newPosition;
        this.targetX = this.getXFromPosition();
        this.targetY = this.getYFromPosition();
    }
}

function setup() {
    createCanvas(windowWidth * 0.95, windowHeight * 0.7);
    document.getElementById('percentage').classList.remove('visible');
    updateDimensions();
    initializeCards();
    redistributeCards();
}

function updateDimensions() {
    // Berechne neue Dimensionen basierend auf der Fensterbreite
    let scale = min(1, windowWidth / 800);
    CARD_WIDTH = 60 * scale;
    CARD_HEIGHT = 80 * scale;
    PADDING = 70 * scale;
    GROUP_GAP = 30 * scale;
    START_X = calculateStartX();
}

function windowResized() {
    resizeCanvas(windowWidth * 0.95, windowHeight * 0.7);
    updateDimensions();
    
    // Kartenpositionen neu berechnen
    cards.forEach(card => {
        card.width = CARD_WIDTH;
        card.height = CARD_HEIGHT;
        card.setPosition(card.position);
    });
}

function initializeCards() {
    cards = [];
    cardPositions.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
            let value = cardPositions[rowIndex][colIndex];
            cards.push(new Card(value, [rowIndex, colIndex]));
        });
    });
}

function redistributeCards() {
    let values = [...Array(10).keys()];
    shuffle(values, true);
    
    cards.forEach((card, index) => {
        card.value = values[index];
        card.revealed = false;
    });

    setTimeout(() => {
        cards.forEach(card => {
            card.revealed = true;
        });
        calculatePercentage();
    }, 1000);
}

function draw() {
    background(240);
    drawSlots();
    
    cards.forEach(card => {
        if (card !== selectedCard) {
            card.update();
            card.display();
        }
    });
    
    if (selectedCard) {
        selectedCard.display();
    }
}

function drawSlots() {
    for (let row = 0; row < 2; row++) {
        let y = row === 0 ? START_Y1 : START_Y2;
        for (let col = 0; col < 5; col++) {
            let x = START_X + (col * PADDING);
            if (col >= 2) x += GROUP_GAP;
            
            fill(200, 200, 255, 100);
            noStroke();
            ellipse(x + CARD_WIDTH/2, y + CARD_HEIGHT/2, 10, 10);
        }
    }
}

function findNearestSlot(x, y) {
    let minDist = Infinity;
    let nearestPos = null;
    
    for (let row = 0; row < 2; row++) {
        let slotY = row === 0 ? START_Y1 : START_Y2;
        for (let col = 0; col < 5; col++) {
            let slotX = START_X + (col * PADDING);
            if (col >= 2) slotX += GROUP_GAP;
            
            let d = dist(x, y, slotX + CARD_WIDTH/2, slotY + CARD_HEIGHT/2);
            if (d < minDist) {
                minDist = d;
                nearestPos = [row, col];
            }
        }
    }
    
    return minDist < SNAP_DISTANCE ? nearestPos : null;
}

function mousePressed() {
    for(let card of cards) {
        if(card.contains(mouseX, mouseY)) {
            selectedCard = card;
            isDragging = true;
            dragOffsetX = mouseX - card.x;
            dragOffsetY = mouseY - card.y;
            break;
        }
    }
}

function mouseDragged() {
    if(isDragging && selectedCard) {
        selectedCard.x = mouseX - dragOffsetX;
        selectedCard.y = mouseY - dragOffsetY;
    }
}

function mouseReleased() {
    if(selectedCard) {
        let nearestPos = findNearestSlot(
            selectedCard.x + CARD_WIDTH/2,
            selectedCard.y + CARD_HEIGHT/2
        );

        if(nearestPos) {
            let oldPos = selectedCard.position;
            if(nearestPos[0] !== oldPos[0] || nearestPos[1] !== oldPos[1]) {
                // Finde Karte am Zielort
                let cardAtTarget = cards.find(c => 
                    c.position[0] === nearestPos[0] && 
                    c.position[1] === nearestPos[1]
                );
                
                // Tausche Positionen
                if(cardAtTarget) {
                    cardAtTarget.setPosition(oldPos);
                }
                selectedCard.setPosition(nearestPos);
                
                calculatePercentage();
            }
        }
        
        // Zurück zur Zielposition
        selectedCard.x = selectedCard.targetX;
        selectedCard.y = selectedCard.targetY;
    }
    
    selectedCard = null;
    isDragging = false;
}

function calculatePercentage() {
    // Sortiere Karten nach Position
    let sortedCards = [...cards].sort((a, b) => {
        if (a.position[0] !== b.position[0]) {
            return a.position[0] - b.position[0];
        }
        return a.position[1] - b.position[1];
    });

    // Erste Reihe
    let firstRow = sortedCards.slice(0, 5);
    let num1 = parseInt(firstRow.slice(0, 2).map(c => c.value).join(''));
    let num2 = parseInt(firstRow.slice(2, 5).map(c => c.value).join(''));
    
    // Zweite Reihe
    let secondRow = sortedCards.slice(5);
    let num3 = parseInt(secondRow.slice(0, 2).map(c => c.value).join(''));
    let num4 = parseInt(secondRow.slice(2, 5).map(c => c.value).join(''));
    
    let result1 = (num1 / 100) * num2;
    let result2 = (num3 / 100) * num4;
    
    document.getElementById('percentage').innerHTML = 
        `${num1}% von ${num2} = ${result1.toFixed(2)}<br>` +
        `${num3}% von ${num4} = ${result2.toFixed(2)}`;
}

function keyPressed() {
    if (key.length === 1 && key.match(/[a-z]/i)) {
        keyBuffer += key.toLowerCase();
        
        if (resetBufferTimer) clearTimeout(resetBufferTimer);
        resetBufferTimer = setTimeout(() => {
            keyBuffer = '';
        }, bufferTimeout);
        
        if (keyBuffer.includes(targetSequence)) {
            togglePercentageVisibility();
            keyBuffer = '';
            if (resetBufferTimer) clearTimeout(resetBufferTimer);
            return false;
        }
        
        if (keyBuffer.length > 10) {
            keyBuffer = keyBuffer.slice(-10);
        }
    }
    return true;
}

function togglePercentageVisibility() {
    const percentageDiv = document.getElementById('percentage');
    percentageDiv.classList.toggle('visible');
}

// Touch Events
function touchStarted() {
    mousePressed();
    return false;
}

function touchMoved() {
    mouseDragged();
    return false;
}

function touchEnded() {
    mouseReleased();
    return false;
}