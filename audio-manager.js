class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.masterVolume = 0.3;
        this.noteCache = new Map();
        
        // Initialize audio context on first user interaction
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise(async (resolve) => {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create master gain node
                this.masterGain = this.audioContext.createGain();
                this.masterGain.gain.value = this.masterVolume;
                this.masterGain.connect(this.audioContext.destination);
                
                resolve();
            } catch (error) {
                console.warn('Audio initialization failed:', error);
                this.enabled = false;
                resolve();
            }
        });

        return this.initPromise;
    }

    async playNote(note, octave = 3, duration = 1000) {
        if (!this.enabled) return;
        
        try {
            await this.init();
            
            if (!this.audioContext) return;
            
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            const frequency = this.getFrequency(note, octave);
            this.synthesizeGuitarNote(frequency, duration);
            
        } catch (error) {
            console.warn('Error playing note:', error);
        }
    }

    async playChord(notes, duration = 2000) {
        if (!this.enabled || !notes.length) return;
        
        try {
            await this.init();
            
            if (!this.audioContext) return;
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Play all notes simultaneously
            notes.forEach((note, index) => {
                setTimeout(() => {
                    const frequency = this.getFrequency(note.note, note.octave || 3);
                    this.synthesizeGuitarNote(frequency, duration - (index * 50));
                }, index * 50); // Slight stagger for more realistic sound
            });
            
        } catch (error) {
            console.warn('Error playing chord:', error);
        }
    }

    synthesizeGuitarNote(frequency, duration) {
        const now = this.audioContext.currentTime;
        
        // Create multiple oscillators for richer guitar-like sound
        const oscillators = [];
        const gains = [];
        
        // Fundamental frequency
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(frequency, now);
        gain1.gain.setValueAtTime(0.4, now);
        osc1.connect(gain1);
        oscillators.push(osc1);
        gains.push(gain1);
        
        // Second harmonic (octave)
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(frequency * 2, now);
        gain2.gain.setValueAtTime(0.15, now);
        osc2.connect(gain2);
        oscillators.push(osc2);
        gains.push(gain2);
        
        // Third harmonic
        const osc3 = this.audioContext.createOscillator();
        const gain3 = this.audioContext.createGain();
        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(frequency * 3, now);
        gain3.gain.setValueAtTime(0.08, now);
        osc3.connect(gain3);
        oscillators.push(osc3);
        gains.push(gain3);
        
        // Create filter for more guitar-like tone
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.Q.setValueAtTime(1, now);
        
        // Master gain for this note
        const noteGain = this.audioContext.createGain();
        
        // Connect oscillators through filter
        gains.forEach(gain => {
            gain.connect(filter);
        });
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);
        
        // Apply envelope (ADSR)
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.6;
        const releaseTime = duration / 1000 * 0.3; // 30% of total duration for release
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.8, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.setValueAtTime(sustainLevel, now + (duration / 1000) - releaseTime);
        noteGain.gain.linearRampToValueAtTime(0, now + (duration / 1000));
        
        // Start oscillators
        oscillators.forEach(osc => {
            osc.start(now);
            osc.stop(now + (duration / 1000));
        });
    }

    getFrequency(note, octave) {
        // Convert note name to frequency using A4 = 440 Hz as reference
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = noteNames.indexOf(note);
        
        if (noteIndex === -1) {
            console.warn('Invalid note name:', note);
            return 440; // Default to A4
        }
        
        // Calculate semitones from A4
        const A4_INDEX = 9; // A is at index 9
        const A4_OCTAVE = 4;
        
        const semitones = (octave - A4_OCTAVE) * 12 + (noteIndex - A4_INDEX);
        
        // Calculate frequency using equal temperament
        return 440 * Math.pow(2, semitones / 12);
    }

    playNoteFromFretboard(string, fret) {
        const note = MusicTheory.getNoteAtFret(string, fret);
        
        // Calculate octave based on string and fret
        const baseOctaves = [2, 2, 3, 3, 3, 4]; // Standard tuning octaves
        const octave = baseOctaves[string] + Math.floor(fret / 12);
        
        this.playNote(note, octave, 800);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    // Play a sequence of notes (for chord arpeggiation)
    async playArpeggio(notes, tempo = 400) {
        if (!this.enabled || !notes.length) return;
        
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            await this.playNote(note.note, note.octave || 3, tempo * 0.8);
            
            if (i < notes.length - 1) {
                await new Promise(resolve => setTimeout(resolve, tempo));
            }
        }
    }

    // Create audio feedback for correct/incorrect answers
    playSuccessSound() {
        if (!this.enabled) return;
        
        this.playChord([
            { note: 'C', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'G', octave: 4 }
        ], 1000);
    }

    playErrorSound() {
        if (!this.enabled) return;
        
        this.playChord([
            { note: 'F', octave: 3 },
            { note: 'Ab', octave: 3 },
            { note: 'C', octave: 4 }
        ], 800);
    }

    // Cleanup
    destroy() {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}