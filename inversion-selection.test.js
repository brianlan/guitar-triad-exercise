// TDD Tests for Inversion Selection
// Tests that ensure root position chords have root note in bass and inversions are correctly labeled

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
            // Major chords - Closed voicing - Root position (Root note in bass, adjacent strings)
            { name: 'C Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 0], [4, 3]] },
            { name: 'G Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 0], [5, 3]] },
            { name: 'D Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 3], [3, 2]] },
            { name: 'A Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 2], [3, 2], [4, 0]] },
            { name: 'E Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 2], [4, 2], [5, 0]] },
            { name: 'F Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 3], [4, 1], [5, 1]] },
            
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

// Helper function to analyze chord inversion
function analyzeInversion(chordName, positions, fretboard) {
    // Get the root note from chord name
    const rootNote = chordName.split(' ')[0];
    
    // Find the bass note (lowest string number = highest pitch, but we want actual bass)
    // In guitar terms, string 5 (A) and string 4 (D) are lower than string 3 (G)
    const bassPosition = positions.reduce((lowest, pos) => {
        return pos[0] > lowest[0] ? pos : lowest; // Highest string number = actual bass
    });
    
    // Calculate the bass note
    const bassNote = fretboard.getNote(bassPosition[0], bassPosition[1]);
    
    // For major chords, determine inversion
    if (chordName.includes('Major') && !chordName.includes('(')) {
        // Major chord intervals: Root, Major 3rd, Perfect 5th
        const noteToNumber = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
        const rootNumber = noteToNumber[rootNote];
        const bassNumber = noteToNumber[bassNote];
        
        const interval = (bassNumber - rootNumber + 12) % 12;
        
        let actualInversion;
        if (interval === 0) {
            actualInversion = 'root';
        } else if (interval === 4) { // Major 3rd
            actualInversion = 'first';
        } else if (interval === 7) { // Perfect 5th
            actualInversion = 'second';
        } else {
            actualInversion = 'unknown';
        }
        
        return {
            rootNote: rootNote,
            bassNote: bassNote,
            interval: interval,
            actualInversion: actualInversion
        };
    }
    
    return {
        rootNote: rootNote,
        bassNote: bassNote,
        actualInversion: 'unknown'
    };
}

describe('Guitar Inversion Selection', () => {
    let app;
    let fretboard;
    
    beforeEach(() => {
        app = new MockApp();
        fretboard = app.fretboard;
    });

    test('FAIL: All root position chords should have root note in bass', () => {
        const chordDatabase = app.generateChordDatabase();
        const rootPositionChords = chordDatabase.filter(chord => chord.inversion === 'root');
        
        const incorrectRootChords = [];
        
        rootPositionChords.forEach(chord => {
            const analysis = analyzeInversion(chord.name, chord.positions, fretboard);
            if (analysis.actualInversion !== 'root' && analysis.actualInversion !== 'unknown') {
                incorrectRootChords.push({
                    name: chord.name,
                    positions: chord.positions,
                    rootNote: analysis.rootNote,
                    bassNote: analysis.bassNote,
                    labeledAs: 'root',
                    actualInversion: analysis.actualInversion
                });
            }
        });
        
        console.log('Chords labeled as root position but actually inversions:', incorrectRootChords);
        
        // This should fail initially
        expect(incorrectRootChords.length).toBe(0);
    });

    test('FAIL: C Major root should have C in bass', () => {
        const chordDatabase = app.generateChordDatabase();
        const cMajorRoot = chordDatabase.find(chord => 
            chord.name === 'C Major' && chord.inversion === 'root'
        );
        
        expect(cMajorRoot).toBeDefined();
        
        const analysis = analyzeInversion(cMajorRoot.name, cMajorRoot.positions, fretboard);
        console.log('C Major root analysis:', analysis);
        console.log('C Major positions:', cMajorRoot.positions);
        
        expect(analysis.bassNote).toBe('C');
        expect(analysis.actualInversion).toBe('root');
    });

    test('FAIL: A Major root should have A in bass', () => {
        const chordDatabase = app.generateChordDatabase();
        const aMajorRoot = chordDatabase.find(chord => 
            chord.name === 'A Major' && chord.inversion === 'root'
        );
        
        expect(aMajorRoot).toBeDefined();
        
        const analysis = analyzeInversion(aMajorRoot.name, aMajorRoot.positions, fretboard);
        console.log('A Major root analysis:', analysis);
        console.log('A Major positions:', aMajorRoot.positions);
        
        expect(analysis.bassNote).toBe('A');
        expect(analysis.actualInversion).toBe('root');
    });

    test('FAIL: G Major root should have G in bass', () => {
        const chordDatabase = app.generateChordDatabase();
        const gMajorRoot = chordDatabase.find(chord => 
            chord.name === 'G Major' && chord.inversion === 'root'
        );
        
        expect(gMajorRoot).toBeDefined();
        
        const analysis = analyzeInversion(gMajorRoot.name, gMajorRoot.positions, fretboard);
        console.log('G Major root analysis:', analysis);
        console.log('G Major positions:', gMajorRoot.positions);
        
        expect(analysis.bassNote).toBe('G');
        expect(analysis.actualInversion).toBe('root');
    });

    test('FAIL: E Major root should have E in bass', () => {
        const chordDatabase = app.generateChordDatabase();
        const eMajorRoot = chordDatabase.find(chord => 
            chord.name === 'E Major' && chord.inversion === 'root'
        );
        
        expect(eMajorRoot).toBeDefined();
        
        const analysis = analyzeInversion(eMajorRoot.name, eMajorRoot.positions, fretboard);
        console.log('E Major root analysis:', analysis);
        console.log('E Major positions:', eMajorRoot.positions);
        
        expect(analysis.bassNote).toBe('E');
        expect(analysis.actualInversion).toBe('root');
    });

    test('FAIL: No major chord labeled as root should have 3rd or 5th in bass', () => {
        const chordDatabase = app.generateChordDatabase();
        const majorRootChords = chordDatabase.filter(chord => 
            chord.name.includes('Major') && 
            !chord.name.includes('(') && 
            chord.inversion === 'root'
        );
        
        const wrongInversions = [];
        
        majorRootChords.forEach(chord => {
            const analysis = analyzeInversion(chord.name, chord.positions, fretboard);
            if (analysis.actualInversion === 'first' || analysis.actualInversion === 'second') {
                wrongInversions.push({
                    name: chord.name,
                    labeled: 'root',
                    actual: analysis.actualInversion,
                    bassNote: analysis.bassNote
                });
            }
        });
        
        console.log('Major chords labeled as root but actually inversions:', wrongInversions);
        
        expect(wrongInversions.length).toBe(0);
    });
});