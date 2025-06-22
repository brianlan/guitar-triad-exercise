class App {
    constructor() {
        this.fretboard = null;
        this.audioManager = null;
        this.statisticsManager = null;
        this.gameModes = null;
        
        this.currentMode = 'mode-a';
        this.isGameStarted = false;
        
        this.init();
    }

    async init() {
        // Initialize managers
        this.audioManager = new AudioManager();
        this.statisticsManager = new StatisticsManager();
        
        // Initialize fretboard
        const fretboardContainer = document.getElementById('fretboard');
        this.fretboard = new Fretboard(fretboardContainer, {
            fretCount: 12,
            showNoteNames: false,
            showFretNumbers: true,
            onNoteClick: (fret, string, note, data) => this.handleFretboardClick(fret, string, note, data)
        });
        
        // Initialize game modes
        this.gameModes = new GameModes(this.fretboard, this.audioManager, this.statisticsManager);
        this.gameModes.setCallbacks({
            onQuestionStart: (question) => this.handleQuestionStart(question),
            onQuestionEnd: (result) => this.handleQuestionEnd(result),
            onModeChange: (mode) => this.handleModeChange(mode)
        });
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI with initial stats
        this.updateStatsDisplay();
        
        console.log('Guitar Triad Practice Tool initialized');
    }

    setupEventListeners() {
        // Mode selection buttons
        document.getElementById('mode-a-btn').addEventListener('click', () => this.setMode('mode-a'));
        document.getElementById('mode-b-btn').addEventListener('click', () => this.setMode('mode-b'));
        document.getElementById('review-btn').addEventListener('click', () => this.setMode('review'));
        
        // Game control buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('replay-btn').addEventListener('click', () => this.replayAudio());
        
        // Settings controls
        document.getElementById('fret-count').addEventListener('input', (e) => this.updateFretCount(e.target.value));
        document.getElementById('audio-enabled').addEventListener('change', (e) => this.toggleAudio(e.target.checked));
        
        // Triad type checkboxes
        ['major', 'minor', 'diminished', 'augmented'].forEach(type => {
            document.getElementById(type).addEventListener('change', () => this.updateTriadSelection());
        });
        
        // Inversion checkboxes
        ['root-position', 'first-inversion', 'second-inversion'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateInversionSelection());
        });
        
        // Stats button
        document.getElementById('stats-btn').addEventListener('click', () => this.showStatsModal());
        
        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => this.hideStatsModal());
        document.getElementById('stats-modal').addEventListener('click', (e) => {
            if (e.target.id === 'stats-modal') {
                this.hideStatsModal();
            }
        });
        
        // Quiz option clicks (for Mode A)
        document.getElementById('mode-a-options').addEventListener('click', (e) => {
            if (e.target.classList.contains('quiz-option')) {
                this.handleModeAAnswer(e.target.textContent);
            }
        });
        
        // Update fret count display
        document.getElementById('fret-count').addEventListener('input', (e) => {
            document.getElementById('fret-count-display').textContent = e.target.value;
        });
    }

    setMode(mode) {
        this.currentMode = mode;
        this.gameModes.setMode(mode);
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-btn`).classList.add('active');
        
        // Reset game state
        this.resetGame();
    }

    async startGame() {
        this.isGameStarted = true;
        
        // Update button states
        document.getElementById('start-btn').disabled = true;
        document.getElementById('next-btn').disabled = false;
        document.getElementById('replay-btn').disabled = false;
        
        // Update triad and inversion settings
        this.updateTriadSelection();
        this.updateInversionSelection();
        
        // Start first question
        await this.nextQuestion();
    }

    async nextQuestion() {
        if (!this.isGameStarted) return;
        
        this.clearFeedback();
        await this.gameModes.startNewQuestion();
    }

    async replayAudio() {
        await this.gameModes.replayAudio();
    }

    resetGame() {
        this.isGameStarted = false;
        
        // Reset button states
        document.getElementById('start-btn').disabled = false;
        document.getElementById('next-btn').disabled = true;
        document.getElementById('replay-btn').disabled = true;
        
        // Clear displays
        this.clearQuestionDisplay();
        this.clearFeedback();
        this.fretboard.clearHighlights();
        this.fretboard.clearSelections();
        
        // Reset question display
        document.getElementById('question-display').innerHTML = '<p>Select your practice settings and click "Start Practice" to begin.</p>';
    }

    handleFretboardClick(fret, string, note, data) {
        // Play audio feedback
        if (this.audioManager.enabled) {
            this.audioManager.playNoteFromFretboard(string, fret);
        }
        
        // Handle Mode B selection
        if (this.currentMode === 'mode-b' && this.gameModes.isWaiting()) {
            const result = this.gameModes.handleModeBSelection(data.selectedPositions);
            if (result) {
                this.updateModeBProgress(result);
            }
        }
    }

    handleQuestionStart(question) {
        this.clearFeedback();
        
        if (question.type === 'mode-a') {
            this.displayModeAQuestion(question);
        } else if (question.type === 'mode-b') {
            this.displayModeBQuestion(question);
        }
    }

    handleQuestionEnd(result) {
        this.displayFeedback(result.isCorrect, result);
        this.updateStatsDisplay();
        
        // Auto-advance after a delay (optional)
        setTimeout(() => {
            if (this.isGameStarted) {
                this.nextQuestion();
            }
        }, 3000);
    }

    handleModeChange(mode) {
        this.currentMode = mode;
    }

    displayModeAQuestion(question) {
        // Update question display
        document.getElementById('question-display').innerHTML = 
            `<p>What chord is being played?</p>`;
        
        // Show options
        const optionsContainer = document.getElementById('mode-a-options');
        optionsContainer.innerHTML = '';
        optionsContainer.style.display = 'flex';
        
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'quiz-option';
            button.textContent = option;
            optionsContainer.appendChild(button);
        });
        
        // Hide Mode B elements
        document.getElementById('mode-b-progress').style.display = 'none';
    }

    displayModeBQuestion(question) {
        // Update question display
        const chordRole = this.getChordRole(question.shownPosition, question.triad);
        document.getElementById('question-display').innerHTML = 
            `<p>Complete the <strong>${question.chordName}</strong> chord</p>
             <p>Given: <strong>${question.shownPosition.note}</strong> (${chordRole})</p>`;
        
        // Show progress
        const progressContainer = document.getElementById('mode-b-progress');
        progressContainer.style.display = 'block';
        document.getElementById('notes-found').textContent = '0';
        document.getElementById('notes-total').textContent = question.hiddenPositions.length.toString();
        
        // Hide Mode A elements
        document.getElementById('mode-a-options').style.display = 'none';
    }

    updateModeBProgress(result) {
        document.getElementById('notes-found').textContent = result.foundCount.toString();
        
        if (result.isComplete) {
            if (result.isCorrect) {
                document.getElementById('mode-b-progress').innerHTML += 
                    '<p style="color: green; font-weight: bold;">Chord completed correctly!</p>';
            } else {
                document.getElementById('mode-b-progress').innerHTML += 
                    '<p style="color: red; font-weight: bold;">Incorrect notes selected.</p>';
            }
        }
    }

    handleModeAAnswer(selectedOption) {
        if (!this.gameModes.isWaiting()) return;
        
        // Highlight selected option
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent === selectedOption) {
                btn.classList.add('selected');
            }
        });
        
        // Process answer
        this.gameModes.handleModeAAnswer(selectedOption);
    }

    displayFeedback(isCorrect, result) {
        const feedbackContainer = document.getElementById('feedback');
        feedbackContainer.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
        
        if (isCorrect) {
            feedbackContainer.innerHTML = `
                <p><strong>Correct!</strong></p>
                <p>Time: ${(result.timeElapsed / 1000).toFixed(1)}s</p>
            `;
        } else {
            let message = '<p><strong>Incorrect.</strong></p>';
            
            if (result.question.type === 'mode-a') {
                message += `<p>Correct answer: <strong>${result.question.correctAnswer}</strong></p>`;
            } else if (result.question.type === 'mode-b') {
                message += `<p>Target chord: <strong>${result.question.chordName}</strong></p>`;
            }
            
            message += `<p>Time: ${(result.timeElapsed / 1000).toFixed(1)}s</p>`;
            feedbackContainer.innerHTML = message;
        }
        
        // Update quiz option colors for Mode A
        if (result.question.type === 'mode-a') {
            document.querySelectorAll('.quiz-option').forEach(btn => {
                if (btn.textContent === result.question.correctAnswer) {
                    btn.classList.add('correct');
                } else if (btn.textContent === result.details.selectedOption) {
                    btn.classList.add('wrong');
                }
            });
        }
    }

    clearFeedback() {
        document.getElementById('feedback').innerHTML = '';
        document.getElementById('feedback').className = 'feedback';
        
        // Clear quiz option colors
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.classList.remove('selected', 'correct', 'wrong');
        });
    }

    clearQuestionDisplay() {
        document.getElementById('mode-a-options').style.display = 'none';
        document.getElementById('mode-b-progress').style.display = 'none';
        document.getElementById('mode-a-options').innerHTML = '';
    }

    updateTriadSelection() {
        const enabledTypes = [];
        ['major', 'minor', 'diminished', 'augmented'].forEach(type => {
            if (document.getElementById(type).checked) {
                enabledTypes.push(type);
            }
        });
        
        this.gameModes.setEnabledTriadTypes(enabledTypes);
    }

    updateInversionSelection() {
        const enabledInversions = [];
        const inversionMap = {
            'root-position': 'root',
            'first-inversion': 'first',
            'second-inversion': 'second'
        };
        
        Object.entries(inversionMap).forEach(([id, inversion]) => {
            if (document.getElementById(id).checked) {
                enabledInversions.push(inversion);
            }
        });
        
        this.gameModes.setEnabledInversions(enabledInversions);
    }

    updateFretCount(count) {
        this.fretboard.setFretCount(parseInt(count));
        document.getElementById('fret-count-display').textContent = count;
    }

    toggleAudio(enabled) {
        this.audioManager.setEnabled(enabled);
    }

    updateStatsDisplay() {
        const stats = this.statisticsManager.getOverallStats();
        
        document.getElementById('accuracy-stat').textContent = stats.accuracy;
        document.getElementById('questions-stat').textContent = stats.totalQuestions;
        document.getElementById('time-stat').textContent = stats.averageTime;
    }

    showStatsModal() {
        const modal = document.getElementById('stats-modal');
        const content = document.getElementById('stats-content');
        
        // Generate detailed stats
        const overallStats = this.statisticsManager.getOverallStats();
        const sessionStats = this.statisticsManager.getSessionStats();
        const triadStats = this.statisticsManager.getTriadStats();
        const performanceOverTime = this.statisticsManager.getPerformanceOverTime();
        
        content.innerHTML = `
            <div class="stats-section">
                <h3>Overall Statistics</h3>
                <div class="stats-grid">
                    <div>Total Questions: <strong>${overallStats.totalQuestions}</strong></div>
                    <div>Accuracy: <strong>${overallStats.accuracy}</strong></div>
                    <div>Average Time: <strong>${overallStats.averageTime}</strong></div>
                    <div>Current Streak: <strong>${overallStats.currentStreak}</strong></div>
                    <div>Best Streak: <strong>${overallStats.bestStreak}</strong></div>
                    <div>Sessions: <strong>${overallStats.totalSessions}</strong></div>
                </div>
            </div>
            
            <div class="stats-section">
                <h3>Current Session</h3>
                <div class="stats-grid">
                    <div>Questions: <strong>${sessionStats.totalQuestions}</strong></div>
                    <div>Accuracy: <strong>${sessionStats.accuracy}</strong></div>
                </div>
            </div>
            
            <div class="stats-section">
                <h3>Performance by Triad Type</h3>
                <div class="triad-stats">
                    ${triadStats.slice(0, 10).map(stat => `
                        <div class="triad-stat-item">
                            <strong>${stat.triad.rootNote} ${stat.triad.triadType}</strong><br>
                            Questions: ${stat.totalQuestions}, 
                            Accuracy: ${stat.accuracy}%, 
                            Avg Time: ${stat.averageTimeSeconds}s
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    hideStatsModal() {
        document.getElementById('stats-modal').style.display = 'none';
    }

    getChordRole(position, triad) {
        const noteIndex = triad.notes.indexOf(position.note);
        const roles = ['Root', '3rd', '5th'];
        return roles[noteIndex] || 'Unknown';
    }

    // Cleanup when page unloads
    destroy() {
        if (this.statisticsManager) {
            this.statisticsManager.endSession();
        }
        if (this.audioManager) {
            this.audioManager.destroy();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.guitarApp = new App();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.guitarApp) {
        window.guitarApp.destroy();
    }
});

// Add some additional CSS styles for stats modal
const additionalStyles = `
<style>
.stats-section {
    margin-bottom: 25px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
}

.stats-section h3 {
    margin-bottom: 15px;
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 5px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
}

.stats-grid > div {
    padding: 8px;
    background: white;
    border-radius: 4px;
    border-left: 3px solid #3498db;
}

.triad-stats {
    max-height: 300px;
    overflow-y: auto;
}

.triad-stat-item {
    padding: 10px;
    margin-bottom: 8px;
    background: white;
    border-radius: 4px;
    border-left: 3px solid #27ae60;
    font-size: 0.9em;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);