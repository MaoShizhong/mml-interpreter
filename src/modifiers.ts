type Modifier = 'tempo' | 'lengthOfNote' | 'octave' | 'volume';
export type Modifiers = Record<Modifier, number>;

export function setModifiers(
    modifiers: Modifiers,
    modifierString: string
): void {
    const modifierPrefix = modifierString[0];
    const dots = modifierString.match(/\.+/g)?.[0] ?? [];
    const digits = modifierString.match(/\d+/g)?.[0] ?? '';
    const newModifierValue = toNumericNoteDuration(Number(digits), dots.length);

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

function toNumericNoteDuration(baseNumber: number, dotCount: number): number {
    let numerator = 1;
    let denominator = baseNumber;
    for (let i = 0; i < dotCount; i++) {
        numerator *= 2;
        numerator += 1;
        denominator *= 2;
    }
    return denominator / numerator;
}
