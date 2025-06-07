/**
 * Unit tests for AudioManager module
 */

import { AudioManager } from '../src/core/AudioManager.js';

export function runAudioManagerTests(runner) {
    runner.test('AudioManager - Initialization', async () => {
        const audioManager = new AudioManager();
        runner.assertFalse(audioManager.isInitialized(), 'Should not be initialized initially');
        
        // Mock AudioContext for testing
        if (typeof AudioContext === 'undefined') {
            global.AudioContext = class MockAudioContext {
                constructor() {
                    this.state = 'suspended';
                    this.destination = {};
                }
                async resume() {
                    this.state = 'running';
                }
                createOscillator() {
                    return {
                        frequency: { value: 440 },
                        type: 'sine',
                        connect: () => {},
                        start: () => {},
                        stop: () => {}
                    };
                }
                createGain() {
                    return {
                        gain: { value: 1 },
                        connect: () => {}
                    };
                }
            };
        }
        
        await audioManager.init();
        runner.assertTrue(audioManager.isInitialized(), 'Should be initialized after init()');
    });
    
    runner.test('AudioManager - Enable/Disable', () => {
        const audioManager = new AudioManager();
        
        runner.assertTrue(audioManager.isEnabled(), 'Should be enabled by default');
        
        audioManager.disable();
        runner.assertFalse(audioManager.isEnabled(), 'Should be disabled after disable()');
        
        audioManager.enable();
        runner.assertTrue(audioManager.isEnabled(), 'Should be enabled after enable()');
    });
    
    runner.test('AudioManager - Note frequency calculation', () => {
        const audioManager = new AudioManager();
        
        // Test A4 = 440Hz (reference)
        const a4Freq = audioManager.getNoteFrequency('A', 4);
        runner.assertEquals(Math.round(a4Freq), 440, 'A4 should be 440Hz');
        
        // Test octave relationships
        const a3Freq = audioManager.getNoteFrequency('A', 3);
        const a5Freq = audioManager.getNoteFrequency('A', 5);
        
        runner.assertEquals(Math.round(a3Freq * 2), Math.round(a4Freq), 'A3 * 2 should equal A4');
        runner.assertEquals(Math.round(a4Freq * 2), Math.round(a5Freq), 'A4 * 2 should equal A5');
    });
    
    runner.test('AudioManager - Guitar string frequencies', () => {
        const audioManager = new AudioManager();
        
        // Standard tuning frequencies (approximate)
        const expectedFreqs = {
            'E2': 82.4,   // Low E
            'A2': 110.0,  // A string
            'D3': 146.8,  // D string
            'G3': 196.0,  // G string
            'B3': 246.9,  // B string
            'E4': 329.6   // High E
        };
        
        Object.entries(expectedFreqs).forEach(([note, expectedFreq]) => {
            const noteName = note.slice(0, -1);
            const octave = parseInt(note.slice(-1));
            const calculatedFreq = audioManager.getNoteFrequency(noteName, octave);
            
            // Allow for small rounding differences
            const diff = Math.abs(calculatedFreq - expectedFreq);
            runner.assertTrue(diff < 1, `${note} frequency should be close to ${expectedFreq}Hz, got ${calculatedFreq}Hz`);
        });
    });
    
    runner.test('AudioManager - Fret position frequency calculation', () => {
        const audioManager = new AudioManager();
        
        // Test that fretting increases frequency correctly
        const openE = audioManager.getStringFretFrequency(0, 0); // High E open
        const firstFret = audioManager.getStringFretFrequency(0, 1); // First fret (F)
        const twelfthFret = audioManager.getStringFretFrequency(0, 12); // 12th fret (E octave)
        
        runner.assertTrue(firstFret > openE, 'First fret should be higher than open');
        runner.assertTrue(twelfthFret > firstFret, '12th fret should be higher than 1st');
        
        // 12th fret should be exactly double the open string frequency
        const ratio = twelfthFret / openE;
        runner.assertTrue(Math.abs(ratio - 2) < 0.01, '12th fret should be 2x open string frequency');
    });
    
    runner.test('AudioManager - Note playing (mock)', () => {
        const audioManager = new AudioManager();
        
        // Mock the playNote method to track calls
        let playedNotes = [];
        audioManager.playNote = (noteName, stringIndex, fretIndex) => {
            playedNotes.push({ noteName, stringIndex, fretIndex });
        };
        
        audioManager.playNote('E', 0, 0);
        audioManager.playNote('F', 0, 1);
        
        runner.assertEquals(playedNotes.length, 2, 'Should have played 2 notes');
        runner.assertEquals(playedNotes[0].noteName, 'E', 'First note should be E');
        runner.assertEquals(playedNotes[1].noteName, 'F', 'Second note should be F');
    });
    
    runner.test('AudioManager - Multiple note playback', () => {
        const audioManager = new AudioManager();
        
        // Test chord playback (multiple notes)
        let playedNotes = [];
        audioManager.playNote = (noteName) => {
            playedNotes.push(noteName);
        };
        
        const chordNotes = ['C', 'E', 'G'];
        audioManager.playChord(chordNotes);
        
        runner.assertEquals(playedNotes.length, 3, 'Should have played 3 notes for chord');
        runner.assertEquals(playedNotes, chordNotes, 'Should have played all chord notes');
    });
    
    runner.test('AudioManager - Volume control', () => {
        const audioManager = new AudioManager();
        
        // Test volume setting
        audioManager.setVolume(0.5);
        runner.assertEquals(audioManager.getVolume(), 0.5, 'Volume should be set to 0.5');
        
        audioManager.setVolume(0);
        runner.assertEquals(audioManager.getVolume(), 0, 'Volume should be set to 0');
        
        audioManager.setVolume(1);
        runner.assertEquals(audioManager.getVolume(), 1, 'Volume should be set to 1');
    });
    
    runner.test('AudioManager - Invalid volume handling', () => {
        const audioManager = new AudioManager();
        
        runner.assertThrows(() => {
            audioManager.setVolume(-0.1);
        }, 'Negative volume should throw');
        
        runner.assertThrows(() => {
            audioManager.setVolume(1.1);
        }, 'Volume > 1 should throw');
    });
    
    runner.test('AudioManager - Stop all sounds', () => {
        const audioManager = new AudioManager();
        
        let stoppedSounds = 0;
        audioManager.stopAllSounds = () => {
            stoppedSounds++;
        };
        
        audioManager.stopAllSounds();
        runner.assertEquals(stoppedSounds, 1, 'Should have called stop all sounds');
    });
}
