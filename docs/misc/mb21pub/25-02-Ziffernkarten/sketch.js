// Globale Variablen
let cards = [];
let cardPositions = [
    [0, 1, 2, 3, 4],     // erste Reihe
    [5, 6, 7, 8, 9]      // zweite Reihe
];
let selectedCard = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
const SNAP_DISTANCE = 30;
const CARD_WIDTH = 60;
const CARD_HEIGHT = 80;
const PADDING = 70;
const START_X = 50;
const START_Y1 = 100;
const START_Y2 = 250;
const GROUP_GAP = 30;

class Card {
    constructor(value, position) {
        this.value = value;
        this.position = position; // [row, col]
        this.x = this.getXFromPosition();
        this.y = this.getYFromPosition();
        this.targetX = this.x;
        this.targetY = this.y;
        this.width = CARD_WIDTH;
        this.height = CARD_HEIGHT;
        this.revealed = true;
    }

    getXFromPosition() {
        let x = START_X + (this.position[1] * PADDING);
        // Füge Lücke nach der 2er Gruppe hinzu
        if (this.position[1] >= 2) {
            x += GROUP_GAP;
        }
        return x;
    }

    getYFromPosition() {
        return this.position[0] === 0 ? START_Y1 : START_Y2;
    }

    display() {
        push();
        translate(this.x, this.y);
        
        // Karte zeichnen
        fill(255);
        stroke(0);
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
    createCanvas(800, 400);
    initializeCards();
    redistributeCards();
}

function draw() {
    background(240);
    
    // Zeichne Slots
    drawSlots();
    
    // Zeichne alle Karten außer der ausgewählten
    cards.forEach(card => {
        if (card !== selectedCard) {
            card.update();
            card.display();
        }
    });
    
    // Zeichne ausgewählte Karte zuletzt
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

function initializeCards() {
    cards = [];
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
            let value = cardPositions[row][col];
            cards.push(new Card(value, [row, col]));
        }
    }
}

function redistributeCards() {
    let values = [...Array(10).keys()];
    shuffle(values, true);
    
    let index = 0;
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
            cards[index].value = values[index];
            cards[index].revealed = false;
            index++;
        }
    }

    setTimeout(() => {
        cards.forEach(card => {
            card.revealed = true;
        });
        calculatePercentage();
    }, 1000);
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

function swapCards(card1, pos1, pos2) {
    // Finde Karte an Position 2
    let card2 = cards.find(c => 
        c.position[0] === pos2[0] && 
        c.position[1] === pos2[1]
    );
    
    // Tausche Positionen
    card2.setPosition(pos1);
    card1.setPosition(pos2);
    
    calculatePercentage();
}

function calculatePercentage() {
    // Erste Reihe
    let firstRow = cards.filter(c => c.position[0] === 0)
                       .sort((a, b) => a.position[1] - b.position[1]);
    
    let num1 = parseInt(firstRow.slice(0, 2).map(c => c.value).join(''));
    let num2 = parseInt(firstRow.slice(2, 5).map(c => c.value).join(''));
    
    // Zweite Reihe
    let secondRow = cards.filter(c => c.position[0] === 1)
                        .sort((a, b) => a.position[1] - b.position[1]);
    
    let num3 = parseInt(secondRow.slice(0, 2).map(c => c.value).join(''));
    let num4 = parseInt(secondRow.slice(2, 5).map(c => c.value).join(''));
    
    let result1 = (num1 / 100) * num2;
    let result2 = (num3 / 100) * num4;
    
    document.getElementById('percentage').innerHTML = 
        `${num1}% von ${num2} = ${result1.toFixed(2)}<br>` +
        `${num3}% von ${num4} = ${result2.toFixed(2)}`;
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
            selectedCard.x + selectedCard.width/2,
            selectedCard.y + selectedCard.height/2
        );

        if(nearestPos) {
            let oldPos = selectedCard.position;
            if (nearestPos[0] !== oldPos[0] || nearestPos[1] !== oldPos[1]) {
                swapCards(selectedCard, oldPos, nearestPos);
            } else {
                // Zurück zur ursprünglichen Position
                selectedCard.x = selectedCard.targetX;
                selectedCard.y = selectedCard.targetY;
            }
        } else {
            // Zurück zur ursprünglichen Position
            selectedCard.x = selectedCard.targetX;
            selectedCard.y = selectedCard.targetY;
        }
    }
    
    selectedCard = null;
    isDragging = false;
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