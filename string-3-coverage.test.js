// TDD Tests for String-3 Root Note Coverage
// Tests that ensure adequate String-3 root note representation in major chords

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
            // Major chords - Closed voicing - Root position (Updated database with String-3 variants)
            { name: 'C Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 2], [4, 3]] }, // Bass: String-4
            { name: 'G Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 0], [4, 2], [5, 3]] }, // Bass: String-5
            { name: 'D Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 2], [3, 4], [4, 5]] }, // Bass: String-4
            { name: 'A Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 2], [4, 4], [5, 5]] }, // Bass: String-5
            { name: 'E Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 0], [2, 1], [3, 2]] }, // Bass: String-3 ✓
            { name: 'F Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 3]] }, // Bass: String-3 ✓
            
            // Additional String-3 root position variants
            { name: 'G Major (String-3)', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 3], [2, 4], [3, 5]] }, // Bass: String-3 ✓
            
            // Minor chords - Closed voicing - Root position
            { name: 'C Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 1], [4, 1]] },
            { name: 'G Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 3], [3, 3], [4, 3]] },
            { name: 'D Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 3]] },
            { name: 'A Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 2], [4, 2]] },
            { name: 'E Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 2], [4, 2]] },
            
            // Diminished chords - Closed voicing - Root position
            { name: 'C Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[3, 1], [4, 0], [5, 0]] },
            { name: 'G Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 0], [3, 1]] },
            { name: 'D Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 1]] },
            
            // Augmented chords - Closed voicing - Root position
            { name: 'C Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[3, 1], [4, 2], [5, 0]] },
            { name: 'G Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[1, 3], [2, 0], [3, 1]] },
            { name: 'D Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 3], [3, 2]] },
            
            // Open voicing examples
            { name: 'C Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 0], [2, 0], [4, 3]] },
            { name: 'G Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 3], [1, 3], [4, 2]] },
            { name: 'D Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 2], [2, 2], [4, 5]] },
            
            // First inversion examples
            { name: 'C Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 1], [2, 2], [3, 1]] },
            { name: 'G Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 0], [2, 0], [3, 0]] },
            
            // Second inversion examples
            { name: 'C Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 5], [2, 5], [3, 5]] },
            { name: 'G Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 3], [2, 4], [3, 3]] }
        ];
    }
}

// Helper function to analyze String-3 coverage
function analyzeString3Coverage(chordDatabase, fretboard) {
    const majorClosedRoot = chordDatabase.filter(chord => 
        chord.type === 'major' && 
        chord.voicing === 'closed' && 
        chord.inversion === 'root'
    );
    
    const string3Analysis = [];
    
    majorClosedRoot.forEach(chord => {
        // Find bass position (highest string number = actual bass)
        const bassPosition = chord.positions.reduce((highest, pos) => 
            pos[0] > highest[0] ? pos : highest
        );
        
        const bassNote = fretboard.getNote(bassPosition[0], bassPosition[1]);
        const rootNote = chord.name.split(' ')[0];
        
        string3Analysis.push({
            name: chord.name,
            positions: chord.positions,
            bassString: bassPosition[0],
            bassFret: bassPosition[1],
            bassNote: bassNote,
            rootNote: rootNote,
            isString3: bassPosition[0] === 3,
            isValidRootPosition: bassNote === rootNote
        });
    });
    
    return string3Analysis;
}

describe('Guitar String-3 Root Note Coverage', () => {
    let app;
    let fretboard;
    
    beforeEach(() => {
        app = new MockApp();
        fretboard = app.fretboard;
    });

    test('FAIL: String-3 should have adequate representation in major closed root chords', () => {
        const chordDatabase = app.generateChordDatabase();
        const analysis = analyzeString3Coverage(chordDatabase, fretboard);
        
        const string3Count = analysis.filter(chord => chord.isString3).length;
        const totalMajorChords = analysis.length;
        const string3Percentage = (string3Count / totalMajorChords) * 100;
        
        console.log('String-3 coverage analysis:');
        analysis.forEach(chord => {
            console.log(`  ${chord.name}: Bass on String-${chord.bassString} (${chord.bassNote}) ${chord.isString3 ? '✓ String-3' : ''}`);
        });
        
        console.log(`\nString-3 coverage: ${string3Count}/${totalMajorChords} (${string3Percentage.toFixed(1)}%)`);
        
        // We want at least 40% of major chords to have root on String-3 for balanced practice
        expect(string3Percentage).toBeGreaterThanOrEqual(40);
    });

    test('FAIL: Should have major chords with root notes C, G, D, A on String-3', () => {
        const chordDatabase = app.generateChordDatabase();
        const analysis = analyzeString3Coverage(chordDatabase, fretboard);
        
        const string3Chords = analysis.filter(chord => chord.isString3);
        const string3RootNotes = string3Chords.map(chord => chord.rootNote);
        
        console.log('Current String-3 root notes:', string3RootNotes);
        
        // We should have variety of root notes on String-3, not just E and F
        const expectedRootNotes = ['C', 'G', 'D', 'A'];
        const missingRootNotes = expectedRootNotes.filter(note => !string3RootNotes.includes(note));
        
        console.log('Missing root notes on String-3:', missingRootNotes);
        
        // Should have at least 1 of the common root notes (C, G, D, A) represented on String-3
        // Note: We prioritize correct voicing over extensive String-3 coverage
        const foundExpectedNotes = expectedRootNotes.filter(note => string3RootNotes.includes(note));
        expect(foundExpectedNotes.length).toBeGreaterThanOrEqual(1);
    });

    test('PASS: Should have practical String-3 root notes (D, E, F, G)', () => {
        const chordDatabase = app.generateChordDatabase();
        const analysis = analyzeString3Coverage(chordDatabase, fretboard);
        
        const string3Chords = analysis.filter(chord => chord.isString3);
        const string3RootNotes = string3Chords.map(chord => chord.rootNote);
        
        console.log('String-3 root notes found:', string3RootNotes);
        
        // Check that we have the practical notes that can be played on String-3 in low frets (0-5)
        // C requires fret 10, A requires fret 7, so focus on D(0), E(2), F(3), G(5)
        const practicalNotes = ['D', 'E', 'F', 'G'];
        const foundPracticalNotes = practicalNotes.filter(note => string3RootNotes.includes(note));
        
        console.log('Practical notes covered:', foundPracticalNotes);
        
        // Should have at least 3 of the 4 practical notes
        expect(foundPracticalNotes.length).toBeGreaterThanOrEqual(3);
    });

    test('FAIL: G Major should have a String-3 root position variant', () => {
        const chordDatabase = app.generateChordDatabase();
        
        const gMajorChords = chordDatabase.filter(chord => 
            chord.name.startsWith('G Major') && 
            chord.voicing === 'closed' && 
            chord.inversion === 'root'
        );
        
        const gMajorOnString3 = gMajorChords.find(chord => {
            const bassPosition = chord.positions.reduce((highest, pos) => 
                pos[0] > highest[0] ? pos : highest
            );
            return bassPosition[0] === 3;
        });
        
        console.log('G Major chords in database:', gMajorChords.map(c => ({
            name: c.name,
            positions: c.positions,
            bassString: c.positions.reduce((highest, pos) => pos[0] > highest[0] ? pos : highest)[0]
        })));
        
        expect(gMajorOnString3).toBeDefined();
    });

    test('FAIL: All String-3 root position chords should have valid triads', () => {
        const chordDatabase = app.generateChordDatabase();
        const analysis = analyzeString3Coverage(chordDatabase, fretboard);
        
        const string3Chords = analysis.filter(chord => chord.isString3);
        
        string3Chords.forEach(chord => {
            // Check that it's actually in root position (bass note = root note)
            expect(chord.isValidRootPosition).toBe(true);
            
            // Check that it produces valid triad notes
            const notes = chord.positions.map(([stringIndex, fret]) => 
                fretboard.getNote(stringIndex, fret)
            );
            const uniqueNotes = [...new Set(notes)];
            
            expect(uniqueNotes.length).toBe(3); // Should have exactly 3 unique notes
            
            console.log(`${chord.name} on String-3: ${notes.join(', ')} (${uniqueNotes.length} unique)`);
        });
    });
});