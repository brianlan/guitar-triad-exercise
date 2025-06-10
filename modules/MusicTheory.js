/**
 * Music Theory Module
 * 
 * Handles all music theory calculations including:
 * - Note names and chromatic relationships
 * - Triad intervals and chord construction
 * - Inversion calculations
 * - Pitch calculations for close voicing validation
 * 
 * This module is pure functions with no side effects or DOM dependencies.
 */

export class MusicTheory {
    static notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    static triadIntervals = {
        'Major': [0, 4, 7],      // Root, Major Third (4 semitones), Perfect Fifth (7 semitones)
        'Minor': [0, 3, 7],      // Root, Minor Third (3 semitones), Perfect Fifth (7 semitones)
        'Diminished': [0, 3, 6], // Root, Minor Third (3 semitones), Diminished Fifth (6 semitones)
        'Augmented': [0, 4, 8]   // Root, Major Third (4 semitones), Augmented Fifth (8 semitones)
    };

    // Standard guitar tuning pitches (in semitones from C0): E4, B3, G3, D3, A2, E2
    static standardTuning = ['E', 'B', 'G', 'D', 'A', 'E']; // High E (1st string) to Low E (6th string)
    static openStringPitches = [64, 59, 55, 50, 45, 40]; // High E to Low E

    /**
     * Get the index of a note in the chromatic scale
     * @param {string} noteName - Note name (e.g., 'C', 'F#')
     * @returns {number} Index (0-11) or -1 if invalid
     */
    static getNoteIndex(noteName) {
        if (typeof noteName !== 'string') return -1;
        return this.notes.indexOf(noteName.toUpperCase());
    }

    /**
     * Get note name from chromatic index
     * @param {number} index - Chromatic index
     * @returns {string} Note name
     */
    static getNoteFromIndex(index) {
        if (typeof index !== 'number' || index < 0) return null;
        return this.notes[index % this.notes.length];
    }

    /**
     * Calculate the notes in a triad
     * @param {string} rootNote - Root note of the triad
     * @param {string} triadType - Type of triad ('Major', 'Minor', 'Diminished', 'Augmented')
     * @returns {string[]|null} Array of note names or null if invalid
     */
    static calculateTriadNotes(rootNote, triadType) {
        const rootIndex = this.getNoteIndex(rootNote);
        if (rootIndex === -1) return null;
        
        const intervals = this.triadIntervals[triadType];
        if (!intervals) return null;
        
        return intervals.map(interval => this.getNoteFromIndex(rootIndex + interval));
    }

    /**
     * Get the note name at a specific string and fret
     * @param {number} stringIndex - String index (0-5, where 0 is high E)
     * @param {number} fretIndex - Fret number (0-24)
     * @param {string[]} tuning - Guitar tuning array (optional, defaults to standard)
     * @returns {string|null} Note name or null if invalid
     */
    static getNoteName(stringIndex, fretIndex, tuning = this.standardTuning) {
        if (stringIndex < 0 || stringIndex >= tuning.length) return null;
        if (fretIndex < 0) return null;
        
        const openNote = tuning[stringIndex];
        if (!openNote) return null;
        
        const openNoteIndex = this.getNoteIndex(openNote);
        if (openNoteIndex === -1) return null;
        
        const noteIndex = (openNoteIndex + fretIndex) % this.notes.length;
        return this.notes[noteIndex];
    }

    /**
     * Calculate absolute pitch for a fret position
     * @param {number} stringIndex - String index (0-5)
     * @param {number} fretIndex - Fret number
     * @returns {number} Absolute pitch in semitones from C0
     */
    static getAbsolutePitch(stringIndex, fretIndex) {
        if (stringIndex < 0 || stringIndex >= this.openStringPitches.length) return null;
        if (fretIndex < 0) return null;
        
        return this.openStringPitches[stringIndex] + fretIndex;
    }

    /**
     * Get notes in order for a specific inversion
     * @param {string[]} triadNotes - Array of 3 triad notes
     * @param {number} inversion - Inversion number (0, 1, or 2)
     * @returns {string[]} Notes in inversion order
     */
    static getNotesInInversion(triadNotes, inversion) {
        if (!Array.isArray(triadNotes) || triadNotes.length !== 3) return null;
        if (inversion < 0 || inversion > 2) return null;
        
        return [...triadNotes.slice(inversion), ...triadNotes.slice(0, inversion)];
    }

    /**
     * Validate if a voicing is in close position (interval < octave)
     * @param {Array} voicing - Array of {string, fret} objects
     * @returns {boolean} True if close voicing
     */
    static isCloseVoicing(voicing) {
        if (!Array.isArray(voicing) || voicing.length !== 3) return false;
        
        const pitches = voicing.map(v => this.getAbsolutePitch(v.string, v.fret));
        if (pitches.some(p => p === null)) return false;
        
        const pitchSpan = Math.max(...pitches) - Math.min(...pitches);
        return pitchSpan < 12; // Less than one octave
    }

    /**
     * Check if a voicing has the correct bass note for the inversion
     * @param {Array} voicing - Array of {string, fret} objects
     * @param {string[]} notesInOrder - Expected notes in inversion order
     * @returns {boolean} True if correct inversion
     */
    static hasCorrectInversion(voicing, notesInOrder) {
        if (!Array.isArray(voicing) || voicing.length !== 3) return false;
        if (!Array.isArray(notesInOrder) || notesInOrder.length !== 3) return false;
        
        // Find the lowest pitched note in the voicing
        const pitchNoteMap = voicing.map(v => ({
            pitch: this.getAbsolutePitch(v.string, v.fret),
            note: this.getNoteName(v.string, v.fret)
        }));
        
        pitchNoteMap.sort((a, b) => a.pitch - b.pitch);
        const bassNote = pitchNoteMap[0].note;
        const expectedBassNote = notesInOrder[0];
        
        return bassNote === expectedBassNote;
    }

    /**
     * Format a chord name with inversion
     * @param {string} root - Root note
     * @param {string} type - Triad type
     * @param {number} inversion - Inversion number
     * @returns {string} Formatted chord name
     */
    static formatChordName(root, type, inversion) {
        if (!root) return '';
        
        let name = root;
        if (type) name += ` ${type}`;
        if (inversion === 1) name += ' (1st Inv)';
        else if (inversion === 2) name += ' (2nd Inv)';
        return name;
    }

    /**
     * Get human-readable inversion name
     * @param {number} inversion - Inversion number
     * @returns {string} Inversion name
     */
    static getInversionName(inversion) {
        const names = {
            0: 'Root Position',
            1: '1st Inversion',
            2: '2nd Inversion'
        };
        return names[inversion] || `Inversion ${inversion}`;
    }

    /**
     * Validate if notes form a specific triad
     * @param {string[]} noteNames - Array of note names
     * @param {string[]} targetTriadNotes - Expected triad notes
     * @returns {boolean} True if notes match the triad
     */
    static validateTriadNotes(noteNames, targetTriadNotes) {
        if (!Array.isArray(noteNames) || !Array.isArray(targetTriadNotes)) return false;
        if (noteNames.length !== 3 || targetTriadNotes.length !== 3) return false;
        
        const uniqueNotes = new Set(noteNames);
        const uniqueTargetNotes = new Set(targetTriadNotes);
        
        return uniqueNotes.size === 3 && 
               uniqueTargetNotes.size === 3 &&
               noteNames.every(note => targetTriadNotes.includes(note)) &&
               targetTriadNotes.every(note => noteNames.includes(note));
    }
}
