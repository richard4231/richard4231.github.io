let counts = { 6: 0, 7: 0, 8: 0, 9: 0 };
let totalTests = 0;
const maxTests = 1000;

function setup() {
    createCanvas(600, 400);
    textAlign(CENTER, CENTER);
    textSize(16);
}

function draw() {
    background(240);
    
    // Neue Werte generieren, bis maxTests erreicht ist
    if (totalTests < maxTests) {
        const value = getWeightedRandom();
        counts[value]++;
        totalTests++;
    }
    
    // Balken zeichnen
    const barWidth = width / 8;
    const maxHeight = height - 100;
    
    Object.entries(counts).forEach(([value, count], index) => {
        const percentage = (count / totalTests * 100);
        const x = width/4 + index * barWidth * 1.5;
        const barHeight = (percentage / 100) * maxHeight;
        
        // Balken
        fill(100, 150, 255);
        rect(x - barWidth/2, height - barHeight - 50, barWidth, barHeight);
        
        // Beschriftung (Wert)
        fill(0);
        text(value, x, height - 30);
        
        // Prozentanzeige
        text(percentage.toFixed(1) + '%', x, height - barHeight - 70);
    });
    
    // Titel und Info
    fill(0);
    textSize(20);
    text(`Verteilungstest (${totalTests} Durchläufe)`, width/2, 30);
    textSize(16);
    
    // Erwartete Verteilung anzeigen
    text('Erwartete Verteilung: 6:20% | 7:50% | 8:25% | 9:5%', width/2, 60);
}

// Reset-Funktion
function mousePressed() {
    counts = { 6: 0, 7: 0, 8: 0, 9: 0 };
    totalTests = 0;
}

// Die getWeightedRandom Funktion von vorher
function getWeightedRandom() {
    const distribution = [
        { value: 6, probability: 0.20 },
        { value: 7, probability: 0.50 },
        { value: 8, probability: 0.25 },
        { value: 9, probability: 0.05 }
    ];
    
    const rand = random();
    let sum = 0;
    
    for (const item of distribution) {
        sum += item.probability;
        if (rand < sum) {
            return item.value;
        }
    }
    
    return distribution[distribution.length - 1].value;
}