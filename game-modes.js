class GameModes {
    constructor(fretboard, audioManager, statisticsManager) {
        this.fretboard = fretboard;
        this.audioManager = audioManager;
        this.statisticsManager = statisticsManager;
        
        this.currentMode = 'mode-a';
        this.currentQuestion = null;
        this.questionStartTime = null;
        this.isWaitingForAnswer = false;
        
        this.enabledTriadTypes = ['major', 'minor'];
        this.enabledInversions = ['root'];
        
        this.callbacks = {
            onQuestionStart: () => {},
            onQuestionEnd: () => {},
            onModeChange: () => {}
        };
    }

    setMode(mode) {
        this.currentMode = mode;
        this.resetCurrentQuestion();
        this.callbacks.onModeChange(mode);
    }

    setEnabledTriadTypes(types) {
        this.enabledTriadTypes = types.length > 0 ? types : ['major'];
    }

    setEnabledInversions(inversions) {
        this.enabledInversions = inversions.length > 0 ? inversions : ['root'];
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    resetCurrentQuestion() {
        this.currentQuestion = null;
        this.questionStartTime = null;
        this.isWaitingForAnswer = false;
        this.fretboard.clearHighlights();
        this.fretboard.clearSelections();
    }

    async startNewQuestion() {
        this.resetCurrentQuestion();
        
        switch (this.currentMode) {
            case 'mode-a':
                await this.startModeAQuestion();
                break;
            case 'mode-b':
                await this.startModeBQuestion();
                break;
            case 'review':
                await this.startReviewQuestion();
                break;
        }
        
        this.questionStartTime = Date.now();
        this.isWaitingForAnswer = true;
        this.callbacks.onQuestionStart(this.currentQuestion);
    }

    // Mode A: Chord Identification
    async startModeAQuestion() {
        // Generate random triad
        const triad = MusicTheory.generateRandomTriad(
            this.enabledTriadTypes, 
            this.enabledInversions
        );
        
        // Find optimal shape for display
        const shapes = MusicTheory.findOptimalTriadShape(
            triad.rootNote, 
            triad.triadType, 
            triad.inversion,
            this.fretboard.fretCount
        );
        
        if (shapes.length === 0) {
            // Fallback to any positions if no optimal shape found
            const positions = MusicTheory.findTriadPositions(
                triad.rootNote, 
                triad.triadType, 
                triad.inversion,
                this.fretboard.fretCount
            ).slice(0, 3);
            
            this.currentQuestion = {
                type: 'mode-a',
                triad,
                displayPositions: positions,
                correctAnswer: MusicTheory.getChordName(triad.rootNote, triad.triadType, triad.inversion),
                options: []
            };
        } else {
            this.currentQuestion = {
                type: 'mode-a',
                triad,
                displayPositions: shapes[0].positions,
                correctAnswer: MusicTheory.getChordName(triad.rootNote, triad.triadType, triad.inversion),
                options: []
            };
        }
        
        // Generate wrong answers
        const wrongAnswers = MusicTheory.generateWrongAnswers(this.currentQuestion.correctAnswer, 3);
        this.currentQuestion.options = this.shuffleArray([
            this.currentQuestion.correctAnswer,
            ...wrongAnswers
        ]);
        
        // Highlight positions on fretboard
        this.fretboard.highlightPositions(this.currentQuestion.displayPositions, 'target');
        
        // Play chord audio
        if (this.audioManager.enabled) {
            const chordNotes = this.currentQuestion.displayPositions.map(pos => ({
                note: pos.note,
                octave: this.getOctaveForPosition(pos.string, pos.fret)
            }));
            await this.audioManager.playChord(chordNotes);
        }
    }

    // Mode B: Chord Completion
    async startModeBQuestion() {
        // Generate random triad
        const triad = MusicTheory.generateRandomTriad(
            this.enabledTriadTypes, 
            this.enabledInversions
        );
        
        // Find optimal shape
        const shapes = MusicTheory.findOptimalTriadShape(
            triad.rootNote, 
            triad.triadType, 
            triad.inversion,
            this.fretboard.fretCount
        );
        
        if (shapes.length === 0) {
            // Fallback
            await this.startModeAQuestion();
            return;
        }
        
        const targetShape = shapes[0];
        
        // Randomly select one note to show, others to complete
        const shownNoteIndex = Math.floor(Math.random() * targetShape.positions.length);
        const shownPosition = targetShape.positions[shownNoteIndex];
        const hiddenPositions = targetShape.positions.filter((_, index) => index !== shownNoteIndex);
        
        this.currentQuestion = {
            type: 'mode-b',
            triad,
            targetPositions: targetShape.positions,
            shownPosition,
            hiddenPositions,
            requiredNotes: hiddenPositions.map(pos => pos.note),
            chordName: MusicTheory.getChordName(triad.rootNote, triad.triadType, triad.inversion),
            foundNotes: new Set(),
            isComplete: false
        };
        
        // Highlight the shown position
        this.fretboard.highlightPositions([shownPosition], 'target');
        
        // Play the shown note
        if (this.audioManager.enabled) {
            this.audioManager.playNoteFromFretboard(shownPosition.string, shownPosition.fret);
        }
    }

    // Review Mode (uses spaced repetition)
    async startReviewQuestion() {
        if (this.statisticsManager) {
            const reviewItem = this.statisticsManager.getNextReviewItem();
            if (reviewItem) {
                // Use the review item to generate a targeted question
                if (Math.random() < 0.5) {
                    this.currentMode = 'mode-a';
                    await this.startModeAQuestion();
                } else {
                    this.currentMode = 'mode-b';
                    await this.startModeBQuestion();
                }
                this.currentMode = 'review'; // Reset mode
                return;
            }
        }
        
        // Fall back to random question if no review items
        if (Math.random() < 0.5) {
            await this.startModeAQuestion();
        } else {
            await this.startModeBQuestion();
        }
    }

    // Handle user answers
    handleModeAAnswer(selectedOption) {
        if (!this.isWaitingForAnswer || this.currentQuestion.type !== 'mode-a') {
            return;
        }
        
        const isCorrect = selectedOption === this.currentQuestion.correctAnswer;
        const timeElapsed = Date.now() - this.questionStartTime;
        
        this.endQuestion(isCorrect, timeElapsed, {
            selectedOption,
            correctAnswer: this.currentQuestion.correctAnswer
        });
    }

    handleModeBSelection(selectedPositions) {
        if (!this.isWaitingForAnswer || this.currentQuestion.type !== 'mode-b') {
            return;
        }
        
        const validation = MusicTheory.validateTriadCompletion(
            [...selectedPositions, this.currentQuestion.shownPosition],
            this.currentQuestion.triad
        );
        
        // Update found notes
        selectedPositions.forEach(pos => {
            if (this.currentQuestion.requiredNotes.includes(pos.note)) {
                this.currentQuestion.foundNotes.add(pos.note);
            }
        });
        
        // Check if complete
        if (validation.isComplete && validation.isCorrect) {
            const timeElapsed = Date.now() - this.questionStartTime;
            this.endQuestion(true, timeElapsed, {
                selectedPositions,
                targetPositions: this.currentQuestion.targetPositions
            });
        } else if (validation.isComplete && !validation.isCorrect) {
            // Complete but wrong
            const timeElapsed = Date.now() - this.questionStartTime;
            this.endQuestion(false, timeElapsed, {
                selectedPositions,
                targetPositions: this.currentQuestion.targetPositions,
                extraNotes: validation.extraNotes
            });
        }
        
        // Return progress info
        return {
            foundCount: this.currentQuestion.foundNotes.size,
            totalCount: this.currentQuestion.requiredNotes.length,
            isComplete: validation.isComplete,
            isCorrect: validation.isCorrect,
            missingNotes: validation.missingNotes,
            extraNotes: validation.extraNotes
        };
    }

    endQuestion(isCorrect, timeElapsed, details = {}) {
        this.isWaitingForAnswer = false;
        
        // Record statistics
        if (this.statisticsManager) {
            this.statisticsManager.recordAnswer({
                mode: this.currentQuestion.type,
                triad: this.currentQuestion.triad,
                isCorrect,
                timeElapsed,
                timestamp: Date.now(),
                details
            });
        }
        
        // Audio feedback
        if (this.audioManager.enabled) {
            if (isCorrect) {
                this.audioManager.playSuccessSound();
            } else {
                this.audioManager.playErrorSound();
            }
        }
        
        // Visual feedback
        if (isCorrect) {
            if (this.currentQuestion.type === 'mode-a') {
                this.fretboard.animateCorrectAnswer(this.currentQuestion.displayPositions);
            } else {
                this.fretboard.animateCorrectAnswer(this.currentQuestion.targetPositions);
            }
        } else {
            if (this.currentQuestion.type === 'mode-b' && details.selectedPositions) {
                this.fretboard.showIncorrectFeedback(details.selectedPositions);
            }
        }
        
        this.callbacks.onQuestionEnd({
            question: this.currentQuestion,
            isCorrect,
            timeElapsed,
            details
        });
    }

    // Utility methods
    getOctaveForPosition(string, fret) {
        const baseOctaves = [2, 2, 3, 3, 3, 4]; // Standard tuning octaves
        return baseOctaves[string] + Math.floor(fret / 12);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Replay current question audio
    async replayAudio() {
        if (!this.currentQuestion || !this.audioManager.enabled) {
            return;
        }
        
        if (this.currentQuestion.type === 'mode-a') {
            const chordNotes = this.currentQuestion.displayPositions.map(pos => ({
                note: pos.note,
                octave: this.getOctaveForPosition(pos.string, pos.fret)
            }));
            await this.audioManager.playChord(chordNotes);
        } else if (this.currentQuestion.type === 'mode-b') {
            // Play shown note and then target chord
            this.audioManager.playNoteFromFretboard(
                this.currentQuestion.shownPosition.string, 
                this.currentQuestion.shownPosition.fret
            );
            
            setTimeout(async () => {
                const chordNotes = this.currentQuestion.targetPositions.map(pos => ({
                    note: pos.note,
                    octave: this.getOctaveForPosition(pos.string, pos.fret)
                }));
                await this.audioManager.playChord(chordNotes);
            }, 1000);
        }
    }

    getCurrentQuestion() {
        return this.currentQuestion;
    }

    isWaiting() {
        return this.isWaitingForAnswer;
    }
}