/**
 * Unit tests for MusicUtils module
 */

import { 
    getRandomElement, 
    normalizeNote, 
    getEnharmonicEquivalent,
    calculateInterval,
    getOctaveFromNote,
    formatChordName 
} from '../src/utils/MusicUtils.js';

export function runMusicUtilsTests(runner) {
    runner.test('MusicUtils - getRandomElement', () => {
        const testArray = ['A', 'B', 'C', 'D', 'E'];
        
        // Test multiple times to ensure randomness works
        for (let i = 0; i < 10; i++) {
            const result = getRandomElement(testArray);
            runner.assertTrue(testArray.includes(result), 'Result should be from input array');
        }
        
        // Test with single element
        const singleElement = getRandomElement(['X']);
        runner.assertEquals(singleElement, 'X', 'Single element should be returned');
    });
    
    runner.test('MusicUtils - getRandomElement edge cases', () => {
        runner.assertThrows(() => {
            getRandomElement([]);
        }, 'Empty array should throw error');
        
        runner.assertThrows(() => {
            getRandomElement(null);
        }, 'Null input should throw error');
        
        runner.assertThrows(() => {
            getRandomElement(undefined);
        }, 'Undefined input should throw error');
    });
    
    runner.test('MusicUtils - normalizeNote basic cases', () => {
        runner.assertEquals(normalizeNote('c'), 'C', 'Lowercase to uppercase');
        runner.assertEquals(normalizeNote('C'), 'C', 'Already uppercase');
        runner.assertEquals(normalizeNote('C#'), 'C#', 'Sharp note');
        runner.assertEquals(normalizeNote('c#'), 'C#', 'Lowercase sharp');
    });
    
    runner.test('MusicUtils - normalizeNote flat to sharp conversion', () => {
        runner.assertEquals(normalizeNote('Db'), 'C#', 'Db to C#');
        runner.assertEquals(normalizeNote('Eb'), 'D#', 'Eb to D#');
        runner.assertEquals(normalizeNote('Gb'), 'F#', 'Gb to F#');
        runner.assertEquals(normalizeNote('Ab'), 'G#', 'Ab to G#');
        runner.assertEquals(normalizeNote('Bb'), 'A#', 'Bb to A#');
    });
    
    runner.test('MusicUtils - normalizeNote edge cases', () => {
        // Test enharmonic equivalents
        runner.assertEquals(normalizeNote('E#'), 'F', 'E# to F');
        runner.assertEquals(normalizeNote('Fb'), 'E', 'Fb to E');
        runner.assertEquals(normalizeNote('B#'), 'C', 'B# to C');
        runner.assertEquals(normalizeNote('Cb'), 'B', 'Cb to B');
    });
    
    runner.test('MusicUtils - normalizeNote invalid inputs', () => {
        runner.assertThrows(() => {
            normalizeNote('X');
        }, 'Invalid note should throw');
        
        runner.assertThrows(() => {
            normalizeNote('');
        }, 'Empty string should throw');
        
        runner.assertThrows(() => {
            normalizeNote(null);
        }, 'Null should throw');
    });
    
    runner.test('MusicUtils - getEnharmonicEquivalent', () => {
        runner.assertEquals(getEnharmonicEquivalent('C#'), 'Db', 'C# to Db');
        runner.assertEquals(getEnharmonicEquivalent('Db'), 'C#', 'Db to C#');
        runner.assertEquals(getEnharmonicEquivalent('D#'), 'Eb', 'D# to Eb');
        runner.assertEquals(getEnharmonicEquivalent('Eb'), 'D#', 'Eb to D#');
        runner.assertEquals(getEnharmonicEquivalent('F#'), 'Gb', 'F# to Gb');
        runner.assertEquals(getEnharmonicEquivalent('Gb'), 'F#', 'Gb to F#');
        runner.assertEquals(getEnharmonicEquivalent('G#'), 'Ab', 'G# to Ab');
        runner.assertEquals(getEnharmonicEquivalent('Ab'), 'G#', 'Ab to G#');
        runner.assertEquals(getEnharmonicEquivalent('A#'), 'Bb', 'A# to Bb');
        runner.assertEquals(getEnharmonicEquivalent('Bb'), 'A#', 'Bb to A#');
    });
    
    runner.test('MusicUtils - getEnharmonicEquivalent natural notes', () => {
        // Natural notes should return themselves
        const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        naturalNotes.forEach(note => {
            runner.assertEquals(getEnharmonicEquivalent(note), note, `${note} should return itself`);
        });
    });
    
    runner.test('MusicUtils - calculateInterval', () => {
        runner.assertEquals(calculateInterval('C', 'E'), 4, 'C to E is 4 semitones');
        runner.assertEquals(calculateInterval('C', 'G'), 7, 'C to G is 7 semitones');
        runner.assertEquals(calculateInterval('C', 'C'), 0, 'C to C is 0 semitones');
        runner.assertEquals(calculateInterval('G', 'C'), 5, 'G to C is 5 semitones (wrapping)');
        runner.assertEquals(calculateInterval('A', 'F'), 8, 'A to F is 8 semitones (wrapping)');
    });
    
    runner.test('MusicUtils - calculateInterval with enharmonics', () => {
        runner.assertEquals(calculateInterval('C#', 'Db'), 0, 'Enharmonic equivalents');
        runner.assertEquals(calculateInterval('C', 'Db'), 1, 'C to Db');
        runner.assertEquals(calculateInterval('Eb', 'G'), 4, 'Eb to G');
    });
    
    runner.test('MusicUtils - getOctaveFromNote', () => {
        runner.assertEquals(getOctaveFromNote('C4'), 4, 'C4 octave');
        runner.assertEquals(getOctaveFromNote('A0'), 0, 'A0 octave');
        runner.assertEquals(getOctaveFromNote('G#7'), 7, 'G#7 octave');
        runner.assertEquals(getOctaveFromNote('Bb3'), 3, 'Bb3 octave');
    });
    
    runner.test('MusicUtils - getOctaveFromNote default', () => {
        // Should default to octave 4 for notes without octave specified
        runner.assertEquals(getOctaveFromNote('C'), 4, 'C defaults to octave 4');
        runner.assertEquals(getOctaveFromNote('F#'), 4, 'F# defaults to octave 4');
    });
    
    runner.test('MusicUtils - getOctaveFromNote invalid', () => {
        runner.assertThrows(() => {
            getOctaveFromNote('C10');
        }, 'Invalid high octave should throw');
        
        runner.assertThrows(() => {
            getOctaveFromNote('X4');
        }, 'Invalid note name should throw');
    });
    
    runner.test('MusicUtils - formatChordName', () => {
        // Test root position
        runner.assertEquals(formatChordName('C', 'Major', 0), 'C Major', 'Root position major chord');
        runner.assertEquals(formatChordName('F#', 'Minor', 0), 'F# Minor', 'Root position minor chord');
        
        // Test inversions
        runner.assertEquals(formatChordName('A', 'Major', 1), 'A Major 1st inversion', '1st inversion');
        runner.assertEquals(formatChordName('D', 'Diminished', 2), 'D Diminished 2nd inversion', '2nd inversion');
        
        // Test default inversion
        runner.assertEquals(formatChordName('G', 'Augmented'), 'G Augmented', 'Default inversion should be root');
        
        // Test edge cases
        runner.assertEquals(formatChordName('', 'Major', 0), 'Unknown Chord', 'Empty root note');
        runner.assertEquals(formatChordName('C', '', 0), 'Unknown Chord', 'Empty triad type');
        runner.assertEquals(formatChordName(null, 'Major', 0), 'Unknown Chord', 'Null root note');
    });
}
