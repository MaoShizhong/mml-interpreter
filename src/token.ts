import { Modifiers } from './modifiers';

type SemitoneShift = -1 | 0 | 1;
type Accidental = 'sharp' | 'flat' | 'natural';
type Note = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'R' | 'P';
type NoteDetails = {
    baseNote: Note;
    accidental: Accidental;
    midiNumber: number | null;
    lengthInCrotchets: number;
    referenceBpm: number;
};

const ACCIDENTALS: Record<SemitoneShift, Accidental> = {
    1: 'sharp',
    0: 'natural',
    '-1': 'flat',
};

export class Token {
    mmlString: string;
    pitchInHz: number | null;
    lengthInMs: number;
    details: NoteDetails;
    volume: number;

    constructor(noteString: string, modifiers: Modifiers) {
        const { baseNote, semitoneShift, attachedDurationMultiplier } =
            this.#splitMmlString(noteString);
        const durationMultiplier =
            attachedDurationMultiplier || 4 / modifiers.lengthOfNote;

        this.mmlString = noteString;
        this.details = {
            baseNote: baseNote,
            accidental: ACCIDENTALS[semitoneShift],
            midiNumber: this.#getMidiNumber(
                baseNote,
                semitoneShift,
                modifiers.octave
            ),
            lengthInCrotchets: durationMultiplier,
            referenceBpm: modifiers.tempo,
        };
        this.pitchInHz = this.#noteToHz(this.details.midiNumber);
        this.lengthInMs = this.#durationToMs(
            modifiers.tempo,
            durationMultiplier
        );
        this.volume = modifiers.volume;
    }

    #splitMmlString(str: string): {
        baseNote: Note;
        semitoneShift: SemitoneShift;
        attachedDurationMultiplier: number;
    } {
        const baseNote = str[0] as Note;
        let semitoneShift: SemitoneShift = 0;

        if (str[1] === '#') {
            semitoneShift = 1;
        } else if (str[1] === '-') {
            semitoneShift = -1;
        }

        const noteDuration = str.match(/\d+/g)?.[0];
        const noteDurationMultiplier = 4 / Number(noteDuration);

        const dots = str.match(/\.+/g)?.[0] ?? [];
        const dotsMultiplier = 2 - ( 1 / 2 ** dots.length);

        const attachedDurationMultiplier =
            noteDurationMultiplier * dotsMultiplier;

        return { baseNote, semitoneShift, attachedDurationMultiplier };
    }

    #durationToMs(bpm: number, multiplier: number): number {
        const BASE_BPM = 60;
        const MS_PER_CROTCHET_60BPM = 1000;
        const msPerCrotchet = (BASE_BPM / bpm) * MS_PER_CROTCHET_60BPM;

        return Math.round(msPerCrotchet * multiplier);
    }

    #getMidiNumber(
        note: Note,
        semitoneShift: SemitoneShift,
        octave: number
    ): number | null {
        if (note === 'R' || note === 'P') {
            return null;
        }

        const C0_MIDI_NUMBER = 12;
        const SEMITONES_FROM_C = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        const SEMITONES_IN_OCTAVE = 12;
        const offsetFromA0 =
            SEMITONES_IN_OCTAVE * octave +
            SEMITONES_FROM_C[note] +
            semitoneShift;
        return C0_MIDI_NUMBER + offsetFromA0;
    }

    #noteToHz(noteNumber: number | null): number | null {
        if (!noteNumber) {
            return null;
        }

        const CONCERT_A_MIDI_NUMBER = this.#getMidiNumber('A', 0, 4) as number;
        const CONCERT_A_HZ = 440;
        const semitonesFromConcertA = noteNumber - CONCERT_A_MIDI_NUMBER;
        const SEMITONE_RATIO = 2 ** (1 / 12);

        const frequencyInHz =
            CONCERT_A_HZ * SEMITONE_RATIO ** semitonesFromConcertA;

        return Math.round(frequencyInHz);
    }
}
