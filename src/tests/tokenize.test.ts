import { tokenize } from '../tokenize';

describe('tokenizing note letters', (): void => {
    it.each([
        ['ABCDEFG', ['A', 'B', 'C', 'D', 'E', 'F', 'G']],
        ['BAG', ['B', 'A', 'G']],
        ['abCdE', ['A', 'B', 'C', 'D', 'E']],
    ])('tokenizes %s into %p', (inputString, outputArray): void => {
        expect(tokenize(inputString)).toEqual(outputArray);
    });

    it.each([
        ['ABWD', 'W'],
        ['PACE', 'P'],
    ])(
        'tokenizing %s throws RangeError because %s is not in the musical alphabet',
        (inputString): void => {
            expect((): string[] => tokenize(inputString)).toThrow(RangeError);
        }
    );
});

describe('tokenizing note letters with attached durations', (): void => {
    it.each([
        ['A2B2C4D1E4F1G2', ['A2', 'B2', 'C4', 'D1', 'E4', 'F1', 'G2']],
        ['B8A16G32', ['B8', 'A16', 'G32']],
    ])('tokenizes %s into %p', (inputString, outputArray): void => {
        expect(tokenize(inputString)).toEqual(outputArray);
    });
});

describe('tokenizing with accidentals', (): void => {
    it('treats both # and + as sharp signs', (): void => {
        expect(tokenize('A#A+')).toEqual(['A#', 'A#']);
    });

    it.each([
        [
            'A+2B#2C4D-1E+4F1G-2',
            ['A#2', 'B#2', 'C4', 'D-1', 'E#4', 'F1', 'G-2'],
        ],
        ['B-8A-16G+32', ['B-8', 'A-16', 'G#32']],
    ])('tokenizes %s into %p', (inputString, outputArray): void => {
        expect(tokenize(inputString)).toEqual(outputArray);
    });
});
