document.addEventListener('DOMContentLoaded', () => {
    console.log('Guitar Fretboard Triad Practice Tool Initialized');

    // --- Constants ---
    const standardTuning = ['E', 'B', 'G', 'D', 'A', 'E']; // High E (1st string) to Low E (6th string)
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // --- State Variables ---
    const triadIntervals = {
        'Major': [0, 4, 7],      // Root, Major Third (4 semitones), Perfect Fifth (7 semitones)
        'Minor': [0, 3, 7],      // Root, Minor Third (3 semitones), Perfect Fifth (7 semitones)
        'Diminished': [0, 3, 6], // Root, Minor Third (3 semitones), Diminished Fifth (6 semitones)
        'Augmented': [0, 4, 8]   // Root, Major Third (4 semitones), Augmented Fifth (8 semitones)
    };
    let currentTuning = [...standardTuning];
    let numFrets = 12;
    let selectedTriadTypes = ['Major']; // Default
    let selectedInversions = [0]; // Default to root position only
    let practiceMode = null; // e.g., 'identification', 'completion'
    let userPerformance = []; // Array to store quiz results
    let soundEnabled = true; // Default to sound on
    let audioContext; // For Web Audio API
    let audioBuffers = {}; // To store loaded audio samples {noteName: buffer}

    let currentModeAChallenge = { // State for Mode A
        rootNote: null,
        triadType: null, // Corrected typo from previous versions
        inversion: 0,
        correctAnswer: null,
        notesToHighlight: []
    };
    let currentModeBChallenge = { // State for Mode B
        rootNote: null,
        triadType: null,
        inversion: 0,
        targetNotesFull: [], // Array of {note, string, fret} for the complete triad pattern
        initialNote: { note: null, string: null, fret: null },
        notesToFind: [], // Note names the user needs to click
        userSelectedNotes: [],
        isComplete: false
    };

    // --- DOM Elements ---
    const fretboardContainer = document.getElementById('fretboard-container');
    // Settings container, practice modes, stats - assumed to be fetched as needed or already available

    // --- Core Functions ---
    function setupTriadSelection() {
        console.log('Setting up triad selection...');
        const triadCheckboxes = document.querySelectorAll('#triad-selection input[name="triad-type"]');
        const inversionCheckboxes = document.querySelectorAll('#inversion-selection input[name="inversion-type"]');

        triadCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedTriads);
        });

        inversionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedInversions);
        });

        updateSelectedTriads(); // Initial update
        updateSelectedInversions(); // Initial update
    }

    function updateSelectedTriads() {
        const checkedBoxes = document.querySelectorAll('#triad-selection input[name="triad-type"]:checked');
        selectedTriadTypes = Array.from(checkedBoxes).map(cb => cb.value);
        console.log('Updated Selected Triad Types:', selectedTriadTypes);
        if (selectedTriadTypes.length === 0) {
            console.warn("No triad types selected!");
        }
    }

    function updateSelectedInversions() {
        const checkedBoxes = document.querySelectorAll('#inversion-selection input[name="inversion-type"]:checked');
        selectedInversions = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
        console.log('Updated Selected Inversions:', selectedInversions);
        if (selectedInversions.length === 0) {
            console.warn("No inversions selected!");
            selectedInversions = [0]; // Default to root position if none selected
        }
    }

    function renderFretboard() {
        console.log('Rendering fretboard...');
        if (!fretboardContainer) return;
        fretboardContainer.innerHTML = '';

        const fretboard = document.createElement('div');
        fretboard.className = 'fretboard';

        // Issue 1: Fret numbers removed - no fret number row created

        for (let s = 0; s < currentTuning.length; s++) { // s=0 is high E, s=5 is low E
            const stringDiv = document.createElement('div');
            stringDiv.className = 'string';

            const nut = document.createElement('div');
            nut.className = 'fret open';
            nut.dataset.string = s;
            nut.dataset.fret = 0;
            nut.addEventListener('click', handleFretClick);
            stringDiv.appendChild(nut);

            for (let f = 1; f <= numFrets; f++) {
                const fret = document.createElement('div');
                fret.className = 'fret';
                if ([3, 5, 7, 9].includes(f)) fret.classList.add('marker-single');
                else if (f === 12) fret.classList.add('marker-double');
                fret.dataset.string = s;
                fret.dataset.fret = f;
                fret.addEventListener('click', handleFretClick);
                stringDiv.appendChild(fret);
            }
            fretboard.appendChild(stringDiv);
        }
        fretboardContainer.appendChild(fretboard);
    }

    function handleFretClick(event) {
        const targetElement = event.target.closest('.fret');
        if (!targetElement) return;

        const stringIndex = parseInt(targetElement.dataset.string);
        const fretIndex = parseInt(targetElement.dataset.fret);
        const clickedNoteName = getNoteName(stringIndex, fretIndex);

        playNote(stringIndex, fretIndex);
        let tempClickedFeedback = true;

        if (practiceMode === 'completion' && currentModeBChallenge && !currentModeBChallenge.isComplete && clickedNoteName) {
            if (currentModeBChallenge.initialNote && stringIndex === currentModeBChallenge.initialNote.string && fretIndex === currentModeBChallenge.initialNote.fret) {
                return; // Clicked on the initially shown note
            }

            const findIndex = currentModeBChallenge.notesToFind.indexOf(clickedNoteName);
            const alreadyFound = currentModeBChallenge.userSelectedNotes.some(n => n.string === stringIndex && n.fret === fretIndex);

            if (alreadyFound) return;

            if (findIndex !== -1) {
                currentModeBChallenge.userSelectedNotes.push({ note: clickedNoteName, string: stringIndex, fret: fretIndex });
                currentModeBChallenge.notesToFind.splice(findIndex, 1);
                targetElement.classList.remove('highlighted', 'highlighted-incorrect');
                targetElement.classList.add('highlighted-correct');
                tempClickedFeedback = false;
                if (currentModeBChallenge.notesToFind.length === 0) {
                    completeModeBChallenge(true);
                }
            } else {
                if (!targetElement.classList.contains('highlighted-correct')) {
                    targetElement.classList.add('highlighted-incorrect');
                    tempClickedFeedback = false;
                    setTimeout(() => {
                        if (!targetElement.classList.contains('highlighted-correct')) {
                            targetElement.classList.remove('highlighted-incorrect');
                        }
                    }, 600);
                }
            }
        }

        if (tempClickedFeedback && !targetElement.classList.contains('highlighted-correct') && !targetElement.classList.contains('highlighted-incorrect') && !targetElement.classList.contains('highlighted')) {
            targetElement.classList.add('clicked');
            setTimeout(() => targetElement.classList.remove('clicked'), 150);
        }
    }

    function getNoteName(stringIndex, fretIndex) {
        const openNote = currentTuning[stringIndex];
        if (!openNote) {
            console.error(`Invalid string index: ${stringIndex}`);
            return null;
        }
        const openNoteIndex = notes.indexOf(openNote.toUpperCase());
        if (openNoteIndex === -1) {
            console.error(`Invalid tuning note: ${openNote} for string index ${stringIndex}`);
            return null;
        }
        const noteIndex = (openNoteIndex + fretIndex) % notes.length;
        return notes[noteIndex];
    }

    function playNote(stringIndex, fretIndex) {
        const noteName = getNoteName(stringIndex, fretIndex);
        if (noteName && soundEnabled) {
            console.log(`Playing note: String ${stringIndex + 1}, Fret ${fretIndex} => Note: ${noteName}`);
            playAudio(noteName);
        } else if (noteName) {
            console.log(`Note clicked (sound off): String ${stringIndex + 1}, Fret ${fretIndex} => Note: ${noteName}`);
        }
    }

    function initAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            console.log("AudioContext initialized.");
            const resumeAudio = () => {
                if (audioContext.state === 'suspended') audioContext.resume();
                document.body.removeEventListener('click', resumeAudio);
                document.body.removeEventListener('touchstart', resumeAudio);
            };
            document.body.addEventListener('click', resumeAudio);
            document.body.addEventListener('touchstart', resumeAudio);
        } catch (e) {
            console.error("Web Audio API is not supported.", e);
            soundEnabled = false;
            const soundCheckbox = document.getElementById('enable-sound');
            if (soundCheckbox) soundCheckbox.disabled = true;
        }
    }

    async function loadAudioSamples() { /* Placeholder */ console.log("Audio samples not loaded."); }
    function playAudio(noteName) { /* Placeholder */ console.log(`Attempt to play audio for ${noteName} (audio not implemented).`); }

    function setupPracticeModes() {
        console.log('Setting up practice modes...');
        const modeAButton = document.getElementById('select-mode-a');
        const modeBButton = document.getElementById('select-mode-b');
        const modeANextButton = document.getElementById('mode-a-next');
        const modeBNextButton = document.getElementById('mode-b-next');
        const modeAContent = document.getElementById('mode-a');
        const modeBContent = document.getElementById('mode-b');
        const modeAOptionsContainer = document.getElementById('mode-a-options');

        if (modeAButton) modeAButton.addEventListener('click', () => {
            practiceMode = 'identification';
            if(modeAContent) modeAContent.style.display = 'block';
            if(modeBContent) modeBContent.style.display = 'none';
            startModeA();
        });
        if (modeBButton) modeBButton.addEventListener('click', () => {
            practiceMode = 'completion';
            if(modeAContent) modeAContent.style.display = 'none';
            if(modeBContent) modeBContent.style.display = 'block';
            startModeB();
        });
        if (modeANextButton) modeANextButton.addEventListener('click', startModeA);
        if (modeBNextButton) modeBNextButton.addEventListener('click', startModeB);
        else console.error("Mode B Next button ('mode-b-next') not found!");

        if (modeAOptionsContainer) modeAOptionsContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && practiceMode === 'identification' && !event.target.disabled) {
                checkModeAAnswer(event.target.dataset.answer);
            }
        });
    }

    function formatChordName(root, type, inversion) {
        let name = root;
        if (type) name += ` ${type}`;
        if (inversion === 1) name += ' (1st Inv)';
        else if (inversion === 2) name += ' (2nd Inv)';
        return name;
    }

    function generateModeAOptions(correctAnswer, numOptions = 4) {
        const optionsContainer = document.getElementById('mode-a-options');
        if (!optionsContainer) return;
        optionsContainer.innerHTML = '';

        const options = new Set([correctAnswer]);
        const allPossibleRoots = notes;
        const possibleTypes = selectedTriadTypes.length > 0 ? selectedTriadTypes : Object.keys(triadIntervals);
        const possibleInversions = selectedInversions.length > 0 ? selectedInversions : [0];

        if (possibleTypes.length === 0) {
            optionsContainer.textContent = "Error: No triad types for options.";
            return;
        }

        let attempts = 0;
        while (options.size < numOptions && attempts < 100) {
            const randomRootOpt = getRandomElement(allPossibleRoots);
            const randomTypeOpt = getRandomElement(possibleTypes);
            const randomInversionOpt = getRandomElement(possibleInversions);
            if (!randomRootOpt || !randomTypeOpt || randomInversionOpt === undefined) { attempts++; continue; }
            const distractor = formatChordName(randomRootOpt, randomTypeOpt, randomInversionOpt);
            if (distractor !== correctAnswer) options.add(distractor);
            attempts++;
        }

        if (options.size < numOptions) { /* Fill with more if needed */ }

        const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.dataset.answer = option;
            optionsContainer.appendChild(button);
        });
    }

    function checkModeAAnswer(selectedAnswer) {
        const feedbackContainer = document.getElementById('mode-a-feedback');
        if (!feedbackContainer) return;
        const correct = selectedAnswer === currentModeAChallenge.correctAnswer;

        feedbackContainer.textContent = correct ? 'Correct!' : `Incorrect. Answer: ${currentModeAChallenge.correctAnswer}.`;
        feedbackContainer.className = `feedback ${correct ? 'correct' : 'incorrect'}`;
        document.querySelectorAll('#mode-a-options button').forEach(b => b.disabled = true);
        recordQuizAttempt({ mode: 'A', question: currentModeAChallenge.correctAnswer, answer: selectedAnswer, isCorrect: correct });

        // Issue 2: Automatically show the next chord after a delay
        setTimeout(() => {
            startModeA();
        }, 1500); // 1.5 second delay before loading next chord
    }

    function startModeA() {
        practiceMode = 'identification';
        console.log('Starting Mode A');
        console.log('Current selectedTriadTypes:', selectedTriadTypes);
        console.log('Current selectedInversions:', selectedInversions);
        clearHighlights();
        const optionsContainer = document.getElementById('mode-a-options');
        const feedbackContainer = document.getElementById('mode-a-feedback');

        if (optionsContainer) optionsContainer.innerHTML = 'Generating...';
        if (feedbackContainer) feedbackContainer.innerHTML = '';
        document.querySelectorAll('#mode-a-options button').forEach(b => b.disabled = false);

        if (selectedTriadTypes.length === 0 || selectedInversions.length === 0) {
            if (feedbackContainer) feedbackContainer.textContent = 'Select triad types and inversions in Settings.';
            if (optionsContainer) optionsContainer.innerHTML = '';
            return;
        }

        const randomRoot = getRandomElement(notes);
        const randomType = getRandomElement(selectedTriadTypes);
        const randomInversion = getRandomElement(selectedInversions);
        if (!randomRoot || !randomType || randomInversion === undefined) {
            if (feedbackContainer) feedbackContainer.textContent = 'Error generating chord.';
            if (optionsContainer) optionsContainer.innerHTML = '';
            return;
        }
        const notesToDisplay = findTriadVoicingOnFretboard(randomRoot, randomType, randomInversion);

        if (!notesToDisplay) {
            if (feedbackContainer) feedbackContainer.textContent = 'Error finding voicing, retrying...';
            if (optionsContainer) optionsContainer.innerHTML = '';
            setTimeout(startModeA, 100);
            return;
        }

        currentModeAChallenge = { rootNote: randomRoot, triadType: randomType, inversion: randomInversion, correctAnswer: formatChordName(randomRoot, randomType, randomInversion), notesToHighlight: notesToDisplay };
        highlightNotes(notesToDisplay);
        generateModeAOptions(currentModeAChallenge.correctAnswer);
    }

    function startModeB() {
        practiceMode = 'completion';
        console.log('Starting Mode B');
        console.log('Current selectedTriadTypes:', selectedTriadTypes);
        console.log('Current selectedInversions:', selectedInversions);
        clearHighlights();
        document.querySelectorAll('.fret.highlighted-correct, .fret.highlighted-incorrect').forEach(f => {
            f.classList.remove('highlighted-correct', 'highlighted-incorrect');
        });

        const feedbackContainer = document.getElementById('mode-b-feedback');
        const targetDisplay = document.querySelector('#mode-b-target span');
        const instructionText = document.getElementById('mode-b-instruction');

        if (feedbackContainer) feedbackContainer.innerHTML = '';
        if (targetDisplay) targetDisplay.textContent = '---';
        if (instructionText) instructionText.textContent = 'Generating...';

        if (selectedTriadTypes.length === 0 || selectedInversions.length === 0) {
            if (instructionText) instructionText.textContent = 'Select triad types and inversions in Settings.';
            return;
        }

        const randomRoot = getRandomElement(notes);
        const randomType = getRandomElement(selectedTriadTypes);
        const randomInversion = getRandomElement(selectedInversions);
        if (!randomRoot || !randomType || randomInversion === undefined) {
            if (instructionText) instructionText.textContent = 'Error generating chord for Mode B.';
            console.error("Mode B: Could not get randomRoot, randomType, or randomInversion");
            return;
        }
        const triadVoicing = findTriadVoicingOnFretboard(randomRoot, randomType, randomInversion);

        // Issue 3: Ensure triadVoicing has 3 notes with 3 unique note names
        if (!triadVoicing || triadVoicing.length !== 3) {
            if (instructionText) instructionText.textContent = 'Finding pattern... (retry)';
            console.warn(`Retrying Mode B: findTriadVoicingOnFretboard returned ${triadVoicing ? triadVoicing.length : 'null'} notes for ${randomRoot} ${randomType} Inv ${randomInversion}.`);
            setTimeout(startModeB, 100); // Retry
            return;
        }

        // At this point, triadVoicing is guaranteed to have 3 elements with 3 unique note names
        const fullTriadPattern = triadVoicing.map(pos => ({ ...pos, note: getNoteName(pos.string, pos.fret) }));


        const notesInPatternCopy = [...fullTriadPattern];
        const initialNoteIndex = Math.floor(Math.random() * notesInPatternCopy.length);
        const initialNoteToShow = notesInPatternCopy.splice(initialNoteIndex, 1)[0];

        currentModeBChallenge = {
            rootNote: randomRoot, triadType: randomType, inversion: randomInversion,
            targetNotesFull: fullTriadPattern,
            initialNote: initialNoteToShow,
            notesToFind: notesInPatternCopy.map(n => n.note),
            userSelectedNotes: [],
            isComplete: false
        };

        if (targetDisplay) targetDisplay.textContent = formatChordName(randomRoot, randomType, randomInversion);
        if (instructionText) instructionText.textContent = `Complete the ${formatChordName(randomRoot, randomType, randomInversion)}. Find ${currentModeBChallenge.notesToFind.length} more note(s).`;
        
        // Use querySelector with template literals correctly for attribute values
        const initialFretElement = document.querySelector(`.fret[data-string='${initialNoteToShow.string}'][data-fret='${initialNoteToShow.fret}']`);
        if (initialFretElement) {
            initialFretElement.classList.add('highlighted');
        } else {
            console.error("Could not find initial fret element for Mode B:", initialNoteToShow);
        }
    }

    function completeModeBChallenge(success) {
        currentModeBChallenge.isComplete = true;
        const feedbackContainer = document.getElementById('mode-b-feedback');
        if (!feedbackContainer) return;

        if (success) {
            feedbackContainer.textContent = 'Correct! Triad complete.';
            feedbackContainer.className = 'feedback correct';
            currentModeBChallenge.targetNotesFull.forEach(notePos => {
                const fretEl = document.querySelector(`.fret[data-string='${notePos.string}'][data-fret='${notePos.fret}']`);
                if (fretEl) {
                    fretEl.classList.remove('highlighted');
                    fretEl.classList.add('highlighted-correct');
                }
            });
        } else {
            feedbackContainer.textContent = `Challenge ended. Triad: ${currentModeBChallenge.targetNotesFull.map(n => n.note).join(', ')}.`;
            feedbackContainer.className = 'feedback incorrect';
            // Optionally show all correct notes if ended due to failure/give up
        }
        recordQuizAttempt({ mode: 'B', questionDetails: {root: currentModeBChallenge.rootNote, type: currentModeBChallenge.triadType}, userAnswers: currentModeBChallenge.userSelectedNotes, isCorrect: success });
    }

    function clearHighlights() {
        document.querySelectorAll('.fret.highlighted, .fret.highlighted-correct, .fret.highlighted-incorrect, .fret.clicked').forEach(el => {
            el.classList.remove('highlighted', 'highlighted-correct', 'highlighted-incorrect', 'clicked');
        });
    }

    function highlightNotes(notesToHighlight) {
        clearHighlights();
        notesToHighlight.forEach(({ string, fret }) => {
            const fretElement = document.querySelector(`.fret[data-string='${string}'][data-fret='${fret}']`);
            if (fretElement) fretElement.classList.add('highlighted');
        });
    }

    function getRandomElement(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getNoteIndex(noteName) { return notes.indexOf(noteName.toUpperCase()); }
    function getNoteFromIndex(index) { return notes[index % notes.length]; }

    // Calculate absolute pitch for proper close voicing validation
    // Standard guitar tuning pitches (in semitones from C0): E4, B3, G3, D3, A2, E2
    function getAbsolutePitch(stringIndex, fretIndex) {
        // Define the absolute pitch of each open string in semitones from C0
        // Standard tuning: E4(64), B3(59), G3(55), D3(50), A2(45), E2(40)
        const openStringPitches = [64, 59, 55, 50, 45, 40]; // High E to Low E
        return openStringPitches[stringIndex] + fretIndex;
    }

    function calculateTriadNotes(rootNote, triadType) {
        const rootIndex = getNoteIndex(rootNote);
        if (rootIndex === -1) return null;
        const intervals = triadIntervals[triadType];
        if (!intervals) return null;
        return intervals.map(interval => getNoteFromIndex(rootIndex + interval));
    }

    function findTriadVoicingOnFretboard(rootNote, triadType, inversion = 0) {
        const targetNotes = calculateTriadNotes(rootNote, triadType);
        if (!targetNotes) return null;
        
        // Ensure we have exactly 3 unique notes for the triad
        const uniqueTargetNotes = [...new Set(targetNotes)];
        if (uniqueTargetNotes.length !== 3) {
            console.warn(`Triad ${rootNote} ${triadType} doesn't have 3 unique notes:`, targetNotes);
            return null;
        }
        
        const notesInOrder = [...uniqueTargetNotes.slice(inversion), ...uniqueTargetNotes.slice(0, inversion)];
        const maxAttemptsOuter = 100;

        for (let outerAttempt = 0; outerAttempt < maxAttemptsOuter; outerAttempt++) {
            const firstNoteString = Math.floor(Math.random() * (currentTuning.length - 2));
            const firstNote = notesInOrder[0];

            for (let firstNoteFret = 0; firstNoteFret <= numFrets - 4; firstNoteFret++) {
                if (getNoteName(firstNoteString, firstNoteFret) === firstNote) {
                    // Find second note - must be different note name and on different string
                    const secondNote = notesInOrder[1];
                    
                    for (let s2 = 0; s2 < currentTuning.length; s2++) {
                        if (s2 === firstNoteString) continue; // Different string
                        for (let f2 = Math.max(0, firstNoteFret - 3); f2 <= Math.min(numFrets, firstNoteFret + 5); f2++) {
                            if (getNoteName(s2, f2) === secondNote) {
                                // Find third note - must be different from both previous notes and on different string
                                const thirdNote = notesInOrder[2];
                                
                                for (let s3 = 0; s3 < currentTuning.length; s3++) {
                                    if (s3 === firstNoteString || s3 === s2) continue; // Different strings
                                    for (let f3 = Math.max(0, firstNoteFret - 3); f3 <= Math.min(numFrets, firstNoteFret + 5); f3++) {
                                        if (getNoteName(s3, f3) === thirdNote) {
                                            const finalVoicing = [
                                                { string: firstNoteString, fret: firstNoteFret },
                                                { string: s2, fret: f2 },
                                                { string: s3, fret: f3 }
                                            ];
                                            
                                            // Verify we have exactly the 3 notes we want
                                            const noteNames = finalVoicing.map(v => getNoteName(v.string, v.fret));
                                            const uniqueNotes = new Set(noteNames);
                                            const frets = finalVoicing.map(v => v.fret);
                                            const fretSpan = Math.max(...frets) - Math.min(...frets);
                                            
                                            // Check for close voicing: interval between lowest and highest note < 12 semitones
                                            // Calculate actual pitches more accurately with proper octave handling
                                            const pitches = finalVoicing.map(v => {
                                                // Calculate absolute pitch considering guitar tuning and octaves
                                                return getAbsolutePitch(v.string, v.fret);
                                            });
                                            const pitchSpan = Math.max(...pitches) - Math.min(...pitches);
                                            
                                            // Must have exactly 3 unique notes, match our target triad, be playable, and be close voicing
                                            if (uniqueNotes.size === 3 && 
                                                noteNames.every(note => uniqueTargetNotes.includes(note)) &&
                                                uniqueTargetNotes.every(note => noteNames.includes(note)) &&
                                                fretSpan <= 4 &&
                                                pitchSpan < 12) { // Close voicing: less than one octave
                                                console.log(`Found valid close voicing for ${rootNote} ${triadType} Inv ${inversion}: ${noteNames.join(', ')} (pitch span: ${pitchSpan} semitones)`);
                                                return finalVoicing.sort((a, b) => a.string - b.string);
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
        console.warn(`Could not find a close voicing for ${rootNote} ${triadType} Inv ${inversion} after ${maxAttemptsOuter} attempts.`);
        return null;
    }

    function recordQuizAttempt(attempt) {
        userPerformance.push(attempt);
        console.log('Quiz Attempt Recorded:', attempt, 'Total Attempts:', userPerformance.length);
        // TODO: Update stats display (Section 3.1)
    }

    // --- Initialization ---
    initAudioContext();
    // await loadAudioSamples(); // If using actual audio files
    renderFretboard();
    setupTriadSelection();
    setupPracticeModes();

    // Expose functions for debugging or potential external calls if needed
    // window.guitarTool = { startModeA, startModeB, getNoteName, currentTuning };
});