import { Modifiers, setModifiers } from '../modifiers';

export const DEFAULT_MODIFIERS: Modifiers = {
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

    it('converts dotted L values to the appropriate numeric duration value', (): void => {
        const modifiersCopy = { ...DEFAULT_MODIFIERS };

        setModifiers(modifiersCopy, 'L4.');
        expect(modifiersCopy).toEqual({
            ...modifiersCopy,
            lengthOfNote: 8 / 3,
        });

        setModifiers(modifiersCopy, 'L4..');
        expect(modifiersCopy).toEqual({
            ...modifiersCopy,
            lengthOfNote: 16 / 7,

        });
    });

    it('does not change modifiers object if invalid modifier property passed in', (): void => {
        const modifiersCopy = { ...DEFAULT_MODIFIERS };

        setModifiers(modifiersCopy, 'G23');
        expect(modifiersCopy).toEqual(DEFAULT_MODIFIERS);
        setModifiers(modifiersCopy, 'sdfnb38s');
        expect(modifiersCopy).toEqual(DEFAULT_MODIFIERS);
    });
});
