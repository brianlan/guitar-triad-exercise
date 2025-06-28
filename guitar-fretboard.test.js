// Tests for guitar-specific fretboard functionality
const { GuitarFretboard, GuitarChordDatabase, GuitarPositionMapper } = require('./guitar-fretboard.js');

describe('Guitar Fretboard Functionality', () => {
    describe('GuitarFretboard Class', () => {
        let fretboard;

        beforeEach(() => {
            fretboard = new GuitarFretboard();
        });

        test('should have standard guitar tuning', () => {
            const tuning = fretboard.getTuning();
            expect(tuning).toEqual(['E4', 'B3', 'G3', 'D3', 'A2', 'E2']);
        });

        test('should convert fret position to pitch', () => {
            const pitch = fretboard.fretToPitch(5, 0); // Low E open
            expect(pitch.toString()).toBe('E2');
        });

        test('should convert fret position to pitch with frets', () => {
            const pitch = fretboard.fretToPitch(4, 2); // A string, 2nd fret
            expect(pitch.toString()).toBe('B2');
        });

        test('should validate string indices', () => {
            expect(() => fretboard.fretToPitch(-1, 0)).toThrow('Invalid string index');
            expect(() => fretboard.fretToPitch(6, 0)).toThrow('Invalid string index');
        });

        test('should validate fret numbers', () => {
            expect(() => fretboard.fretToPitch(0, -1)).toThrow('Invalid fret number');
            expect(() => fretboard.fretToPitch(0, 30)).toThrow('Invalid fret number');
        });

        test('should get string name', () => {
            expect(fretboard.getStringName(0)).toBe('High E');
            expect(fretboard.getStringName(5)).toBe('Low E');
        });

        test('should find all positions for a note', () => {
            const positions = fretboard.findPositionsForNote('A4', 12);
            
            expect(positions.length).toBeGreaterThan(0);
            expect(positions.some(pos => pos.string === 0 && pos.fret === 5)).toBe(true); // High E, 5th fret
        });
    });

    describe('GuitarChordDatabase Class', () => {
        let chordDb;

        beforeEach(() => {
            chordDb = new GuitarChordDatabase();
        });

        test('should identify chord from fretboard positions', () => {
            // G major chord: String-6-Fret-3, String-5-Fret-2, String-4-Fret-0
            const fretPositions = [
                { string: 5, fret: 3 }, // G2
                { string: 4, fret: 2 }, // B2
                { string: 3, fret: 0 }  // D3
            ];

            const chords = chordDb.identifyChordFromPositions(fretPositions);
            expect(chords.length).toBeGreaterThan(0);
            expect(chords.some(chord => chord.getStandardName().includes('G_major'))).toBe(true);
        });

        test('should get chord positions for a chord', () => {
            const { Chord } = require('./music-theory-core.js');
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            const positions = chordDb.getChordPositions(cMajor);
            
            expect(positions.length).toBeGreaterThan(0);
            expect(positions[0]).toHaveProperty('positions');
            expect(positions[0]).toHaveProperty('difficulty');
        });

        test('should have common chord patterns', () => {
            const patterns = chordDb.getCommonChordPatterns();
            
            expect(patterns).toHaveProperty('C_major_root_closed');
            expect(patterns).toHaveProperty('G_major_root_closed');
            expect(patterns['C_major_root_closed'].length).toBeGreaterThan(0);
        });

        test('should calculate chord difficulty', () => {
            const pattern = [
                { string: 5, fret: 3 },
                { string: 4, fret: 2 },
                { string: 3, fret: 0 }
            ];
            
            const difficulty = chordDb.calculateDifficulty(pattern);
            expect(['beginner', 'intermediate', 'advanced']).toContain(difficulty);
        });
    });

    describe('GuitarPositionMapper Class', () => {
        let mapper;

        beforeEach(() => {
            mapper = new GuitarPositionMapper();
        });

        test('should generate complete fretboard mapping', () => {
            const mapping = mapper.generateCompleteMapping(12);
            
            expect(mapping).toHaveProperty('metadata');
            expect(mapping).toHaveProperty('strings');
            expect(mapping.strings).toHaveLength(6);
            
            mapping.strings.forEach((string) => {
                expect(string).toHaveProperty('stringNumber');
                expect(string).toHaveProperty('openNote');
                expect(string).toHaveProperty('positions');
                expect(string.positions.length).toBe(13); // 0-12 frets
            });
        });

        test('should find positions for note with enharmonic equivalents', () => {
            const cSharpPositions = mapper.findPositionsForNote('C#4');
            const dFlatPositions = mapper.findPositionsForNote('Db4');
            
            expect(cSharpPositions.length).toBe(dFlatPositions.length);
            expect(cSharpPositions.length).toBeGreaterThan(0);
        });

        test('should generate mapping table in correct format', () => {
            const tableData = mapper.generateMappingTable({
                maxFrets: 5,
                includeEnharmonics: true
            });
            
            expect(tableData).toContain('Guitar Fretboard Position to SPN Mapping');
            expect(tableData).toContain('String 1 (High E)');
            expect(tableData).toContain('String 6 (Low E)');
            expect(tableData).toContain('String-5-Fret-2: B2');
        });

        test('should generate mapping file', async () => {
            const fs = require('fs');
            const path = require('path');
            const outputPath = path.join(__dirname, 'test-guitar-mapping.txt');
            
            await mapper.generateMappingFile(outputPath, {
                maxFrets: 5,
                includeEnharmonics: false,
                includeMIDI: false
            });
            
            expect(fs.existsSync(outputPath)).toBe(true);
            
            const content = fs.readFileSync(outputPath, 'utf8');
            expect(content).toContain('GUITAR FRETBOARD POSITION TO SPN MAPPING');
            expect(content).toContain('String-5-Fret-2: B2');
            
            // Clean up
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        });

        test('should integrate with chord theory', () => {
            const { Chord } = require('./music-theory-core.js');
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            const chordPitches = cMajor.getPitches();
            
            chordPitches.forEach(pitch => {
                const positions = mapper.findPositionsForNote(pitch.toString());
                expect(positions.length).toBeGreaterThan(0);
            });
        });
    });
});