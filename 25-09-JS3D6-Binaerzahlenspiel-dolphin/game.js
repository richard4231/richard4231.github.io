let dots = [];
let targetNumber;
const maxDots = 7; // 2^6

function createDot(index) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    dot.addEventListener('click', () => toggleDot(index));
    dot.dataset.index = index;
    return dot;
}

function initGame() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = '';
    dots = [];
    for (let i = 0; i < maxDots; i++) {
        const dot = createDot(i);
        gameContainer.appendChild(dot);
        dots.push({ element: dot, value: Math.pow(2, i) });
    }
}

function toggleDot(index) {
    if (index > -1 && index < dots.length) {
        dots[index].element.classList.toggle('active');
        dots[index + 1]?.element.classList.add('active');
        dots[index - 1]?.element.classList.add('active');

        updateCurrentNumber();
    }
}

function updateCurrentNumber() {
    let currentNumber = 0;
    dots.forEach(dot => {
        if (dot.element.classList.contains('active')) {
            currentNumber += dot.value;
        }
    });
    document.getElementById('current-number').innerText = currentNumber;
}

function startCooperativeGame() {
    initGame();
    targetNumber = Math.floor(Math.random() * 63) + 1;
    document.getElementById('target-number').innerText = targetNumber;
}

function startCompetitiveGame() {
    initGame();
    targetNumber = Math.floor(Math.random() * 127) + 1;
    document.getElementById('target-number').innerText = targetNumber;
}

// Initial call to set up the game
initGame();
