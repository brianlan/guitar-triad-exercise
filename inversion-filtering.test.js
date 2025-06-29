// TDD Tests for Inversion Filtering
// Tests that ensure only root position chords are generated when only root position is checked

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
            
            // Minor chords - Closed voicing - Root position (Ensuring unique triad notes: root, minor third, fifth)
            { name: 'C Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 1], [4, 1]] },
            { name: 'G Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 3], [3, 3], [4, 3]] },
            { name: 'D Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 3]] },
            { name: 'A Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 2], [4, 2]] },
            { name: 'E Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 2], [4, 2]] },
            
            // Diminished chords - Closed voicing - Root position (Ensuring unique triad notes: root, minor third, diminished fifth)
            { name: 'C Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[3, 1], [4, 0], [5, 0]] },
            { name: 'G Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 0], [3, 1]] },
            { name: 'D Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 1]] },
            
            // Augmented chords - Closed voicing - Root position (Ensuring unique triad notes: root, major third, augmented fifth)
            { name: 'C Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[3, 1], [4, 2], [5, 0]] },
            { name: 'G Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[1, 3], [2, 0], [3, 1]] },
            { name: 'D Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 3], [3, 2]] },
            
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

// Helper function to analyze chord inversion
function analyzeInversion(chordName, positions, fretboard) {
    // Get the root note from chord name
    const rootNote = chordName.split(' ')[0];
    
    // Find the bass note (highest string number = actual bass)
    const bassPosition = positions.reduce((lowest, pos) => {
        return pos[0] > lowest[0] ? pos : lowest;
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
            actualInversion: actualInversion,
            labeledAs: 'root'
        };
    }
    
    return {
        rootNote: rootNote,
        bassNote: bassNote,
        actualInversion: 'unknown',
        labeledAs: 'root'
    };
}

describe('Guitar Inversion Filtering', () => {
    let app;
    let fretboard;
    
    beforeEach(() => {
        app = new MockApp();
        fretboard = app.fretboard;
    });

    test('FAIL: All root position chords must have root note in bass', () => {
        const chordDatabase = app.generateChordDatabase();
        const rootPositionChords = chordDatabase.filter(chord => chord.inversion === 'root');
        
        const wrongRootChords = [];
        
        rootPositionChords.forEach(chord => {
            const analysis = analyzeInversion(chord.name, chord.positions, fretboard);
            if (analysis.actualInversion !== 'root' && analysis.actualInversion !== 'unknown') {
                wrongRootChords.push({
                    name: chord.name,
                    positions: chord.positions,
                    rootNote: analysis.rootNote,
                    bassNote: analysis.bassNote,
                    actualInversion: analysis.actualInversion,
                    shouldBe: 'root'
                });
            }
        });
        
        console.log('Root position chords that are actually inversions:', wrongRootChords);
        
        // This should fail initially - we have inversions labeled as root position
        expect(wrongRootChords.length).toBe(0);
    });

    test('FAIL: A Major root position should have A in bass, not E', () => {
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

    test('FAIL: C Major root position should have C in bass, not E', () => {
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

    test('FAIL: G Major root position should have G in bass, not D', () => {
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

    test('FAIL: D Major root position should have D in bass, not F#', () => {
        const chordDatabase = app.generateChordDatabase();
        const dMajorRoot = chordDatabase.find(chord => 
            chord.name === 'D Major' && chord.inversion === 'root'
        );
        
        expect(dMajorRoot).toBeDefined();
        
        const analysis = analyzeInversion(dMajorRoot.name, dMajorRoot.positions, fretboard);
        console.log('D Major root analysis:', analysis);
        console.log('D Major positions:', dMajorRoot.positions);
        
        expect(analysis.bassNote).toBe('D');
        expect(analysis.actualInversion).toBe('root');
    });

    test('FAIL: All major chords labeled as root should be in root position', () => {
        const chordDatabase = app.generateChordDatabase();
        const majorRootChords = chordDatabase.filter(chord => 
            chord.name.includes('Major') && 
            !chord.name.includes('(') && 
            chord.inversion === 'root'
        );
        
        const actualInversions = [];
        
        majorRootChords.forEach(chord => {
            const analysis = analyzeInversion(chord.name, chord.positions, fretboard);
            actualInversions.push({
                name: chord.name,
                labeled: 'root',
                actual: analysis.actualInversion,
                bassNote: analysis.bassNote,
                rootNote: analysis.rootNote
            });
        });
        
        console.log('Major chord inversion analysis:', actualInversions);
        
        const wrongInversions = actualInversions.filter(chord => 
            chord.actual !== 'root'
        );
        
        expect(wrongInversions.length).toBe(0);
    });
});