// Verfügbare Würfel-Themen
export const THEMES = Object.freeze([
    'default',
    'rock',
    'smooth',
    'rust',
    'rock',
    'default-extras', //5
    'smooth-pip', //6
    'gemstone',
    'gemstoneMarble'
]);

// Verfügbare Würfelfarben
export const COLORS = Object.freeze([
    //'#348888', '#22BABB', '#9EF8EE', '#FA7F08', '#F24405',
    //'#F25EB0', '#B9BF04', '#F2B705', '#F27405', '#F23005',
    //'#000000', '#FFFFFF',
    '#8AC7E4', '#C5CE70', '#D94368', '#BCE4FA', '#ECC500', '#71A2B5', '#0087BF',
]);

// Standard-Würfelkonfiguration (siehe https://fantasticdice.games/docs/usage/config)
export const DEFAULT_DICE_CONFIG = Object.freeze({
    offscreen: true,
    scale: 10,
    throwForce: 5,
    gravity: 1,
    mass: 2,
    spinForce: 4,
    friction: 0.7,
    restitution: 0,
    angularDamping: 0.4,
    linearDamping: 0.4,
    settleTimeout: 30000,
    startingHeight: 6,
    lightIntensity: 0.9,
    delay: 10,
    delay: 10
});

// Würfelkonfiguration für viele Würfel
export const MANY_DICE_CONFIG = Object.freeze({
    scale: 6,
    gravity: 4,
    mass: 4,
    friction: 0.4,
    restitution: 0.2
});

// Standardwerte für Eingaben
export const INPUT_LIMITS = Object.freeze({
    DICE_COUNT: {
        MIN: 0,
        MAX: 20,
        DEFAULT: 1
    },
    CUSTOM_SIDES: {
        MIN: 2,
        MAX: 999,
        DEFAULT: 2
    }
});

// Pfad zu den Assets für die Würfelbox
export const ASSET_PATH = "/misc/mb21/diceroller/lib/@3d-dice/dice-box/dist/assets/";
