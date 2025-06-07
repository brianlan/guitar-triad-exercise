/**
 * Guitar fretboard rendering and interaction management
 */
import { STANDARD_TUNING, FRETBOARD_CONFIG, CSS_CLASSES } from '../utils/Constants.js';
import { MusicUtils } from '../utils/MusicUtils.js';

export class GuitarFretboard {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.tuning = options.tuning || STANDARD_TUNING;
        this.numFrets = options.numFrets || FRETBOARD_CONFIG.DEFAULT_NUM_FRETS;
        this.onFretClick = options.onFretClick || (() => {});
        this.debug = options.debug || false;
        
        this.fretboardElement = null;
        this.highlightedFrets = new Set();
    }

    /**
     * Render the fretboard in the container
     */
    render() {
        if (!this.container) {
            console.error('GuitarFretboard: Cannot render - container is null');
            return;
        }
        
        if (this.debug) {
            console.log('Rendering fretboard...');
        }

        this.container.innerHTML = '';
        this.fretboardElement = this._createFretboardElement();
        this.container.appendChild(this.fretboardElement);
        
        if (this.debug) {
            console.log('Fretboard rendered successfully');
        }
    }

    /**
     * Create the main fretboard DOM element
     * @returns {HTMLElement} The fretboard element
     */
    _createFretboardElement() {
        const fretboard = document.createElement('div');
        fretboard.className = 'fretboard';

        // Create strings (rows)
        for (let stringIndex = 0; stringIndex < this.tuning.length; stringIndex++) {
            const stringDiv = this._createStringElement(stringIndex);
            fretboard.appendChild(stringDiv);
        }

        return fretboard;
    }

    /**
     * Create a string element with all its frets
     * @param {number} stringIndex - The string index (0-5)
     * @returns {HTMLElement} The string element
     */
    _createStringElement(stringIndex) {
        const stringDiv = document.createElement('div');
        stringDiv.className = 'string';

        // Create the nut (open string position)
        const nut = this._createFretElement(stringIndex, 0, true);
        stringDiv.appendChild(nut);

        // Create frets 1 through numFrets
        for (let fretIndex = 1; fretIndex <= this.numFrets; fretIndex++) {
            const fret = this._createFretElement(stringIndex, fretIndex, false);
            stringDiv.appendChild(fret);
        }

        return stringDiv;
    }

    /**
     * Create a single fret element
     * @param {number} stringIndex - The string index
     * @param {number} fretIndex - The fret index
     * @param {boolean} isNut - Whether this is the nut (open position)
     * @returns {HTMLElement} The fret element
     */
    _createFretElement(stringIndex, fretIndex, isNut = false) {
        const fret = document.createElement('div');
        fret.className = isNut ? 'fret open' : 'fret';
        
        // Add marker classes for position markers
        if (!isNut && this._isMarkerFret(fretIndex)) {
            try {
                const markerClass = this._getMarkerClass(fretIndex);
                if (markerClass) {
                    fret.classList.add(markerClass);
                }
            } catch (error) {
                console.warn('Could not add marker class:', error);
            }
        }

        // Set data attributes for identification
        fret.dataset.string = stringIndex.toString();
        fret.dataset.fret = fretIndex.toString();

        // Add click event listener
        fret.addEventListener('click', (event) => this._handleFretClick(event));

        return fret;
    }

    /**
     * Check if a fret should have a position marker
     * @param {number} fretIndex - The fret number
     * @returns {boolean} True if it should have a marker
     */
    _isMarkerFret(fretIndex) {
        return [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fretIndex);
    }

    /**
     * Get the appropriate marker CSS class for a fret
     * @param {number} fretIndex - The fret number
     * @returns {string} The CSS class name
     */
    _getMarkerClass(fretIndex) {
        const doubleMarker = CSS_CLASSES?.FRET_MARKER_DOUBLE || 'marker-double';
        const singleMarker = CSS_CLASSES?.FRET_MARKER_SINGLE || 'marker-single';
        
        return fretIndex === 12 || fretIndex === 24 ? doubleMarker : singleMarker;
    }

    /**
     * Handle fret click events
     * @param {Event} event - The click event
     */
    _handleFretClick(event) {
        const fretElement = event.target.closest('.fret');
        if (!fretElement) return;

        const stringIndex = parseInt(fretElement.dataset.string);
        const fretIndex = parseInt(fretElement.dataset.fret);
        const noteName = MusicUtils.getNoteName(stringIndex, fretIndex, this.tuning);

        if (this.debug) {
            console.log(`Fret clicked: String ${stringIndex + 1}, Fret ${fretIndex}, Note: ${noteName}`);
        }

        // Call the provided callback
        this.onFretClick({
            stringIndex,
            fretIndex,
            noteName,
            element: fretElement
        });

        // Add visual feedback for the click
        this._addClickFeedback(fretElement);
    }

    /**
     * Add visual feedback for a clicked fret
     * @param {HTMLElement} fretElement - The fret element that was clicked
     */
    _addClickFeedback(fretElement) {
        // Don't add click feedback if the fret is already highlighted
        if (fretElement.classList.contains(CSS_CLASSES.HIGHLIGHTED) ||
            fretElement.classList.contains(CSS_CLASSES.HIGHLIGHTED_CORRECT) ||
            fretElement.classList.contains(CSS_CLASSES.HIGHLIGHTED_INCORRECT)) {
            return;
        }

        fretElement.classList.add(CSS_CLASSES.CLICKED);
        setTimeout(() => {
            fretElement.classList.remove(CSS_CLASSES.CLICKED);
        }, CONSTANTS.UI.CLICK_HIGHLIGHT);
    }

    /**
     * Highlight specific frets on the fretboard
     * @param {Array} positions - Array of {string, fret} objects
     * @param {string} highlightClass - CSS class to apply
     */
    highlightFrets(positions, highlightClass = CSS_CLASSES.HIGHLIGHTED) {
        this.clearHighlights();

        positions.forEach(({ string, fret }) => {
            const fretElement = this._getFretElement(string, fret);
            if (fretElement) {
                fretElement.classList.add(highlightClass);
                this.highlightedFrets.add(`${string}-${fret}`);
                
                if (this.debug) {
                    console.log(`Highlighted fret: String ${string + 1}, Fret ${fret}`);
                }
            } else {
                console.warn(`Could not find fret element for String ${string + 1}, Fret ${fret}`);
            }
        });
    }

    /**
     * Highlight a single fret
     * @param {number} stringIndex - The string index
     * @param {number} fretIndex - The fret index
     * @param {string} highlightClass - CSS class to apply
     */
    highlightFret(stringIndex, fretIndex, highlightClass = CSS_CLASSES.HIGHLIGHTED) {
        const fretElement = this._getFretElement(stringIndex, fretIndex);
        if (fretElement) {
            fretElement.classList.add(highlightClass);
            this.highlightedFrets.add(`${stringIndex}-${fretIndex}`);
        }
    }

    /**
     * Remove highlight from a specific fret
     * @param {number} stringIndex - The string index
     * @param {number} fretIndex - The fret index
     * @param {string} highlightClass - CSS class to remove (optional)
     */
    unhighlightFret(stringIndex, fretIndex, highlightClass = null) {
        const fretElement = this._getFretElement(stringIndex, fretIndex);
        if (fretElement) {
            if (highlightClass) {
                fretElement.classList.remove(highlightClass);
            } else {
                // Remove all highlight classes
                fretElement.classList.remove(
                    CSS_CLASSES.HIGHLIGHTED,
                    CSS_CLASSES.HIGHLIGHTED_CORRECT,
                    CSS_CLASSES.HIGHLIGHTED_INCORRECT
                );
            }
            this.highlightedFrets.delete(`${stringIndex}-${fretIndex}`);
        }
    }

    /**
     * Clear all highlights from the fretboard
     */
    clearHighlights() {
        const highlightClasses = [
            CSS_CLASSES.HIGHLIGHTED,
            CSS_CLASSES.HIGHLIGHTED_CORRECT,
            CSS_CLASSES.HIGHLIGHTED_INCORRECT,
            CSS_CLASSES.CLICKED
        ];

        highlightClasses.forEach(className => {
            this.container.querySelectorAll(`.fret.${className}`).forEach(element => {
                element.classList.remove(className);
            });
        });

        this.highlightedFrets.clear();
    }

    /**
     * Get a fret element by string and fret indices
     * @param {number} stringIndex - The string index
     * @param {number} fretIndex - The fret index
     * @returns {HTMLElement|null} The fret element or null if not found
     */
    _getFretElement(stringIndex, fretIndex) {
        return this.container.querySelector(
            `.fret[data-string='${stringIndex}'][data-fret='${fretIndex}']`
        );
    }

    /**
     * Update the tuning and re-render the fretboard
     * @param {string[]} newTuning - Array of note names
     */
    setTuning(newTuning) {
        this.tuning = newTuning;
        this.render();
    }

    /**
     * Update the number of frets and re-render
     * @param {number} numFrets - Number of frets to display
     */
    setNumFrets(numFrets) {
        this.numFrets = Math.max(1, Math.min(numFrets, FRETBOARD_CONFIG.MAX_FRETS));
        this.render();
    }

    /**
     * Get the note name at a specific position
     * @param {number} stringIndex - The string index
     * @param {number} fretIndex - The fret index
     * @returns {string|null} The note name or null if invalid
     */
    getNoteName(stringIndex, fretIndex) {
        return MusicUtils.getNoteName(stringIndex, fretIndex, this.tuning);
    }

    /**
     * Find all positions on the fretboard where a specific note can be played
     * @param {string} noteName - The note to find
     * @param {number} maxFret - Maximum fret to search (optional)
     * @returns {Array} Array of {string, fret} objects
     */
    findNotePositions(noteName, maxFret = this.numFrets) {
        const positions = [];

        for (let stringIndex = 0; stringIndex < this.tuning.length; stringIndex++) {
            for (let fretIndex = 0; fretIndex <= maxFret; fretIndex++) {
                if (this.getNoteName(stringIndex, fretIndex) === noteName) {
                    positions.push({ string: stringIndex, fret: fretIndex });
                }
            }
        }

        return positions;
    }

    /**
     * Get all currently highlighted fret positions
     * @returns {Array} Array of {string, fret} objects
     */
    getHighlightedPositions() {
        return Array.from(this.highlightedFrets).map(key => {
            const [string, fret] = key.split('-').map(Number);
            return { string, fret };
        });
    }

    /**
     * Check if a specific fret is highlighted
     * @param {number} stringIndex - The string index
     * @param {number} fretIndex - The fret index
     * @returns {boolean} True if highlighted
     */
    isFretHighlighted(stringIndex, fretIndex) {
        return this.highlightedFrets.has(`${stringIndex}-${fretIndex}`);
    }

    /**
     * Get a fret element by string and fret indices (public method)
     * @param {number} stringIndex - The string index
     * @param {number} fretIndex - The fret index
     * @returns {HTMLElement|null} The fret element or null if not found
     */
    getFretElement(stringIndex, fretIndex) {
        return this._getFretElement(stringIndex, fretIndex);
    }
}
