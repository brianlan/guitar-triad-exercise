class Fretboard {
    constructor(container, options = {}) {
        this.container = container;
        this.fretCount = options.fretCount || 12;
        this.showNoteNames = options.showNoteNames || false;
        this.showFretNumbers = options.showFretNumbers || true;
        this.onNoteClick = options.onNoteClick || (() => {});
        
        this.selectedPositions = new Set();
        this.highlightedPositions = new Map(); // position -> class
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = '';
        
        // Calculate fretboard dimensions
        const fretboardWidth = 900;
        const fretboardHeight = 120;
        const nutWidth = 6;
        
        // Create fretboard element
        const fretboard = document.createElement('div');
        fretboard.className = 'fretboard';
        fretboard.style.width = `${fretboardWidth}px`;
        fretboard.style.height = `${fretboardHeight}px`;
        fretboard.style.position = 'relative';
        
        // Add nut (0th fret)
        const nut = document.createElement('div');
        nut.className = 'fret-line nut';
        nut.style.left = '0px';
        fretboard.appendChild(nut);
        
        // Add fret lines with decreasing spacing
        for (let fret = 1; fret <= this.fretCount; fret++) {
            const fretLine = document.createElement('div');
            fretLine.className = 'fret-line fret';
            
            // Calculate fret position using 18th root of 2 (equal temperament)
            const fretPosition = nutWidth + (fretboardWidth - nutWidth) * 
                (1 - Math.pow(2, -fret / 12));
            
            fretLine.style.left = `${fretPosition}px`;
            fretboard.appendChild(fretLine);
        }
        
        // Add strings
        const stringPositions = [15, 30, 45, 60, 75, 90]; // Y positions
        const stringNames = ['low-e', 'a', 'd', 'g', 'b', 'high-e'];
        
        stringPositions.forEach((pos, index) => {
            const string = document.createElement('div');
            string.className = `string ${stringNames[index]}`;
            string.style.top = `${pos}px`;
            fretboard.appendChild(string);
        });
        
        // Add fret markers
        const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21];
        const doubleMarkerFrets = [12, 24];
        
        markerFrets.forEach(fret => {
            if (fret <= this.fretCount) {
                const fretPosition = nutWidth + (fretboardWidth - nutWidth) * 
                    (1 - Math.pow(2, -(fret - 0.5) / 12));
                
                if (doubleMarkerFrets.includes(fret)) {
                    // Double markers
                    const marker1 = document.createElement('div');
                    marker1.className = 'fret-marker double top';
                    marker1.style.left = `${fretPosition}px`;
                    fretboard.appendChild(marker1);
                    
                    const marker2 = document.createElement('div');
                    marker2.className = 'fret-marker double bottom';
                    marker2.style.left = `${fretPosition}px`;
                    fretboard.appendChild(marker2);
                } else {
                    // Single marker
                    const marker = document.createElement('div');
                    marker.className = 'fret-marker';
                    marker.style.left = `${fretPosition}px`;
                    fretboard.appendChild(marker);
                }
            }
        });
        
        // Add note positions
        for (let fret = 0; fret <= this.fretCount; fret++) {
            for (let string = 0; string < 6; string++) {
                const notePosition = this.createNotePosition(fret, string);
                fretboard.appendChild(notePosition);
            }
        }
        
        // Add fret numbers if enabled
        if (this.showFretNumbers) {
            for (let fret = 0; fret <= this.fretCount; fret++) {
                const fretNumber = document.createElement('div');
                fretNumber.className = 'fret-number';
                fretNumber.textContent = fret;
                fretNumber.style.position = 'absolute';
                fretNumber.style.top = `${fretboardHeight + 5}px`;
                fretNumber.style.fontSize = '12px';
                fretNumber.style.color = '#666';
                fretNumber.style.textAlign = 'center';
                fretNumber.style.width = '20px';
                
                const fretPosition = fret === 0 ? nutWidth/2 : 
                    nutWidth + (fretboardWidth - nutWidth) * 
                    (1 - Math.pow(2, -(fret - 0.5) / 12));
                
                fretNumber.style.left = `${fretPosition - 10}px`;
                fretboard.appendChild(fretNumber);
            }
        }
        
        this.container.appendChild(fretboard);
        this.fretboardElement = fretboard;
    }

    createNotePosition(fret, string) {
        const notePosition = document.createElement('div');
        notePosition.className = 'note-position';
        notePosition.dataset.fret = fret;
        notePosition.dataset.string = string;
        
        // Calculate position
        const nutWidth = 6;
        const fretboardWidth = 900;
        const stringPositions = [15, 30, 45, 60, 75, 90];
        
        let xPosition;
        if (fret === 0) {
            xPosition = nutWidth / 2;
        } else {
            const prevFretPos = nutWidth + (fretboardWidth - nutWidth) * 
                (1 - Math.pow(2, -(fret - 1) / 12));
            const currFretPos = nutWidth + (fretboardWidth - nutWidth) * 
                (1 - Math.pow(2, -fret / 12));
            xPosition = (prevFretPos + currFretPos) / 2;
        }
        
        notePosition.style.left = `${xPosition}px`;
        notePosition.style.top = `${stringPositions[string]}px`;
        
        // Add note name if enabled
        if (this.showNoteNames) {
            const noteName = MusicTheory.getNoteAtFret(string, fret);
            notePosition.textContent = noteName;
        }
        
        return notePosition;
    }

    setupEventListeners() {
        this.fretboardElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('note-position')) {
                const fret = parseInt(e.target.dataset.fret);
                const string = parseInt(e.target.dataset.string);
                const note = MusicTheory.getNoteAtFret(string, fret);
                
                this.handleNoteClick(fret, string, note, e.target);
            }
        });
    }

    handleNoteClick(fret, string, note, element) {
        const position = `${fret}-${string}`;
        
        // Toggle selection
        if (this.selectedPositions.has(position)) {
            this.selectedPositions.delete(position);
            element.classList.remove('active');
        } else {
            this.selectedPositions.add(position);
            element.classList.add('active');
        }
        
        // Call callback
        this.onNoteClick(fret, string, note, {
            selected: this.selectedPositions.has(position),
            selectedPositions: Array.from(this.selectedPositions).map(pos => {
                const [f, s] = pos.split('-').map(Number);
                return { fret: f, string: s, note: MusicTheory.getNoteAtFret(s, f) };
            })
        });
    }

    highlightPositions(positions, className = 'target') {
        // Clear previous highlights of this class
        this.clearHighlights(className);
        
        positions.forEach(pos => {
            const element = this.getNoteElement(pos.fret, pos.string);
            if (element) {
                element.classList.add(className);
                this.highlightedPositions.set(`${pos.fret}-${pos.string}`, className);
            }
        });
    }

    clearHighlights(className = null) {
        if (className) {
            // Clear specific class
            this.highlightedPositions.forEach((cls, position) => {
                if (cls === className) {
                    const [fret, string] = position.split('-').map(Number);
                    const element = this.getNoteElement(fret, string);
                    if (element) {
                        element.classList.remove(className);
                    }
                    this.highlightedPositions.delete(position);
                }
            });
        } else {
            // Clear all highlights
            this.highlightedPositions.forEach((cls, position) => {
                const [fret, string] = position.split('-').map(Number);
                const element = this.getNoteElement(fret, string);
                if (element) {
                    element.classList.remove(cls);
                }
            });
            this.highlightedPositions.clear();
        }
    }

    clearSelections() {
        this.selectedPositions.forEach(position => {
            const [fret, string] = position.split('-').map(Number);
            const element = this.getNoteElement(fret, string);
            if (element) {
                element.classList.remove('active');
            }
        });
        this.selectedPositions.clear();
    }

    getNoteElement(fret, string) {
        return this.fretboardElement.querySelector(
            `[data-fret="${fret}"][data-string="${string}"]`
        );
    }

    setFretCount(count) {
        this.fretCount = count;
        this.render();
        this.setupEventListeners();
    }

    setShowNoteNames(show) {
        this.showNoteNames = show;
        
        // Update existing note positions
        this.fretboardElement.querySelectorAll('.note-position').forEach(element => {
            const fret = parseInt(element.dataset.fret);
            const string = parseInt(element.dataset.string);
            
            if (show) {
                const noteName = MusicTheory.getNoteAtFret(string, fret);
                element.textContent = noteName;
            } else {
                element.textContent = '';
            }
        });
    }

    setShowFretNumbers(show) {
        this.showFretNumbers = show;
        
        // Remove existing fret numbers
        this.fretboardElement.querySelectorAll('.fret-number').forEach(el => el.remove());
        
        // Add fret numbers if enabled
        if (show) {
            const fretboardHeight = 120;
            const nutWidth = 6;
            const fretboardWidth = 900;
            
            for (let fret = 0; fret <= this.fretCount; fret++) {
                const fretNumber = document.createElement('div');
                fretNumber.className = 'fret-number';
                fretNumber.textContent = fret;
                fretNumber.style.position = 'absolute';
                fretNumber.style.top = `${fretboardHeight + 5}px`;
                fretNumber.style.fontSize = '12px';
                fretNumber.style.color = '#666';
                fretNumber.style.textAlign = 'center';
                fretNumber.style.width = '20px';
                
                const fretPosition = fret === 0 ? nutWidth/2 : 
                    nutWidth + (fretboardWidth - nutWidth) * 
                    (1 - Math.pow(2, -(fret - 0.5) / 12));
                
                fretNumber.style.left = `${fretPosition - 10}px`;
                this.fretboardElement.appendChild(fretNumber);
            }
        }
    }

    getSelectedPositions() {
        return Array.from(this.selectedPositions).map(pos => {
            const [fret, string] = pos.split('-').map(Number);
            return { fret, string, note: MusicTheory.getNoteAtFret(string, fret) };
        });
    }

    animateCorrectAnswer(positions) {
        positions.forEach((pos, index) => {
            setTimeout(() => {
                const element = this.getNoteElement(pos.fret, pos.string);
                if (element) {
                    element.classList.add('correct');
                    element.style.animation = 'pulse 0.5s ease-in-out';
                }
            }, index * 200);
        });
    }

    showIncorrectFeedback(positions) {
        positions.forEach(pos => {
            const element = this.getNoteElement(pos.fret, pos.string);
            if (element) {
                element.classList.add('wrong');
                setTimeout(() => {
                    element.classList.remove('wrong');
                }, 1500);
            }
        });
    }
}