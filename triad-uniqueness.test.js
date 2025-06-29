// TDD Tests for Triad Note Uniqueness
// Tests that ensure triads contain exactly 3 unique notes (root, third, fifth)

// Mock the classes to test just the logic
class MockFretboard {
    constructor() {
        this.fingerDots = [];
        this.fretboardHeight = 250;
        this.fretboardWidth = 1000;
    }
    
    clearAllDots() {
        this.fingerDots = [];
    }
    
    addFingerDot(stringIndex, fret, x, y) {
        this.fingerDots.push({
            string: stringIndex,
            fret: fret,
            note: this.getNote(stringIndex, fret)
        });
    }
    
    getNote(stringIndex, fret) {
        const openStringNotes = ['E', 'B', 'G', 'D', 'A', 'E'];
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        const openNote = openStringNotes[stringIndex];
        const openNoteIndex = notes.indexOf(openNote);
        const noteIndex = (openNoteIndex + fret) % 12;
        
        return notes[noteIndex];
    }
    
    getFretPosition(fret) {
        return fret * 80; // Mock positioning
    }
}

class MockApp {
    constructor() {
        this.fretboard = new MockFretboard();
    }
    
    generateChordDatabase() {
        return [
            // Major chords - Closed voicing - Root position (Root note in bass for true root position)
            { name: 'C Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 2], [4, 3]] },
            { name: 'G Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 0], [4, 2], [5, 3]] },
            { name: 'D Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 2], [3, 4], [4, 5]] },
            { name: 'A Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 2], [4, 4], [5, 5]] },
            { name: 'E Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 0], [2, 1], [3, 2]] },
            { name: 'F Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 3]] },
            
            // Additional String-3 root position variants
            { name: 'G Major (String-3)', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 3], [2, 4], [3, 5]] },
            
            // Minor chords - Closed voicing - Root position (Adjacent strings only for true closed voicing)
            { name: 'C Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[1, 4], [2, 5], [3, 5]] },
            { name: 'G Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 3], [3, 5], [4, 5]] },
            { name: 'D Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 3]] },
            { name: 'A Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 2]] },
            { name: 'E Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 2], [4, 2]] },
            
            // Diminished chords - Closed voicing - Root position (All proper triads with 3 notes)
            { name: 'C Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 1], [3, 2]] },
            { name: 'G Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 0], [3, 1]] },
            { name: 'D Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 1]] },
            
            // Augmented chords - Closed voicing - Root position (All proper triads with 3 notes)
            { name: 'C Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 1], [3, 2]] },
            { name: 'G Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[1, 3], [2, 0], [3, 1]] },
            { name: 'D Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[1, 3], [2, 3], [3, 2]] },
            
            // Open voicing examples (Non-adjacent strings with unique triad notes)
            { name: 'C Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 0], [2, 0], [4, 3]] },
            { name: 'G Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 3], [1, 3], [4, 2]] },
            { name: 'D Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 2], [2, 2], [4, 5]] },
            
            // First inversion examples (Major chords with 3 notes)
            { name: 'C Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 1], [2, 2], [3, 1]] },
            { name: 'G Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 0], [2, 0], [3, 0]] },
            
            // Second inversion examples (Major chords with 3 notes)
            { name: 'C Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 5], [2, 5], [3, 5]] },
            { name: 'G Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 3], [2, 4], [3, 3]] }
        ];
    }
}

// Helper function to analyze triad uniqueness
function analyzeTriadUniqueness(chordName, positions, fretboard) {
    // Calculate the notes being played
    const notes = positions.map(([stringIndex, fret]) => {
        return fretboard.getNote(stringIndex, fret);
    });
    
    // Get unique notes (ignoring octaves)
    const uniqueNotes = [...new Set(notes)];
    
    // For major chords, check if we have root, third, and fifth
    if (chordName.includes('Major') && !chordName.includes('(')) {
        const rootNote = chordName.split(' ')[0];
        
        // Expected triad notes for major chord
        const noteToNumber = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
        const numberToNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        const rootNumber = noteToNumber[rootNote];
        const thirdNumber = (rootNumber + 4) % 12; // Major third
        const fifthNumber = (rootNumber + 7) % 12; // Perfect fifth
        
        const expectedNotes = [
            rootNote,
            numberToNote[thirdNumber],
            numberToNote[fifthNumber]
        ];
        
        // Check which expected notes are present
        const missingNotes = expectedNotes.filter(note => !uniqueNotes.includes(note));
        const duplicateNotes = notes.filter((note, index) => notes.indexOf(note) !== index);
        
        return {
            notes: notes,
            uniqueNotes: uniqueNotes,
            expectedNotes: expectedNotes,
            missingNotes: missingNotes,
            duplicateNotes: [...new Set(duplicateNotes)],
            isValidTriad: uniqueNotes.length === 3 && missingNotes.length === 0,
            hasDuplicates: duplicateNotes.length > 0
        };
    }
    
    // For non-major chords, just check basic uniqueness
    const duplicateNotes = notes.filter((note, index) => notes.indexOf(note) !== index);
    
    return {
        notes: notes,
        uniqueNotes: uniqueNotes,
        duplicateNotes: [...new Set(duplicateNotes)],
        isValidTriad: uniqueNotes.length === 3,
        hasDuplicates: duplicateNotes.length > 0
    };
}

describe('Guitar Triad Note Uniqueness', () => {
    let app;
    let fretboard;
    
    beforeEach(() => {
        app = new MockApp();
        fretboard = app.fretboard;
    });

    test('FAIL: All triads should have exactly 3 unique notes', () => {
        const chordDatabase = app.generateChordDatabase();
        
        const invalidTriads = [];
        
        chordDatabase.forEach(chord => {
            const analysis = analyzeTriadUniqueness(chord.name, chord.positions, fretboard);
            if (!analysis.isValidTriad) {
                invalidTriads.push({
                    name: chord.name,
                    notes: analysis.notes,
                    uniqueNotes: analysis.uniqueNotes,
                    uniqueCount: analysis.uniqueNotes.length,
                    duplicates: analysis.duplicateNotes
                });
            }
        });
        
        console.log('Triads with invalid note counts:', invalidTriads);
        
        // This should fail initially
        expect(invalidTriads.length).toBe(0);
    });

    test('FAIL: E Major should have E, G#, B (not duplicate E)', () => {
        const chordDatabase = app.generateChordDatabase();
        const eMajor = chordDatabase.find(chord => 
            chord.name === 'E Major' && chord.inversion === 'root'
        );
        
        expect(eMajor).toBeDefined();
        
        const analysis = analyzeTriadUniqueness(eMajor.name, eMajor.positions, fretboard);
        console.log('E Major analysis:', analysis);
        
        expect(analysis.uniqueNotes).toEqual(expect.arrayContaining(['E', 'G#', 'B']));
        expect(analysis.uniqueNotes.length).toBe(3);
        expect(analysis.hasDuplicates).toBe(false);
    });

    test('FAIL: A Major should have A, C#, E (not duplicate A)', () => {
        const chordDatabase = app.generateChordDatabase();
        const aMajor = chordDatabase.find(chord => 
            chord.name === 'A Major' && chord.inversion === 'root'
        );
        
        expect(aMajor).toBeDefined();
        
        const analysis = analyzeTriadUniqueness(aMajor.name, aMajor.positions, fretboard);
        console.log('A Major analysis:', analysis);
        
        expect(analysis.uniqueNotes).toEqual(expect.arrayContaining(['A', 'C#', 'E']));
        expect(analysis.uniqueNotes.length).toBe(3);
        expect(analysis.hasDuplicates).toBe(false);
    });

    test('FAIL: G Major should have G, B, D (not duplicate G)', () => {
        const chordDatabase = app.generateChordDatabase();
        const gMajor = chordDatabase.find(chord => 
            chord.name === 'G Major' && chord.inversion === 'root'
        );
        
        expect(gMajor).toBeDefined();
        
        const analysis = analyzeTriadUniqueness(gMajor.name, gMajor.positions, fretboard);
        console.log('G Major analysis:', analysis);
        
        expect(analysis.uniqueNotes).toEqual(expect.arrayContaining(['G', 'B', 'D']));
        expect(analysis.uniqueNotes.length).toBe(3);
        expect(analysis.hasDuplicates).toBe(false);
    });

    test('FAIL: F Major should have F, A, C (not duplicate F)', () => {
        const chordDatabase = app.generateChordDatabase();
        const fMajor = chordDatabase.find(chord => 
            chord.name === 'F Major' && chord.inversion === 'root'
        );
        
        expect(fMajor).toBeDefined();
        
        const analysis = analyzeTriadUniqueness(fMajor.name, fMajor.positions, fretboard);
        console.log('F Major analysis:', analysis);
        
        expect(analysis.uniqueNotes).toEqual(expect.arrayContaining(['F', 'A', 'C']));
        expect(analysis.uniqueNotes.length).toBe(3);
        expect(analysis.hasDuplicates).toBe(false);
    });

    test('FAIL: No major triad should have duplicate notes', () => {
        const chordDatabase = app.generateChordDatabase();
        const majorChords = chordDatabase.filter(chord => 
            chord.name.includes('Major') && !chord.name.includes('(')
        );
        
        const chordsWithDuplicates = [];
        
        majorChords.forEach(chord => {
            const analysis = analyzeTriadUniqueness(chord.name, chord.positions, fretboard);
            if (analysis.hasDuplicates) {
                chordsWithDuplicates.push({
                    name: chord.name,
                    duplicates: analysis.duplicateNotes,
                    allNotes: analysis.notes
                });
            }
        });
        
        console.log('Major chords with duplicate notes:', chordsWithDuplicates);
        
        expect(chordsWithDuplicates.length).toBe(0);
    });

    test('FAIL: All major triads should contain root, third, and fifth', () => {
        const chordDatabase = app.generateChordDatabase();
        const majorChords = chordDatabase.filter(chord => 
            chord.name.includes('Major') && !chord.name.includes('(')
        );
        
        const incompleteTriads = [];
        
        majorChords.forEach(chord => {
            const analysis = analyzeTriadUniqueness(chord.name, chord.positions, fretboard);
            if (analysis.missingNotes && analysis.missingNotes.length > 0) {
                incompleteTriads.push({
                    name: chord.name,
                    missing: analysis.missingNotes,
                    present: analysis.uniqueNotes,
                    expected: analysis.expectedNotes
                });
            }
        });
        
        console.log('Major triads missing required notes:', incompleteTriads);
        
        expect(incompleteTriads.length).toBe(0);
    });
});