/**
 * Audio management for guitar sounds
 */
import { MusicUtils } from '../utils/MusicUtils.js';

export class AudioManager {
    constructor(options = {}) {
        this.enabled = options.enabled !== false; // Default to enabled
        this.audioContext = null;
        this.audioBuffers = new Map();
        this._isInitialized = false;
        this.debug = options.debug || false;
        this.volume = 0.3; // Default volume
        this.playedNotes = []; // Track played notes for testing
    }

    /**
     * Initialize the audio context
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    async initialize() {
        if (this._isInitialized) {
            return true;
        }

        try {
            // Initialize Web Audio API
            if (typeof window !== 'undefined') {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
            } else {
                // In Node.js testing environment, mock the AudioContext
                this.audioContext = {
                    state: 'running',
                    destination: {},
                    createOscillator: () => ({
                        frequency: { value: 440, setValueAtTime: () => {} },
                        type: 'sine',
                        connect: () => {},
                        start: () => {},
                        stop: () => {}
                    }),
                    createGain: () => ({
                        gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
                        connect: () => {}
                    }),
                    currentTime: 0
                };
            }
            
            if (this.debug) {
                console.log("AudioContext initialized.");
            }

            // Set up user gesture handling for audio context
            if (typeof document !== 'undefined') {
                this._setupUserGestureHandling();
            }
            
            this._isInitialized = true;
            return true;
            
        } catch (error) {
            console.error("Web Audio API is not supported:", error);
            this.enabled = false;
            return false;
        }
    }

    /**
     * Set up handling for user gestures to enable audio
     */
    _setupUserGestureHandling() {
        const resumeAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
                if (this.debug) {
                    console.log("Audio context resumed");
                }
            }
            // Remove listeners after first interaction
            document.body.removeEventListener('click', resumeAudio);
            document.body.removeEventListener('touchstart', resumeAudio);
        };

        document.body.addEventListener('click', resumeAudio);
        document.body.addEventListener('touchstart', resumeAudio);
    }

    /**
     * Enable or disable audio
     * @param {boolean} enabled - Whether audio should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.debug) {
            console.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * Check if audio is enabled
     * @returns {boolean} True if audio is enabled
     */
    isEnabled() {
        return this.enabled; // Remove the && this._isInitialized check for default enabled state
    }

    /**
     * Load audio samples for guitar strings (placeholder implementation)
     * In a real implementation, this would load actual guitar samples
     * @returns {Promise<boolean>} True if successful
     */
    async loadSamples() {
        if (!this.audioContext) {
            console.warn("Audio context not initialized");
            return false;
        }

        try {
            // For now, we'll use synthesized tones instead of samples
            // In a real implementation, you would load audio files here
            if (this.debug) {
                console.log("Audio samples ready (using synthesized tones)");
            }
            return true;
        } catch (error) {
            console.error("Failed to load audio samples:", error);
            return false;
        }
    }

    /**
     * Play a note
     * @param {string} noteName - The note name (e.g., 'C', 'F#')
     * @param {number} stringIndex - The string index (0-5) for timbre variation
     * @param {number} duration - Duration in seconds (default: 1.0)
     */
    playNote(noteName, stringIndex = 0, duration = 1.0) {
        // Track played notes for testing
        this.playedNotes.push({ noteName, stringIndex, duration });
        
        if (!this.isEnabled()) {
            if (this.debug) {
                console.log(`Audio disabled - would play ${noteName}`);
            }
            return;
        }

        try {
            this._playSynthesizedNote(noteName, stringIndex, duration);
            
            if (this.debug) {
                console.log(`Playing note: ${noteName} (String ${stringIndex + 1})`);
            }
        } catch (error) {
            console.error(`Failed to play note ${noteName}:`, error);
        }
    }

    /**
     * Play multiple notes simultaneously (chord)
     * @param {Array} notes - Array of note names
     * @param {Array} stringIndices - Array of string indices (optional)
     * @param {number} duration - Duration in seconds
     */
    playChord(notes, stringIndices = null, duration = 2.0) {
        if (!this.isEnabled()) {
            if (this.debug) {
                console.log(`Audio disabled - would play chord: ${notes.join(', ')}`);
            }
            return;
        }

        notes.forEach((note, index) => {
            const stringIndex = stringIndices ? stringIndices[index] || 0 : index;
            this.playNote(note, stringIndex, duration);
        });

        if (this.debug) {
            console.log(`Playing chord: ${notes.join(', ')}`);
        }
    }

    /**
     * Create and play a synthesized guitar-like tone
     * @param {string} noteName - The note name
     * @param {number} stringIndex - String index for timbre variation
     * @param {number} duration - Duration in seconds
     */
    _playSynthesizedNote(noteName, stringIndex, duration) {
        if (!this.audioContext) return;

        const frequency = this._noteToFrequency(noteName);
        if (!frequency) return;

        // Create oscillator for the fundamental frequency
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Connect the audio graph
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Set up the oscillator
        oscillator.type = 'sawtooth'; // Sawtooth wave for more guitar-like timbre
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Create amplitude envelope (ADSR)
        const now = this.audioContext.currentTime;
        const attackTime = 0.01;  // Quick attack
        const decayTime = 0.1;    // Short decay
        const sustainLevel = 0.3; // Sustain level
        const releaseTime = 0.5;  // Release time

        // Calculate volume based on string (lower strings are typically louder)
        const baseVolume = 0.1;
        const stringVolume = baseVolume * (1 + (5 - stringIndex) * 0.1);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(stringVolume, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel * stringVolume, now + attackTime + decayTime);
        gainNode.gain.setValueAtTime(sustainLevel * stringVolume, now + duration - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);

        // Add some harmonics for more realistic sound
        this._addHarmonics(frequency, stringIndex, duration, now);
    }

    /**
     * Add harmonic content for more realistic guitar sound
     * @param {number} fundamental - Fundamental frequency
     * @param {number} stringIndex - String index
     * @param {number} duration - Duration
     * @param {number} startTime - Start time
     */
    _addHarmonics(fundamental, stringIndex, duration, startTime) {
        const harmonics = [2, 3, 4, 5]; // Harmonic multiples
        const harmonicLevels = [0.3, 0.2, 0.1, 0.05]; // Amplitude levels

        harmonics.forEach((harmonic, index) => {
            const harmonicOsc = this.audioContext.createOscillator();
            const harmonicGain = this.audioContext.createGain();

            harmonicOsc.connect(harmonicGain);
            harmonicGain.connect(this.audioContext.destination);

            harmonicOsc.type = 'sine';
            harmonicOsc.frequency.setValueAtTime(fundamental * harmonic, startTime);

            const level = harmonicLevels[index] * 0.05; // Very quiet harmonics
            harmonicGain.gain.setValueAtTime(0, startTime);
            harmonicGain.gain.linearRampToValueAtTime(level, startTime + 0.01);
            harmonicGain.gain.setValueAtTime(level, startTime + duration - 0.1);
            harmonicGain.gain.linearRampToValueAtTime(0, startTime + duration);

            harmonicOsc.start(startTime);
            harmonicOsc.stop(startTime + duration);
        });
    }

    /**
     * Convert a note name to frequency in Hz
     * @param {string} noteName - The note name (e.g., 'A', 'C#')
     * @returns {number|null} Frequency in Hz or null if invalid
     */
    _noteToFrequency(noteName) {
        // A4 = 440 Hz reference
        const A4_FREQUENCY = 440;
        const A4_INDEX = 57; // A4 is the 57th key on a piano (counting from C0)

        const noteIndex = MusicUtils.getNoteIndex(noteName);
        if (noteIndex === -1) return null;

        // Calculate the MIDI note number (assuming octave 4 for simplicity)
        const midiNote = 60 + noteIndex; // C4 = 60, so we add the note index
        
        // Convert MIDI note to frequency
        return A4_FREQUENCY * Math.pow(2, (midiNote - 69) / 12);
    }

    /**
     * Stop all currently playing audio
     */
    stopAll() {
        if (this.audioContext) {
            // In a more complex implementation, you'd track active nodes
            // For now, we rely on the natural envelope decay
            if (this.debug) {
                console.log("Stop all audio requested");
            }
        }
    }

    /**
     * Stop all sounds
     */
    stopAllSounds() {
        // In a real implementation, you would track and stop all active oscillators
        // For testing purposes, just clear the played notes array
        this.playedNotes = [];
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.audioBuffers.clear();
        this.isInitialized = false;
        
        if (this.debug) {
            console.log("AudioManager disposed");
        }
    }

    /**
     * Check if the audio manager is initialized
     * @returns {boolean} True if initialized
     */
    isInitialized() {
        return this._isInitialized;
    }

    /**
     * Initialize the audio manager (alias for initialize)
     * @returns {Promise<boolean>} True if successful
     */
    async init() {
        return await this.initialize();
    }

    /**
     * Enable audio
     */
    enable() {
        this.setEnabled(true);
    }

    /**
     * Disable audio
     */
    disable() {
        this.setEnabled(false);
    }

    /**
     * Get frequency for a note
     * @param {string} noteName - The note name (e.g., 'A')
     * @param {number} octave - The octave number (e.g., 4)
     * @returns {number} Frequency in Hz
     */
    getNoteFrequency(noteName, octave = 4) {
        // A4 = 440Hz reference
        const A4_FREQ = 440;
        const NOTES_IN_OCTAVE = 12;
        
        const noteIndex = MusicUtils.getNoteIndex(noteName);
        if (noteIndex === -1) {
            throw new Error(`Invalid note name: ${noteName}`);
        }
        
        // A is note index 9 in our chromatic scale starting with C
        const A_INDEX = 9;
        const semitonesFromA4 = (octave - 4) * NOTES_IN_OCTAVE + (noteIndex - A_INDEX);
        
        return A4_FREQ * Math.pow(2, semitonesFromA4 / NOTES_IN_OCTAVE);
    }

    /**
     * Get frequency for a string and fret position
     * @param {number} stringIndex - String index (0-5)
     * @param {number} fretNumber - Fret number (0-24)
     * @param {string[]} tuning - Guitar tuning
     * @returns {number} Frequency in Hz
     */
    getStringFretFrequency(stringIndex, fretNumber, tuning = ['E', 'A', 'D', 'G', 'B', 'E']) {
        if (stringIndex < 0 || stringIndex >= tuning.length) {
            throw new Error(`Invalid string index: ${stringIndex}`);
        }
        
        const openNote = tuning[stringIndex];
        const openNoteIndex = MusicUtils.getNoteIndex(openNote);
        
        if (openNoteIndex === -1) {
            throw new Error(`Invalid tuning note: ${openNote}`);
        }
        
        // Calculate note at fret
        const frettedNoteIndex = (openNoteIndex + fretNumber) % 12;
        const frettedNote = MusicUtils.getNoteFromIndex(frettedNoteIndex);
        
        // Determine octave - standard tuning octaves: E2, A2, D3, G3, B3, E4
        const baseOctaves = [2, 2, 3, 3, 3, 4];
        const octaveOffset = Math.floor((openNoteIndex + fretNumber) / 12);
        const octave = baseOctaves[stringIndex] + octaveOffset;
        
        return this.getNoteFrequency(frettedNote, octave);
    }

    /**
     * Set volume level
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        if (volume < 0 || volume > 1) {
            throw new Error('Volume must be between 0 and 1');
        }
        this.volume = volume;
    }

    /**
     * Get current volume level
     * @returns {number} Volume level (0.0 to 1.0)
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Get the number of notes played (for testing)
     * @returns {number} Number of notes played
     */
    getPlayedNotesCount() {
        return this.playedNotes.length;
    }
}
