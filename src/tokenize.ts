import { setModifiers } from './modifiers';
import { Modifiers } from './types';

const NOTE_LETTERS = 'ABCDEFGPR';
const SHARPS = '#+';
const FLAT = '-';
const DOT = '.';
const NUMBERS = '1234567890';
const PROPERTY_LETTERS = 'TLOV';
const OCTAVE_SHIFTS = '<>';
const ACCIDENTALS = `${SHARPS}${FLAT}`;
const NON_TOKENIZABLES = `${PROPERTY_LETTERS}${OCTAVE_SHIFTS}`;
const VALID_MML_CHARS = `${NOTE_LETTERS}${NUMBERS}${ACCIDENTALS}${DOT}${NON_TOKENIZABLES}`;

function throwRangeErrorIfInvalidMML(
    char: string,
    previousChar: string = '',
    modifierString: string
): void {
    const isValidDot =
        (previousChar === DOT || NUMBERS.includes(previousChar)) &&
        !modifierString.length;

    if (!VALID_MML_CHARS.includes(char)) {
        throw new RangeError(`${char} is not a valid MML character.`);
    } else if (char === DOT && !isValidDot) {
        throw new RangeError(
            `Dots must be preceded by a note duration or another dot.`
        );
    } else if (
        ACCIDENTALS.includes(char) &&
        !NOTE_LETTERS.includes(previousChar)
    ) {
        throw new RangeError(`Accidentals must be preceded by a note letter.`);
    }
}

/**
 * If not provided in defaultModifiers, default values for modifiers are as follows:
 *
 * tempo = 120
 *
 * lengthOfNote = 4
 *
 * octave = 4
 *
 * volume = 10
 *
 * @throws RangeError if input string contains non-MML characters
 * @throws RangeError if input string contains a dot that does not follow a note duration or another dot
 * @throws RangeError if input string contains an accidental that does not follow a note letter or rest
 */
export function tokenize(
    input: string,
    defaultModifiers: Modifiers = {
        tempo: 120,
        lengthOfNote: 4,
        octave: 4,
        volume: 10,
    }
): string[] {
    input = input.replaceAll(/\s/g, '').toUpperCase();

    const tokens: string[] = [];
    const modifiers = defaultModifiers;
    let currentTokenString = '';
    let currentModifierString = '';
    for (const char of input) {
        throwRangeErrorIfInvalidMML(
            char,
            currentTokenString.at(-1),
            currentModifierString
        );

        // Number('0') === false
        const isDurationNumber =
            NUMBERS.includes(char) && !currentModifierString.length;

        if (NOTE_LETTERS.includes(char)) {
            tokens.push(currentTokenString);
            setModifiers(modifiers, currentModifierString);
            currentModifierString = '';
            currentTokenString = char;
        } else if (SHARPS.includes(char)) {
            // Quirk of Modern MML allows for both + and # as sharps, but only a single flat character
            currentTokenString += '#';
        } else if (char === FLAT || char === DOT || isDurationNumber) {
            currentTokenString += char;
        } else if (PROPERTY_LETTERS.includes(char)) {
            setModifiers(modifiers, currentModifierString);
            currentModifierString = char;
        } else if (OCTAVE_SHIFTS.includes(char)) {
            const newOctave =
                char === '<' ? modifiers.octave - 1 : modifiers.octave + 1;
            setModifiers(modifiers, `O${newOctave}`);
        } else if (NUMBERS.includes(char)) {
            currentModifierString += char;
        }
    }

    // Handle final token/modifier
    tokens.push(currentTokenString);
    setModifiers(modifiers, currentModifierString);

    return tokens.slice(1);
}
