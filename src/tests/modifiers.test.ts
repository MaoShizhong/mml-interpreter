import tokenize from '../index';
import { setModifiers } from '../modifiers';
import { Modifiers } from '../types';

const DEFAULT_MODIFIERS: Modifiers = {
    tempo: 120,
    lengthOfNote: 4,
    octave: 4,
    volume: 10,
};

describe('sets modifiers', (): void => {
    it.each([
        ['tempo', 150, 200],
        ['lengthOfNote', 2, 16],
        ['octave', 2, 5],
        ['volume', 20, 30],
    ])(
        'overwrites %s modifer with new value',
        (property, newValue1, newValue2): void => {
            const modifiersCopy = { ...DEFAULT_MODIFIERS };
            const modifierString1 = `${property[0].toUpperCase()}${newValue1}`;
            const modifierString2 = `${property[0].toUpperCase()}${newValue2}`;

            setModifiers(modifiersCopy, modifierString1);
            expect(modifiersCopy).toEqual({
                ...modifiersCopy,
                [property]: newValue1,
            });

            setModifiers(modifiersCopy, modifierString2);
            expect(modifiersCopy).toEqual({
                ...modifiersCopy,
                [property]: newValue2,
            });
        }
    );

    it('does not change modifiers object if invalid modifier property passed in', (): void => {
        const modifiersCopy = { ...DEFAULT_MODIFIERS };

        setModifiers(modifiersCopy, 'G23');
        expect(modifiersCopy).toEqual(DEFAULT_MODIFIERS);
        setModifiers(modifiersCopy, 'sdfnb38s');
        expect(modifiersCopy).toEqual(DEFAULT_MODIFIERS);
    });
});

describe('consecutive modifier segments', (): void => {
    it('processes consecutive modifier strings individually', (): void => {
        const modifiersCopy = { ...DEFAULT_MODIFIERS };

        const newModifiers1: Modifiers = {
            ...modifiersCopy,
            tempo: 200,
            octave: 7,
        };
        tokenize('T200O7', modifiersCopy);
        expect(modifiersCopy).toEqual(newModifiers1);

        const newModifiers2: Modifiers = {
            tempo: 144,
            lengthOfNote: 8,
            octave: 3,
            volume: 30,
        };
        tokenize('T144L8V30ABCDEFGO3', modifiersCopy);
        expect(modifiersCopy).toEqual(newModifiers2);
    });
});

describe('octave shift symbols', (): void => {
    it('> increments octave modifier by 1 with each instance', (): void => {
        const modifiersCopy = { ...DEFAULT_MODIFIERS };

        const newModifiers1: Modifiers = {
            ...modifiersCopy,
            octave: DEFAULT_MODIFIERS.octave + 2,
        };
        tokenize('ABC>DE>F', modifiersCopy);
        expect(modifiersCopy).toEqual(newModifiers1);
    });

    it('< decrements octave modifier by 1 with each instance', (): void => {
        const modifiersCopy = { ...DEFAULT_MODIFIERS };

        const newModifiers1: Modifiers = {
            ...modifiersCopy,
            octave: DEFAULT_MODIFIERS.octave - 3,
        };
        tokenize('A<<<BCDEF', modifiersCopy);
        expect(modifiersCopy).toEqual(newModifiers1);
    });
});
