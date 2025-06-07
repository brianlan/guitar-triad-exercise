/**
 * Mode A: Chord Identification Practice Mode
 */
import { DEFAULTS, UI_CONFIG, NOTES, TRIAD_INTERVALS } from '../utils/Constants.js';
import { MusicUtils } from '../utils/MusicUtils.js';

export class ModeA {
    constructor(triadGenerator, fretboard, state, onResult, audioManager, options = {}) {
        this.fretboard = fretboard;
        this.triadGenerator = triadGenerator;
        this.state = state;
        this.onResult = onResult;
        this.audioManager = audioManager;
        this.debug = options.debug || false;
        
        // DOM elements
        this.nextButton = document.getElementById('mode-a-next');
        this.optionsContainer = document.getElementById('mode-a-options');
        this.feedbackContainer = document.getElementById('mode-a-feedback');
        
        // Current challenge state
        this.currentChallenge = null;
        this.isActive = false;
        
        // Settings from state
        this.selectedTriadTypes = state.selectedTriadTypes;
        this.selectedInversions = state.selectedInversions;
        this.numOptions = DEFAULTS.NUM_OPTIONS;
        
        this._setupEventListeners();
    }

    /**
     * Set up event listeners for Mode A
     */
    _setupEventListeners() {
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => {
                this.startChallenge();
            });
        }
        
        if (this.optionsContainer) {
            this.optionsContainer.addEventListener('click', (event) => {
                if (event.target.tagName === 'BUTTON' && !event.target.disabled) {
                    this._handleAnswerClick(event.target.dataset.answer);
                }
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
            console.log('Mode A settings updated:', {
                triadTypes: this.selectedTriadTypes,
                inversions: this.selectedInversions
            });
        }
    }

    /**
     * Start a new Mode A challenge
     * @returns {Object|null} Challenge data or null if failed
     */
    startChallenge() {
        if (this.debug) {
            console.log('Starting Mode A challenge');
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
        
        if (!voicing) {
            this._showError('Could not find voicing, generating new challenge...');
            // Retry with a delay
            setTimeout(() => this.startChallenge(), 100);
            return null;
        }

        // Create challenge object
        this.currentChallenge = {
            rootNote,
            triadType,
            inversion,
            voicing,
            correctAnswer: MusicUtils.formatChordName(rootNote, triadType, inversion),
            startTime: Date.now(),
            options: this._generateOptions(rootNote, triadType, inversion)
        };

        // Display the challenge
        this._displayChallenge();
        
        if (this.debug) {
            console.log('Mode A challenge created:', this.currentChallenge);
        }

        return this.currentChallenge;
    }

    /**
     * Display the current challenge on the fretboard and UI
     */
    _displayChallenge() {
        if (!this.currentChallenge) return;

        // Highlight the voicing on the fretboard
        this.fretboard.highlightFrets(this.currentChallenge.voicing);

        // Display multiple choice options
        this._displayOptions();
    }

    /**
     * Generate multiple choice options for the challenge
     * @param {string} rootNote - The correct root note
     * @param {string} triadType - The correct triad type
     * @param {number} inversion - The correct inversion
     * @returns {string[]} Array of option strings
     */
    _generateOptions(rootNote, triadType, inversion) {
        const correctAnswer = MusicUtils.formatChordName(rootNote, triadType, inversion);
        const options = new Set([correctAnswer]);

        // Generate distractors
        const allRoots = NOTES;
        const allTypes = this.selectedTriadTypes.length > 0 ? this.selectedTriadTypes : Object.keys(TRIAD_INTERVALS);
        const allInversions = this.selectedInversions.length > 0 ? this.selectedInversions : [0, 1, 2];

        let attempts = 0;
        while (options.size < this.numOptions && attempts < 100) {
            const randomRoot = MusicUtils.getRandomElement(allRoots);
            const randomType = MusicUtils.getRandomElement(allTypes);
            const randomInversion = MusicUtils.getRandomElement(allInversions);

            if (randomRoot && randomType && randomInversion !== undefined) {
                const distractor = MusicUtils.formatChordName(randomRoot, randomType, randomInversion);
                if (distractor !== correctAnswer) {
                    options.add(distractor);
                }
            }
            attempts++;
        }

        // Convert to array and shuffle
        return Array.from(options).sort(() => Math.random() - 0.5);
    }

    /**
     * Display the multiple choice options in the UI
     */
    _displayOptions() {
        if (!this.optionsContainer || !this.currentChallenge) return;

        this.optionsContainer.innerHTML = '';

        this.currentChallenge.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.dataset.answer = option;
            button.className = 'option-button';
            this.optionsContainer.appendChild(button);
        });
    }

    /**
     * Handle when a user clicks an answer option
     * @param {string} selectedAnswer - The selected answer
     */
    _handleAnswerClick(selectedAnswer) {
        if (!this.currentChallenge || !this.isActive) return;

        const isCorrect = selectedAnswer === this.currentChallenge.correctAnswer;
        const timeTaken = Date.now() - this.currentChallenge.startTime;

        // Disable all option buttons
        this._disableOptions();

        // Show feedback
        this._showFeedback(isCorrect, this.currentChallenge.correctAnswer);

        // Create attempt record
        const attemptRecord = {
            mode: 'A',
            timestamp: Date.now(),
            questionType: 'identification',
            question: this.currentChallenge.correctAnswer,
            questionDetails: {
                rootNote: this.currentChallenge.rootNote,
                triadType: this.currentChallenge.triadType,
                inversion: this.currentChallenge.inversion
            },
            answer: selectedAnswer,
            isCorrect,
            timeTaken,
            notesDisplayed: this.currentChallenge.voicing
        };

        // Notify result callback
        if (this.onResult) {
            this.onResult(attemptRecord);
        }

        // Auto-advance to next challenge
        setTimeout(() => {
            this.startChallenge();
        }, UI_CONFIG.FEEDBACK_DELAY);

        if (this.debug) {
            console.log('Mode A answer submitted:', { selectedAnswer, isCorrect, timeTaken });
        }
    }

    /**
     * Replay the current chord audio
     */
    replayChord() {
        if (!this.currentChallenge || !this.audioManager.isEnabled()) return;

        const notes = this.currentChallenge.voicing.map(pos => 
            this.fretboard.getNoteName(pos.string, pos.fret)
        );
        this.audioManager.playChord(notes);

        if (this.debug) {
            console.log('Replaying chord:', notes);
        }
    }

    /**
     * Show feedback to the user
     * @param {boolean} isCorrect - Whether the answer was correct
     * @param {string} correctAnswer - The correct answer
     */
    _showFeedback(isCorrect, correctAnswer) {
        if (!this.feedbackContainer) return;

        this.feedbackContainer.textContent = isCorrect ? 
            'Correct!' : 
            `Incorrect. The correct answer is: ${correctAnswer}`;
        
        this.feedbackContainer.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    }

    /**
     * Show an error message
     * @param {string} message - The error message
     */
    _showError(message) {
        if (this.feedbackContainer) {
            this.feedbackContainer.textContent = message;
            this.feedbackContainer.className = 'feedback error';
        }

        if (this.optionsContainer) {
            this.optionsContainer.innerHTML = '';
        }
    }

    /**
     * Disable all option buttons
     */
    _disableOptions() {
        if (this.optionsContainer) {
            this.optionsContainer.querySelectorAll('button').forEach(button => {
                button.disabled = true;
            });
        }
    }

    /**
     * Clear UI elements
     */
    _clearUI() {
        if (this.feedbackContainer) {
            this.feedbackContainer.innerHTML = '';
        }

        if (this.optionsContainer) {
            this.optionsContainer.innerHTML = 'Generating...';
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
            console.log('Mode A stopped');
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
     * Check if Mode A is currently active
     * @returns {boolean} True if active
     */
    isRunning() {
        return this.isActive;
    }
}
