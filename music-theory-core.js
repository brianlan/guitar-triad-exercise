// Core Music Theory Module - Instrument-Agnostic
// Pure music theory classes without instrument-specific logic

class Pitch {
    constructor(notation) {
        this.parseNotation(notation);
        this.calculateSemitoneValue();
    }

    parseNotation(notation) {
        // Validate and parse Scientific Pitch Notation (e.g., C4, F#3, Bb2)
        const spnRegex = /^([A-G])([#b]?)(\d+)$/;
        const match = notation.match(spnRegex);
        
        if (!match) {
            throw new Error('Invalid pitch notation');
        }

        this.noteLetter = match[1];
        this.accidental = match[2] || '';
        this.octave = parseInt(match[3]);
        this.note = this.noteLetter + this.accidental;

        // Validate octave range (0-9 for practical use)
        if (this.octave < 0 || this.octave > 9) {
            throw new Error('Invalid octave range');
        }
    }

    calculateSemitoneValue() {
        // Calculate MIDI note number (C4 = 60)
        const noteValues = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
            'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };

        this.semitoneValue = (this.octave * 12) + noteValues[this.note] + 12;
    }

    getEnharmonicEquivalents() {
        const enharmonics = {
            'C#': ['Db'], 'Db': ['C#'],
            'D#': ['Eb'], 'Eb': ['D#'],
            'F#': ['Gb'], 'Gb': ['F#'],
            'G#': ['Ab'], 'Ab': ['G#'],
            'A#': ['Bb'], 'Bb': ['A#']
        };

        const equivalents = enharmonics[this.note] || [];
        return equivalents.map(note => note + this.octave);
    }

    toString() {
        return this.note + this.octave;
    }

    // Add semitones to create new pitch
    addSemitones(semitones) {
        const newMidi = this.semitoneValue + semitones;
        const newOctave = Math.floor((newMidi - 12) / 12);
        const newNoteValue = (newMidi - 12) % 12;
        
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const newNote = notes[newNoteValue];
        
        return new Pitch(newNote + newOctave);
    }
}

class Chord {
    constructor(root, quality, inversion = 'root', voicing = 'closed') {
        this.root = typeof root === 'string' ? new Pitch(root) : root;
        this.quality = quality;
        this.inversion = inversion;
        this.voicing = voicing;
        this.intervals = this.getIntervals();
    }

    getIntervals() {
        // Define intervals for each chord quality (in semitones from root)
        const intervals = {
            'major': [0, 4, 7],        // Root, Major 3rd, Perfect 5th
            'minor': [0, 3, 7],        // Root, Minor 3rd, Perfect 5th
            'diminished': [0, 3, 6],   // Root, Minor 3rd, Diminished 5th
            'augmented': [0, 4, 8]     // Root, Major 3rd, Augmented 5th
        };

        return intervals[this.quality] || intervals['major'];
    }

    getPitches() {
        let pitches = this.intervals.map(interval => 
            this.root.addSemitones(interval)
        );

        // Apply inversion
        switch (this.inversion) {
            case 'first':
                // Third becomes bass note
                pitches = [
                    pitches[1], // Third
                    pitches[2], // Fifth
                    pitches[0].addSemitones(12) // Root up octave
                ];
                break;
            case 'second':
                // Fifth becomes bass note
                pitches = [
                    pitches[2], // Fifth
                    pitches[0].addSemitones(12), // Root up octave
                    pitches[1].addSemitones(12)  // Third up octave
                ];
                break;
            // 'root' case - no change needed
        }

        // Apply voicing
        if (this.voicing === 'open') {
            // Spread chord tones across wider range
            pitches = [
                pitches[0], // Keep bass note
                pitches[2], // Move fifth to middle
                pitches[1].addSemitones(12) // Third up octave
            ];
        }

        return pitches;
    }

    getStandardName() {
        return `${this.root.note}_${this.quality}_${this.inversion}_${this.voicing}`;
    }

    // Get all chord tones (without octave consideration)
    getChordTones() {
        return this.intervals.map(interval => {
            const pitch = this.root.addSemitones(interval);
            return pitch.note;
        });
    }
}

class ChordTheory {
    constructor() {
        // Pure music theory, no instrument-specific logic
    }

    parseChordName(standardName) {
        // Parse standard chord name: "C_major_root_closed"
        const parts = standardName.split('_');
        if (parts.length !== 4) {
            throw new Error('Invalid standard chord name format');
        }

        const [root, quality, inversion, voicing] = parts;
        return new Chord(root + '4', quality, inversion, voicing);
    }

    generateRandomChord(constraints = {}) {
        const {
            roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
            qualities = ['major', 'minor', 'diminished', 'augmented'],
            inversions = ['root', 'first', 'second'],
            voicings = ['closed', 'open']
        } = constraints;

        const randomRoot = roots[Math.floor(Math.random() * roots.length)];
        const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
        const randomInversion = inversions[Math.floor(Math.random() * inversions.length)];
        const randomVoicing = voicings[Math.floor(Math.random() * voicings.length)];

        return new Chord(randomRoot + '4', randomQuality, randomInversion, randomVoicing);
    }

    validateProgression(chordNames) {
        // Basic validation - ensure all chords can be parsed
        try {
            chordNames.forEach(name => this.parseChordName(name));
            return true;
        } catch (error) {
            return false;
        }
    }

    getAllChordVariations(root, quality) {
        const variations = [];
        const inversions = ['root', 'first', 'second'];
        const voicings = ['closed', 'open'];

        for (const inversion of inversions) {
            for (const voicing of voicings) {
                variations.push(new Chord(root + '4', quality, inversion, voicing));
            }
        }

        return variations;
    }

    // Identify chord from a collection of note names (no octave info)
    identifyChordFromNotes(noteNames) {
        const possibleChords = [];
        
        // Only proceed if we have at least 3 unique notes
        if (noteNames.length >= 3) {
            for (const note of ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']) {
                for (const quality of ['major', 'minor', 'diminished', 'augmented']) {
                    const testChord = new Chord(note + '4', quality);
                    const chordTones = testChord.getChordTones();
                    
                    // Count how many chord tones are present
                    let matchCount = 0;
                    for (const tone of chordTones) {
                        if (noteNames.includes(tone)) {
                            matchCount++;
                        } else {
                            // Check enharmonic equivalents
                            const enharmonics = new Pitch(tone + '4').getEnharmonicEquivalents();
                            if (enharmonics.some(enh => noteNames.includes(enh.replace(/\d+$/, '')))) {
                                matchCount++;
                            }
                        }
                    }
                    
                    // If all 3 chord tones are present, this is a valid chord
                    if (matchCount === 3) {
                        // Determine inversion based on bass note (first note in the array)
                        const bassNote = noteNames[0];
                        let inversion = 'root';
                        
                        // Check inversion
                        if (this.notesMatch(bassNote, chordTones[1])) inversion = 'first';
                        else if (this.notesMatch(bassNote, chordTones[2])) inversion = 'second';
                        
                        possibleChords.push(new Chord(note + '4', quality, inversion, 'closed'));
                    }
                }
            }
        }

        return possibleChords;
    }

    // Helper method to check if two notes match (including enharmonics)
    notesMatch(note1, note2) {
        if (note1 === note2) return true;
        const enharmonics1 = new Pitch(note1 + '4').getEnharmonicEquivalents();
        const enharmonics2 = new Pitch(note2 + '4').getEnharmonicEquivalents();
        return enharmonics1.some(enh => enh.replace(/\d+$/, '') === note2) ||
               enharmonics2.some(enh => enh.replace(/\d+$/, '') === note1);
    }
}

// Export for CommonJS (Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pitch, Chord, ChordTheory };
}

// Export for ES6 modules (browser)
if (typeof window !== 'undefined') {
    window.MusicTheoryCore = { Pitch, Chord, ChordTheory };
}