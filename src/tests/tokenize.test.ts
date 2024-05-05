import tokenize from '../index';

function toMmlStringArray(input: string): string[] {
    return tokenize(input).map((token): string => token.mmlString);
}

describe('tokenizing note letters', (): void => {
    it.each([
        ['ABCDEFG', ['A', 'B', 'C', 'D', 'E', 'F', 'G']],
        ['BAG', ['B', 'A', 'G']],
        ['abCdE', ['A', 'B', 'C', 'D', 'E']],
    ])('tokenizes %s into %p', (inputString, outputArray): void => {
        expect(toMmlStringArray(inputString)).toEqual(outputArray);
    });

    it('treats P and R (rests) as note letters', (): void => {
        expect(toMmlStringArray('ABPDER')).toEqual([
            'A',
            'B',
            'P',
            'D',
            'E',
            'R',
        ]);
    });

    it('ignores white space', (): void => {
        expect(toMmlStringArray('A B\n     P\t \n D   ER \n  \n\n ')).toEqual([
            'A',
            'B',
            'P',
            'D',
            'E',
            'R',
        ]);
    });

    it.each([
        ['ABWD', 'W'],
        ['ZACE', 'Z'],
    ])(
        'tokenizing %s throws RangeError because %s is not in the musical alphabet',
        (inputString, badChar): void => {
            expect((): string[] => toMmlStringArray(inputString)).toThrow(
                new RangeError(`${badChar} is not a valid MML character.`)
            );
        }
    );
});

describe('tokenizing note letters with attached durations', (): void => {
    it.each([
        ['A2B2C4D1E4F1G2', ['A2', 'B2', 'C4', 'D1', 'E4', 'F1', 'G2']],
        ['B8A16G32', ['B8', 'A16', 'G32']],
    ])('tokenizes %s into %p', (inputString, outputArray): void => {
        expect(toMmlStringArray(inputString)).toEqual(outputArray);
    });
});

describe('handling non-tokenizable operators/modifiers', (): void => {
    it('does not tokenize valid MML characters that are not related to individual notes or rests', (): void => {
        expect(toMmlStringArray('T100L4V10O5<>')).toEqual([]);
        expect(toMmlStringArray('T180L4C16<DC8>V8T130')).toEqual([
            'C16',
            'D',
            'C8',
        ]);
    });
});

describe('tokenizing with accidentals', (): void => {
    it('treats both # and + as sharp signs', (): void => {
        expect(toMmlStringArray('A#A+')).toEqual(['A#', 'A#']);
    });

    it.each([
        ['A+2B#2C4D-E+4F1G-2', ['A#2', 'B#2', 'C4', 'D-', 'E#4', 'F1', 'G-2']],
        ['B-8A-16G+32', ['B-8', 'A-16', 'G#32']],
    ])('tokenizes %s into %p', (inputString, outputArray): void => {
        expect(toMmlStringArray(inputString)).toEqual(outputArray);
    });

    it('throws RangeError if accidental not attached to a note letter', (): void => {
        const AccidentalError = new RangeError(
            `Accidentals must be preceded by a note letter.`
        );
        expect((): string[] => toMmlStringArray('C4#')).toThrow(
            AccidentalError
        );
        expect((): string[] => toMmlStringArray('B#2C4.-')).toThrow(
            AccidentalError
        );
        expect((): string[] => toMmlStringArray('C##')).toThrow(
            AccidentalError
        );
    });
});

describe('tokenizing durations with dots', (): void => {
    it('includes dotted durations in tokens', (): void => {
        expect(toMmlStringArray('A2.C#4G-4.F32.')).toEqual([
            'A2.',
            'C#4',
            'G-4.',
            'F32.',
        ]);
    });
    it('handles double-dotted durations', (): void => {
        expect(toMmlStringArray('B16..C4.G8..')).toEqual([
            'B16..',
            'C4.',
            'G8..',
        ]);
    });

    it('throws RangeError if dot not attached to a duration', (): void => {
        const DotError = new RangeError(
            `Dots must be preceded by a note duration or another dot.`
        );
        expect((): string[] => toMmlStringArray('A.')).toThrow(DotError);
        expect((): string[] => toMmlStringArray('B4.C..')).toThrow(DotError);
        expect((): string[] => toMmlStringArray('T120.')).toThrow(DotError);
        expect((): string[] => toMmlStringArray('L8.')).toThrow(DotError);
    });
});
