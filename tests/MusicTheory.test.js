/**
 * Unit Tests for Music Theory Module
 * 
 * Tests all music theory calculations and validations
 */

import { MusicTheory } from '../modules/MusicTheory.js';

// Simple test framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    async run() {
        console.log('🎵 Running Music Theory Tests...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFunction();
                console.log(`✅ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.error(`❌ ${test.name}: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    assertArrayEqual(actual, expected, message) {
        if (!Array.isArray(actual) || !Array.isArray(expected)) {
            throw new Error(message || 'Both values must be arrays');
        }
        if (actual.length !== expected.length) {
            throw new Error(message || `Array lengths differ: ${actual.length} vs ${expected.length}`);
        }
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                throw new Error(message || `Arrays differ at index ${i}: ${actual[i]} vs ${expected[i]}`);
            }
        }
    }

    assertNull(value, message) {
        if (value !== null) {
            throw new Error(message || `Expected null, got ${value}`);
        }
    }
}

// Test suite
const testRunner = new TestRunner();

// Basic note operations tests
testRunner.test('getNoteIndex - valid notes', () => {
    testRunner.assertEqual(MusicTheory.getNoteIndex('C'), 0);
    testRunner.assertEqual(MusicTheory.getNoteIndex('C#'), 1);
    testRunner.assertEqual(MusicTheory.getNoteIndex('B'), 11);
    testRunner.assertEqual(MusicTheory.getNoteIndex('c'), 0); // Case insensitive
});

testRunner.test('getNoteIndex - invalid notes', () => {
    testRunner.assertEqual(MusicTheory.getNoteIndex('H'), -1);
    testRunner.assertEqual(MusicTheory.getNoteIndex(''), -1);
    testRunner.assertEqual(MusicTheory.getNoteIndex(null), -1);
    testRunner.assertEqual(MusicTheory.getNoteIndex(123), -1);
});

testRunner.test('getNoteFromIndex - valid indices', () => {
    testRunner.assertEqual(MusicTheory.getNoteFromIndex(0), 'C');
    testRunner.assertEqual(MusicTheory.getNoteFromIndex(11), 'B');
    testRunner.assertEqual(MusicTheory.getNoteFromIndex(12), 'C'); // Wraps around
    testRunner.assertEqual(MusicTheory.getNoteFromIndex(13), 'C#');
});

testRunner.test('getNoteFromIndex - invalid indices', () => {
    testRunner.assertNull(MusicTheory.getNoteFromIndex(-1));
    testRunner.assertNull(MusicTheory.getNoteFromIndex('not a number'));
});

// Triad calculation tests
testRunner.test('calculateTriadNotes - Major triads', () => {
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('C', 'Major'), ['C', 'E', 'G']);
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('G', 'Major'), ['G', 'B', 'D']);
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('F#', 'Major'), ['F#', 'A#', 'C#']);
});

testRunner.test('calculateTriadNotes - Minor triads', () => {
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('A', 'Minor'), ['A', 'C', 'E']);
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('D', 'Minor'), ['D', 'F', 'A']);
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('B', 'Minor'), ['B', 'D', 'F#']);
});

testRunner.test('calculateTriadNotes - Diminished triads', () => {
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('B', 'Diminished'), ['B', 'D', 'F']);
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('F#', 'Diminished'), ['F#', 'A', 'C']);
});

testRunner.test('calculateTriadNotes - Augmented triads', () => {
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('C', 'Augmented'), ['C', 'E', 'G#']);
    testRunner.assertArrayEqual(MusicTheory.calculateTriadNotes('F', 'Augmented'), ['F', 'A', 'C#']);
});

testRunner.test('calculateTriadNotes - invalid inputs', () => {
    testRunner.assertNull(MusicTheory.calculateTriadNotes('H', 'Major'));
    testRunner.assertNull(MusicTheory.calculateTriadNotes('C', 'InvalidType'));
    testRunner.assertNull(MusicTheory.calculateTriadNotes('', 'Major'));
});

// Fretboard note calculation tests
testRunner.test('getNoteName - standard tuning', () => {
    // High E string (index 0)
    testRunner.assertEqual(MusicTheory.getNoteName(0, 0), 'E'); // Open high E
    testRunner.assertEqual(MusicTheory.getNoteName(0, 1), 'F'); // 1st fret high E
    testRunner.assertEqual(MusicTheory.getNoteName(0, 3), 'G'); // 3rd fret high E
    
    // Low E string (index 5)
    testRunner.assertEqual(MusicTheory.getNoteName(5, 0), 'E'); // Open low E
    testRunner.assertEqual(MusicTheory.getNoteName(5, 3), 'G'); // 3rd fret low E
    testRunner.assertEqual(MusicTheory.getNoteName(5, 5), 'A'); // 5th fret low E
});

testRunner.test('getNoteName - invalid inputs', () => {
    testRunner.assertNull(MusicTheory.getNoteName(-1, 0));
    testRunner.assertNull(MusicTheory.getNoteName(6, 0)); // Only 6 strings
    testRunner.assertNull(MusicTheory.getNoteName(0, -1));
});

testRunner.test('getNoteName - custom tuning', () => {
    const dropD = ['E', 'B', 'G', 'D', 'A', 'D']; // Drop D tuning
    testRunner.assertEqual(MusicTheory.getNoteName(5, 0, dropD), 'D'); // Low D
    testRunner.assertEqual(MusicTheory.getNoteName(5, 2, dropD), 'E'); // 2nd fret = E
});

// Absolute pitch tests
testRunner.test('getAbsolutePitch - valid positions', () => {
    testRunner.assertEqual(MusicTheory.getAbsolutePitch(0, 0), 64); // High E open
    testRunner.assertEqual(MusicTheory.getAbsolutePitch(5, 0), 40); // Low E open
    testRunner.assertEqual(MusicTheory.getAbsolutePitch(0, 12), 76); // High E 12th fret (octave)
});

testRunner.test('getAbsolutePitch - invalid inputs', () => {
    testRunner.assertNull(MusicTheory.getAbsolutePitch(-1, 0));
    testRunner.assertNull(MusicTheory.getAbsolutePitch(6, 0));
    testRunner.assertNull(MusicTheory.getAbsolutePitch(0, -1));
});

// Inversion tests
testRunner.test('getNotesInInversion - valid inversions', () => {
    const cMajor = ['C', 'E', 'G'];
    testRunner.assertArrayEqual(MusicTheory.getNotesInInversion(cMajor, 0), ['C', 'E', 'G']);
    testRunner.assertArrayEqual(MusicTheory.getNotesInInversion(cMajor, 1), ['E', 'G', 'C']);
    testRunner.assertArrayEqual(MusicTheory.getNotesInInversion(cMajor, 2), ['G', 'C', 'E']);
});

testRunner.test('getNotesInInversion - invalid inputs', () => {
    testRunner.assertNull(MusicTheory.getNotesInInversion(['C', 'E'], 0)); // Not 3 notes
    testRunner.assertNull(MusicTheory.getNotesInInversion(['C', 'E', 'G'], 3)); // Invalid inversion
    testRunner.assertNull(MusicTheory.getNotesInInversion(['C', 'E', 'G'], -1)); // Invalid inversion
});

// Close voicing tests
testRunner.test('isCloseVoicing - valid close voicings', () => {
    // C major in close position (pitches within an octave)
    const closeVoicing = [
        { string: 2, fret: 5 }, // C on G string 5th fret
        { string: 1, fret: 5 }, // E on B string 5th fret  
        { string: 0, fret: 3 }  // G on high E string 3rd fret
    ];
    testRunner.assert(MusicTheory.isCloseVoicing(closeVoicing));
});

testRunner.test('isCloseVoicing - invalid inputs', () => {
    testRunner.assert(!MusicTheory.isCloseVoicing([])); // Empty array
    testRunner.assert(!MusicTheory.isCloseVoicing([{string: 0, fret: 0}])); // Only 1 note
    testRunner.assert(!MusicTheory.isCloseVoicing(null)); // Null input
});

// Chord name formatting tests
testRunner.test('formatChordName - valid inputs', () => {
    testRunner.assertEqual(MusicTheory.formatChordName('C', 'Major', 0), 'C Major');
    testRunner.assertEqual(MusicTheory.formatChordName('A', 'Minor', 1), 'A Minor (1st Inv)');
    testRunner.assertEqual(MusicTheory.formatChordName('F#', 'Diminished', 2), 'F# Diminished (2nd Inv)');
});

testRunner.test('formatChordName - invalid inputs', () => {
    testRunner.assertEqual(MusicTheory.formatChordName('', 'Major', 0), '');
    testRunner.assertEqual(MusicTheory.formatChordName('C', '', 0), 'C');
    testRunner.assertEqual(MusicTheory.formatChordName(null, 'Major', 0), '');
    testRunner.assertEqual(MusicTheory.formatChordName('C', null, 0), 'C');
});

testRunner.test('getInversionName - all inversions', () => {
    testRunner.assertEqual(MusicTheory.getInversionName(0), 'Root Position');
    testRunner.assertEqual(MusicTheory.getInversionName(1), '1st Inversion');
    testRunner.assertEqual(MusicTheory.getInversionName(2), '2nd Inversion');
    testRunner.assertEqual(MusicTheory.getInversionName(3), 'Inversion 3');
});

// Triad validation tests
testRunner.test('validateTriadNotes - valid triads', () => {
    testRunner.assert(MusicTheory.validateTriadNotes(['C', 'E', 'G'], ['C', 'E', 'G']));
    testRunner.assert(MusicTheory.validateTriadNotes(['E', 'G', 'C'], ['C', 'E', 'G'])); // Different order
    testRunner.assert(MusicTheory.validateTriadNotes(['G', 'C', 'E'], ['C', 'E', 'G'])); // Different order
});

testRunner.test('validateTriadNotes - invalid triads', () => {
    testRunner.assert(!MusicTheory.validateTriadNotes(['C', 'E', 'F'], ['C', 'E', 'G'])); // Wrong notes
    testRunner.assert(!MusicTheory.validateTriadNotes(['C', 'E'], ['C', 'E', 'G'])); // Missing note
    testRunner.assert(!MusicTheory.validateTriadNotes(['C', 'C', 'E'], ['C', 'E', 'G'])); // Duplicate
});

// Run all tests
export async function runMusicTheoryTests() {
    return await testRunner.run();
}
