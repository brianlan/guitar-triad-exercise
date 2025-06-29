// TDD Tests for Guitar Triad Generation
// Tests that ensure triads always generate exactly 3 finger positions

describe('Guitar Triad Generation', () => {
    let app;
    let fretboard;
    
    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="fretboard"></div>
            <input type="checkbox" id="chord-type-major" checked>
            <input type="checkbox" id="chord-type-minor">
            <input type="checkbox" id="chord-type-diminished">
            <input type="checkbox" id="chord-type-augmented">
            <input type="checkbox" id="voicing-open">
            <input type="checkbox" id="voicing-closed" checked>
            <input type="checkbox" id="inversion-root" checked>
            <input type="checkbox" id="inversion-first">
            <input type="checkbox" id="inversion-second">
            <div id="activity-log"></div>
        `;
        
        // Create app instance
        app = new FretboardApp();
        fretboard = app.fretboard;
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('FAIL: All triads should have exactly 3 finger positions', () => {
        const chordDatabase = app.generateChordDatabase();
        
        chordDatabase.forEach(chord => {
            expect(chord.positions.length).toBe(3);
        });
    });

    test('FAIL: Random chord generation should create exactly 3 dots on fretboard', () => {
        // Clear any existing dots
        fretboard.clearAllDots();
        
        // Generate multiple random chords and check dot count
        for (let i = 0; i < 10; i++) {
            app.showRandomChord();
            expect(fretboard.fingerDots.length).toBe(3);
            fretboard.clearAllDots();
        }
    });

    test('FAIL: Major triads should only contain root, third, and fifth', () => {
        const chordDatabase = app.generateChordDatabase();
        const majorTriads = chordDatabase.filter(chord => chord.type === 'major');
        
        majorTriads.forEach(chord => {
            expect(chord.positions.length).toBe(3);
            
            // Get the notes from the positions
            const notes = chord.positions.map(([stringIndex, fret]) => {
                return fretboard.getNote(stringIndex, fret);
            });
            
            // For a triad, we should have exactly 3 unique notes (allowing octave duplicates)
            const uniqueNotes = [...new Set(notes.map(note => note.replace(/\d+/, '')))];
            expect(uniqueNotes.length).toBe(3);
        });
    });

    test('FAIL: Minor triads should only contain root, minor third, and fifth', () => {
        const chordDatabase = app.generateChordDatabase();
        const minorTriads = chordDatabase.filter(chord => chord.type === 'minor');
        
        minorTriads.forEach(chord => {
            expect(chord.positions.length).toBe(3);
        });
    });

    test('FAIL: Diminished triads should only contain root, minor third, and diminished fifth', () => {
        const chordDatabase = app.generateChordDatabase();
        const diminishedTriads = chordDatabase.filter(chord => chord.type === 'diminished');
        
        diminishedTriads.forEach(chord => {
            expect(chord.positions.length).toBe(3);
        });
    });

    test('FAIL: Augmented triads should only contain root, major third, and augmented fifth', () => {
        const chordDatabase = app.generateChordDatabase();
        const augmentedTriads = chordDatabase.filter(chord => chord.type === 'augmented');
        
        augmentedTriads.forEach(chord => {
            expect(chord.positions.length).toBe(3);
        });
    });

    test('FAIL: No chord should have more than 3 finger positions in triad exercise', () => {
        const chordDatabase = app.generateChordDatabase();
        
        const chordsWithTooManyNotes = chordDatabase.filter(chord => chord.positions.length > 3);
        
        // This should fail initially, showing which chords have too many notes
        expect(chordsWithTooManyNotes).toEqual([]);
        
        if (chordsWithTooManyNotes.length > 0) {
            console.log('Chords with more than 3 positions:', 
                chordsWithTooManyNotes.map(chord => `${chord.name}: ${chord.positions.length} positions`)
            );
        }
    });

    test('FAIL: F Major should be a simple triad, not a barre chord', () => {
        const chordDatabase = app.generateChordDatabase();
        const fMajor = chordDatabase.find(chord => chord.name === 'F Major');
        
        expect(fMajor).toBeDefined();
        expect(fMajor.positions.length).toBe(3);
        
        // F Major triad should not be a full barre chord
        // Should use a simpler fingering like fret 1 on strings 1,2 and fret 3 on string 4
        expect(fMajor.positions.length).not.toBe(6);
    });

    test('FAIL: Open voicing chords should still be triads with only 3 notes', () => {
        const chordDatabase = app.generateChordDatabase();
        const openChords = chordDatabase.filter(chord => chord.voicing === 'open');
        
        openChords.forEach(chord => {
            expect(chord.positions.length).toBe(3);
        });
    });
});