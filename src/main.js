/**
 * Main Application Entry Point
 * Integrates all modular components for the Guitar Fretboard Triad Practice Tool
 */

import { AudioManager } from './core/AudioManager.js';
import { GuitarFretboard } from './core/GuitarFretboard.js';
import { TriadGenerator } from './core/TriadGenerator.js';
import { ModeA } from './modes/ModeA.js';
import { ModeB } from './modes/ModeB.js';
import { Statistics } from './utils/Statistics.js';
import { Storage } from './utils/Storage.js';
import { STANDARD_TUNING, TRIAD_INTERVALS } from './utils/Constants.js';

class GuitarTriadApp {
    constructor() {
        this.audioManager = new AudioManager();
        this.triadGenerator = new TriadGenerator();
        this.statistics = new Statistics();
        this.storage = new Storage();
        
        // Initialize state from storage or defaults
        this.state = {
            currentTuning: [...STANDARD_TUNING],
            numFrets: 12,
            selectedTriadTypes: this.storage.get('selectedTriadTypes', ['Major']),
            selectedInversions: this.storage.get('selectedInversions', [0]),
            soundEnabled: this.storage.get('soundEnabled', true),
            practiceMode: null
        };
        
        this.fretboard = null; // Will be initialized in init()
        this.modeA = null;
        this.modeB = null;
        
        this.init();
    }
    
    async init() {
        console.log('Guitar Fretboard Triad Practice Tool Initialized');
        
        // Initialize fretboard after DOM is ready
        const fretboardContainer = document.getElementById('fretboard-container');
        console.log('Fretboard container:', fretboardContainer);
        
        if (!fretboardContainer) {
            console.error('Fretboard container not found!');
            return;
        }
        
        this.fretboard = new GuitarFretboard(
            fretboardContainer,
            {
                tuning: this.state.currentTuning,
                numFrets: this.state.numFrets,
                onFretClick: this.handleFretClick.bind(this)
            }
        );
        
        // Initialize audio if enabled
        if (this.state.soundEnabled) {
            await this.audioManager.init();
        }
        
        // Setup UI event listeners
        this.setupTriadSelection();
        this.setupPracticeModes();
        this.setupSettings();
        this.setupStatistics();
        
        // Render initial fretboard
        if (this.fretboard) {
            this.fretboard.render();
        }
        
        // Load and display statistics
        this.updateStatisticsDisplay();
    }
    
    setupTriadSelection() {
        const triadCheckboxes = document.querySelectorAll('#triad-selection input[name="triad-type"]');
        const inversionCheckboxes = document.querySelectorAll('#inversion-selection input[name="inversion-type"]');
        
        // Set initial states from storage
        triadCheckboxes.forEach(checkbox => {
            checkbox.checked = this.state.selectedTriadTypes.includes(checkbox.value);
            checkbox.addEventListener('change', () => this.updateSelectedTriads());
        });
        
        inversionCheckboxes.forEach(checkbox => {
            checkbox.checked = this.state.selectedInversions.includes(parseInt(checkbox.value));
            checkbox.addEventListener('change', () => this.updateSelectedInversions());
        });
    }
    
    updateSelectedTriads() {
        const checkedBoxes = document.querySelectorAll('#triad-selection input[name="triad-type"]:checked');
        this.state.selectedTriadTypes = Array.from(checkedBoxes).map(cb => cb.value);
        
        // Ensure at least one triad type is selected
        if (this.state.selectedTriadTypes.length === 0) {
            this.state.selectedTriadTypes = ['Major'];
            document.querySelector('#triad-selection input[value="Major"]').checked = true;
        }
        
        this.storage.set('selectedTriadTypes', this.state.selectedTriadTypes);
        console.log('Selected triad types:', this.state.selectedTriadTypes);
    }
    
    updateSelectedInversions() {
        const checkedBoxes = document.querySelectorAll('#inversion-selection input[name="inversion-type"]:checked');
        this.state.selectedInversions = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
        
        // Ensure at least one inversion is selected
        if (this.state.selectedInversions.length === 0) {
            this.state.selectedInversions = [0];
            document.querySelector('#inversion-selection input[value="0"]').checked = true;
        }
        
        this.storage.set('selectedInversions', this.state.selectedInversions);
        console.log('Selected inversions updated:', this.state.selectedInversions);
        
        // Update mode instances
        if (this.modeA) this.modeA.updateSettings();
        if (this.modeB) this.modeB.updateSettings();
    }
    
    setupPracticeModes() {
        const modeAButton = document.getElementById('select-mode-a');
        const modeBButton = document.getElementById('select-mode-b');
        const modeAContent = document.getElementById('mode-a');
        const modeBContent = document.getElementById('mode-b');
        
        if (modeAButton) {
            modeAButton.addEventListener('click', () => {
                this.selectPracticeMode('identification');
                modeAContent.style.display = 'block';
                modeBContent.style.display = 'none';
                this.initModeA();
            });
        }
        
        if (modeBButton) {
            modeBButton.addEventListener('click', () => {
                this.selectPracticeMode('completion');
                modeBContent.style.display = 'block';
                modeAContent.style.display = 'none';
                this.initModeB();
            });
        }
    }
    
    selectPracticeMode(mode) {
        this.state.practiceMode = mode;
        console.log(`Practice mode selected: ${mode}`);
        
        // Clear any existing highlights
        if (this.fretboard) {
            this.fretboard.clearHighlights();
        }
        
        // Reset mode states
        if (this.modeA) this.modeA.reset();
        if (this.modeB) this.modeB.reset();
    }
    
    initModeA() {
        if (!this.modeA && this.fretboard) {
            this.modeA = new ModeA(
                this.triadGenerator,
                this.fretboard,
                this.state,
                this.onModeAResult.bind(this),
                this.audioManager
            );
        }
        if (this.modeA) {
            this.modeA.start();
        }
    }
    
    initModeB() {
        if (!this.modeB && this.fretboard) {
            this.modeB = new ModeB(
                this.triadGenerator,
                this.fretboard,
                this.state,
                this.onModeBResult.bind(this),
                this.audioManager
            );
        }
        if (this.modeB) {
            this.modeB.start();
        }
    }
    
    setupSettings() {
        const soundCheckbox = document.getElementById('enable-sound');
        if (soundCheckbox) {
            soundCheckbox.checked = this.state.soundEnabled;
            soundCheckbox.addEventListener('change', async (e) => {
                this.state.soundEnabled = e.target.checked;
                this.storage.set('soundEnabled', this.state.soundEnabled);
                
                if (this.state.soundEnabled && !this.audioManager.isInitialized()) {
                    await this.audioManager.init();
                } else if (!this.state.soundEnabled) {
                    this.audioManager.stop();
                }
            });
        }
        
        // Add other settings as needed (tuning, fret count, etc.)
        this.setupTuningControls();
        this.setupFretCountControls();
    }
    
    setupTuningControls() {
        // Implementation for custom tuning controls
        // This would allow users to modify the tuning
        console.log('Tuning controls setup - placeholder for future implementation');
    }
    
    setupFretCountControls() {
        // Implementation for fret count controls
        const fretCountSelect = document.getElementById('fret-count');
        if (fretCountSelect) {
            fretCountSelect.value = this.state.numFrets;
            fretCountSelect.addEventListener('change', (e) => {
                this.state.numFrets = parseInt(e.target.value);
                if (this.fretboard) {
                    this.fretboard.setNumFrets(this.state.numFrets);
                }
                this.storage.set('numFrets', this.state.numFrets);
            });
        }
    }
    
    setupStatistics() {
        const resetStatsButton = document.getElementById('reset-stats');
        if (resetStatsButton) {
            resetStatsButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all statistics?')) {
                    this.statistics.reset();
                    this.updateStatisticsDisplay();
                }
            });
        }
        
        const exportStatsButton = document.getElementById('export-stats');
        if (exportStatsButton) {
            exportStatsButton.addEventListener('click', () => {
                this.exportStatistics();
            });
        }
    }
    
    handleFretClick(clickData) {
        const { stringIndex, fretIndex, noteName } = clickData;
        
        // Play sound if enabled
        if (this.state.soundEnabled) {
            this.audioManager.playNote(noteName, stringIndex, fretIndex);
        }
        
        // Delegate to active mode
        if (this.state.practiceMode === 'identification' && this.modeA) {
            // Mode A doesn't handle fret clicks directly
            return;
        } else if (this.state.practiceMode === 'completion' && this.modeB) {
            return this.modeB.handleFretClick(stringIndex, fretIndex, noteName);
        }
        
        return false; // No specific handling
    }
    
    onModeAResult(result) {
        // Handle Mode A completion
        this.statistics.addResult('identification', result);
        this.updateStatisticsDisplay();
        console.log('Mode A result:', result);
    }
    
    onModeBResult(result) {
        // Handle Mode B completion
        this.statistics.addResult('completion', result);
        this.updateStatisticsDisplay();
        console.log('Mode B result:', result);
    }
    
    updateStatisticsDisplay() {
        const stats = this.statistics.getStats();
        
        // Update overall stats
        const totalElement = document.getElementById('stats-total');
        const correctElement = document.getElementById('stats-correct');
        const accuracyElement = document.getElementById('stats-accuracy');
        const avgTimeElement = document.getElementById('stats-avg-time');
        
        if (totalElement) totalElement.textContent = stats.total;
        if (correctElement) correctElement.textContent = stats.correct;
        if (accuracyElement) accuracyElement.textContent = `${stats.accuracy}%`;
        if (avgTimeElement) avgTimeElement.textContent = `${stats.averageTime}s`;
        
        // Update mode-specific stats
        this.updateModeStats('identification', stats.identification);
        this.updateModeStats('completion', stats.completion);
    }
    
    updateModeStats(mode, modeStats) {
        const prefix = mode === 'identification' ? 'mode-a' : 'mode-b';
        
        const totalElement = document.getElementById(`${prefix}-stats-total`);
        const correctElement = document.getElementById(`${prefix}-stats-correct`);
        const accuracyElement = document.getElementById(`${prefix}-stats-accuracy`);
        const avgTimeElement = document.getElementById(`${prefix}-stats-avg-time`);
        
        if (totalElement) totalElement.textContent = modeStats.total;
        if (correctElement) correctElement.textContent = modeStats.correct;
        if (accuracyElement) accuracyElement.textContent = `${modeStats.accuracy}%`;
        if (avgTimeElement) avgTimeElement.textContent = `${modeStats.averageTime}s`;
    }
    
    exportStatistics() {
        const stats = this.statistics.getStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `guitar-triad-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Public API methods
    getCurrentState() {
        return { ...this.state };
    }
    
    updateTuning(newTuning) {
        this.state.currentTuning = [...newTuning];
        if (this.fretboard) {
            this.fretboard.setTuning(this.state.currentTuning);
        }
        this.storage.set('currentTuning', this.state.currentTuning);
    }
    
    resetToDefaults() {
        this.state = {
            currentTuning: [...STANDARD_TUNING],
            numFrets: 12,
            selectedTriadTypes: ['Major'],
            selectedInversions: [0],
            soundEnabled: true,
            practiceMode: null
        };
        
        // Clear storage
        this.storage.clear();
        
        // Reset UI
        this.setupTriadSelection();
        if (this.fretboard) {
            this.fretboard.setTuning(this.state.currentTuning);
            this.fretboard.setNumFrets(this.state.numFrets);
        }
        
        console.log('Application reset to defaults');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.guitarTriadApp = new GuitarTriadApp();
});

// Export for testing
export { GuitarTriadApp };
