import { Token } from '../token';
import { DEFAULT_MODIFIERS } from './modifiers.test';

describe('Token object properties and values', (): void => {
    it.each([
        [
            'C4',
            {
                mmlString: 'C4',
                lengthInMs: 500,
                pitchInHz: 262,
                offsetInMs: 0,
                details: {
                    midiNumber: 60,
                    baseNote: 'C',
                    accidental: 'natural',
                    lengthInCrotchets: 1,
                    referenceBpm: 120,
                },
                volume: 10,
            },
            new Token('C4', { ...DEFAULT_MODIFIERS }),
        ],
        [
            'D#8.',
            {
                mmlString: 'D#8.',
                lengthInMs: 375,
                pitchInHz: 311,
                offsetInMs: 0,
                details: {
                    midiNumber: 63,
                    baseNote: 'D',
                    accidental: 'sharp',
                    lengthInCrotchets: 0.75,
                    referenceBpm: 120,
                },
                volume: 10,
            },
            new Token('D#8.', { ...DEFAULT_MODIFIERS }),
        ],
        [
            'D#8.',
            {
                mmlString: 'D#8.',
                lengthInMs: 750,
                pitchInHz: 311,
                offsetInMs: 0,
                details: {
                    midiNumber: 63,
                    baseNote: 'D',
                    accidental: 'sharp',
                    lengthInCrotchets: 0.75,
                    referenceBpm: 60,
                },
                volume: 10,
            },
            new Token('D#8.', { ...DEFAULT_MODIFIERS, tempo: 60 }),
        ],
        [
            'D#8..',
            {
                mmlString: 'D#8..',
                lengthInMs: 875,
                pitchInHz: 311,
                offsetInMs: 0,
                details: {
                    midiNumber: 63,
                    baseNote: 'D',
                    accidental: 'sharp',
                    lengthInCrotchets: 0.875,
                    referenceBpm: 60,
                },
                volume: 10,
            },
            new Token('D#8..', { ...DEFAULT_MODIFIERS, tempo: 60 }),
        ],
        [
            'D#4...',
            {
                mmlString: 'D#4...',
                lengthInMs: 1875,
                pitchInHz: 311,
                offsetInMs: 0,
                details: {
                    midiNumber: 63,
                    baseNote: 'D',
                    accidental: 'sharp',
                    lengthInCrotchets: 1.875,
                    referenceBpm: 60,
                },
                volume: 10,
            },
            new Token('D#4...', { ...DEFAULT_MODIFIERS, tempo: 60 }),
        ],
        [
            'A-',
            {
                mmlString: 'A-',
                lengthInMs: 1000,
                pitchInHz: 1661,
                offsetInMs: 0,
                details: {
                    midiNumber: 92,
                    baseNote: 'A',
                    accidental: 'flat',
                    lengthInCrotchets: 2,
                    referenceBpm: 120,
                },
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
                offsetInMs: 0,
                details: {
                    midiNumber: null,
                    baseNote: 'R',
                    accidental: 'natural',
                    lengthInCrotchets: 0.5,
                    referenceBpm: 144,
                },
                volume: 74,
            },
            new Token('R', {
                ...DEFAULT_MODIFIERS,
                tempo: 144,
                lengthOfNote: 8,
                volume: 74,
            }),
        ],
    ])(
        '%s token contains correct properties',
        (_, expectedToken, token): void => {
            expect(token).toEqual(expectedToken);
        }
    );

    it('offsetInMs is not 0 if previous Token provided', (): void => {
        const firstToken = new Token('A', { ...DEFAULT_MODIFIERS });
        const secondToken = new Token(
            'A',
            { ...DEFAULT_MODIFIERS },
            firstToken
        );
        const thirdToken = new Token(
            'A',
            { ...DEFAULT_MODIFIERS },
            secondToken
        );
        expect(secondToken).toHaveProperty('offsetInMs', firstToken.lengthInMs);
        expect(thirdToken).toHaveProperty(
            'offsetInMs',
            firstToken.lengthInMs + secondToken.lengthInMs
        );
    });
});
