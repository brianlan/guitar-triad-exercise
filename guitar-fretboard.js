// Guitar-Specific Fretboard Module
// Contains all guitar-specific logic separate from general music theory

const { Pitch, Chord, ChordTheory } = require('./music-theory-core.js');

class GuitarFretboard {
    constructor() {
        this.tuning = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2']; // Standard tuning (high to low E)
        this.stringNames = ['High E', 'B', 'G', 'D', 'A', 'Low E'];
        this.maxFrets = 25; // Reasonable maximum
    }

    getTuning() {
        return [...this.tuning]; // Return copy to prevent mutation
    }

    fretToPitch(stringIndex, fret) {
        // Validate inputs
        if (stringIndex < 0 || stringIndex >= 6) {
            throw new Error(`Invalid string index: ${stringIndex}. Must be 0-5.`);
        }
        if (fret < 0 || fret > this.maxFrets) {
            throw new Error(`Invalid fret number: ${fret}. Must be 0-${this.maxFrets}.`);
        }
        
        const openString = new Pitch(this.tuning[stringIndex]);
        return openString.addSemitones(fret);
    }

    getStringName(stringIndex) {
        if (stringIndex < 0 || stringIndex >= 6) {
            throw new Error(`Invalid string index: ${stringIndex}. Must be 0-5.`);
        }
        return this.stringNames[stringIndex];
    }

    findPositionsForNote(noteName, maxFrets = 24) {
        const positions = [];
        const targetPitch = new Pitch(noteName);
        
        for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
            for (let fret = 0; fret <= Math.min(maxFrets, this.maxFrets); fret++) {
                const pitch = this.fretToPitch(stringIndex, fret);
                
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
}

class GuitarChordDatabase {
    constructor(fretboard = null) {
        this.fretboard = fretboard || new GuitarFretboard();
        this.chordTheory = new ChordTheory();
        this.initializeCommonPatterns();
    }

    initializeCommonPatterns() {
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
        };
    }

    getCommonChordPatterns() {
        return { ...this.commonChordPatterns }; // Return copy
    }

    identifyChordFromPositions(fretPositions) {
        // Extract pitches from fret positions
        const pitches = fretPositions.map(pos => 
            this.fretboard.fretToPitch(pos.string, pos.fret)
        );

        // Get unique note names (remove octave info)
        const uniquePitches = [];
        const seenNotes = new Set();
        
        for (const pitch of pitches) {
            if (!seenNotes.has(pitch.note)) {
                uniquePitches.push(pitch);
                seenNotes.add(pitch.note);
            }
        }
        
        const noteNames = uniquePitches.map(p => p.note);
        
        // Use the chord theory to identify possible chords
        const possibleChords = this.chordTheory.identifyChordFromNotes(noteNames);
        
        // If we have position information, try to determine inversion more accurately
        if (possibleChords.length > 0 && pitches.length > 0) {
            const bassNote = pitches.sort((a, b) => a.semitoneValue - b.semitoneValue)[0].note;
            
            // Filter chords based on bass note for better inversion detection
            return possibleChords.filter(chord => {
                const chordPitches = chord.getPitches();
                const chordBassNote = chordPitches[0].note;
                return this.chordTheory.notesMatch(bassNote, chordBassNote);
            });
        }
        
        return possibleChords;
    }

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

                const openStringPitch = new Pitch(this.fretboard.getTuning()[string]);
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
}

class GuitarPositionMapper {
    constructor(fretboard = null, chordDatabase = null) {
        this.fretboard = fretboard || new GuitarFretboard();
        this.chordDatabase = chordDatabase || new GuitarChordDatabase(this.fretboard);
    }

    generateCompleteMapping(maxFrets = 24) {
        const strings = [];
        
        for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
            const stringData = {
                stringNumber: stringIndex + 1,
                openNote: this.fretboard.getTuning()[stringIndex],
                positions: []
            };
            
            for (let fret = 0; fret <= maxFrets; fret++) {
                const pitch = this.fretboard.fretToPitch(stringIndex, fret);
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
                tuning: this.fretboard.getTuning(),
                maxFrets: maxFrets,
                generatedAt: new Date().toISOString()
            },
            strings: strings
        };
    }

    findPositionsForNote(noteName, maxFrets = 24) {
        return this.fretboard.findPositionsForNote(noteName, maxFrets);
    }

    generateMappingTable(options = {}) {
        const {
            format = 'text',
            maxFrets = 12,
            includeEnharmonics = false,
            includeMIDI = false
        } = options;
        
        let table = '';
        
        // Header
        table += 'Guitar Fretboard Position to SPN Mapping\\n';
        table += '=' .repeat(50) + '\\n';
        table += `Generated: ${new Date().toLocaleString()}\\n`;
        table += `Tuning: ${this.fretboard.getTuning().join(' - ')}\\n`;
        table += `Fret Range: 0-${maxFrets}\\n\\n`;
        
        // String-by-string mapping
        for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
            const stringNumber = stringIndex + 1;
            const stringName = this.fretboard.getStringName(stringIndex);
            
            table += `String ${stringNumber} (${stringName}):\\n`;
            table += '-'.repeat(30) + '\\n';
            
            for (let fret = 0; fret <= maxFrets; fret++) {
                const pitch = this.fretboard.fretToPitch(stringIndex, fret);
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
                
                table += line + '\\n';
            }
            
            table += '\\n';
        }
        
        // Add reference notes section
        table += 'REFERENCE NOTES:\\n';
        table += '-'.repeat(20) + '\\n';
        table += `  A440 (Concert A): String-1-Fret-05 = A4\\n`;
        table += `  Middle C:         String-2-Fret-01 = C4\\n`;
        table += `  Low E (Open):     String-6-Fret-00 = E2\\n`;
        table += `  High E (Open):    String-1-Fret-00 = E4\\n\\n`;
        
        return table;
    }

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
}

// Export for CommonJS (Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GuitarFretboard, GuitarChordDatabase, GuitarPositionMapper };
}

// Export for ES6 modules (browser)
if (typeof window !== 'undefined') {
    window.GuitarFretboard = { GuitarFretboard, GuitarChordDatabase, GuitarPositionMapper };
}