class GuitarFretboard {
    constructor(containerId, numFrets = 12) {
        this.container = document.getElementById(containerId);
        this.numFrets = numFrets;
        this.strings = ['E', 'B', 'G', 'D', 'A', 'E'];
        this.fretboardWidth = 1000;
        this.fretboardHeight = 250;
        this.init();
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
}

document.addEventListener('DOMContentLoaded', () => {
    new GuitarFretboard('fretboard');
});