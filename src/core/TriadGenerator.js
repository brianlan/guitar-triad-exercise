/**
 * Triad generation and voicing algorithms
 */
import { TRIAD_INTERVALS, FRETBOARD_CONFIG, STANDARD_TUNING, VOICING_CONSTRAINTS } from '../utils/Constants.js';
import { MusicUtils } from '../utils/MusicUtils.js';

export class TriadGenerator {
    constructor(tuning = STANDARD_TUNING, numFrets = FRETBOARD_CONFIG.DEFAULT_NUM_FRETS) {
        this.tuning = tuning;
        this.numFrets = numFrets;
        this.debug = false;
    }

    setDebug(enabled) {
        this.debug = enabled;
    }

    setTuning(tuning) {
        this.tuning = tuning;
    }

    generateTriadNotes(rootNote, triadType, inversion = 0) {
        if (!rootNote || typeof rootNote !== 'string') {
            throw new Error('Invalid root note: ' + rootNote);
        }
        
        if (!TRIAD_INTERVALS[triadType]) {
            throw new Error('Invalid triad type: ' + triadType);
        }
        
        if (inversion < 0 || inversion > 2) {
            throw new Error('Invalid inversion: ' + inversion);
        }

        const targetNotes = MusicUtils.calculateTriadNotes(rootNote, triadType);
        if (!targetNotes) {
            throw new Error('Could not calculate notes for ' + rootNote + ' ' + triadType);
        }

        const uniqueTargetNotes = [...new Set(targetNotes)];
        if (uniqueTargetNotes.length !== 3) {
            throw new Error('Triad ' + rootNote + ' ' + triadType + ' does not have 3 unique notes');
        }

        return this._getNotesInInversionOrder(uniqueTargetNotes, inversion);
    }

    findTriadVoicingsOnFretboard(rootNote, triadType, inversion = 0, tuning = STANDARD_TUNING, maxFrets = 12, maxVoicings = 3) {
        if (typeof tuning === 'number') {
            maxVoicings = tuning;
            tuning = this.tuning;
            maxFrets = this.numFrets;
        } else if (Array.isArray(tuning) && typeof maxFrets === 'number' && maxFrets < 25) {
            // Called with (rootNote, triadType, inversion, tuning, maxFrets)
        }

        const oldTuning = this.tuning;
        const oldNumFrets = this.numFrets;
        
        this.tuning = tuning;
        this.numFrets = maxFrets;
        
        const result = this.findMultipleVoicings(rootNote, triadType, inversion, maxVoicings);
        
        this.tuning = oldTuning;
        this.numFrets = oldNumFrets;
        
        return result;
    }

    /**
     * Find a single triad voicing on the fretboard, preferring the closest closed voicing
     * @param {string} rootNote - Root note (e.g., 'C', 'F#')
     * @param {string} triadType - Type of triad ('Major', 'Minor', 'Diminished', 'Augmented')
     * @param {number} inversion - Inversion (0=root, 1=1st, 2=2nd)
     * @returns {Array|null} Voicing array with {string, fret} objects, or null if not found
     */
    findTriadVoicing(rootNote, triadType, inversion = 0) {
        // Get multiple options and select the most closed voicing
        const options = this.findMultipleVoicings(rootNote, triadType, inversion, 5);
        if (!options || options.length === 0) return null;
        let best = options[0];
        let bestScore = this._calculateVoicingSpan(best);
        for (let i = 1; i < options.length; i++) {
            const span = this._calculateVoicingSpan(options[i]);
            if (span < bestScore) {
                best = options[i];
                bestScore = span;
            }
        }
        return best;
    }

    findMultipleVoicings(rootNote, triadType, inversion = 0, maxOptions = 3) {
        const voicings = [];
        const maxAttempts = 500; // Increased from 200 to find more options
        let attempts = 0;

        try {
            const targetNotes = MusicUtils.calculateTriadNotes(rootNote, triadType);
            if (!targetNotes) return [];

            const uniqueTargetNotes = [...new Set(targetNotes)];
            if (uniqueTargetNotes.length !== 3) return [];

            const notesInOrder = this._getNotesInInversionOrder(uniqueTargetNotes, inversion);

            while (voicings.length < maxOptions && attempts < maxAttempts) {
                const voicing = this._attemptToFindVoicing(notesInOrder);
                
                if (voicing && this._isValidVoicing(voicing, notesInOrder, rootNote, triadType, inversion)) {
                    const sortedVoicing = voicing.sort((a, b) => a.string - b.string);
                    if (!this._isDuplicateVoicing(sortedVoicing, voicings.map(v => v.voicing))) {
                        const score = this._scoreVoicing(sortedVoicing, rootNote, triadType, inversion);
                        voicings.push({ voicing: sortedVoicing, score: score });
                    }
                }
                attempts++;
            }
            
            // If no voicings found with strict algorithm, return empty
            // (fallback disabled to enforce strict closed voicing)
            if (voicings.length === 0) {
                return [];
            }
            
            // Sort by closeness (pitch+string span) and score, then return voicing arrays
            voicings.sort((a, b) => {
                // Calculate span metrics (lower is more closed)
                const spanA = this._calculateVoicingSpan(a.voicing);
                const spanB = this._calculateVoicingSpan(b.voicing);
                if (spanA !== spanB) return spanA - spanB;
                return b.score - a.score;
            });
            return voicings.map(v => v.voicing);
            
        } catch (error) {
            console.warn('Error finding voicings for ' + rootNote + ' ' + triadType + ':', error.message);
            // Try fallback on error
            try {
                return this._findSimpleFallbackVoicings(rootNote, triadType, inversion, maxOptions);
            } catch (fallbackError) {
                console.warn('Fallback also failed:', fallbackError.message);
            }
        }

        return [];
    }

    _findSimpleFallbackVoicings(rootNote, triadType, inversion = 0, maxOptions = 3) {
        // Simple fallback that finds basic chord shapes without strict bass note enforcement
        const targetNotes = MusicUtils.calculateTriadNotes(rootNote, triadType);
        if (!targetNotes) return [];
        
        const uniqueTargetNotes = [...new Set(targetNotes)];
        if (uniqueTargetNotes.length !== 3) return [];
        
        const rawVoicings = [];
        
        // Try to find any combination of the three notes on different strings
        for (let s1 = 0; s1 < this.tuning.length; s1++) {
            for (let f1 = 0; f1 <= this.numFrets; f1++) {
                const note1 = MusicUtils.getNoteName(s1, f1, this.tuning);
                if (!uniqueTargetNotes.includes(note1)) continue;
                
                for (let s2 = 0; s2 < this.tuning.length; s2++) {
                    if (s2 === s1) continue;
                    for (let f2 = 0; f2 <= this.numFrets && voicings.length < maxOptions; f2++) {
                        const note2 = MusicUtils.getNoteName(s2, f2, this.tuning);
                        if (!uniqueTargetNotes.includes(note2) || note2 === note1) continue;
                        
                        for (let s3 = 0; s3 < this.tuning.length; s3++) {
                            if (s3 === s1 || s3 === s2) continue;
                            for (let f3 = 0; f3 <= this.numFrets; f3++) {
                                const note3 = MusicUtils.getNoteName(s3, f3, this.tuning);
                                if (!uniqueTargetNotes.includes(note3) || note3 === note1 || note3 === note2) continue;
                                
                                const notes = [note1, note2, note3];
                                const uniqueVoicingNotes = [...new Set(notes)];
                                
                                if (uniqueVoicingNotes.length === 3 && 
                                    uniqueVoicingNotes.every(n => uniqueTargetNotes.includes(n))) {
                                    
                                    const voicing = [
                                        { string: s1, fret: f1 },
                                        { string: s2, fret: f2 },
                                        { string: s3, fret: f3 }
                                    ].sort((a, b) => a.string - b.string);

                                    // Check for reasonable fret, pitch, and string spans
                                    const frets = voicing.map(v => v.fret);
                                    const fretSpan = Math.max(...frets) - Math.min(...frets);
                                    const pitches = voicing.map(v => MusicUtils.getAbsolutePitch(v.string, v.fret));
                                    const pitchSpan = Math.max(...pitches) - Math.min(...pitches);
                                    const voicingStrings = voicing.map(v => v.string);
                                    const stringSpan = Math.max(...voicingStrings) - Math.min(...voicingStrings);

                                    if (
                                        fretSpan <= VOICING_CONSTRAINTS.MAX_FRET_SPAN &&
                                        pitchSpan <= VOICING_CONSTRAINTS.MAX_PITCH_SPAN &&
                                        stringSpan <= VOICING_CONSTRAINTS.MAX_STRING_SPAN
                                    ) {
                                        rawVoicings.push(voicing);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return voicings;
    }

    _getNotesInInversionOrder(notes, inversion) {
        return [...notes.slice(inversion), ...notes.slice(0, inversion)];
    }

    _attemptToFindVoicing(notesInOrder) {
        // For better inversion matching, try lower strings first for the bass note (first note)
        const bassNote = notesInOrder[0];
        const strings = [5, 4, 3, 2, 1, 0]; // Start with lowest strings (E, A, D, G, B, E)
        
        for (const firstNoteString of strings) {
            for (let firstNoteFret = 0; firstNoteFret <= this.numFrets; firstNoteFret++) {
                if (MusicUtils.getNoteName(firstNoteString, firstNoteFret, this.tuning) === bassNote) {
                    
                    const secondNote = notesInOrder[1];
                    // Prioritize nearby strings for closer voicings
                    const adjacentStrings = this._getNearbyStrings(firstNoteString, 3); // Within 3 strings
                    
                    for (const s2 of adjacentStrings) {
                        if (s2 === firstNoteString) continue;

                        const searchRange = VOICING_CONSTRAINTS.SEARCH_FRET_RANGE;
                        const minFret = Math.max(0, firstNoteFret - searchRange);
                        const maxFret = Math.min(this.numFrets, firstNoteFret + searchRange);

                        for (let f2 = minFret; f2 <= maxFret; f2++) {
                            if (MusicUtils.getNoteName(s2, f2, this.tuning) === secondNote) {
                                
                                const thirdNote = notesInOrder[2];
                                // Also prioritize nearby strings for the third note
                                const thirdStrings = this._getNearbyStrings(firstNoteString, 3).filter(s => s !== firstNoteString && s !== s2);
                                
                                for (const s3 of thirdStrings) {
                                    for (let f3 = minFret; f3 <= maxFret; f3++) {
                                        if (MusicUtils.getNoteName(s3, f3, this.tuning) === thirdNote) {
                                            const voicing = [
                                                { string: firstNoteString, fret: firstNoteFret },
                                                { string: s2, fret: f2 },
                                                { string: s3, fret: f3 }
                                            ];
                                            
                                            // Quick pitch and string span checks before full validation
                                            const pitches = voicing.map(v => MusicUtils.getAbsolutePitch(v.string, v.fret));
                                            const pitchSpan = Math.max(...pitches) - Math.min(...pitches);
                                            if (pitchSpan > VOICING_CONSTRAINTS.MAX_PITCH_SPAN) {
                                                continue; // Skip wide voicings early
                                            }
                                            const voicingStrings = voicing.map(v => v.string);
                                            const stringSpan = Math.max(...voicingStrings) - Math.min(...voicingStrings);
                                            if (stringSpan > VOICING_CONSTRAINTS.MAX_STRING_SPAN) {
                                                continue; // Skip voicings using non-adjacent strings
                                            }
                                            
                                            // Verify that the bass note is actually the lowest pitch
                                            const voicingWithPitches = voicing.map(v => ({
                                                ...v,
                                                pitch: MusicUtils.calculatePitch(v.string, v.fret, this.tuning),
                                                note: MusicUtils.getNoteName(v.string, v.fret, this.tuning)
                                            }));
                                            
                                            voicingWithPitches.sort((a, b) => a.pitch - b.pitch);
                                            const actualBassNote = voicingWithPitches[0].note;
                                            
                                            // Only return if the intended bass note is actually the bass
                                            if (actualBassNote === bassNote) {
                                                return voicing;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    _getNearbyStrings(centerString, maxDistance) {
        const strings = [];
        for (let i = 0; i < this.tuning.length; i++) {
            if (Math.abs(i - centerString) <= maxDistance) {
                strings.push(i);
            }
        }
        // Sort by proximity to center string
        return strings.sort((a, b) => Math.abs(a - centerString) - Math.abs(b - centerString));
    }
    /**
     * Calculate a simple span metric for voicing: pitch span weighted + string span
     * @param {Array} voicing - Array of {string, fret}
     * @returns {number} Span score (lower is more closed)
     */
    _calculateVoicingSpan(voicing) {
        const pitches = voicing.map(v => MusicUtils.getAbsolutePitch(v.string, v.fret));
        const pitchSpan = Math.max(...pitches) - Math.min(...pitches);
        const strings = voicing.map(v => v.string);
        const stringSpan = Math.max(...strings) - Math.min(...strings);
        // Weight pitchSpan heavily, stringSpan lightly
        return pitchSpan * 10 + stringSpan;
    }

    _isValidVoicing(voicing, notesInOrder, rootNote, triadType, inversion) {
        if (!voicing || voicing.length !== 3) {
            return false;
        }

        const positionStrings = voicing.map(v => 'S' + v.string + 'F' + v.fret);
        const uniquePositions = [...new Set(positionStrings)];
        if (uniquePositions.length !== 3) {
            return false;
        }

        const noteNames = voicing.map(v => MusicUtils.getNoteName(v.string, v.fret, this.tuning));
        const uniqueNotes = new Set(noteNames);

        if (uniqueNotes.size !== 3) {
            return false;
        }

        const targetNotes = MusicUtils.calculateTriadNotes(rootNote, triadType);
        if (!targetNotes.every(note => noteNames.includes(note))) {
            return false;
        }

        if (!MusicUtils.isPlayableVoicing(voicing)) {
            return false;
        }

        if (!MusicUtils.isCloseVoicing(voicing)) {
            return false;
        }
        // Enforce closed voicing string span constraint
        const voicingStrings = voicing.map(v => v.string);
        const stringSpan = Math.max(...voicingStrings) - Math.min(...voicingStrings);
        if (stringSpan > VOICING_CONSTRAINTS.MAX_STRING_SPAN) {
            return false;
        }

        return true;
    }

    /**
     * Score a voicing based on how well it matches the desired inversion
     * Higher score is better. For root position, prefer root in bass.
     */
    _scoreVoicing(voicing, rootNote, triadType, inversion) {
        let score = 1; // Base score
        
        // Get voicing with pitches to find bass note
        const voicingWithPitches = voicing.map(v => ({
            ...v,
            pitch: MusicUtils.calculatePitch(v.string, v.fret, this.tuning),
            note: MusicUtils.getNoteName(v.string, v.fret, this.tuning)
        }));
        
        // Sort by pitch (lowest first to find bass note)
        voicingWithPitches.sort((a, b) => a.pitch - b.pitch);
        const bassNote = voicingWithPitches[0].note;
        
        // Get expected bass note for this inversion
        const targetNotes = MusicUtils.calculateTriadNotes(rootNote, triadType);
        const notesInOrder = this._getNotesInInversionOrder(targetNotes, inversion);
        const expectedBassNote = notesInOrder[0];
        
        // MAJOR bonus for correct inversion bass note - this should override all other factors
        if (bassNote === expectedBassNote) {
            score += 100; // Very strong preference for correct inversion
        }
        
        // Additional scoring for root position preference (this is now secondary)
        if (inversion === 0 && bassNote === rootNote) {
            score += 2; // Extra bonus for root in bass for root position
        }
        
        return score;
    }

    _isDuplicateVoicing(newVoicing, existingVoicings) {
        return existingVoicings.some(existing => {
            return existing.every((pos, i) => 
                pos.string === newVoicing[i].string && pos.fret === newVoicing[i].fret
            );
        });
    }
}