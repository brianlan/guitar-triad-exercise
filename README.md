# Guitar Fretboard Triad Practice Tool

An interactive web application designed to help guitar players master triad recognition and chord construction across the fretboard through gamified practice modes and spaced repetition learning.

## Features

### 🎸 Interactive Fretboard
- **Realistic Visual Design**: Accurately scaled fretboard with progressively thinner frets
- **Standard Tuning**: Six-string layout (EADGBE) with support for alternative tunings
- **Audio Feedback**: High-quality sampled guitar sounds for every fret position
- **Customizable Appearance**: Adjustable fret and string colors, light/dark themes

### 🎵 Triad Types & Inversions
- **Four Triad Types**: Major, Minor, Diminished, and Augmented
- **Multiple Inversions**: Root position, 1st inversion, and 2nd inversion
- **Closed Voicing**: All chord patterns use close voicing (interval between lowest and highest note less than one octave)
- **Flexible Selection**: Choose any combination of triad types and inversions for practice

### 🎯 Practice Modes

#### Mode A: Chord Identification
- Random triad patterns displayed on the fretboard
- Audio playback of the complete chord
- Multiple-choice answers to identify the chord
- Visual and auditory feedback for correct/incorrect answers

#### Mode B: Chord Completion
- One note of a triad is shown on the fretboard
- Complete the chord by clicking the remaining two notes
- Real-time validation of note selections
- Support for different chord voicings and positions

#### Review Mode: Spaced Repetition
- Intelligent review system based on performance history
- Prioritizes frequently missed chords and overdue reviews
- Implements memory curve principles for optimal retention
- Customizable review frequency and intensity

### 📊 Performance Tracking
- **Detailed Statistics**: Accuracy by triad type, inversion, and response time
- **Progress Visualization**: Performance trends over time
- **Fretboard Heatmap**: Visual representation of correct/incorrect notes across the fretboard
- **Persistent Storage**: All progress saved in local storage

### 🔧 Customization Options
- **Audio Controls**: Enable/disable sound, adjustable playback speed
- **Visual Options**: Show/hide fret numbers, note names, and scale degrees
- **Learning Aids**: Optional fingering guidance and triad construction reference
- **Accessibility**: Keyboard navigation and color-blind friendly palettes

## Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Audio support for the best experience

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. No additional setup required - it's a pure client-side application!

### Quick Start
1. **Configure Settings**: Select your preferred triad types and inversions
2. **Choose Practice Mode**: Start with Mode A for chord identification or Mode B for chord completion
3. **Begin Practicing**: Follow the on-screen instructions for each mode
4. **Track Progress**: View your statistics and use Review Mode for targeted practice

## How to Use

### Basic Workflow
1. **Settings Configuration**
   - Check the triad types you want to practice (Major, Minor, Diminished, Augmented)
   - Select inversions (Root Position, 1st Inversion, 2nd Inversion)
   - Enable/disable audio feedback

2. **Mode A: Chord Identification**
   - Click "Start Mode A"
   - A triad pattern will appear on the fretboard with audio playback
   - Choose the correct chord name from the multiple-choice options
   - Receive immediate feedback and continue to the next chord

3. **Mode B: Chord Completion**
   - Click "Start Mode B"
   - One note of a target triad will be highlighted
   - Click the two remaining notes to complete the chord
   - Get feedback on your chord completion accuracy

4. **Review Mode**
   - Access personalized review sessions based on your performance
   - Focus on challenging chords and maintain long-term retention

### Tips for Effective Practice
- Start with one triad type and gradually add more
- Practice root positions before moving to inversions
- Use audio feedback to train your ear alongside visual recognition
- Review regularly to maintain and improve your skills

## Technical Details

### File Structure
```
guitar-triad-exercise-2/
├── index.html          # Main application interface
├── script.js          # Core application logic and functionality
├── style.css          # Styling and visual design
├── prompts/
│   └── requirements.md # Project requirements and specifications
└── README.md          # This file
```

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

### Technologies Used
- **HTML5**: Structure and layout
- **CSS3**: Styling and responsive design
- **JavaScript (ES6+)**: Application logic and interactivity
- **Web Audio API**: Audio playback and sound generation
- **Local Storage**: Persistent data storage

## Educational Background

This tool is designed around proven learning principles:

### Spaced Repetition
- Based on the forgetting curve research by Hermann Ebbinghaus
- Optimizes review timing to maximize long-term retention
- Adapts to individual performance patterns

### Gamification
- Immediate feedback reinforces correct responses
- Progress tracking motivates continued practice
- Multiple modes prevent monotony and maintain engagement

### Multi-Modal Learning
- Visual recognition through fretboard patterns
- Auditory training through chord playback
- Kinesthetic learning through interactive clicking/tapping

## Contributing

This is an educational project focused on guitar fretboard mastery. Suggestions for improvements or bug reports are welcome!

### Known Areas for Enhancement
- Additional tuning support (Drop D, Open G, etc.)
- More advanced chord types (7th chords, extended chords)
- Social features (sharing progress, challenges)
- Advanced statistics and analytics

## License

This project is available for educational and personal use.

## Acknowledgments

- Inspired by music theory education and spaced repetition research
- Designed for guitar players of all skill levels
- Built with modern web technologies for accessibility and performance

---

**Happy Practicing! 🎸**

*Master your fretboard one triad at a time.*
