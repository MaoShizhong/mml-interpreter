import { Modifiers } from './types';

type SemitoneShift = -1 | 0 | 1;
type Note = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'R' | 'P';

export class Token {
    mmlString: string;
    lengthInMs: number;
    pitchInHz: number | null;
    volume: number;

    constructor(noteString: string, modifiers: Modifiers) {
        this.mmlString = noteString;
        this.volume = modifiers.volume;

        const { baseNote, semitoneShift, attachedDurationMultiplier } =
            this.#splitMmlString(noteString);
        const durationMultiplier =
            attachedDurationMultiplier ?? 4 / modifiers.lengthOfNote;

        this.lengthInMs = this.#durationToMs(
            modifiers.tempo,
            durationMultiplier
        );
        this.pitchInHz = this.#noteToHz(
            baseNote,
            semitoneShift,
            modifiers.octave
        );
    }

    #splitMmlString(str: string): {
        baseNote: Note;
        semitoneShift: SemitoneShift;
        attachedDurationMultiplier: number | null;
    } {
        const baseNote = str[0] as Note;
        let semitoneShift: SemitoneShift = 0;

        if (str[1] === '#') {
            semitoneShift = 1;
        } else if (str[1] === '-') {
            semitoneShift = -1;
        }

        const noteDuration = str.match(/\d+/g)?.[0];
        let attachedDurationMultiplier = 4 / Number(noteDuration) || null;

        if (attachedDurationMultiplier && str.includes('.')) {
            attachedDurationMultiplier *= 1.5;
        }

        return { baseNote, semitoneShift, attachedDurationMultiplier };
    }

    #durationToMs(bpm: number, multiplier: number): number {
        const BASE_BPM = 60;
        const MS_PER_CROTCHET_60BPM = 1000;
        const msPerCrotchet = (BASE_BPM / bpm) * MS_PER_CROTCHET_60BPM;

        return Math.round(msPerCrotchet * multiplier);
    }

    #noteToHz(
        note: Note,
        semitoneShift: SemitoneShift,
        octave: number
    ): number | null {
        if (note === 'R' || note === 'P') {
            return null;
        }

        const A_0 = 1;
        const CONCERT_A = 58;
        const CONCERT_A_HZ = 440;
        const SEMITONES_FROM_C = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        const SEMITONES_IN_OCTAVE = 12;
        const offsetFromA0 =
            SEMITONES_IN_OCTAVE * octave +
            SEMITONES_FROM_C[note] +
            semitoneShift;
        const noteNumber = A_0 + offsetFromA0;
        const semitonesFromConcertA = noteNumber - CONCERT_A;
        const SEMITONE_RATIO = 2 ** (1 / 12);

        const frequencyInHz =
            CONCERT_A_HZ * SEMITONE_RATIO ** semitonesFromConcertA;

        return Math.round(frequencyInHz);
    }
}
