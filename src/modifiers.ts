import { Modifier, Modifiers } from './types';

export function setModifiers(
    modifiers: Modifiers,
    modifierString: string
): void {
    const modifierPrefix = modifierString[0];
    const newModifierValue = Number(modifierString.substring(1));
    let modifier: Modifier;
    switch (modifierPrefix) {
        case 'T':
            modifier = 'tempo';
            break;
        case 'L':
            modifier = 'lengthOfNote';
            break;
        case 'O':
            modifier = 'octave';
            break;
        case 'V':
            modifier = 'volume';
            break;
        default:
            return;
    }

    modifiers[modifier] = newModifierValue;
}
