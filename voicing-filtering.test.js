// TDD Tests for Voicing Filtering
// Tests that ensure only closed voicing chords are generated when only closed voicing is checked

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
            // Major chords - Closed voicing - Root position
            { name: 'C Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 2], [4, 3]] },
            { name: 'G Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 0], [4, 2], [5, 3]] },
            { name: 'D Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 2], [3, 4], [4, 5]] },
            { name: 'A Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 2], [4, 4], [5, 5]] },
            { name: 'E Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 0], [2, 1], [3, 2]] },
            { name: 'F Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 3]] },
            
            // Additional String-3 root position variants
            { name: 'G Major (String-3)', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 3], [2, 4], [3, 5]] },
            
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
            
            // Open voicing examples (properly labeled as open)
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

// Helper function to analyze voicing accuracy
function analyzeVoicing(chordName, positions) {
    // Get string numbers and sort them
    const stringNumbers = positions.map(pos => pos[0]).sort((a, b) => a - b);
    
    // Check if strings are adjacent (closed voicing)
    const isAdjacent = stringNumbers.every((str, index) => {
        if (index === 0) return true;
        return str === stringNumbers[index - 1] + 1;
    });
    
    const actualVoicing = isAdjacent ? 'closed' : 'open';
    
    return {
        chordName,
        positions,
        strings: stringNumbers,
        actualVoicing,
        isAdjacent,
        stringGaps: stringNumbers.map((str, idx) => idx > 0 ? str - stringNumbers[idx-1] : 0).slice(1)
    };
}

describe('Guitar Voicing Filtering', () => {
    let app;
    let fretboard;
    
    beforeEach(() => {
        app = new MockApp();
        fretboard = app.fretboard;
    });

    test('FAIL: All chords labeled as "closed" must use adjacent strings only', () => {
        const chordDatabase = app.generateChordDatabase();
        const closedChords = chordDatabase.filter(chord => chord.voicing === 'closed');
        
        const incorrectlyLabeled = [];
        
        closedChords.forEach(chord => {
            const analysis = analyzeVoicing(chord.name, chord.positions);
            if (analysis.actualVoicing !== 'closed') {
                incorrectlyLabeled.push({
                    name: chord.name,
                    positions: chord.positions,
                    strings: analysis.strings,
                    gaps: analysis.stringGaps,
                    labeledAs: 'closed',
                    actuallyIs: analysis.actualVoicing
                });
            }
        });
        
        console.log('Chords labeled as "closed" but actually open:');
        incorrectlyLabeled.forEach(chord => {
            console.log(`  ${chord.name}: ${JSON.stringify(chord.positions)} (strings ${chord.strings.join(', ')}, gaps: ${chord.gaps.join(', ')})`);
        });
        
        // This should fail - we have incorrectly labeled chords
        expect(incorrectlyLabeled.length).toBe(0);
    });

    test('PASS: Voicing classifications should be accurate after fix', () => {
        const chordDatabase = app.generateChordDatabase();
        const closedChords = chordDatabase.filter(chord => chord.voicing === 'closed');
        
        // Should no longer have any incorrectly labeled chords
        const correctCount = closedChords.filter(chord => {
            const analysis = analyzeVoicing(chord.name, chord.positions);
            return analysis.actualVoicing === 'closed';
        }).length;
        
        console.log(`All closed chords correctly labeled: ${correctCount}/${closedChords.length}`);
        expect(correctCount).toBe(closedChords.length);
    });

    test('FAIL: Major closed chords should have at least 50% adjacent string usage', () => {
        const chordDatabase = app.generateChordDatabase();
        const majorClosedChords = chordDatabase.filter(chord => 
            chord.type === 'major' && 
            chord.voicing === 'closed' && 
            chord.inversion === 'root'
        );
        
        const voicingAnalysis = [];
        
        majorClosedChords.forEach(chord => {
            const analysis = analyzeVoicing(chord.name, chord.positions);
            voicingAnalysis.push({
                name: chord.name,
                isCorrect: analysis.actualVoicing === 'closed'
            });
        });
        
        const correctCount = voicingAnalysis.filter(chord => chord.isCorrect).length;
        const correctPercentage = (correctCount / majorClosedChords.length) * 100;
        
        console.log('Major closed chord voicing analysis:');
        voicingAnalysis.forEach(chord => {
            console.log(`  ${chord.name}: ${chord.isCorrect ? '✓ Correct' : '❌ Incorrect'}`);
        });
        console.log(`Correctly voiced: ${correctCount}/${majorClosedChords.length} (${correctPercentage.toFixed(1)}%)`);
        
        // Should have all (100%) chords correctly voiced as closed
        expect(correctPercentage).toBe(100);
    });

    test('FAIL: All closed voicing chords should use consecutive string numbers', () => {
        const chordDatabase = app.generateChordDatabase();
        const closedChords = chordDatabase.filter(chord => chord.voicing === 'closed');
        
        const nonConsecutiveChords = [];
        
        closedChords.forEach(chord => {
            const analysis = analyzeVoicing(chord.name, chord.positions);
            const hasGaps = analysis.stringGaps.some(gap => gap > 1);
            
            if (hasGaps) {
                nonConsecutiveChords.push({
                    name: chord.name,
                    strings: analysis.strings,
                    gaps: analysis.stringGaps,
                    maxGap: Math.max(...analysis.stringGaps)
                });
            }
        });
        
        console.log('Closed chords with string gaps:');
        nonConsecutiveChords.forEach(chord => {
            console.log(`  ${chord.name}: strings ${chord.strings.join(', ')} (gaps: ${chord.gaps.join(', ')}, max gap: ${chord.maxGap})`);
        });
        
        expect(nonConsecutiveChords.length).toBe(0);
    });

    test('FAIL: Should have proper String-3 closed voicing alternatives', () => {
        const chordDatabase = app.generateChordDatabase();
        
        // Check that we have String-3 coverage but with proper closed voicing
        const majorClosedRoot = chordDatabase.filter(chord => 
            chord.type === 'major' && 
            chord.voicing === 'closed' && 
            chord.inversion === 'root'
        );
        
        const string3Chords = [];
        const properString3Chords = [];
        
        majorClosedRoot.forEach(chord => {
            const bassPosition = chord.positions.reduce((highest, pos) => 
                pos[0] > highest[0] ? pos : highest
            );
            
            if (bassPosition[0] === 3) {
                string3Chords.push(chord.name);
                
                const analysis = analyzeVoicing(chord.name, chord.positions);
                if (analysis.actualVoicing === 'closed') {
                    properString3Chords.push(chord.name);
                }
            }
        });
        
        console.log('String-3 chords found:', string3Chords);
        console.log('Properly voiced String-3 chords:', properString3Chords);
        
        // Should have String-3 coverage without voicing violations
        expect(string3Chords.length).toBeGreaterThan(0);
        expect(properString3Chords.length).toBe(string3Chords.length); // All should be properly voiced
    });
});