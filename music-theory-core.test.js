// Tests for core music theory (instrument-agnostic)
const { Pitch, Chord, ChordTheory } = require('./music-theory-core.js');

describe('Core Music Theory (Instrument-Agnostic)', () => {
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
            expect(cSharp4.semitoneValue).toBe(dFlat4.semitoneValue);
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

        test('should add semitones correctly', () => {
            const c4 = new Pitch('C4');
            const e4 = c4.addSemitones(4);
            
            expect(e4.toString()).toBe('E4');
            expect(e4.semitoneValue).toBe(64);
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

        test('should handle first inversion correctly', () => {
            const cMajorFirst = new Chord('C4', 'major', 'first', 'closed');
            const pitches = cMajorFirst.getPitches();
            
            expect(pitches.map(p => p.toString())).toEqual(['E4', 'G4', 'C5']);
        });

        test('should generate standard chord name', () => {
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            expect(cMajor.getStandardName()).toBe('C_major_root_closed');
        });

        test('should get chord tones without octave consideration', () => {
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            const chordTones = cMajor.getChordTones();
            
            expect(chordTones).toEqual(['C', 'E', 'G']);
        });
    });

    describe('ChordTheory Class', () => {
        let chordTheory;

        beforeEach(() => {
            chordTheory = new ChordTheory();
        });

        test('should parse standard chord name to chord object', () => {
            const chord = chordTheory.parseChordName('C_major_root_closed');
            
            expect(chord.root.note).toBe('C');
            expect(chord.quality).toBe('major');
            expect(chord.inversion).toBe('root');
            expect(chord.voicing).toBe('closed');
        });

        test('should generate random chord with constraints', () => {
            const randomChord = chordTheory.generateRandomChord({
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

            const isValid = chordTheory.validateProgression(progression);
            expect(isValid).toBe(true);
        });

        test('should get all chord variations for a root and quality', () => {
            const variations = chordTheory.getAllChordVariations('C', 'major');
            
            expect(variations.length).toBeGreaterThanOrEqual(6); // 3 inversions × 2 voicings
            expect(variations.some(c => c.inversion === 'root')).toBe(true);
            expect(variations.some(c => c.inversion === 'first')).toBe(true);
            expect(variations.some(c => c.voicing === 'open')).toBe(true);
        });

        test('should identify chord from note collection', () => {
            const notes = ['C', 'E', 'G'];
            const possibleChords = chordTheory.identifyChordFromNotes(notes);
            
            expect(possibleChords.length).toBeGreaterThan(0);
            expect(possibleChords.some(chord => 
                chord.getStandardName().includes('C_major')
            )).toBe(true);
        });
    });
});