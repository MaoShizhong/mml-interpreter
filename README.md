# mml-parser

[![NPM Version][npm-version-image]][npm-url]
[![Node.js Version][node-image]][node-url]

A Modern MML parser that converts a string containing Modern MML to an array of objects for each note/rest.

## Install

```bash
npm install mml-parser
```

## Usage

```javascript
// CJS
const parseMml = require('mml-parser');

// ESM
import parseMml from 'mml-parser';

// case and whitespace insensitive
const mmlTokens = parseMml('D E4. < T100 L2 F#', {
    tempo: 192,
    octave: 5,
    lengthOfNote: 8,
});
console.log(mmlTokens);
```

```javascript
[
  Token {
    mmlString: 'D',
    pitchInHz: 587,
    lengthInMs: 156,
    details: {
      baseNote: 'D',
      accidental: 'natural',
      midiNumber: 74,
      lengthInCrotchets: 0.5,
      referenceBpm: 192
    },
    volume: 10
  },
  Token {
    mmlString: 'E4.',
    pitchInHz: 330,
    lengthInMs: 900,
    details: {
      baseNote: 'E',
      accidental: 'natural',
      midiNumber: 64,
      lengthInCrotchets: 1.5,
      referenceBpm: 100
    },
    volume: 10
  },
  Token {
    mmlString: 'F#',
    pitchInHz: 370,
    lengthInMs: 1200,
    details: {
      baseNote: 'F',
      accidental: 'sharp',
      midiNumber: 66,
      lengthInCrotchets: 2,
      referenceBpm: 100
    },
    volume: 10
  }
]
```

## Parameters

### parseMml(input, startingModifiers)

#### input

A case-insensitive string containing Modern MML. Whitespace is ignored when parsing. If any invalid characters are encountered during parsing (including characters that are out of place, such as a `#` that does not follow a note letter), an error is thrown.

#### startingModifiers (Optional)

An optional object containing initial modifiers applied at the start of parsing. Individual modifiers are overwritten if new values are  encountered while passing (e.g. overwriting the starting `tempo` upon parsing `T200`). The following optional starting modifiers are accepted.

##### startingModifiers.tempo

Default: 120

Starting tempo/bpm using the standard crotchets (quarter notes) per minute. Equivalent to prepending the input  with a T value.

##### startingModifiers.lengthOfNote

Default: 4

Starting note length. Equivalent to prepending the input with an L value.

##### startingModifiers.octave

Default: 4

Starting octave. Equivalent to prepending the input with an O value.

##### startingModifiers.volume

Default: 10

Starting volume (sometimes referred to as "velocity"). This value may not be used by all software and the exact range used will also be software-dependent. Equivalent to prepending the input with a V value.
