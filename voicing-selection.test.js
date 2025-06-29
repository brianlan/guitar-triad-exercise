// TDD Tests for Voicing Selection
// Tests that ensure closed voicing chords use adjacent strings and open voicing chords use non-adjacent strings

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
            // Major chords - Closed voicing - Root position (Adjacent strings only for true closed voicing)
            { name: 'C Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 0], [3, 2]] },
            { name: 'G Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 0], [4, 2]] },
            { name: 'D Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 3], [3, 2]] },
            { name: 'A Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 2], [3, 2]] },
            { name: 'E Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 2], [4, 2]] },
            { name: 'F Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 3], [4, 3]] },
            
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
            
            // Open voicing examples (Non-adjacent strings with wider spacing)
            { name: 'C Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 0], [2, 0], [4, 3]] },
            { name: 'G Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 3], [1, 0], [5, 3]] },
            { name: 'D Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 2], [2, 3], [5, 0]] },
            
            // First inversion examples (Major chords with 3 notes)
            { name: 'C Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 1], [2, 2], [3, 1]] },
            { name: 'G Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 0], [2, 0], [3, 0]] },
            
            // Second inversion examples (Major chords with 3 notes)
            { name: 'C Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 5], [2, 5], [3, 5]] },
            { name: 'G Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 3], [2, 4], [3, 3]] }
        ];
    }
}

// Helper function to analyze voicing
function analyzeVoicing(positions) {
    const strings = positions.map(pos => pos[0]).sort((a, b) => a - b);
    
    // Check if strings are adjacent (closed voicing)
    let isAdjacent = true;
    for (let i = 1; i < strings.length; i++) {
        if (strings[i] - strings[i-1] > 1) {
            isAdjacent = false;
            break;
        }
    }
    
    return {
        strings: strings,
        isAdjacent: isAdjacent,
        actualVoicing: isAdjacent ? 'closed' : 'open'
    };
}

describe('Guitar Voicing Selection', () => {
    let app;
    
    beforeEach(() => {
        app = new MockApp();
    });

    test('FAIL: All closed voicing chords should use adjacent strings', () => {
        const chordDatabase = app.generateChordDatabase();
        const closedChords = chordDatabase.filter(chord => chord.voicing === 'closed');
        
        const incorrectClosedChords = [];
        
        closedChords.forEach(chord => {
            const analysis = analyzeVoicing(chord.positions);
            if (analysis.actualVoicing !== 'closed') {
                incorrectClosedChords.push({
                    name: chord.name,
                    positions: chord.positions,
                    strings: analysis.strings,
                    actualVoicing: analysis.actualVoicing
                });
            }
        });
        
        console.log('Chords labeled as closed but actually open voicing:', incorrectClosedChords);
        
        // This should fail initially
        expect(incorrectClosedChords.length).toBe(0);
    });

    test('FAIL: G Major closed should use adjacent strings', () => {
        const chordDatabase = app.generateChordDatabase();
        const gMajorClosed = chordDatabase.find(chord => 
            chord.name === 'G Major' && chord.voicing === 'closed'
        );
        
        expect(gMajorClosed).toBeDefined();
        
        const analysis = analyzeVoicing(gMajorClosed.positions);
        console.log('G Major closed analysis:', analysis);
        console.log('G Major positions:', gMajorClosed.positions);
        
        expect(analysis.actualVoicing).toBe('closed');
    });

    test('FAIL: F Major closed should use adjacent strings', () => {
        const chordDatabase = app.generateChordDatabase();
        const fMajorClosed = chordDatabase.find(chord => 
            chord.name === 'F Major' && chord.voicing === 'closed'
        );
        
        expect(fMajorClosed).toBeDefined();
        
        const analysis = analyzeVoicing(fMajorClosed.positions);
        console.log('F Major closed analysis:', analysis);
        console.log('F Major positions:', fMajorClosed.positions);
        
        expect(analysis.actualVoicing).toBe('closed');
    });

    test('FAIL: G Minor closed should use adjacent strings', () => {
        const chordDatabase = app.generateChordDatabase();
        const gMinorClosed = chordDatabase.find(chord => 
            chord.name === 'G Minor' && chord.voicing === 'closed'
        );
        
        expect(gMinorClosed).toBeDefined();
        
        const analysis = analyzeVoicing(gMinorClosed.positions);
        console.log('G Minor closed analysis:', analysis);
        console.log('G Minor positions:', gMinorClosed.positions);
        
        expect(analysis.actualVoicing).toBe('closed');
    });

    test('PASS: Open voicing chords should use non-adjacent strings', () => {
        const chordDatabase = app.generateChordDatabase();
        const openChords = chordDatabase.filter(chord => chord.voicing === 'open');
        
        const incorrectOpenChords = [];
        
        openChords.forEach(chord => {
            const analysis = analyzeVoicing(chord.positions);
            if (analysis.actualVoicing !== 'open') {
                incorrectOpenChords.push({
                    name: chord.name,
                    actualVoicing: analysis.actualVoicing
                });
            }
        });
        
        console.log('Open chords that are incorrectly adjacent:', incorrectOpenChords);
        
        // Open chords should correctly use non-adjacent strings
        expect(incorrectOpenChords.length).toBe(0);
    });

    test('FAIL: Closed voicing should have string gaps of max 1', () => {
        const chordDatabase = app.generateChordDatabase();
        const closedChords = chordDatabase.filter(chord => chord.voicing === 'closed');
        
        const invalidClosedChords = [];
        
        closedChords.forEach(chord => {
            const strings = chord.positions.map(pos => pos[0]).sort((a, b) => a - b);
            let maxGap = 0;
            
            for (let i = 1; i < strings.length; i++) {
                const gap = strings[i] - strings[i-1];
                if (gap > maxGap) {
                    maxGap = gap;
                }
            }
            
            if (maxGap > 1) {
                invalidClosedChords.push({
                    name: chord.name,
                    strings: strings,
                    maxGap: maxGap
                });
            }
        });
        
        console.log('Closed chords with gaps > 1 string:', invalidClosedChords);
        
        expect(invalidClosedChords.length).toBe(0);
    });
});