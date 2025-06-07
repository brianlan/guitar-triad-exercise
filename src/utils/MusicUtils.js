/**
 * Utility functions for musical calculations and operations
 */
import { NOTES, STANDARD_TUNING, FRETBOARD_CONFIG, TRIAD_INTERVALS, VOICING_CONSTRAINTS } from './Constants.js';

export class MusicUtils {
    /**
     * Get the index of a note in the chromatic scale
     * @param {string} noteName - The note name (e.g., 'C', 'F#')
     * @returns {number} The index (0-11) or -1 if invalid
     */
    static getNoteIndex(noteName) {
        return NOTES.indexOf(noteName.toUpperCase());
    }

    /**
     * Get a note name from a chromatic index
     * @param {number} index - The chromatic index
     * @returns {string} The note name
     */
    static getNoteFromIndex(index) {
        return NOTES[index % NOTES.length];
    }

    /**
     * Calculate the note at a specific string and fret
     * @param {number} stringIndex - The string index (0-5)
     * @param {number} fretIndex - The fret number (0-24)
     * @param {string[]} tuning - The guitar tuning array
     * @returns {string|null} The note name or null if invalid
     */
    static getNoteName(stringIndex, fretIndex, tuning = STANDARD_TUNING) {
        if (stringIndex < 0 || stringIndex >= tuning.length) {
            console.error(`Invalid string index: ${stringIndex}`);
            return null;
        }

        const openNote = tuning[stringIndex];
        const openNoteIndex = this.getNoteIndex(openNote);
        
        if (openNoteIndex === -1) {
            console.error(`Invalid tuning note: ${openNote} for string index ${stringIndex}`);
            return null;
        }

        const noteIndex = (openNoteIndex + fretIndex) % NOTES.length;
        return NOTES[noteIndex];
    }

    /**
     * Calculate the absolute pitch of a note on the fretboard
     * @param {number} stringIndex - The string index (0-5)
     * @param {number} fretIndex - The fret number
     * @returns {number} The absolute pitch in semitones from C0
     */
    static getAbsolutePitch(stringIndex, fretIndex) {
        if (stringIndex < 0 || stringIndex >= FRETBOARD_CONFIG.OPEN_STRING_PITCHES.length) {
            throw new Error(`Invalid string index: ${stringIndex}`);
        }
        return FRETBOARD_CONFIG.OPEN_STRING_PITCHES[stringIndex] + fretIndex;
    }

    /**
     * Calculate the notes in a triad
     * @param {string} rootNote - The root note
     * @param {string} triadType - The triad type ('Major', 'Minor', etc.)
     * @returns {string[]|null} Array of note names or null if invalid
     */
    static calculateTriadNotes(rootNote, triadType) {
        const rootIndex = this.getNoteIndex(rootNote);
        if (rootIndex === -1) {
            console.error(`Invalid root note: ${rootNote}`);
            return null;
        }

        const intervals = TRIAD_INTERVALS[triadType];
        if (!intervals) {
            console.error(`Invalid triad type: ${triadType}`);
            return null;
        }

        return intervals.map(interval => this.getNoteFromIndex(rootIndex + interval));
    }

    /**
     * Get a random element from an array
     * @param {Array} array - The array to pick from
     * @returns {*} A random element or null if array is empty
     */
    static getRandomElement(array) {
        if (!array || array.length === 0) {
            throw new Error('Array cannot be empty');
        }
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Normalize note name (convert flats to sharps)
     * @param {string} noteName - The note name to normalize
     * @returns {string} Normalized note name
     */
    static normalizeNote(noteName) {
        if (!noteName || typeof noteName !== 'string') {
            throw new Error('Invalid note name');
        }
        
        const note = noteName.trim().toUpperCase();
        
        const enharmonicMap = {
            'DB': 'C#', 'EB': 'D#', 'GB': 'F#', 'AB': 'G#', 'BB': 'A#',
            'C#': 'C#', 'D#': 'D#', 'F#': 'F#', 'G#': 'G#', 'A#': 'A#',
            'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B',
            'E#': 'F', 'B#': 'C', 'FB': 'E', 'CB': 'B'
        };
        
        const normalized = enharmonicMap[note];
        if (!normalized) {
            throw new Error('Invalid note name');
        }
        
        return normalized;
    }

    /**
     * Get enharmonic equivalent of a note
     * @param {string} noteName - The note name
     * @returns {string|null} Enharmonic equivalent or null if none
     */
    static getEnharmonicEquivalent(noteName) {
        const enharmonicPairs = {
            'C#': 'Db', 'Db': 'C#',
            'D#': 'Eb', 'Eb': 'D#',
            'F#': 'Gb', 'Gb': 'F#',
            'G#': 'Ab', 'Ab': 'G#',
            'A#': 'Bb', 'Bb': 'A#'
        };
        
        // For natural notes, return the note itself
        const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        if (naturalNotes.includes(noteName)) {
            return noteName;
        }
        
        return enharmonicPairs[noteName] || null;
    }

    /**
     * Calculate interval between two notes in semitones
     * @param {string} note1 - First note
     * @param {string} note2 - Second note
     * @returns {number} Interval in semitones
     */
    static calculateInterval(note1, note2) {
        // Normalize notes to ensure we can find them in NOTES array
        const normalizedNote1 = MusicUtils.normalizeNote(note1);
        const normalizedNote2 = MusicUtils.normalizeNote(note2);
        
        const index1 = MusicUtils.getNoteIndex(normalizedNote1);
        const index2 = MusicUtils.getNoteIndex(normalizedNote2);
        
        if (index1 === -1 || index2 === -1) {
            throw new Error('Invalid note names');
        }
        
        let interval = index2 - index1;
        if (interval < 0) interval += 12;
        return interval;
    }

    /**
     * Extract octave number from note string (e.g., "C4" -> 4)
     * @param {string} noteString - Note with octave (e.g., "C4")
     * @param {number} defaultOctave - Default octave if none specified
     * @returns {number} Octave number
     */
    static getOctaveFromNote(noteString, defaultOctave = 4) {
        if (!noteString || typeof noteString !== 'string') {
            throw new Error('Invalid note string');
        }
        
        // Validate that the note string contains a valid note name
        const noteMatch = noteString.match(/^([A-G][#b]?)\d*$/);
        if (!noteMatch) {
            throw new Error('Invalid note string');
        }
        
        const match = noteString.match(/(\d+)$/);
        const octave = match ? parseInt(match[1], 10) : defaultOctave;
        
        if (octave < 0 || octave > 9) {
            throw new Error('Octave must be between 0 and 9');
        }
        
        return octave;
    }

    /**
     * Check if a voicing represents a close voicing (interval < 1 octave)
     * @param {Array} voicing - Array of {string, fret} objects
     * @returns {boolean} True if close voicing
     */
    static isCloseVoicing(voicing) {
        if (!voicing || voicing.length < 2) return true;

        const pitches = voicing.map(v => this.getAbsolutePitch(v.string, v.fret));
        const pitchSpan = Math.max(...pitches) - Math.min(...pitches);
        
        return pitchSpan <= VOICING_CONSTRAINTS.MAX_PITCH_SPAN;
    }

    /**
     * Check if positions are within playable fret span
     * @param {Array} voicing - Array of {string, fret} objects
     * @returns {boolean} True if playable
     */
    static isPlayableVoicing(voicing) {
        if (!voicing || voicing.length < 2) return true;

        const frets = voicing.map(v => v.fret);
        const fretSpan = Math.max(...frets) - Math.min(...frets);
        
        return fretSpan <= VOICING_CONSTRAINTS.MAX_FRET_SPAN;
    }

    /**
     * Get the bass note (lowest pitched note) from a voicing
     * @param {Array} voicing - Array of {string, fret} objects
     * @returns {string|null} The bass note name
     */
    static getBassNote(voicing, tuning = STANDARD_TUNING) {
        if (!voicing || voicing.length === 0) return null;

        const pitchNoteMap = voicing.map(v => ({
            pitch: this.getAbsolutePitch(v.string, v.fret),
            note: this.getNoteName(v.string, v.fret, tuning)
        }));

        pitchNoteMap.sort((a, b) => a.pitch - b.pitch);
        return pitchNoteMap[0].note;
    }

    /**
     * Validate that a voicing has the expected unique notes
     * @param {Array} voicing - Array of {string, fret} objects
     * @param {string[]} expectedNotes - Array of expected note names
     * @param {string[]} tuning - Guitar tuning
     * @returns {boolean} True if voicing matches expected notes
     */
    static validateVoicing(voicing, expectedNotes, tuning = STANDARD_TUNING) {
        if (!voicing || !expectedNotes) return false;
        if (voicing.length !== expectedNotes.length) return false;

        const actualNotes = voicing.map(v => this.getNoteName(v.string, v.fret, tuning));
        const uniqueActual = [...new Set(actualNotes)];
        const uniqueExpected = [...new Set(expectedNotes)];

        if (uniqueActual.length !== uniqueExpected.length) return false;

        return uniqueExpected.every(note => actualNotes.includes(note)) &&
               actualNotes.every(note => uniqueExpected.includes(note));
    }

    /**
     * Format a chord name with root note, triad type, and inversion
     * @param {string} rootNote - Root note (e.g., 'C', 'F#')
     * @param {string} triadType - Type of triad ('Major', 'Minor', 'Diminished', 'Augmented')
     * @param {number} inversion - Inversion (0=root, 1=1st, 2=2nd)
     * @returns {string} Formatted chord name (e.g., "C Major", "F# Minor 1st inversion")
     */
    static formatChordName(rootNote, triadType, inversion = 0) {
        if (!rootNote || !triadType) {
            return 'Unknown Chord';
        }

        let chordName = `${rootNote} ${triadType}`;
        
        if (inversion === 1) {
            chordName += ' 1st inversion';
        } else if (inversion === 2) {
            chordName += ' 2nd inversion';
        }
        
        return chordName;
    }

    /**
     * Calculate the pitch (as MIDI note number) for a string and fret
     * @param {number} stringIndex - 0-based string index
     * @param {number} fret - Fret number
     * @param {Array} tuning - Guitar tuning
     * @returns {number} MIDI note number
     */
    static calculatePitch(stringIndex, fret, tuning = STANDARD_TUNING) {
        const openStringNote = tuning[stringIndex];
        const openStringMidi = this.noteToMidi(openStringNote);
        return openStringMidi + fret;
    }

    /**
     * Convert note name to MIDI note number
     * @param {string} noteName - Note name (e.g., "E4", "C#3")
     * @returns {number} MIDI note number
     */
    static noteToMidi(noteName) {
        // Handle case where note doesn't have octave number
        const match = noteName.match(/^([A-G][#b]?)(\d+)?$/);
        if (!match) {
            throw new Error('Invalid note name: ' + noteName);
        }
        
        const noteOnly = match[1];
        const octave = match[2] ? parseInt(match[2]) : 4; // Default to octave 4
        
        const noteValues = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
            'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        
        const noteValue = noteValues[noteOnly];
        if (noteValue === undefined) {
            throw new Error('Invalid note: ' + noteOnly);
        }
        
        return (octave + 1) * 12 + noteValue;
    }
}

// Individual function exports for testing and direct usage
export const getRandomElement = MusicUtils.getRandomElement;
export const normalizeNote = MusicUtils.normalizeNote;
export const getEnharmonicEquivalent = MusicUtils.getEnharmonicEquivalent;
export const calculateInterval = MusicUtils.calculateInterval;
export const getOctaveFromNote = MusicUtils.getOctaveFromNote;
export const formatChordName = MusicUtils.formatChordName;
export const calculatePitch = MusicUtils.calculatePitch;
export const noteToMidi = MusicUtils.noteToMidi;
