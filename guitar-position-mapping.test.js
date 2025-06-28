const { Pitch, Chord } = require('./music-theory-core.js');
const { GuitarFretboard, GuitarChordDatabase, GuitarPositionMapper } = require('./guitar-fretboard.js');
const fs = require('fs');
const path = require('path');

describe('Guitar Position to SPN Mapping', () => {
    let fretboard;
    let chordDb;
    let mapper;

    beforeEach(() => {
        fretboard = new GuitarFretboard();
        chordDb = new GuitarChordDatabase(fretboard);
        mapper = new GuitarPositionMapper(fretboard, chordDb);
    });

    describe('Basic Position to Pitch Mapping', () => {
        test('should map String 6 (Low E) positions correctly', () => {
            // String 6 = Low E = E2 in standard tuning
            expect(fretboard.fretToPitch(5, 0).toString()).toBe('E2'); // Open
            expect(fretboard.fretToPitch(5, 1).toString()).toBe('F2'); // 1st fret
            expect(fretboard.fretToPitch(5, 2).toString()).toBe('F#2'); // 2nd fret
            expect(fretboard.fretToPitch(5, 3).toString()).toBe('G2'); // 3rd fret
            expect(fretboard.fretToPitch(5, 5).toString()).toBe('A2'); // 5th fret
            expect(fretboard.fretToPitch(5, 7).toString()).toBe('B2'); // 7th fret
            expect(fretboard.fretToPitch(5, 12).toString()).toBe('E3'); // 12th fret (octave)
        });

        test('should map String 5 (A) positions correctly', () => {
            // String 5 = A = A2 in standard tuning
            expect(fretboard.fretToPitch(4, 0).toString()).toBe('A2'); // Open
            expect(fretboard.fretToPitch(4, 1).toString()).toBe('A#2'); // 1st fret
            expect(fretboard.fretToPitch(4, 2).toString()).toBe('B2'); // 2nd fret - YOUR EXAMPLE
            expect(fretboard.fretToPitch(4, 3).toString()).toBe('C3'); // 3rd fret
            expect(fretboard.fretToPitch(4, 5).toString()).toBe('D3'); // 5th fret
            expect(fretboard.fretToPitch(4, 7).toString()).toBe('E3'); // 7th fret
            expect(fretboard.fretToPitch(4, 12).toString()).toBe('A3'); // 12th fret (octave)
        });

        test('should map String 4 (D) positions correctly', () => {
            // String 4 = D = D3 in standard tuning
            expect(fretboard.fretToPitch(3, 0).toString()).toBe('D3'); // Open
            expect(fretboard.fretToPitch(3, 1).toString()).toBe('D#3'); // 1st fret
            expect(fretboard.fretToPitch(3, 2).toString()).toBe('E3'); // 2nd fret
            expect(fretboard.fretToPitch(3, 3).toString()).toBe('F3'); // 3rd fret
            expect(fretboard.fretToPitch(3, 5).toString()).toBe('G3'); // 5th fret
            expect(fretboard.fretToPitch(3, 7).toString()).toBe('A3'); // 7th fret
            expect(fretboard.fretToPitch(3, 12).toString()).toBe('D4'); // 12th fret (octave)
        });

        test('should map String 3 (G) positions correctly', () => {
            // String 3 = G = G3 in standard tuning
            expect(fretboard.fretToPitch(2, 0).toString()).toBe('G3'); // Open
            expect(fretboard.fretToPitch(2, 1).toString()).toBe('G#3'); // 1st fret
            expect(fretboard.fretToPitch(2, 2).toString()).toBe('A3'); // 2nd fret
            expect(fretboard.fretToPitch(2, 3).toString()).toBe('A#3'); // 3rd fret
            expect(fretboard.fretToPitch(2, 5).toString()).toBe('C4'); // 5th fret
            expect(fretboard.fretToPitch(2, 7).toString()).toBe('D4'); // 7th fret
            expect(fretboard.fretToPitch(2, 12).toString()).toBe('G4'); // 12th fret (octave)
        });

        test('should map String 2 (B) positions correctly', () => {
            // String 2 = B = B3 in standard tuning
            expect(fretboard.fretToPitch(1, 0).toString()).toBe('B3'); // Open
            expect(fretboard.fretToPitch(1, 1).toString()).toBe('C4'); // 1st fret
            expect(fretboard.fretToPitch(1, 2).toString()).toBe('C#4'); // 2nd fret
            expect(fretboard.fretToPitch(1, 3).toString()).toBe('D4'); // 3rd fret
            expect(fretboard.fretToPitch(1, 5).toString()).toBe('E4'); // 5th fret
            expect(fretboard.fretToPitch(1, 7).toString()).toBe('F#4'); // 7th fret
            expect(fretboard.fretToPitch(1, 12).toString()).toBe('B4'); // 12th fret (octave)
        });

        test('should map String 1 (High E) positions correctly', () => {
            // String 1 = High E = E4 in standard tuning
            expect(fretboard.fretToPitch(0, 0).toString()).toBe('E4'); // Open
            expect(fretboard.fretToPitch(0, 1).toString()).toBe('F4'); // 1st fret
            expect(fretboard.fretToPitch(0, 2).toString()).toBe('F#4'); // 2nd fret
            expect(fretboard.fretToPitch(0, 3).toString()).toBe('G4'); // 3rd fret
            expect(fretboard.fretToPitch(0, 5).toString()).toBe('A4'); // 5th fret (A440)
            expect(fretboard.fretToPitch(0, 7).toString()).toBe('B4'); // 7th fret
            expect(fretboard.fretToPitch(0, 12).toString()).toBe('E5'); // 12th fret (octave)
        });
    });

    describe('Known Reference Points', () => {
        test('should correctly identify musical landmarks', () => {
            // A440 (concert pitch)
            expect(fretboard.fretToPitch(0, 5).toString()).toBe('A4');
            expect(fretboard.fretToPitch(0, 5).semitoneValue).toBe(69); // MIDI note 69
            
            // Middle C (C4)
            expect(fretboard.fretToPitch(1, 1).toString()).toBe('C4');
            expect(fretboard.fretToPitch(1, 1).semitoneValue).toBe(60); // MIDI note 60
            
            // Octave relationships
            expect(fretboard.fretToPitch(5, 0).toString()).toBe('E2'); // Low E
            expect(fretboard.fretToPitch(5, 12).toString()).toBe('E3'); // Low E + octave
            expect(fretboard.fretToPitch(0, 0).toString()).toBe('E4'); // High E
            expect(fretboard.fretToPitch(0, 12).toString()).toBe('E5'); // High E + octave
        });

        test('should validate semitone differences', () => {
            const lowE = fretboard.fretToPitch(5, 0); // E2
            const highE = fretboard.fretToPitch(0, 0); // E4
            
            // E2 to E4 should be exactly 2 octaves = 24 semitones
            expect(highE.semitoneValue - lowE.semitoneValue).toBe(24);
            
            // Adjacent frets should differ by 1 semitone
            const fret0 = fretboard.fretToPitch(0, 0);
            const fret1 = fretboard.fretToPitch(0, 1);
            expect(fret1.semitoneValue - fret0.semitoneValue).toBe(1);
        });
    });

    describe('GuitarPositionMapper Class', () => {
        test('should create complete fretboard mapping', () => {
            const mapping = mapper.generateCompleteMapping();
            
            expect(mapping).toHaveProperty('metadata');
            expect(mapping).toHaveProperty('strings');
            expect(mapping.strings).toHaveLength(6);
            
            // Each string should have positions 0-24 (common fret range)
            mapping.strings.forEach((string, index) => {
                expect(string).toHaveProperty('stringNumber');
                expect(string).toHaveProperty('openNote');
                expect(string).toHaveProperty('positions');
                expect(string.positions.length).toBeGreaterThanOrEqual(25); // 0-24 frets
            });
        });

        test('should provide reverse lookup functionality', () => {
            const positions = mapper.findPositionsForNote('A4');
            
            expect(positions.length).toBeGreaterThan(0);
            expect(positions.some(pos => pos.string === 0 && pos.fret === 5)).toBe(true); // High E, 5th fret
        });

        test('should handle enharmonic equivalents', () => {
            const cSharpPositions = mapper.findPositionsForNote('C#4');
            const dFlatPositions = mapper.findPositionsForNote('Db4');
            
            // Should find the same positions for enharmonic equivalents
            expect(cSharpPositions.length).toBe(dFlatPositions.length);
            expect(cSharpPositions).toEqual(dFlatPositions);
        });

        test('should generate mapping table in specified format', () => {
            const tableData = mapper.generateMappingTable({
                format: 'text',
                maxFrets: 12,
                includeEnharmonics: true
            });
            
            expect(tableData).toContain('Guitar Fretboard Position to SPN Mapping');
            expect(tableData).toContain('String 1 (High E)');
            expect(tableData).toContain('String 6 (Low E)');
            expect(tableData).toContain('E4'); // High E open
            expect(tableData).toContain('E2'); // Low E open
        });
    });

    describe('Edge Cases and Validation', () => {
        test('should handle high fret positions', () => {
            // Test up to 24th fret (common range for electric guitars)
            const fret24 = fretboard.fretToPitch(0, 24); // High E, 24th fret
            expect(fret24.toString()).toBe('E6'); // Two octaves up from E4
        });

        test('should reject invalid string indices', () => {
            expect(() => fretboard.fretToPitch(-1, 0)).toThrow();
            expect(() => fretboard.fretToPitch(6, 0)).toThrow();
        });

        test('should reject invalid fret numbers', () => {
            expect(() => fretboard.fretToPitch(0, -1)).toThrow();
            expect(() => fretboard.fretToPitch(0, 30)).toThrow(); // Beyond reasonable range
        });

        test('should maintain consistency across octaves', () => {
            // Test that notes maintain their letter names across octaves
            const e2 = fretboard.fretToPitch(5, 0); // E2
            const e3 = fretboard.fretToPitch(5, 12); // E3
            const e4 = fretboard.fretToPitch(0, 0); // E4
            const e5 = fretboard.fretToPitch(0, 12); // E5
            
            expect(e2.note).toBe('E');
            expect(e3.note).toBe('E');
            expect(e4.note).toBe('E');
            expect(e5.note).toBe('E');
            
            // Check octave progression
            expect(e2.octave).toBe(2);
            expect(e3.octave).toBe(3);
            expect(e4.octave).toBe(4);
            expect(e5.octave).toBe(5);
        });
    });

    describe('File Generation', () => {
        test('should generate static mapping table file', async () => {
            const outputPath = path.join(__dirname, 'guitar-fretboard-mapping.txt');
            
            await mapper.generateMappingFile(outputPath, {
                maxFrets: 15,
                includeEnharmonics: true,
                includeMIDI: true
            });
            
            expect(fs.existsSync(outputPath)).toBe(true);
            
            const content = fs.readFileSync(outputPath, 'utf8');
            expect(content).toContain('GUITAR FRETBOARD POSITION TO SPN MAPPING');
            expect(content).toContain('String-5-Fret-2'); // Your example
            expect(content).toContain('B2'); // Your example result
            
            // Clean up
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        });

        test('should include comprehensive position data in file', async () => {
            const outputPath = path.join(__dirname, 'test-mapping.txt');
            
            await mapper.generateMappingFile(outputPath);
            
            const content = fs.readFileSync(outputPath, 'utf8');
            
            // Check for all open strings
            expect(content).toContain('E2'); // Low E
            expect(content).toContain('A2'); // A string
            expect(content).toContain('D3'); // D string
            expect(content).toContain('G3'); // G string
            expect(content).toContain('B3'); // B string
            expect(content).toContain('E4'); // High E
            
            // Check for some specific positions
            expect(content).toContain('A4'); // A440 reference
            expect(content).toContain('C4'); // Middle C
            
            // Clean up
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        });
    });

    describe('Integration with Existing Music Theory', () => {
        test('should work seamlessly with Chord class', () => {
            // Create a chord and verify its notes can be found on fretboard
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            const chordPitches = cMajor.getPitches();
            
            chordPitches.forEach(pitch => {
                const positions = mapper.findPositionsForNote(pitch.toString());
                expect(positions.length).toBeGreaterThan(0);
            });
        });

        test('should validate chord positions from real fretboard', () => {
            // Test the example from user: String-6-Fret-3, String-5-Fret-2, String-4-Fret-0
            const position1 = fretboard.fretToPitch(5, 3); // G2
            const position2 = fretboard.fretToPitch(4, 2); // B2
            const position3 = fretboard.fretToPitch(3, 0); // D3
            
            const notes = [position1.note, position2.note, position3.note];
            expect(notes.sort()).toEqual(['D', 'G', 'B'].sort()); // G major chord tones
        });
    });
});