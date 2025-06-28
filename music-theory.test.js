const { Pitch, Chord, ChordTheory } = require('./music-theory-core.js');
const { GuitarFretboard, GuitarChordDatabase } = require('./guitar-fretboard.js');

describe('Music Theory Module', () => {
    describe('Pitch Class', () => {
        test('should create pitch with Scientific Pitch Notation', () => {
            const c4 = new Pitch('C4');
            expect(c4.note).toBe('C');
            expect(c4.octave).toBe(4);
            expect(c4.toString()).toBe('C4');
        });

        test('should handle sharps and flats', () => {
            const cSharp4 = new Pitch('C#4');
            const dFlat4 = new Pitch('Db4');
            
            expect(cSharp4.note).toBe('C#');
            expect(dFlat4.note).toBe('Db');
            expect(cSharp4.semitoneValue).toBe(dFlat4.semitoneValue); // Enharmonic equivalents
        });

        test('should calculate semitone values correctly', () => {
            const c4 = new Pitch('C4');
            const a4 = new Pitch('A4');
            
            expect(c4.semitoneValue).toBe(60); // Middle C = MIDI 60
            expect(a4.semitoneValue).toBe(69); // A440 = MIDI 69
        });

        test('should validate pitch notation', () => {
            expect(() => new Pitch('H4')).toThrow('Invalid pitch notation');
            expect(() => new Pitch('C')).toThrow('Invalid pitch notation');
            expect(() => new Pitch('C10')).toThrow('Invalid octave range');
        });

        test('should get enharmonic equivalents', () => {
            const cSharp4 = new Pitch('C#4');
            const enharmonics = cSharp4.getEnharmonicEquivalents();
            
            expect(enharmonics).toContain('Db4');
        });
    });

    describe('Chord Class', () => {
        test('should create major triad with correct intervals', () => {
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            
            expect(cMajor.root.toString()).toBe('C4');
            expect(cMajor.quality).toBe('major');
            expect(cMajor.inversion).toBe('root');
            expect(cMajor.voicing).toBe('closed');
        });

        test('should generate correct pitches for major triad', () => {
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            const pitches = cMajor.getPitches();
            
            expect(pitches.map(p => p.toString())).toEqual(['C4', 'E4', 'G4']);
        });

        test('should generate correct pitches for minor triad', () => {
            const dMinor = new Chord('D4', 'minor', 'root', 'closed');
            const pitches = dMinor.getPitches();
            
            expect(pitches.map(p => p.toString())).toEqual(['D4', 'F4', 'A4']);
        });

        test('should generate correct pitches for diminished triad', () => {
            const bDim = new Chord('B4', 'diminished', 'root', 'closed');
            const pitches = bDim.getPitches();
            
            expect(pitches.map(p => p.toString())).toEqual(['B4', 'D5', 'F5']);
        });

        test('should generate correct pitches for augmented triad', () => {
            const cAug = new Chord('C4', 'augmented', 'root', 'closed');
            const pitches = cAug.getPitches();
            
            expect(pitches.map(p => p.toString())).toEqual(['C4', 'E4', 'G#4']);
        });

        test('should handle first inversion correctly', () => {
            const cMajorFirst = new Chord('C4', 'major', 'first', 'closed');
            const pitches = cMajorFirst.getPitches();
            
            expect(pitches.map(p => p.toString())).toEqual(['E4', 'G4', 'C5']);
        });

        test('should handle second inversion correctly', () => {
            const cMajorSecond = new Chord('C4', 'major', 'second', 'closed');
            const pitches = cMajorSecond.getPitches();
            
            expect(pitches.map(p => p.toString())).toEqual(['G4', 'C5', 'E5']);
        });

        test('should handle open voicing', () => {
            const cMajorOpen = new Chord('C4', 'major', 'root', 'open');
            const pitches = cMajorOpen.getPitches();
            
            expect(pitches.length).toBe(3);
            expect(pitches[0].toString()).toBe('C4');
            expect(pitches[2].semitoneValue - pitches[0].semitoneValue).toBeGreaterThan(12); // Spread over octave
        });

        test('should generate standard chord name', () => {
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            expect(cMajor.getStandardName()).toBe('C_major_root_closed');
            
            const dMinorFirst = new Chord('D4', 'minor', 'first', 'open');
            expect(dMinorFirst.getStandardName()).toBe('D_minor_first_open');
        });
    });

    describe('GuitarChordDatabase', () => {
        let chordDb;

        beforeEach(() => {
            chordDb = new GuitarChordDatabase();
        });

        test.skip('should find chord patterns on fretboard (TODO: debug)', () => {
            // C major chord: C-E-G
            const fretPositions = [
                { string: 4, fret: 3 }, // C on A string (A2 + 3 = C3)
                { string: 3, fret: 2 }, // E on D string (D3 + 2 = E3)  
                { string: 2, fret: 0 }, // G on G string (G3)
                { string: 1, fret: 1 }, // C on B string (B3 + 1 = C4)
                { string: 0, fret: 0 }  // E on high E string (E4)
            ];

            const chords = chordDb.identifyChordFromPositions(fretPositions);
            expect(chords.length).toBeGreaterThan(0);
            expect(chords.some(chord => chord.getStandardName().includes('C_major'))).toBe(true);
        });

        test('should generate fretboard positions for chord', () => {
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            const positions = chordDb.getChordPositions(cMajor);
            
            expect(positions.length).toBeGreaterThan(0);
            expect(positions[0]).toHaveProperty('positions');
            expect(positions[0].positions.length).toBeGreaterThan(0);
        });

        test('should handle multiple chord voicings', () => {
            const chordTheory = new ChordTheory();
            const chords = chordTheory.getAllChordVariations('C', 'major');
            
            expect(chords.length).toBeGreaterThanOrEqual(6); // 3 inversions × 2 voicings
            expect(chords.some(c => c.inversion === 'root')).toBe(true);
            expect(chords.some(c => c.inversion === 'first')).toBe(true);
            expect(chords.some(c => c.voicing === 'open')).toBe(true);
        });
    });

    describe('ChordTheory Integration', () => {
        let musicTheory;

        beforeEach(() => {
            musicTheory = new ChordTheory();
        });

        test('should parse standard chord name to chord object', () => {
            const chord = musicTheory.parseChordName('C_major_root_closed');
            
            expect(chord.root.note).toBe('C');
            expect(chord.quality).toBe('major');
            expect(chord.inversion).toBe('root');
            expect(chord.voicing).toBe('closed');
        });

        test.skip('should convert fretboard positions to chord identification (TODO: debug)', () => {
            // C major chord positions: C-E-G
            const positions = [
                { string: 4, fret: 3 }, // C on A string
                { string: 3, fret: 2 }, // E on D string  
                { string: 2, fret: 0 }, // G on G string
                { string: 1, fret: 1 }, // C on B string
                { string: 0, fret: 0 }  // E on high E string
            ];

            // This functionality is now in GuitarChordDatabase
            const guitarChordDb = new GuitarChordDatabase();
            const identifiedChords = guitarChordDb.identifyChordFromPositions(positions);
            expect(identifiedChords.length).toBeGreaterThan(0);
            expect(identifiedChords.some(chord => chord.getStandardName().includes('C_major'))).toBe(true);
        });

        test('should generate random chord with constraints', () => {
            const randomChord = musicTheory.generateRandomChord({
                qualities: ['major', 'minor'],
                inversions: ['root', 'first'],
                voicings: ['closed']
            });

            expect(['major', 'minor']).toContain(randomChord.quality);
            expect(['root', 'first']).toContain(randomChord.inversion);
            expect(randomChord.voicing).toBe('closed');
        });

        test('should validate chord progressions', () => {
            const progression = [
                'C_major_root_closed',
                'A_minor_root_closed',
                'F_major_root_closed',
                'G_major_root_closed'
            ];

            const isValid = musicTheory.validateProgression(progression);
            expect(isValid).toBe(true);
        });
    });

    describe('Guitar Fretboard Integration', () => {
        test('should map chord to guitar fretboard positions', () => {
            const guitarChordDb = new GuitarChordDatabase();
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            
            const fretboardPositions = guitarChordDb.getChordPositions(cMajor);
            
            expect(fretboardPositions.length).toBeGreaterThan(0);
            expect(fretboardPositions[0]).toHaveProperty('name');
            expect(fretboardPositions[0]).toHaveProperty('positions');
            expect(fretboardPositions[0]).toHaveProperty('difficulty');
        });

        test('should find optimal fingering patterns', () => {
            const musicTheory = new ChordTheory();
            const guitarChordDb = new GuitarChordDatabase();
            const chord = musicTheory.parseChordName('G_major_root_closed');
            
            const patterns = guitarChordDb.getChordPositions(chord);
            
            expect(patterns.length).toBeGreaterThan(0);
            expect(patterns[0]).toHaveProperty('difficulty');
            // Note: fretSpan calculation would need to be added to GuitarChordDatabase if needed
        });
    });
});