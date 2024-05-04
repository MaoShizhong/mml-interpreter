import { Token } from '../token';

const DEFAULT_MODIFIERS = {
    tempo: 120,
    lengthOfNote: 4,
    octave: 4,
    volume: 10,
};

describe('Token object properties', (): void => {
    it.each([
        [
            'C4',
            {
                mmlString: 'C4',
                lengthInMs: 500,
                pitchInHz: 262,
                volume: 10,
            },
            new Token('C4', DEFAULT_MODIFIERS),
        ],
        [
            'D#8.',
            {
                mmlString: 'D#8.',
                lengthInMs: 375,
                pitchInHz: 311,
                volume: 10,
            },
            new Token('D#8.', DEFAULT_MODIFIERS),
        ],
        [
            'D#8.',
            {
                mmlString: 'D#8.',
                lengthInMs: 750,
                pitchInHz: 311,
                volume: 10,
            },
            new Token('D#8.', { ...DEFAULT_MODIFIERS, tempo: 60 }),
        ],
        [
            'A-',
            {
                mmlString: 'A-',
                lengthInMs: 1000,
                pitchInHz: 1661,
                volume: 10,
            },
            new Token('A-', {
                ...DEFAULT_MODIFIERS,
                octave: 6,
                lengthOfNote: 2,
            }),
        ],
        [
            'R',
            {
                mmlString: 'R',
                lengthInMs: 208,
                pitchInHz: null,
                volume: 74,
            },
            new Token('R', {
                ...DEFAULT_MODIFIERS,
                tempo: 144,
                lengthOfNote: 8,
                volume: 74,
            }),
        ],
    ])('%s token has %o', (_, expectedToken, token): void => {
        expect(token).toEqual(expectedToken);
    });
});
