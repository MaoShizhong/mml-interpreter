import { setModifiers } from '../modifiers';
import { Modifiers } from '../types';

describe('sets modifiers', (): void => {
    const DEFAULT_MODIFIERS: Modifiers = {
        tempo: 120,
        noteDuration: 4,
        octave: 4,
        volume: 10,
    };

    it.each([
        ['tempo', 150, 200],
        ['noteDuration', 2, 16],
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
