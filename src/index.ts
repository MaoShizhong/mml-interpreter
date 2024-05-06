import { Modifiers, setModifiers } from './modifiers';
import { Token } from './token';

const NOTE_LETTERS = 'ABCDEFGPR';
const SHARPS = '#+';
const FLAT = '-';
const DOT = '.';
const NUMBERS = '1234567890';
const PROPERTY_LETTERS = 'TLOV';
const OCTAVE_SHIFTS = '<>';
const ACCIDENTALS = `${SHARPS}${FLAT}`;
const NON_TOKENIZABLES = `${PROPERTY_LETTERS}${OCTAVE_SHIFTS}`;
const LETTERS = `${NOTE_LETTERS}${PROPERTY_LETTERS}`;
const VALID_MML_CHARS = `${NOTE_LETTERS}${NUMBERS}${ACCIDENTALS}${DOT}${NON_TOKENIZABLES}`;

const DEFAULT_MODIFIERS = {
    tempo: 120,
    lengthOfNote: 4,
    octave: 4,
    volume: 10,
};

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
 * @throws RangeError if input string contains non-MML characters
 * @throws RangeError if input string contains a dot that does not follow a note duration or another dot
 * @throws RangeError if input string contains an accidental that does not follow a note letter or rest
 *
 * ---
 *
 * @description If not provided in startingModifiers, default starting values are as follows:
 *
 * tempo = 120bpm
 *
 * lengthOfNote = 4 (crotchet/quarter note)
 *
 * octave = 4 (octave starting at middle C)
 *
 * volume = 10 (arbitrary - software dependent)
 */
function parse(input: string, startingModifiers?: Partial<Modifiers>): Token[] {
    input = input.replaceAll(/\s/g, '').toUpperCase();

    const tokens: Token[] = [];
    const modifiers = { ...DEFAULT_MODIFIERS, ...startingModifiers };
    let currentNoteString = '';
    let currentModifierString = '';
    for (const char of input) {
        throwRangeErrorIfInvalidMML(
            char,
            currentNoteString.at(-1),
            currentModifierString
        );

        // Number('0') === false
        const isDurationNumber =
            NUMBERS.includes(char) && currentNoteString.length;
        const isFinishedParsingNote =
            (LETTERS.includes(char) || OCTAVE_SHIFTS.includes(char)) &&
            currentNoteString.length;

        if (isFinishedParsingNote) {
            tokens.push(new Token(currentNoteString, modifiers));
            currentNoteString = '';
        }

        if (LETTERS.includes(char)) {
            setModifiers(modifiers, currentModifierString);
            currentModifierString = '';
        }

        if (NOTE_LETTERS.includes(char)) {
            currentNoteString = char;
        } else if (SHARPS.includes(char)) {
            // Quirk of Modern MML allows for both + and # as sharps, but only a single flat character
            currentNoteString += '#';
        } else if (char === FLAT || char === DOT || isDurationNumber) {
            currentNoteString += char;
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
    if (currentNoteString) {
        tokens.push(new Token(currentNoteString, modifiers));
        setModifiers(modifiers, currentModifierString);
    }

    return tokens;
}

export default parse;
module.exports = parse;
