import { INPUT_LIMITS } from './config.js';

export class DiceValidation {
    /**
     * Validiert die Eingabe für die Würfelanzahl
     * @param {HTMLInputElement} input - Das Eingabefeld
     * @returns {number} - Validierte Würfelanzahl
     */
    static validateDiceCount(input) {
        // Erlaube leere Eingabe
        if (input.value === '') {
            return;
        }

        const value = parseInt(input.value);
        
        // Überprüfung auf gültige Zahl
        if (isNaN(value)) {
            input.value = INPUT_LIMITS.DICE_COUNT.DEFAULT;
            return INPUT_LIMITS.DICE_COUNT.DEFAULT;
        }

        // Grenzwerte prüfen und ggf. korrigieren
        if (value < INPUT_LIMITS.DICE_COUNT.MIN) {
            input.value = INPUT_LIMITS.DICE_COUNT.MIN;
            return INPUT_LIMITS.DICE_COUNT.MIN;
        }
        
        if (value > INPUT_LIMITS.DICE_COUNT.MAX) {
            input.value = INPUT_LIMITS.DICE_COUNT.MAX;
            return INPUT_LIMITS.DICE_COUNT.MAX;
        }

        return value;
    }

    /**
     * Validiert die Eingabe für benutzerdefinierte Würfelseiten
     * @param {HTMLInputElement} input - Das Eingabefeld
     * @returns {number} - Validierte Seitenanzahl
     */
    static validateCustomSides(input) {
        // Erlaube leere Eingabe
        if (input.value === '') {
            return;
        }

        const value = parseInt(input.value);
        
        // Überprüfung auf gültige Zahl
        if (isNaN(value)) {
            input.value = INPUT_LIMITS.CUSTOM_SIDES.DEFAULT;
            return INPUT_LIMITS.CUSTOM_SIDES.DEFAULT;
        }

        // Grenzwerte prüfen und ggf. korrigieren
        if (value < INPUT_LIMITS.CUSTOM_SIDES.MIN) {
            input.value = INPUT_LIMITS.CUSTOM_SIDES.MIN;
            return INPUT_LIMITS.CUSTOM_SIDES.MIN;
        }
        
        if (value > INPUT_LIMITS.CUSTOM_SIDES.MAX) {
            input.value = INPUT_LIMITS.CUSTOM_SIDES.MAX;
            return INPUT_LIMITS.CUSTOM_SIDES.MAX;
        }

        return value;
    }

    /**
     * Fügt Event-Listener für die Eingabevalidierung hinzu
     * @param {HTMLElement} container - Container-Element der Würfelsektion
     */
    static setupInputValidation(container) {
        // Validierung für Würfelanzahl
        const diceCountInput = container.querySelector('.dice-number');
        diceCountInput.addEventListener('input', () => {
            this.validateDiceCount(diceCountInput);
        });
        diceCountInput.addEventListener('blur', () => {
            // Bei Verlassen des Feldes: Setze Standardwert wenn leer
            if (diceCountInput.value === '') {
                diceCountInput.value = INPUT_LIMITS.DICE_COUNT.DEFAULT;
            }
            this.validateDiceCount(diceCountInput);
        });

        // Validierung für benutzerdefinierte Würfelseiten
        const customSidesInput = container.querySelector('.custom-sides');
        customSidesInput.addEventListener('input', () => {
            this.validateCustomSides(customSidesInput);
        });
        customSidesInput.addEventListener('blur', () => {
            // Bei Verlassen des Feldes: Setze Standardwert wenn leer
            if (customSidesInput.value === '') {
                customSidesInput.value = INPUT_LIMITS.CUSTOM_SIDES.DEFAULT;
            }
            this.validateCustomSides(customSidesInput);
        });

        // Verhindern von ungültigen Zeichen
        const preventInvalidChars = (event) => {
            // Erlaubt: Zahlen, Backspace, Delete, Pfeiltasten, Tab
            if (!/^\d$/.test(event.key) && 
                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
                event.preventDefault();
            }
        };

        diceCountInput.addEventListener('keydown', preventInvalidChars);
        customSidesInput.addEventListener('keydown', preventInvalidChars);
    }
}