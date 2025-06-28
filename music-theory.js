// Music Theory Module - Comprehensive implementation
// Following TDD principles with full chord theory support

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

class ChordDatabase {
    constructor() {
        this.guitarTuning = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2']; // Standard tuning (high to low E)
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Common chord patterns on guitar fretboard
        this.commonChordPatterns = {
            'C_major_root_closed': [
                { string: 4, fret: 3 }, // C on A string
                { string: 3, fret: 2 }, // E on D string
                { string: 2, fret: 0 }, // G on G string
                { string: 1, fret: 1 }, // C on B string
                { string: 0, fret: 0 }  // E on high E string
            ],
            'G_major_root_closed': [
                { string: 5, fret: 3 }, // G on low E string
                { string: 4, fret: 2 }, // B on A string
                { string: 3, fret: 0 }, // D on D string
                { string: 2, fret: 0 }, // G on G string
                { string: 1, fret: 3 }, // D on B string
                { string: 0, fret: 3 }  // G on high E string
            ],
            'D_major_root_closed': [
                { string: 3, fret: 2 }, // E on D string
                { string: 2, fret: 3 }, // A on G string
                { string: 1, fret: 2 }, // D on B string
                { string: 0, fret: 2 }  // F# on high E string
            ]
            // More patterns would be added here
        };
    }

    // Convert fret position to pitch
    fretToPitch(stringIndex, fret) {
        // Validate inputs
        if (stringIndex < 0 || stringIndex >= 6) {
            throw new Error(`Invalid string index: ${stringIndex}. Must be 0-5.`);
        }
        if (fret < 0 || fret > 25) {
            throw new Error(`Invalid fret number: ${fret}. Must be 0-25.`);
        }
        
        const openString = new Pitch(this.guitarTuning[stringIndex]);
        return openString.addSemitones(fret);
    }

    // Identify chord from fretboard positions
    identifyChord(fretPositions) {
        // Extract pitches from fret positions
        const pitches = fretPositions.map(pos => 
            this.fretToPitch(pos.string, pos.fret)
        );

        // Get unique note names (remove octave info) and sort by semitone value
        const uniquePitches = [];
        const seenNotes = new Set();
        
        for (const pitch of pitches) {
            if (!seenNotes.has(pitch.note)) {
                uniquePitches.push(pitch);
                seenNotes.add(pitch.note);
            }
        }
        
        const noteNames = uniquePitches.map(p => p.note);
        
        // Try to match against known chord patterns
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
                        // Determine inversion based on bass note
                        const bassNote = pitches.sort((a, b) => a.semitoneValue - b.semitoneValue)[0].note;
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

    // Get possible fretboard positions for a chord
    getChordPositions(chord) {
        const positions = [];
        
        // Check if we have a predefined pattern
        const standardName = chord.getStandardName();
        if (this.commonChordPatterns[standardName]) {
            positions.push({
                name: standardName,
                positions: this.commonChordPatterns[standardName],
                difficulty: 'beginner'
            });
        }

        // Generate additional positions algorithmically
        this.generateChordPositions(chord, positions);
        
        return positions;
    }

    generateChordPositions(chord, positions) {
        const chordPitches = chord.getPitches();
        
        // Try to find the chord across different fret positions
        for (let baseFret = 0; baseFret <= 12; baseFret++) {
            const pattern = this.findChordPattern(chordPitches, baseFret);
            if (pattern && pattern.length >= 3) {
                const difficulty = this.calculateDifficulty(pattern);
                positions.push({
                    name: `${chord.getStandardName()}_fret_${baseFret}`,
                    positions: pattern,
                    difficulty: difficulty
                });
            }
        }
    }

    findChordPattern(chordPitches, baseFret) {
        const pattern = [];
        const usedStrings = new Set();

        for (const pitch of chordPitches) {
            for (let string = 0; string < 6; string++) {
                if (usedStrings.has(string)) continue;

                const openStringPitch = new Pitch(this.guitarTuning[string]);
                const requiredFret = pitch.semitoneValue - openStringPitch.semitoneValue;

                if (requiredFret >= baseFret && requiredFret <= baseFret + 4 && requiredFret >= 0) {
                    pattern.push({ string, fret: requiredFret });
                    usedStrings.add(string);
                    break;
                }
            }
        }

        return pattern;
    }

    calculateDifficulty(pattern) {
        const frets = pattern.map(p => p.fret).filter(f => f > 0);
        if (frets.length === 0) return 'beginner';
        
        const fretSpan = Math.max(...frets) - Math.min(...frets);
        const avgFret = frets.reduce((a, b) => a + b, 0) / frets.length;

        if (fretSpan <= 3 && avgFret <= 5) return 'beginner';
        if (fretSpan <= 4 && avgFret <= 7) return 'intermediate';
        return 'advanced';
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
}

class MusicTheory {
    constructor() {
        this.chordDatabase = new ChordDatabase();
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

    identifyChordFromFretboard(positions) {
        return this.chordDatabase.identifyChord(positions);
    }

    mapChordToFretboard(chord) {
        return this.chordDatabase.getChordPositions(chord);
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

    getOptimalFingerings(chord) {
        const positions = this.mapChordToFretboard(chord);
        
        return positions.map(pattern => {
            const frets = pattern.positions.map(p => p.fret).filter(f => f > 0);
            const fretSpan = frets.length > 0 ? Math.max(...frets) - Math.min(...frets) : 0;
            
            return {
                ...pattern,
                fretSpan: fretSpan,
                difficulty: pattern.difficulty
            };
        }).sort((a, b) => a.fretSpan - b.fretSpan); // Sort by easiest fingering first
    }
}

class GuitarPositionMapper {
    constructor() {
        this.chordDatabase = new ChordDatabase();
        this.guitarTuning = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2']; // Standard tuning (high to low E)
    }

    // Generate complete fretboard mapping with metadata
    generateCompleteMapping(maxFrets = 24) {
        const strings = [];
        
        for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
            const stringData = {
                stringNumber: stringIndex + 1,
                openNote: this.guitarTuning[stringIndex],
                positions: []
            };
            
            for (let fret = 0; fret <= maxFrets; fret++) {
                const pitch = this.chordDatabase.fretToPitch(stringIndex, fret);
                stringData.positions.push({
                    fret: fret,
                    note: pitch.toString(),
                    semitoneValue: pitch.semitoneValue,
                    enharmonics: pitch.getEnharmonicEquivalents()
                });
            }
            
            strings.push(stringData);
        }
        
        return {
            metadata: {
                tuning: this.guitarTuning,
                maxFrets: maxFrets,
                generatedAt: new Date().toISOString()
            },
            strings: strings
        };
    }

    // Find all positions on fretboard for a specific note
    findPositionsForNote(noteName, maxFrets = 24) {
        const positions = [];
        const targetPitch = new Pitch(noteName);
        
        for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
            for (let fret = 0; fret <= maxFrets; fret++) {
                const pitch = this.chordDatabase.fretToPitch(stringIndex, fret);
                
                // Check if semitone values match (handles enharmonic equivalents)
                if (pitch.semitoneValue === targetPitch.semitoneValue) {
                    positions.push({
                        string: stringIndex,
                        fret: fret,
                        note: pitch.toString()
                    });
                }
            }
        }
        
        return positions;
    }

    // Generate mapping table in specified format
    generateMappingTable(options = {}) {
        const {
            format = 'text',
            maxFrets = 12,
            includeEnharmonics = false,
            includeMIDI = false
        } = options;
        
        let table = '';
        
        // Header
        table += 'Guitar Fretboard Position to SPN Mapping\n';
        table += '=' .repeat(50) + '\n';
        table += `Generated: ${new Date().toLocaleString()}\n`;
        table += `Tuning: ${this.guitarTuning.join(' - ')}\n`;
        table += `Fret Range: 0-${maxFrets}\n\n`;
        
        // String-by-string mapping
        for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
            const stringNumber = stringIndex + 1;
            const stringName = this.getStringName(stringIndex);
            
            table += `String ${stringNumber} (${stringName}):\n`;
            table += '-'.repeat(30) + '\n';
            
            for (let fret = 0; fret <= maxFrets; fret++) {
                const pitch = this.chordDatabase.fretToPitch(stringIndex, fret);
                let line = `  String-${stringNumber}-Fret-${fret}: ${pitch.toString()}`;
                
                if (includeMIDI) {
                    line += ` (MIDI: ${pitch.semitoneValue})`;
                }
                
                if (includeEnharmonics) {
                    const enharmonics = pitch.getEnharmonicEquivalents();
                    if (enharmonics.length > 0) {
                        line += ` [${enharmonics.join(', ')}]`;
                    }
                }
                
                table += line + '\n';
            }
            
            table += '\n';
        }
        
        // Add reference notes section
        table += 'REFERENCE NOTES:\n';
        table += '-'.repeat(20) + '\n';
        table += `  A440 (Concert A): String-1-Fret-05 = A4\n`;
        table += `  Middle C:         String-2-Fret-01 = C4\n`;
        table += `  Low E (Open):     String-6-Fret-00 = E2\n`;
        table += `  High E (Open):    String-1-Fret-00 = E4\n\n`;
        
        return table;
    }

    // Generate mapping file and save to disk
    async generateMappingFile(outputPath, options = {}) {
        const fs = require('fs');
        const {
            maxFrets = 15,
            includeEnharmonics = false,
            includeMIDI = false
        } = options;
        
        let tableContent = this.generateMappingTable({
            maxFrets,
            includeEnharmonics,
            includeMIDI
        });
        
        // For file output, use all-caps header
        tableContent = tableContent.replace(
            'Guitar Fretboard Position to SPN Mapping',
            'GUITAR FRETBOARD POSITION TO SPN MAPPING'
        );
        
        // Write file synchronously for testing purposes
        fs.writeFileSync(outputPath, tableContent, 'utf8');
    }

    // Helper method to get string name
    getStringName(stringIndex) {
        const names = ['High E', 'B', 'G', 'D', 'A', 'Low E'];
        return names[stringIndex];
    }
}

// Export for CommonJS (Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pitch, Chord, ChordDatabase, MusicTheory, GuitarPositionMapper };
}

// Export for ES6 modules (browser)
if (typeof window !== 'undefined') {
    window.MusicTheory = { Pitch, Chord, ChordDatabase, MusicTheory, GuitarPositionMapper };
}