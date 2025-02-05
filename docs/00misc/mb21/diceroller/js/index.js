// @ts-ignore
import DiceBox from '/misc/mb21/diceroller/lib/@3d-dice/dice-box/dist/dice-box.es.min.js'
import { THEMES, COLORS, DEFAULT_DICE_CONFIG, MANY_DICE_CONFIG, ASSET_PATH } from './config.js';
import { DiceValidation } from './validation.js';

// Hilfsfunktionen
const getRandomFromList = (list) => list[Math.floor(Math.random() * list.length)];

const getRandomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDiceConfig = () => ({
  throwForce: getRandomRange(4, 10),
  spinForce: getRandomRange(4, 9),
  startingHeight: getRandomRange(4, 11)
});

class DiceSection {
  constructor(container) {
    this.container = container;
    this.init();
    this.setupHelpOverlay();
  }

  // Overlay für Hilfe-Funktionalität
  setupHelpOverlay() {
    const helpButton = this.container.querySelector('.help-button');
    const helpOverlay = this.container.querySelector('.help-overlay');
    
    if (!helpButton || !helpOverlay) return;
    
    const closeOverlay = () => {
      helpOverlay.classList.remove('show');
      document.removeEventListener('click', closeOverlay);
    };
    
    helpButton.addEventListener('click', (e) => {
      e.stopPropagation();
      helpOverlay.classList.add('show');
      setTimeout(() => document.addEventListener('click', closeOverlay), 0);
    });
  }

  // Initialisierung
  async init() {
    try {
      this.box = await this.initDiceBox();
      await this.setupEventListeners();
      DiceValidation.setupInputValidation(this.container);
    } catch (error) {
      console.error('Fehler bei der Initialisierung von DiceSection:', error);
    }
  }

  async initDiceBox() {
    const boxId = this.container.getAttribute('data-box-id');
    return new DiceBox({
      assetPath: ASSET_PATH,
      container: `#dice-box-${boxId}`,
      theme: getRandomFromList(THEMES),
      ...DEFAULT_DICE_CONFIG,
      preloadThemes: THEMES,
    }).init();
  }

  // UI-Steuerung
  toggleVisibility(showDice) {
    const diceBox = this.container.querySelector('.dice-box');
    const randomResult = this.container.querySelector('.random-result');
    
    diceBox.style.visibility = showDice ? 'visible' : 'hidden';
    if (!showDice) {
      this.box.clear();
    }
    if (showDice) {
      randomResult.classList.remove('show');
    }
  }

  // Würfel-Konfiguration
  getDiceTheme(diceType) {
    const themeMap = {
      'd4': THEMES[7],
      'd6': THEMES[6],
      'd100': getRandomFromList(['rust', 'rock', 'default', 'smooth']),
      'default': getRandomFromList(THEMES.slice(0, 4))
    };
    return themeMap[diceType] || themeMap.default;
  }

  updateDiceConfig(diceCount, diceType) {
    if (diceCount > 9 && diceType !== 'd100') {
      return MANY_DICE_CONFIG;
    }
    
    return {
      scale: 10,
      gravity: 4,
      mass: 4,
      friction: 0.5,
      restitution: 0.1,
      ...getRandomDiceConfig()
    };
  }

  // Würfelwurf-Logik
  async rollDice(diceType, diceCount) {
    const theme = this.getDiceTheme(diceType);
    const themeColor = getRandomFromList(COLORS);
    this.box.updateConfig(this.updateDiceConfig(diceCount, diceType));
    
    // Spezialfall: Schwebende d10 Würfel bei diceCount = 0
    if (this.container.querySelector('.dice-number').value == 0 && diceType ==='d10') {
      this.box.updateConfig({
        scale: 10,
        gravity: 0,
        mass: 1,
        friction: 0,
        restitution: 0.7,
        throwForce: 7,
        spinForce: 7,
        startingHeight: 20,
        angularDamping: 0.1,
        linearDamping: 0.4,
      });
      this.box.roll(['3d10'], {
        theme: theme,
        themeColor: getRandomFromList(COLORS),
      });
      this.box.roll(['3d10'], {
        theme: theme,
        themeColor: getRandomFromList(COLORS),
      });
      this.box.roll(['3d10'], {
        theme: theme,
        themeColor: getRandomFromList(COLORS),
      });
    }

    if (diceType === 'd100') {
      this.box.roll(['1d100'], { theme, themeColor });
      return;
    }

    if (diceType === 'd6') {
      for (let i = 0; i < diceCount; i++) {
        this.box.roll(['1dpip'], {
          theme,
          themeColor,
        });
      }
      return;
    }

    const iterDice = `1${diceType}`;
    for (let i = 0; i < diceCount; i++) {
      this.box.roll([iterDice], {
        theme,  //theme: THEMES[1],
        themeColor,
        ...getRandomDiceConfig()
      });
    }
  }

  // Spezielle Würfeleffekte
  handleSpecialDice(sides, diceCount) {
    const randomResult = this.container.querySelector('.random-result');
    const themeColor = getRandomFromList(COLORS);

    const specialCases = {
      2: () => this.rollCoins(diceCount),
      42: () => {
          this.box.updateConfig({
              theme: THEMES[4],
              themeColor,
              scale: 5,
              gravity: 4,
              mass: 2,
              friction: 0.5,
              restitution: 0.1,
              throwForce: 20
          });
          this.box.roll(["1000d20"], {newStartPoint: true });
      },
      418: () => this.showSpecialMessage(randomResult, "418: I'm a teapot"),
      503: () => this.showSpecialMessage(randomResult, "503: Service Unavailable")
    };

    if (specialCases[sides]) {
      specialCases[sides]();
      return true;
    }
    return false;
  }

  // Münzwurf-Funktion
  async rollCoins(count) {
    if (count > 2) {
      // Bei mehr als 2 Münzen normalen Zufallsgenerator verwenden
      this.rollCustomDice(2, count);
      return;
    }

    this.box.clear();
    for (let i = 0; i < count; i++) {
      const themeColor = getRandomFromList(COLORS);
      this.box.roll(['1d2'], {
        theme: THEMES[5],
        themeColor,
        throwForce: getRandomRange(4, 10),
        spinForce: getRandomRange(4, 9),
        startingHeight: getRandomRange(4, 11),
        delay: 100,
        lightIntensity: 0.1,
      });
    }
  }

  showSpecialMessage(element, message) {
    element.setAttribute('data-length', 'long');
    element.textContent = `${message}`; // Der Status-Code wird in handleSpecialDice hinzugefügt
    element.classList.add('show', 'flash');
    setTimeout(() => element.classList.remove('flash'), 300);
  } 

  // Event Listeners
  async setupEventListeners() {
    this.setupDiceButtons();
    this.setupCustomDice();
    this.setupContainerClickHandler();
  }

  setupDiceButtons() {
    ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'].forEach(diceType => {
      const button = this.container.querySelector(`.${diceType}`);
      button.addEventListener('click', () => this.handleDiceButtonClick(diceType, button));
    });
  }

  async handleDiceButtonClick(diceType, button) {
    button.classList.add('flash');
    setTimeout(() => button.classList.remove('flash'), 300);

    const diceCount = parseInt(this.container.querySelector('.dice-number').value) || 1;
    await this.rollDice(diceType, diceCount);
  }

  setupCustomDice() {
    const customDiceButton = this.container.querySelector('.dN');
    const customSidesInput = this.container.querySelector('.custom-sides');

    customDiceButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleCustomDiceRoll(customDiceButton);
    });

    customSidesInput.addEventListener('click', (e) => e.stopPropagation());
  }

  handleCustomDiceRoll(button) {
    const sides = parseInt(this.container.querySelector('.custom-sides').value);
    const diceCount = parseInt(this.container.querySelector('.dice-number').value) || 1;

    if (sides < 2 || sides > 999) return;

    button.classList.add('flash');
    setTimeout(() => button.classList.remove('flash'), 300);
    this.box.clear();

    if (!this.handleSpecialDice(sides, diceCount)) {
      this.rollCustomDice(sides, diceCount);
    }
  }

  rollCustomDice(sides, diceCount) {
    const randomResult = this.container.querySelector('.random-result');
    const results = Array.from({ length: diceCount }, () => 
      Math.floor(Math.random() * sides) + 1
    );

    // Längenlogik für reguläre Würfelergebnisse
    const lengthMap = {
      1: 'short',
      2: 'medium',
      3: 'medium',
      4: 'medium',
      default: 'long'
    };

    const dataLength = lengthMap[results.length] || lengthMap.default;
    randomResult.setAttribute('data-length', dataLength);
    randomResult.textContent = results.join(', ');

    randomResult.classList.add('show', 'flash');
    setTimeout(() => randomResult.classList.remove('flash'), 300);
}

  setupContainerClickHandler() {
    this.container.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-dice')) {
        const randomResult = this.container.querySelector('.random-result');
        if (randomResult.classList.contains('show')) {
          randomResult.classList.remove('show');
          this.toggleVisibility(true);
        }
      }
    });
  }
}

// Initialisierung aller Würfel-Sektionen
document.querySelectorAll('.dice-section').forEach(section => {
  new DiceSection(section);
});
