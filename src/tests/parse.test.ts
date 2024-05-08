import parse from '../index';
import { Token } from '../token';

function toMmlStringArray(input: string): string[] {
    return parse(input).map((token): string => token.mmlString);
}

describe('tokenizing note letters', (): void => {
    it('returns an array of Token objects', (): void => {
        const tokens = parse('ABCDEFG');
        expect(tokens.every((token): boolean => token instanceof Token)).toBe(
            true
        );
    });

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
    const testArgs: [string, string[], number[]][] = [
        [
            'A2B2C4D1E4F1G2',
            ['A2', 'B2', 'C4', 'D1', 'E4', 'F1', 'G2'],
            [2, 2, 1, 4, 1, 4, 2],
        ],
        ['B8A16G32', ['B8', 'A16', 'G32'], [0.5, 0.25, 0.125]],
    ];

    it.each(testArgs)(
        'tokenizes %s into %p',
        (inputString, outputArray): void => {
            expect(toMmlStringArray(inputString)).toEqual(outputArray);
        }
    );

    it.each(testArgs)(
        'applies attached durations to note length properties in tokens',
        (inputString, _, durationArray): void => {
            const tokens = parse(inputString);
            expect(
                tokens.map((token): number => token.details.lengthInCrotchets)
            ).toEqual(durationArray);
        }
    );
});

describe('handling non-tokenizable operators/modifiers', (): void => {
    it('does not tokenize valid MML characters that are not related to individual notes or rests', (): void => {
        // expect(toMmlStringArray('T100L4V10O5<>')).toEqual([]);
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
        expect(parse('A#A+').map((token) => token.details.accidental)).toEqual([
            'sharp',
            'sharp',
        ]);
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
        const testString = 'A2.C#4G-4.F32.';
        expect(toMmlStringArray(testString)).toEqual([
            'A2.',
            'C#4',
            'G-4.',
            'F32.',
        ]);

        const tokens = parse(testString);
        expect(
            tokens.map((token): number => token.details.lengthInCrotchets)
        ).toEqual([3, 1, 1.5, 0.1875]);
    });

    it('handles double-dotted durations', (): void => {
        const testString = 'B16..C4.G8..';
        expect(toMmlStringArray('B16..C4.G8..')).toEqual([
            'B16..',
            'C4.',
            'G8..',
        ]);

        const tokens = parse(testString);
        expect(
            tokens.map((token): number => token.details.lengthInCrotchets)
        ).toEqual([0.4375, 1.5, 0.875]);
    });

    it('throws RangeError if dot not attached to a duration value', (): void => {
        const DotError = new RangeError(
            `Dots must be preceded by a duration value or another dot.`
        );
        expect((): string[] => toMmlStringArray('A.')).toThrow(DotError);
        expect((): string[] => toMmlStringArray('B4.C..')).toThrow(DotError);
    });
});

describe('tokenizing with modifiers', (): void => {
    it('handles single dotted L values', (): void => {
        const [note] = parse('L4.A');
        expect(note.details.lengthInCrotchets).toBe(1.5);

        const [note2] = parse('L8.A');
        expect(note2.details.lengthInCrotchets).toBe(0.75);
    });

    it('handles double dotted L values', (): void => {
        const [note] = parse('L4..A');
        expect(note.details.lengthInCrotchets).toBe(1.75);

        const [note2] = parse('L8..A');
        expect(note2.details.lengthInCrotchets).toBe(0.875);
    });

    test('changing modifiers only affects notes that follow', (): void => {
        const [firstNote, secondNote, thirdNote] = parse('AT200B<L8C');

        expect(firstNote.details.referenceBpm).toBe(120);
        expect(firstNote.details.midiNumber).toBe(69);
        expect(firstNote.details.lengthInCrotchets).toBe(1);

        expect(secondNote.details.referenceBpm).toBe(200);
        expect(secondNote.details.midiNumber).toBe(71);
        expect(secondNote.details.lengthInCrotchets).toBe(1);

        expect(thirdNote.details.referenceBpm).toBe(200);
        expect(thirdNote.details.midiNumber).toBe(48);
        expect(thirdNote.details.lengthInCrotchets).toBe(0.5);
    });
});

describe('sequential offsets', (): void => {
    test('parse offsets sequential tokens based on previous token note length', (): void => {
        const tokens = parse('C D E F8 G16 A B');
        expect(tokens.map((token): number => token.offsetInMs)).toEqual([
            0, 500, 1000, 1500, 1750, 1875, 2375
        ]);
    });
});
