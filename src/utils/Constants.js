/**
 * Musical constants and configuration for the Guitar Triad Practice Tool
 */

// Musical notes in chromatic order
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Standard guitar tuning (high E to low E)
export const STANDARD_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];

// Triad intervals in semitones from root
export const TRIAD_INTERVALS = {
    'Major': [0, 4, 7],      // Root, Major Third, Perfect Fifth
    'Minor': [0, 3, 7],      // Root, Minor Third, Perfect Fifth
    'Diminished': [0, 3, 6], // Root, Minor Third, Diminished Fifth
    'Augmented': [0, 4, 8]   // Root, Major Third, Augmented Fifth
};

// Guitar fretboard configuration
export const FRETBOARD_CONFIG = {
    DEFAULT_NUM_FRETS: 12,
    MAX_FRETS: 24,
    NUM_STRINGS: 6,
    // Absolute pitch of each open string in semitones from C0
    // Standard tuning: E4(64), B3(59), G3(55), D3(50), A2(45), E2(40)
    OPEN_STRING_PITCHES: [64, 59, 55, 50, 45, 40]
};

// Practice modes
export const MODES = {
    IDENTIFICATION: 'identification',
    COMPLETION: 'completion',
    REVIEW: 'review'
};

// Voicing constraints
export const VOICING_CONSTRAINTS = {
    MAX_FRET_SPAN: 5,        // Maximum frets between lowest and highest note (hand span constraint)
    MAX_PITCH_SPAN: 15,      // Maximum semitones for close voicing (about 1 octave + 3rd)
    MAX_STRING_SPAN: 2,      // Maximum difference in string numbers for closed voicing
    SEARCH_FRET_RANGE: 5     // How many frets above/below to search for other notes
};

// UI configuration
export const UI_CONFIG = {
    FEEDBACK_DELAY: 1500,    // Delay before showing next question (ms)
    HIGHLIGHT_DURATION: 600, // Duration for incorrect highlight (ms)
    CLICK_HIGHLIGHT: 150     // Duration for click feedback (ms)
};

// Practice settings defaults
export const DEFAULTS = {
    SELECTED_TRIADS: ['Major'],
    SELECTED_INVERSIONS: [0],
    SOUND_ENABLED: true,
    NUM_OPTIONS: 4           // Number of multiple choice options in Mode A
};

// Storage keys
export const STORAGE_KEYS = {
    USER_PERFORMANCE: 'guitarTriadUserPerformance',
    USER_SETTINGS: 'guitarTriadUserSettings'
};

// Alternative tunings (for future extension)
export const ALTERNATIVE_TUNINGS = {
    'Standard': ['E', 'B', 'G', 'D', 'A', 'E'],
    'Drop D': ['E', 'B', 'G', 'D', 'A', 'D'],
    'Open G': ['D', 'B', 'G', 'D', 'G', 'D'],
    'Open D': ['D', 'A', 'F#', 'D', 'A', 'D'],
    'DADGAD': ['D', 'A', 'G', 'D', 'A', 'D']
};

// Inversion names for display
export const INVERSION_NAMES = {
    0: 'Root Position',
    1: '1st Inversion',
    2: '2nd Inversion'
};

// CSS class names for consistency
export const CSS_CLASSES = {
    HIGHLIGHTED: 'highlighted',
    HIGHLIGHTED_CORRECT: 'highlighted-correct',
    HIGHLIGHTED_INCORRECT: 'highlighted-incorrect',
    CLICKED: 'clicked',
    FRET_MARKER_SINGLE: 'marker-single',
    FRET_MARKER_DOUBLE: 'marker-double'
};
