class MusicTheory {
    static NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    static STANDARD_TUNING = [
        { string: 0, note: 'E', octave: 2 }, // Low E
        { string: 1, note: 'A', octave: 2 }, // A
        { string: 2, note: 'D', octave: 3 }, // D
        { string: 3, note: 'G', octave: 3 }, // G
        { string: 4, note: 'B', octave: 3 }, // B
        { string: 5, note: 'E', octave: 4 }  // High E
    ];

    static TRIAD_INTERVALS = {
        major: [0, 4, 7],
        minor: [0, 3, 7],
        diminished: [0, 3, 6],
        augmented: [0, 4, 8]
    };

    static INVERSION_PATTERNS = {
        root: [0, 1, 2],      // Root, 3rd, 5th
        first: [1, 2, 0],     // 3rd, 5th, Root
        second: [2, 0, 1]     // 5th, Root, 3rd
    };

    static getNoteIndex(note) {
        return this.NOTES.indexOf(note);
    }

    static getNoteFromIndex(index) {
        return this.NOTES[((index % 12) + 12) % 12];
    }

    static getNoteAtFret(stringIndex, fret) {
        const openNote = this.STANDARD_TUNING[stringIndex].note;
        const openNoteIndex = this.getNoteIndex(openNote);
        const noteIndex = openNoteIndex + fret;
        return this.getNoteFromIndex(noteIndex);
    }

    static getTriadNotes(rootNote, triadType, inversion = 'root') {
        const rootIndex = this.getNoteIndex(rootNote);
        const intervals = this.TRIAD_INTERVALS[triadType];
        const inversionPattern = this.INVERSION_PATTERNS[inversion];
        
        const triadNotes = intervals.map(interval => 
            this.getNoteFromIndex(rootIndex + interval)
        );
        
        return inversionPattern.map(index => triadNotes[index]);
    }

    static findTriadPositions(rootNote, triadType, inversion = 'root', maxFret = 12) {
        const triadNotes = this.getTriadNotes(rootNote, triadType, inversion);
        const positions = [];

        for (let fret = 0; fret <= maxFret; fret++) {
            for (let string = 0; string < 6; string++) {
                const noteAtPosition = this.getNoteAtFret(string, fret);
                const noteIndex = triadNotes.indexOf(noteAtPosition);
                
                if (noteIndex !== -1) {
                    positions.push({
                        fret,
                        string,
                        note: noteAtPosition,
                        role: ['root', 'third', 'fifth'][this.INVERSION_PATTERNS.root.indexOf(noteIndex)]
                    });
                }
            }
        }

        return positions;
    }

    static generateRandomTriad(enabledTriadTypes, enabledInversions) {
        const triadType = enabledTriadTypes[Math.floor(Math.random() * enabledTriadTypes.length)];
        const inversion = enabledInversions[Math.floor(Math.random() * enabledInversions.length)];
        const rootNote = this.NOTES[Math.floor(Math.random() * this.NOTES.length)];
        
        return {
            rootNote,
            triadType,
            inversion,
            notes: this.getTriadNotes(rootNote, triadType, inversion)
        };
    }

    static findOptimalTriadShape(rootNote, triadType, inversion = 'root', maxFret = 12) {
        const positions = this.findTriadPositions(rootNote, triadType, inversion, maxFret);
        const shapes = [];

        // Group positions by proximity to find playable shapes
        for (let startFret = 0; startFret <= maxFret - 4; startFret++) {
            const fretRange = 4; // Maximum span of 4 frets
            const shapePositions = positions.filter(pos => 
                pos.fret >= startFret && pos.fret <= startFret + fretRange
            );

            // Find combinations of 3 notes that form the triad
            const triadNotes = this.getTriadNotes(rootNote, triadType, inversion);
            for (let i = 0; i < shapePositions.length; i++) {
                for (let j = i + 1; j < shapePositions.length; j++) {
                    for (let k = j + 1; k < shapePositions.length; k++) {
                        const shape = [shapePositions[i], shapePositions[j], shapePositions[k]];
                        
                        // Check if all three notes are present and on different strings
                        const shapeNotes = shape.map(pos => pos.note);
                        const shapeStrings = shape.map(pos => pos.string);
                        
                        if (triadNotes.every(note => shapeNotes.includes(note)) &&
                            new Set(shapeStrings).size === 3) {
                            
                            const fretSpan = Math.max(...shape.map(p => p.fret)) - 
                                           Math.min(...shape.map(p => p.fret));
                            
                            shapes.push({
                                positions: shape,
                                fretSpan,
                                startFret: Math.min(...shape.map(p => p.fret)),
                                difficulty: this.calculateShapeDifficulty(shape)
                            });
                        }
                    }
                }
            }
        }

        // Sort by difficulty (easier shapes first)
        shapes.sort((a, b) => a.difficulty - b.difficulty);
        return shapes;
    }

    static calculateShapeDifficulty(shape) {
        let difficulty = 0;
        
        // Penalize wide fret spans
        const fretSpan = Math.max(...shape.map(p => p.fret)) - 
                        Math.min(...shape.map(p => p.fret));
        difficulty += fretSpan * 2;
        
        // Penalize high frets (harder to reach)
        const avgFret = shape.reduce((sum, p) => sum + p.fret, 0) / shape.length;
        difficulty += avgFret * 0.5;
        
        // Slightly prefer lower strings (easier to fret)
        const avgString = shape.reduce((sum, p) => sum + p.string, 0) / shape.length;
        difficulty += avgString * 0.2;
        
        return difficulty;
    }

    static getChordName(rootNote, triadType, inversion = 'root') {
        const typeNames = {
            major: '',
            minor: 'm',
            diminished: 'dim',
            augmented: 'aug'
        };
        
        const inversionNames = {
            root: '',
            first: '/1st',
            second: '/2nd'
        };
        
        return `${rootNote}${typeNames[triadType]}${inversionNames[inversion]}`;
    }

    static generateWrongAnswers(correctAnswer, count = 3) {
        const wrongAnswers = [];
        const allTriadTypes = Object.keys(this.TRIAD_INTERVALS);
        const allInversions = Object.keys(this.INVERSION_PATTERNS);
        
        while (wrongAnswers.length < count) {
            const randomRoot = this.NOTES[Math.floor(Math.random() * this.NOTES.length)];
            const randomType = allTriadTypes[Math.floor(Math.random() * allTriadTypes.length)];
            const randomInversion = allInversions[Math.floor(Math.random() * allInversions.length)];
            
            const wrongAnswer = this.getChordName(randomRoot, randomType, randomInversion);
            
            if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    }

    static validateTriadCompletion(selectedPositions, targetTriad) {
        const selectedNotes = selectedPositions.map(pos => this.getNoteAtFret(pos.string, pos.fret));
        const targetNotes = targetTriad.notes;
        
        // Check if all target notes are present
        const hasAllNotes = targetNotes.every(note => selectedNotes.includes(note));
        
        // Check if there are no extra notes
        const hasOnlyTargetNotes = selectedNotes.every(note => targetNotes.includes(note));
        
        return {
            isComplete: hasAllNotes && selectedNotes.length === targetNotes.length,
            isCorrect: hasAllNotes && hasOnlyTargetNotes,
            missingNotes: targetNotes.filter(note => !selectedNotes.includes(note)),
            extraNotes: selectedNotes.filter(note => !targetNotes.includes(note))
        };
    }
}