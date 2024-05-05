import { split } from '../split';

describe('splitting note letters', (): void => {
    it.each([
        ['ABCDEFG', ['A', 'B', 'C', 'D', 'E', 'F', 'G']],
        ['BAG', ['B', 'A', 'G']],
        ['abCdE', ['A', 'B', 'C', 'D', 'E']],
    ])('splits %s into %p', (inputString, outputArray): void => {
        expect(split(inputString)).toEqual(outputArray);
    });

    it('treats P and R (rests) as note letters', (): void => {
        expect(split('ABPDER')).toEqual(['A', 'B', 'P', 'D', 'E', 'R']);
    });

    it('ignores white space', (): void => {
        expect(split('A B\n     P\t \n D   ER \n  \n\n ')).toEqual([
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
        'splitting %s throws RangeError because %s is not in the musical alphabet',
        (inputString, badChar): void => {
            expect((): string[] => split(inputString)).toThrow(
                new RangeError(`${badChar} is not a valid MML character.`)
            );
        }
    );
});

describe('splitting note letters with attached durations', (): void => {
    it.each([
        ['A2B2C4D1E4F1G2', ['A2', 'B2', 'C4', 'D1', 'E4', 'F1', 'G2']],
        ['B8A16G32', ['B8', 'A16', 'G32']],
    ])('splits %s into %p', (inputString, outputArray): void => {
        expect(split(inputString)).toEqual(outputArray);
    });
});

describe('handling non-splittable operators/modifiers', (): void => {
    it('does not split valid MML characters that are not related to individual notes or rests', (): void => {
        expect(split('T100L4V10O5<>')).toEqual([]);
        expect(split('T180L4C16<DC8>V8T130')).toEqual(['C16', 'D', 'C8']);
    });
});

describe('splitting with accidentals', (): void => {
    it('treats both # and + as sharp signs', (): void => {
        expect(split('A#A+')).toEqual(['A#', 'A#']);
    });

    it.each([
        ['A+2B#2C4D-E+4F1G-2', ['A#2', 'B#2', 'C4', 'D-', 'E#4', 'F1', 'G-2']],
        ['B-8A-16G+32', ['B-8', 'A-16', 'G#32']],
    ])('splits %s into %p', (inputString, outputArray): void => {
        expect(split(inputString)).toEqual(outputArray);
    });

    it('throws RangeError if accidental not attached to a note letter', (): void => {
        const AccidentalError = new RangeError(`Accidentals must be preceded by a note letter.`);
        expect((): string[] => split('C4#')).toThrow(AccidentalError);
        expect((): string[] => split('B#2C4.-')).toThrow(AccidentalError);
        expect((): string[] => split('C##')).toThrow(AccidentalError);
    });
});

describe('splitting durations with dots', (): void => {
    it.each([
        ['A2.C#4G-4.F32.', ['A2.', 'C#4', 'G-4.', 'F32.']],
        ['B16..C4.G8..', ['B16..', 'C4.', 'G8..']],
    ])('splits %s into %p', (inputString, outputArray): void => {
        expect(split(inputString)).toEqual(outputArray);
    });

    it('throws RangeError if dot not attached to a duration', (): void => {
        const DotError = new RangeError(`Dots must be preceded by a note duration or another dot.`);
        expect((): string[] => split('A.')).toThrow(DotError);
        expect((): string[] => split('B4.C..')).toThrow(DotError);
        expect((): string[] => split('T120.')).toThrow(DotError);
        expect((): string[] => split('L8.')).toThrow(DotError);
    });
});
