class GuitarFretboard {
    constructor(containerId, numFrets = 12) {
        this.container = document.getElementById(containerId);
        this.numFrets = numFrets;
        this.strings = ['E', 'B', 'G', 'D', 'A', 'E'];
        this.fretboardWidth = 1000;
        this.fretboardHeight = 250;
        this.fingerDots = [];
        this.init();
        this.setupInteractivity();
    }

    init() {
        this.createFretboard();
        this.drawStrings();
        this.drawFrets();
        this.addLabels();
    }

    createFretboard() {
        this.container.style.width = `${this.fretboardWidth}px`;
        this.container.style.height = `${this.fretboardHeight}px`;
    }

    drawStrings() {
        const stringSpacing = this.fretboardHeight / 7;
        const stringThicknesses = [1, 1.5, 2, 2.5, 3, 3.5];
        
        this.strings.forEach((stringName, index) => {
            const string = document.createElement('div');
            string.className = 'string';
            string.dataset.string = stringName;
            
            const y = stringSpacing * (index + 1);
            string.style.top = `${y}px`;
            string.style.left = '0px';
            string.style.width = `${this.fretboardWidth}px`;
            string.style.height = `${stringThicknesses[index]}px`;
            
            this.container.appendChild(string);
            
            const label = document.createElement('div');
            label.className = 'string-label';
            label.textContent = stringName;
            label.style.top = `${y}px`;
            this.container.appendChild(label);
        });
    }

    drawFrets() {
        // Add fret 0 (nut/open string)
        const fret0 = document.createElement('div');
        fret0.className = 'fret';
        fret0.dataset.fret = '0';
        fret0.style.left = '1px';
        fret0.style.top = '0px';
        fret0.style.width = '4px';
        fret0.style.height = `${this.fretboardHeight}px`;
        fret0.style.backgroundColor = '#000';
        this.container.appendChild(fret0);
        
        // Add regular frets 1-12
        for (let i = 1; i <= this.numFrets; i++) {
            const fret = document.createElement('div');
            fret.className = 'fret';
            fret.dataset.fret = i;
            
            const x = this.getFretPosition(i);
            fret.style.left = `${x}px`;
            fret.style.top = '0px';
            fret.style.width = '3px';
            fret.style.height = `${this.fretboardHeight}px`;
            
            this.container.appendChild(fret);
        }
    }

    getFretPosition(fretNumber) {
        // Create wider, more evenly distributed fret spacing
        // Use a hybrid approach that's more linear than traditional guitar spacing
        // but still slightly compressed towards higher frets
        
        const maxFrets = 16; // Maximum expected frets
        const compressionFactor = 0.7; // How much to compress higher frets (0.5 = half spacing, 1.0 = linear)
        
        // Calculate position using a modified exponential curve
        const normalized = fretNumber / maxFrets;
        const position = Math.pow(normalized, compressionFactor);
        
        return position * this.fretboardWidth * 0.95; // Use 95% of width to leave some margin
    }

    addLabels() {
        // Fret position markers (dots) at 3rd, 5th, 7th, 9th, 12th, 15th
        // Double dots at 12th fret
        const markerFrets = [3, 5, 7, 9, 12, 15];
        markerFrets.forEach(fretNum => {
            if (fretNum <= this.numFrets) {
                const currentFretPos = this.getFretPosition(fretNum);
                const previousFretPos = fretNum === 1 ? 1 : this.getFretPosition(fretNum - 1);
                const x = previousFretPos + (currentFretPos - previousFretPos) / 2;
                
                if (fretNum === 12) {
                    // Double dots for 12th fret
                    this.addFretMarker(x, this.fretboardHeight * 0.33);
                    this.addFretMarker(x, this.fretboardHeight * 0.67);
                } else {
                    // Single dot for other frets
                    this.addFretMarker(x, this.fretboardHeight * 0.5);
                }
            }
        });
    }

    addFretMarker(x, y) {
        const marker = document.createElement('div');
        marker.style.position = 'absolute';
        marker.style.left = `${x - 8}px`;
        marker.style.top = `${y - 8}px`;
        marker.style.width = '16px';
        marker.style.height = '16px';
        marker.style.backgroundColor = '#E8E8E8';
        marker.style.borderRadius = '50%';
        marker.style.border = '2px solid #A0A0A0';
        marker.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
        this.container.appendChild(marker);
    }

    setupInteractivity() {
        // Add click event listener to fretboard for finger dot placement
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container || e.target.classList.contains('string')) {
                this.handleFretboardClick(e);
            }
        });

        // Add some initial finger dots as shown in the image
        this.addInitialFingerDots();
    }

    handleFretboardClick(e) {
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find the closest string and fret position
        const stringInfo = this.getClosestString(y);
        const fretInfo = this.getClosestFret(x);

        if (stringInfo && fretInfo) {
            this.toggleFingerDot(stringInfo.index, fretInfo.fret, fretInfo.x, stringInfo.y);
        }
    }

    getClosestString(y) {
        const stringSpacing = this.fretboardHeight / 7;
        let closestString = null;
        let minDistance = Infinity;

        for (let i = 0; i < this.strings.length; i++) {
            const stringY = stringSpacing * (i + 1);
            const distance = Math.abs(y - stringY);
            
            if (distance < minDistance && distance < 25) { // 25px tolerance
                minDistance = distance;
                closestString = { index: i, y: stringY };
            }
        }

        return closestString;
    }

    getClosestFret(x) {
        let closestFret = null;
        let minDistance = Infinity;

        // Check fret 0 (open string)
        const distance0 = Math.abs(x - 15);
        if (distance0 < minDistance && distance0 < 30) {
            minDistance = distance0;
            closestFret = { fret: 0, x: 15 };
        }

        // Check other frets
        for (let i = 1; i <= this.numFrets; i++) {
            const fretX = this.getFretPosition(i);
            const prevFretX = i === 1 ? 1 : this.getFretPosition(i - 1);
            const midX = prevFretX + (fretX - prevFretX) / 2;
            
            const distance = Math.abs(x - midX);
            if (distance < minDistance && distance < (fretX - prevFretX) / 2) {
                minDistance = distance;
                closestFret = { fret: i, x: midX };
            }
        }

        return closestFret;
    }

    toggleFingerDot(stringIndex, fret, x, y) {
        // Check if dot already exists at this position
        const existingDotIndex = this.fingerDots.findIndex(
            dot => dot.string === stringIndex && dot.fret === fret
        );

        if (existingDotIndex >= 0) {
            // Remove existing dot
            const dot = this.fingerDots[existingDotIndex];
            this.container.removeChild(dot.element);
            this.fingerDots.splice(existingDotIndex, 1);
        } else {
            // Add new dot
            this.addFingerDot(stringIndex, fret, x, y);
        }
    }

    addFingerDot(stringIndex, fret, x, y) {
        const dot = document.createElement('div');
        dot.className = 'finger-dot';
        dot.style.left = `${x - 10}px`;
        dot.style.top = `${y - 10}px`;
        
        // Store dot information
        const dotInfo = {
            element: dot,
            string: stringIndex,
            fret: fret,
            note: this.getNote(stringIndex, fret)
        };

        this.fingerDots.push(dotInfo);
        this.container.appendChild(dot);

        // Add click handler to remove dot
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFingerDot(stringIndex, fret, x, y);
        });
    }

    addInitialFingerDots() {
        // No initial finger dots for triad exercise
        // Users will learn by clicking Random Chord button
    }

    getNote(stringIndex, fret) {
        const openStringNotes = ['E', 'B', 'G', 'D', 'A', 'E'];
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        const openNote = openStringNotes[stringIndex];
        const openNoteIndex = notes.indexOf(openNote);
        const noteIndex = (openNoteIndex + fret) % 12;
        
        return notes[noteIndex];
    }

    clearAllDots() {
        this.fingerDots.forEach(dot => {
            this.container.removeChild(dot.element);
        });
        this.fingerDots = [];
    }
}

// App controller
class FretboardApp {
    constructor() {
        this.fretboard = new GuitarFretboard('fretboard');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const clearButton = document.getElementById('clear-dots');
        const randomChordButton = document.getElementById('random-chord');
        const fretCountSelect = document.getElementById('fret-count');

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.fretboard.clearAllDots();
                this.logActivity('Cleared all finger positions');
            });
        }

        if (randomChordButton) {
            randomChordButton.addEventListener('click', () => {
                this.showRandomChord();
            });
        }

        if (fretCountSelect) {
            fretCountSelect.addEventListener('change', (e) => {
                this.updateFretCount(parseInt(e.target.value));
            });
        }

        this.setupChordSettings();
    }

    setupChordSettings() {
        const chordTypeCheckboxes = ['major', 'minor', 'diminished', 'augmented'];
        const voicingCheckboxes = ['open', 'closed'];
        const inversionCheckboxes = ['root', 'first', 'second'];

        chordTypeCheckboxes.forEach(type => {
            const checkbox = document.getElementById(`chord-type-${type}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.handleChordTypeChange(type, checkbox.checked);
                });
            }
        });

        voicingCheckboxes.forEach(voicing => {
            const checkbox = document.getElementById(`voicing-${voicing}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.handleVoicingChange(voicing, checkbox.checked);
                });
            }
        });

        inversionCheckboxes.forEach(inversion => {
            const checkbox = document.getElementById(`inversion-${inversion}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.handleInversionChange(inversion, checkbox.checked);
                });
            }
        });
    }

    handleChordTypeChange(type, checked) {
        const message = checked ? `Enabled ${type} chords` : `Disabled ${type} chords`;
        this.logActivity(message);
        
        const selectedTypes = this.getSelectedChordTypes();
        if (selectedTypes.length === 0) {
            document.getElementById('chord-type-major').checked = true;
            this.logActivity('Auto-enabled Major chords (at least one type required)');
        }
    }

    handleVoicingChange(voicing, checked) {
        const message = checked ? `Enabled ${voicing} voicing` : `Disabled ${voicing} voicing`;
        this.logActivity(message);
        
        const selectedVoicings = this.getSelectedVoicings();
        if (selectedVoicings.length === 0) {
            document.getElementById('voicing-closed').checked = true;
            this.logActivity('Auto-enabled Closed voicing (at least one voicing required)');
        }
    }

    handleInversionChange(inversion, checked) {
        const message = checked ? `Enabled ${inversion} inversion` : `Disabled ${inversion} inversion`;
        this.logActivity(message);
        
        const selectedInversions = this.getSelectedInversions();
        if (selectedInversions.length === 0) {
            document.getElementById('inversion-root').checked = true;
            this.logActivity('Auto-enabled Root position (at least one inversion required)');
        }
    }

    getSelectedChordTypes() {
        const types = ['major', 'minor', 'diminished', 'augmented'];
        return types.filter(type => {
            const checkbox = document.getElementById(`chord-type-${type}`);
            return checkbox && checkbox.checked;
        });
    }

    getSelectedVoicings() {
        const voicings = ['open', 'closed'];
        return voicings.filter(voicing => {
            const checkbox = document.getElementById(`voicing-${voicing}`);
            return checkbox && checkbox.checked;
        });
    }

    getSelectedInversions() {
        const inversions = ['root', 'first', 'second'];
        return inversions.filter(inversion => {
            const checkbox = document.getElementById(`inversion-${inversion}`);
            return checkbox && checkbox.checked;
        });
    }

    showRandomChord() {
        this.fretboard.clearAllDots();
        
        const selectedTypes = this.getSelectedChordTypes();
        const selectedVoicings = this.getSelectedVoicings();
        const selectedInversions = this.getSelectedInversions();
        
        const allChords = this.generateChordDatabase();
        
        // Filter chords based on selected criteria
        const availableChords = allChords.filter(chord => 
            selectedTypes.includes(chord.type) &&
            selectedVoicings.includes(chord.voicing) &&
            selectedInversions.includes(chord.inversion)
        );
        
        if (availableChords.length === 0) {
            this.logActivity('No chords match current settings');
            return;
        }
        
        const randomChord = availableChords[Math.floor(Math.random() * availableChords.length)];
        
        randomChord.positions.forEach(([stringIndex, fret]) => {
            const fretX = fret === 0 ? 15 : this.fretboard.getFretPosition(fret - 0.5);
            const stringY = this.fretboard.fretboardHeight / 7 * (stringIndex + 1);
            this.fretboard.addFingerDot(stringIndex, fret, fretX, stringY);
        });

        this.logActivity(`Displayed ${randomChord.name} chord`);
    }

    generateChordDatabase() {
        return [
            // Major chords - Closed voicing - Root position (Root note in bass for true root position)
            { name: 'C Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 2], [4, 3]] }, // G, E, C (bass: C)
            { name: 'G Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 0], [4, 2], [5, 3]] }, // D, B, G (bass: G)
            { name: 'D Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[2, 2], [3, 4], [4, 5]] }, // A, F#, D (bass: D)
            { name: 'A Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[3, 2], [4, 4], [5, 5]] }, // E, C#, A (bass: A)
            { name: 'E Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 0], [2, 1], [3, 2]] }, // B, G#, E (bass: E on String-3)
            { name: 'F Major', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 3]] }, // C, A, F (bass: F on String-3)
            
            // Additional String-3 root position variants for better String-3 coverage  
            { name: 'G Major (String-3)', type: 'major', voicing: 'closed', inversion: 'root', positions: [[1, 3], [2, 4], [3, 5]] }, // D, B, G (bass: G on String-3)
            
            // Minor chords - Closed voicing - Root position (Ensuring unique triad notes: root, minor third, fifth)
            { name: 'C Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 1], [4, 1]] }, // C, D#, G
            { name: 'G Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 3], [3, 3], [4, 3]] }, // A#, G, D
            { name: 'D Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 3]] }, // D, F, A
            { name: 'A Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 1], [3, 2], [4, 2]] }, // C, A, E
            { name: 'E Minor', type: 'minor', voicing: 'closed', inversion: 'root', positions: [[2, 0], [3, 2], [4, 2]] }, // G, E, B
            
            // Diminished chords - Closed voicing - Root position (Ensuring unique triad notes: root, minor third, diminished fifth)
            { name: 'C Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[3, 1], [4, 0], [5, 0]] }, // C, D#, F#
            { name: 'G Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[1, 2], [2, 0], [3, 1]] }, // D, G, A#
            { name: 'D Diminished', type: 'diminished', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 2], [3, 1]] }, // D, F, G#
            
            // Augmented chords - Closed voicing - Root position (Ensuring unique triad notes: root, major third, augmented fifth)
            { name: 'C Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[3, 1], [4, 2], [5, 0]] }, // C, E, G#
            { name: 'G Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[1, 3], [2, 0], [3, 1]] }, // D, G, B
            { name: 'D Augmented', type: 'augmented', voicing: 'closed', inversion: 'root', positions: [[1, 1], [2, 3], [3, 2]] }, // D, F#, A#
            
            // Open voicing examples (Non-adjacent strings with unique triad notes)
            { name: 'C Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 0], [2, 0], [4, 3]] }, // E, G, C
            { name: 'G Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 3], [1, 3], [4, 2]] }, // G, D, B
            { name: 'D Major (Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 2], [2, 2], [4, 5]] }, // F#, A, D
            { name: 'D Major (String-3 Open)', type: 'major', voicing: 'open', inversion: 'root', positions: [[0, 2], [2, 2], [3, 0]] }, // F#, A, D (bass: D on String-3)
            
            // First inversion examples (Major chords with 3 notes)
            { name: 'C Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 1], [2, 2], [3, 1]] },
            { name: 'G Major (1st inv)', type: 'major', voicing: 'closed', inversion: 'first', positions: [[1, 0], [2, 0], [3, 0]] },
            
            // Second inversion examples (Major chords with 3 notes)
            { name: 'C Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 5], [2, 5], [3, 5]] },
            { name: 'G Major (2nd inv)', type: 'major', voicing: 'closed', inversion: 'second', positions: [[1, 3], [2, 4], [3, 3]] }
        ];
    }

    updateFretCount(count) {
        const container = document.getElementById('fretboard');
        container.innerHTML = '';
        this.fretboard = new GuitarFretboard('fretboard', count);
        this.logActivity(`Changed to ${count} frets`);
    }

    logActivity(message) {
        const activityLog = document.getElementById('activity-log');
        if (activityLog) {
            const li = document.createElement('li');
            li.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
            activityLog.insertBefore(li, activityLog.firstChild);
            
            // Keep only last 10 entries
            while (activityLog.children.length > 10) {
                activityLog.removeChild(activityLog.lastChild);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new FretboardApp();
});