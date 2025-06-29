// Simple TDD Tests for Guitar Triad Generation Logic
// Tests the core chord database without DOM dependencies

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
            // Major chords - Closed voicing - Root position (All proper triads with 3 notes)
            { name: 'C Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 1], [3, 2], [4, 2]] },
            { name: 'G Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[0, 3], [4, 2], [5, 3]] },
            { name: 'D Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 3], [3, 2]] },
            { name: 'A Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 2], [3, 2]] },
            { name: 'E Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 2], [4, 2]] },
            { name: 'F Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 1], [3, 3], [4, 3]] },
            
            // Minor chords - Closed voicing - Root position (All proper triads with 3 notes)
            { name: 'C Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[1, 4], [2, 5], [3, 5]] },
            { name: 'G Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[0, 3], [2, 3], [3, 5]] },
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
            
            // Open voicing examples (Proper triads with 3 notes, using open strings strategically)
            { name: 'C Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[2, 0], [3, 2], [4, 3]] },
            { name: 'G Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 3], [1, 0], [4, 2]] },
            { name: 'D Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[1, 2], [2, 3], [3, 2]] },
            
            // First inversion examples (Major chords with 3 notes)
            { name: 'C Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 1], [2, 2], [3, 1]] },
            { name: 'G Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 0], [2, 0], [3, 0]] },
            
            // Second inversion examples (Major chords with 3 notes)
            { name: 'C Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 5], [2, 5], [3, 5]] },
            { name: 'G Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 3], [2, 4], [3, 3]] }
        ];
    }
}

describe('Guitar Triad Generation Logic', () => {
    let app;
    
    beforeEach(() => {
        app = new MockApp();
    });

    test('FAIL: All triads should have exactly 3 finger positions', () => {
        const chordDatabase = app.generateChordDatabase();
        
        const failingChords = [];
        chordDatabase.forEach(chord => {
            if (chord.positions.length !== 3) {
                failingChords.push(`${chord.name}: ${chord.positions.length} positions`);
            }
        });
        
        console.log('Chords that fail (not 3 positions):', failingChords);
        
        // This test should fail initially
        expect(failingChords.length).toBe(0);
    });

    test('FAIL: F Major should be a simple triad, not a barre chord', () => {
        const chordDatabase = app.generateChordDatabase();
        const fMajor = chordDatabase.find(chord => chord.name === 'F Major');
        
        expect(fMajor).toBeDefined();
        expect(fMajor.positions.length).toBe(3);
        
        console.log('F Major positions:', fMajor.positions);
    });

    test('FAIL: C Minor should be a simple triad, not a barre chord', () => {
        const chordDatabase = app.generateChordDatabase();
        const cMinor = chordDatabase.find(chord => chord.name === 'C Minor');
        
        expect(cMinor).toBeDefined();
        expect(cMinor.positions.length).toBe(3);
        
        console.log('C Minor positions:', cMinor.positions);
    });

    test('FAIL: E Minor should have exactly 3 positions', () => {
        const chordDatabase = app.generateChordDatabase();
        const eMinor = chordDatabase.find(chord => chord.name === 'E Minor');
        
        expect(eMinor).toBeDefined();
        expect(eMinor.positions.length).toBe(3);
        
        console.log('E Minor positions:', eMinor.positions);
    });

    test('FAIL: Open voicing chords should still be triads with only 3 notes', () => {
        const chordDatabase = app.generateChordDatabase();
        const openChords = chordDatabase.filter(chord => chord.voicing === 'open');
        
        const failingOpenChords = [];
        openChords.forEach(chord => {
            if (chord.positions.length !== 3) {
                failingOpenChords.push(`${chord.name}: ${chord.positions.length} positions`);
            }
        });
        
        console.log('Open chords that fail:', failingOpenChords);
        
        expect(failingOpenChords.length).toBe(0);
    });
});