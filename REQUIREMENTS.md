Write a web-based Guitar Fretboard Triad Practice Tool. Below is the general and detailed requirements.

# General Requirements

- The user can select/deselect multiple types of triad including major, minor, diminished and augmented to practice. And the user can also choose whether to enable 1st inversion and 2nd inversion.
- the tool shows a guitar fretboard (mimic a real one), the user can choose different fret color and string color. The frets should not have equal widths, it becomes thiner and thiner as the fret goes to the right (higher zone)
- every time the user's finger or mouse clicking on the string of a fret, play the voice of this note. 
- the tool can have multiple practice modes. 
  a. Mode A: randomly display a pattern on the fretboard (with the chords voice played along), and generates some options, and the user should chose the correct one that matches the displayed chord. 
  b. Mode B: randomly choose a note and the position in the chord as well as the chord type, and only the chosen note will be displayed on the fret string. The user now is required to use mouse / fingers to complete the other notes on the fret strings to complete the chord. For example, E as the 5th, major chord (the E is also displayed on the fifth fret, the second string), and the user should complete the chord by clicking / touch A, C# on the fretboard (A is at 7th fret, 4th string; C# is at 6th fret, 3rd string) to complete the chord A Major (A, C#, E).
- the tool memorizes how the user performed (correct or wrong, time elapsed from the quiz show up to the answer submitted) in each of the quiz, so that it can generate a stats for the user. 
- the tool should also consider memory curve in the cognitize science and support 'review' feature, which will generate quizzes to let the user to review regularly (spaced Spaced Repetition). It is better to let the user practice again the ones that have been performed worse in the history. 

Please feel free to add features you think that are meaningful and make sense for the user to fully practice the traids on a guitar fretboard.


# Detailed requirements


# **Guitar Fretboard Triad Practice Tool – Requirements Specification**

## **1. Overview**

The **Guitar Fretboard Triad Practice Tool** is an interactive application designed to help guitar players practice triads across the fretboard. The tool offers multiple practice modes, realistic fretboard visuals, audio feedback, user customization, and adaptive learning features based on performance and memory retention principles.

---

## **2. Functional Requirements**

### **2.1 Triad Selection**

* Users can select one or more triad types for practice:

  * Major
  * Minor
  * Diminished
  * Augmented
* Inversions:

  * Users can toggle inclusion of 1st and 2nd inversions.

### **2.2 Interactive Fretboard Display**

* Realistic, interactive guitar fretboard:

  * Adjustable number of frets (default: 12; customizable up to 24).
  * Accurate fret size scaling (progressively thinner towards higher frets).
  * Six-string layout mimicking real guitar tuning (standard tuning by default: EADGBE).
  * Customization:
    * Fret color selection
    * String color selection

* User interactions:

  * Clicking or tapping a fret-string intersection:
    * Plays corresponding note (sampled guitar sound).
    * Visual highlight on interaction (customizable highlight color).

### **2.3 Practice Modes**

#### **2.3.1 Mode A – Chord Identification**

* Function:

  * Randomly display a triad pattern on the fretboard.
  * Play the audio of the full chord.
  * Present multiple choice options (e.g., A Major, A Minor, B Diminished…).
  * User selects the correct chord name.
* Features:

  * Visual and auditory feedback (correct/wrong).
  * Option to replay the chord audio.
  * Option to hide fret numbers or note names for increased challenge.

#### **2.3.2 Mode B – Chord Completion**

* Function:

  * Randomly generate:

    * Root note or any chord tone (3rd, 5th)
    * Chord type
    * A single note’s position on the fretboard (visually highlighted)
  * User must complete the remaining chord tones by clicking the correct notes on the fretboard.
* Features:

  * Real-time validation of selections.
  * Allowable margin for different voicings (e.g., allow any correct triad form).
  * Optional voice playback of individual notes or completed chord.

---

## **3. User Performance Tracking**

### **3.1 Quiz Tracking**

* For each quiz attempt, track:

  * Timestamp
  * Question type and parameters
  * User answer
  * Whether it was correct
  * Time taken to answer
  * Notes selected
* Store results in a persistent profile (local storage or account-based database).

### **3.2 Statistics Dashboard**

* Summarize user performance:

  * Accuracy by triad type and inversion
  * Average response time
  * Heatmap of correct/wrong notes across fretboard
* Progress tracking over time (daily, weekly, monthly reports)

---

## **4. Spaced Repetition and Memory Curve Integration**

### **4.1 Review Mode**

* Implements spaced repetition based on user's performance history.
* Prioritizes:

  * Triads frequently answered incorrectly
  * Triads not reviewed for a while
* Customizable review frequency and intensity.

---

## **5. Additional Features**

### **5.1 Audio System**

* High-quality sampled guitar sounds for all 6 strings across all frets.
* Option to enable/disable sound playback.
* Adjustable playback speed (for slower chord recognition training).

---

## **6. Platform Compatibility**

* Web-based (primary)
* Mobile-responsive (iOS and Android browsers)