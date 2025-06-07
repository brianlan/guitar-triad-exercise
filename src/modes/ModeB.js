/**
 * Mode B: Chord Completion Practice Mode
 */
import { NOTES, CSS_CLASSES, UI_CONFIG } from '../utils/Constants.js';
import { MusicUtils } from '../utils/MusicUtils.js';

export class ModeB {
    constructor(triadGenerator, fretboard, state, onResult, audioManager, options = {}) {
        this.fretboard = fretboard;
        this.triadGenerator = triadGenerator;
        this.state = state;
        this.onResult = onResult;
        this.audioManager = audioManager;
        this.debug = options.debug || false;
        
        // DOM elements
        this.nextButton = document.getElementById('mode-b-next');
        this.targetDisplay = document.querySelector('#mode-b-target span');
        this.instructionText = document.getElementById('mode-b-instruction');
        this.feedbackContainer = document.getElementById('mode-b-feedback');
        
        // Current challenge state
        this.currentChallenge = null;
        this.isActive = false;
        
        // Settings from state
        this.selectedTriadTypes = state.selectedTriadTypes;
        this.selectedInversions = state.selectedInversions;
        
        this._setupEventListeners();
    }

    /**
     * Set up event listeners for Mode B
     */
    _setupEventListeners() {
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => {
                this.startChallenge();
            });
        }
    }

    /**
     * Start the mode
     */
    start() {
        this.isActive = true;
        this.startChallenge();
    }

    /**
     * Reset the mode
     */
    reset() {
        this.isActive = false;
        this.currentChallenge = null;
        this._clearUI();
    }

    /**
     * Update the selected triad types and inversions
     */
    updateSettings() {
        this.selectedTriadTypes = this.state.selectedTriadTypes;
        this.selectedInversions = this.state.selectedInversions;
        
        if (this.debug) {
            console.log('Mode B settings updated:', {
                triadTypes: this.selectedTriadTypes,
                inversions: this.selectedInversions
            });
        }
    }

    /**
     * Start a new Mode B challenge
     * @returns {Object|null} Challenge data or null if failed
     */
    startChallenge() {
        if (this.debug) {
            console.log('Starting Mode B challenge');
        }

        this.isActive = true;
        this._clearUI();
        this.updateSettings(); // Get latest settings

        // Validate settings
        if (this.selectedTriadTypes.length === 0 || this.selectedInversions.length === 0) {
            this._showError('Please select triad types and inversions in Settings.');
            return null;
        }

        // Generate random challenge parameters
        const rootNote = MusicUtils.getRandomElement(NOTES);
        const triadType = MusicUtils.getRandomElement(this.selectedTriadTypes);
        const inversion = MusicUtils.getRandomElement(this.selectedInversions);

        // Find a voicing for the challenge
        const voicing = this.triadGenerator.findTriadVoicing(rootNote, triadType, inversion);
        
        if (!voicing || voicing.length !== 3) {
            this._showError('Could not find suitable voicing, generating new challenge...');
            // Retry with a delay
            setTimeout(() => this.startChallenge(), 100);
            return null;
        }

        // Validate the voicing has exactly 3 unique notes
        const noteNames = voicing.map(pos => this.fretboard.getNoteName(pos.string, pos.fret));
        const uniqueNotes = [...new Set(noteNames)];
        
        if (uniqueNotes.length !== 3) {
            if (this.debug) {
                console.warn(`Voicing has ${uniqueNotes.length} unique notes instead of 3, retrying...`);
            }
            setTimeout(() => this.startChallenge(), 100);
            return null;
        }

        // Choose one note to show initially
        const initialNoteIndex = Math.floor(Math.random() * voicing.length);
        const initialNote = voicing[initialNoteIndex];
        const remainingNotes = voicing.filter((_, index) => index !== initialNoteIndex);

        // Create challenge object
        this.currentChallenge = {
            rootNote,
            triadType,
            inversion,
            targetVoicing: voicing,
            initialNote,
            remainingNotes,
            notesToFind: remainingNotes.map(pos => this.fretboard.getNoteName(pos.string, pos.fret)),
            userSelectedNotes: [],
            isComplete: false,
            startTime: Date.now()
        };

        // Display the challenge
        this._displayChallenge();
        
        if (this.debug) {
            console.log('Mode B challenge created:', this.currentChallenge);
        }

        return this.currentChallenge;
    }

    /**
     * Display the current challenge
     */
    _displayChallenge() {
        if (!this.currentChallenge) return;

        const { rootNote, triadType, inversion, initialNote, notesToFind } = this.currentChallenge;

        // Update UI text
        if (this.targetDisplay) {
            this.targetDisplay.textContent = MusicUtils.formatChordName(rootNote, triadType, inversion);
        }

        if (this.instructionText) {
            this.instructionText.textContent = 
                `Complete the ${MusicUtils.formatChordName(rootNote, triadType, inversion)}. Find ${notesToFind.length} more note(s).`;
        }

        // Highlight the initial note
        this.fretboard.highlightFret(initialNote.string, initialNote.fret, CSS_CLASSES.HIGHLIGHTED);

        // Play the initial note
        if (this.audioManager.isEnabled()) {
            const noteName = this.fretboard.getNoteName(initialNote.string, initialNote.fret);
            this.audioManager.playNote(noteName, initialNote.string);
        }
    }

    /**
     * Handle fret clicks during Mode B
     * @param {Object} clickData - Data from fretboard click
     */
    _handleFretClick(clickData) {
        if (!this.isActive || !this.currentChallenge || this.currentChallenge.isComplete) {
            return;
        }

        const { stringIndex, fretIndex, noteName, element } = clickData;

        // Don't allow clicking the initial note
        if (stringIndex === this.currentChallenge.initialNote.string && 
            fretIndex === this.currentChallenge.initialNote.fret) {
            return;
        }

        // Check if this position was already selected
        const alreadySelected = this.currentChallenge.userSelectedNotes.some(note => 
            note.string === stringIndex && note.fret === fretIndex
        );

        if (alreadySelected) {
            return;
        }

        // Check if this is a correct note
        const isCorrectNote = this.currentChallenge.notesToFind.includes(noteName);

        if (isCorrectNote) {
            // Correct note clicked
            this._handleCorrectNote(stringIndex, fretIndex, noteName, element);
        } else {
            // Incorrect note clicked
            this._handleIncorrectNote(element);
        }
    }

    /**
     * Public method to handle fret clicks from main application
     * @param {number} stringIndex - String index
     * @param {number} fretIndex - Fret index
     * @param {string} noteName - Note name
     * @returns {boolean} - Whether the click was handled
     */
    handleFretClick(stringIndex, fretIndex, noteName) {
        if (!this.isActive || !this.currentChallenge || this.currentChallenge.isComplete) {
            return false;
        }

        // Don't allow clicking the initial note
        if (stringIndex === this.currentChallenge.initialNote.string && 
            fretIndex === this.currentChallenge.initialNote.fret) {
            return false;
        }

        // Check if this position was already selected
        const alreadySelected = this.currentChallenge.userSelectedNotes.some(note => 
            note.string === stringIndex && note.fret === fretIndex
        );

        if (alreadySelected) {
            return false;
        }

        // Get the fret element for visual feedback
        const element = this.fretboard.getFretElement(stringIndex, fretIndex);

        // Check if this is a correct note
        const isCorrectNote = this.currentChallenge.notesToFind.includes(noteName);

        if (isCorrectNote) {
            // Correct note clicked
            this._handleCorrectNote(stringIndex, fretIndex, noteName, element);
            return true;
        } else {
            // Incorrect note clicked
            this._handleIncorrectNote(element);
            return false;
        }
    }

    /**
     * Handle a correct note being clicked
     * @param {number} stringIndex - String index
     * @param {number} fretIndex - Fret index
     * @param {string} noteName - Note name
     * @param {HTMLElement} element - Fret element
     */
    _handleCorrectNote(stringIndex, fretIndex, noteName, element) {
        // Add to user selections
        this.currentChallenge.userSelectedNotes.push({
            string: stringIndex,
            fret: fretIndex,
            note: noteName
        });

        // Remove from notes to find
        const noteIndex = this.currentChallenge.notesToFind.indexOf(noteName);
        if (noteIndex !== -1) {
            this.currentChallenge.notesToFind.splice(noteIndex, 1);
        }

        // Highlight as correct
        this.fretboard.highlightFret(stringIndex, fretIndex, CSS_CLASSES.HIGHLIGHTED_CORRECT);

        // Play the note
        if (this.audioManager.isEnabled()) {
            this.audioManager.playNote(noteName, stringIndex);
        }

        // Check if challenge is complete
        if (this.currentChallenge.notesToFind.length === 0) {
            this._completeChallenge(true);
        } else {
            // Update instruction text
            if (this.instructionText) {
                this.instructionText.textContent = 
                    `Complete the ${MusicUtils.formatChordName(
                        this.currentChallenge.rootNote, 
                        this.currentChallenge.triadType, 
                        this.currentChallenge.inversion
                    )}. Find ${this.currentChallenge.notesToFind.length} more note(s).`;
            }
        }

        if (this.debug) {
            console.log(`Correct note clicked: ${noteName} at S${stringIndex + 1}F${fretIndex}`);
        }
    }

    /**
     * Handle an incorrect note being clicked
     * @param {HTMLElement} element - Fret element
     */
    _handleIncorrectNote(element) {
        // Show temporary incorrect feedback
        element.classList.add(CSS_CLASSES.HIGHLIGHTED_INCORRECT);
        
        setTimeout(() => {
            element.classList.remove(CSS_CLASSES.HIGHLIGHTED_INCORRECT);
        }, UI_CONFIG.HIGHLIGHT_DURATION);

        if (this.debug) {
            console.log('Incorrect note clicked');
        }
    }

    /**
     * Complete the current challenge
     * @param {boolean} success - Whether completed successfully
     */
    _completeChallenge(success) {
        this.currentChallenge.isComplete = true;
        const timeTaken = Date.now() - this.currentChallenge.startTime;

        if (success) {
            // Show all correct notes highlighted
            this.currentChallenge.targetVoicing.forEach(pos => {
                this.fretboard.highlightFret(pos.string, pos.fret, CSS_CLASSES.HIGHLIGHTED_CORRECT);
            });

            // Play the complete chord
            if (this.audioManager.isEnabled()) {
                const chordNotes = this.currentChallenge.targetVoicing.map(pos => 
                    this.fretboard.getNoteName(pos.string, pos.fret)
                );
                setTimeout(() => {
                    this.audioManager.playChord(chordNotes);
                }, 500); // Small delay for better UX
            }

            this._showFeedback('Correct! Triad complete.', 'correct');
        } else {
            this._showFeedback(
                `Challenge ended. The complete triad was: ${
                    this.currentChallenge.targetVoicing.map(pos => 
                        this.fretboard.getNoteName(pos.string, pos.fret)
                    ).join(', ')
                }.`, 
                'incorrect'
            );
        }

        // Create attempt record
        const attemptRecord = {
            mode: 'B',
            timestamp: Date.now(),
            questionType: 'completion',
            questionDetails: {
                rootNote: this.currentChallenge.rootNote,
                triadType: this.currentChallenge.triadType,
                inversion: this.currentChallenge.inversion
            },
            userAnswers: this.currentChallenge.userSelectedNotes,
            isCorrect: success,
            timeTaken,
            targetNotes: this.currentChallenge.targetVoicing,
            notesToFind: [...this.currentChallenge.notesToFind] // Copy remaining notes
        };

        // Notify completion callback
        // Notify result callback
        if (this.onResult) {
            this.onResult(attemptRecord);
        }

        // Auto-advance to next challenge
        setTimeout(() => {
            this.startChallenge();
        }, UI_CONFIG.FEEDBACK_DELAY);

        if (this.debug) {
            console.log('Mode B challenge completed:', { success, timeTaken });
        }
    }

    /**
     * Give up on the current challenge (for future implementation)
     */
    giveUp() {
        if (this.currentChallenge && !this.currentChallenge.isComplete) {
            this._completeChallenge(false);
        }
    }

    /**
     * Show feedback to the user
     * @param {string} message - Feedback message
     * @param {string} type - Feedback type ('correct', 'incorrect', 'error')
     */
    _showFeedback(message, type) {
        if (this.feedbackContainer) {
            this.feedbackContainer.textContent = message;
            this.feedbackContainer.className = `feedback ${type}`;
        }
    }

    /**
     * Show an error message
     * @param {string} message - Error message
     */
    _showError(message) {
        if (this.instructionText) {
            this.instructionText.textContent = message;
        }

        if (this.targetDisplay) {
            this.targetDisplay.textContent = '---';
        }

        if (this.feedbackContainer) {
            this.feedbackContainer.innerHTML = '';
        }
    }

    /**
     * Clear UI elements
     */
    _clearUI() {
        if (this.feedbackContainer) {
            this.feedbackContainer.innerHTML = '';
        }

        if (this.targetDisplay) {
            this.targetDisplay.textContent = '---';
        }

        if (this.instructionText) {
            this.instructionText.textContent = 'Generating...';
        }

        this.fretboard.clearHighlights();
    }

    /**
     * Stop the current mode
     */
    stop() {
        this.isActive = false;
        this.currentChallenge = null;
        this._clearUI();
        
        if (this.debug) {
            console.log('Mode B stopped');
        }
    }

    /**
     * Get the current challenge data
     * @returns {Object|null} Current challenge or null
     */
    getCurrentChallenge() {
        return this.currentChallenge;
    }

    /**
     * Check if Mode B is currently active
     * @returns {boolean} True if active
     */
    isRunning() {
        return this.isActive;
    }

    /**
     * Get progress information for the current challenge
     * @returns {Object|null} Progress info or null
     */
    getProgress() {
        if (!this.currentChallenge) return null;

        const totalNotes = this.currentChallenge.targetVoicing.length;
        const foundNotes = this.currentChallenge.userSelectedNotes.length + 1; // +1 for initial note
        
        return {
            totalNotes,
            foundNotes,
            remainingNotes: this.currentChallenge.notesToFind.length,
            percentage: Math.round((foundNotes / totalNotes) * 100)
        };
    }
}
