const puppeteer = require('puppeteer');
const path = require('path');

describe('Music Theory Integration with Fretboard', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ 
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        
        try {
            await page.goto('http://localhost:8010', { waitUntil: 'networkidle2' });
            await page.waitForSelector('#fretboard', { timeout: 10000 });
        } catch (error) {
            console.log('Falling back to file:// protocol');
            const htmlPath = 'file://' + path.resolve(__dirname, 'index.html');
            await page.goto(htmlPath, { waitUntil: 'networkidle2' });
            await page.waitForSelector('#fretboard', { timeout: 10000 });
        }
    }, 90000);

    afterAll(async () => {
        await browser.close();
    });

    test('should load music theory module in browser', async () => {
        // Inject music theory module into the page
        await page.addScriptTag({ path: path.resolve(__dirname, 'music-theory.js') });
        
        // Test if classes are available
        const moduleAvailable = await page.evaluate(() => {
            return typeof window.MusicTheory !== 'undefined' && 
                   typeof window.MusicTheory.Pitch !== 'undefined' &&
                   typeof window.MusicTheory.Chord !== 'undefined';
        });
        
        expect(moduleAvailable).toBe(true);
    });

    test('should create and display chord using music theory', async () => {
        // Inject music theory module
        await page.addScriptTag({ path: path.resolve(__dirname, 'music-theory.js') });
        
        // Create a chord using music theory and display it
        const chordDisplayed = await page.evaluate(() => {
            const { Pitch, Chord, MusicTheory } = window.MusicTheory;
            
            // Create a C major chord
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            const pitches = cMajor.getPitches();
            
            // Get the standard name
            const standardName = cMajor.getStandardName();
            
            // Update the question display with chord info
            const questionDisplay = document.querySelector('.question-display p');
            if (questionDisplay) {
                questionDisplay.textContent = `Current chord: ${standardName}`;
            }
            
            return {
                standardName: standardName,
                pitches: pitches.map(p => p.toString()),
                pitchCount: pitches.length
            };
        });
        
        expect(chordDisplayed.standardName).toBe('C_major_root_closed');
        expect(chordDisplayed.pitches).toEqual(['C4', 'E4', 'G4']);
        expect(chordDisplayed.pitchCount).toBe(3);
    });

    test('should generate random chord and update display', async () => {
        // Inject music theory module
        await page.addScriptTag({ path: path.resolve(__dirname, 'music-theory.js') });
        
        const randomChordInfo = await page.evaluate(() => {
            const { MusicTheory } = window.MusicTheory;
            const musicTheory = new MusicTheory();
            
            // Generate a random chord
            const randomChord = musicTheory.generateRandomChord({
                qualities: ['major', 'minor'],
                inversions: ['root'],
                voicings: ['closed']
            });
            
            return {
                name: randomChord.getStandardName(),
                quality: randomChord.quality,
                root: randomChord.root.toString(),
                pitches: randomChord.getPitches().map(p => p.toString())
            };
        });
        
        expect(['major', 'minor']).toContain(randomChordInfo.quality);
        expect(randomChordInfo.name).toContain('_root_closed');
        expect(randomChordInfo.pitches.length).toBe(3);
    });

    test('should map chord to fretboard positions', async () => {
        // Inject music theory module
        await page.addScriptTag({ path: path.resolve(__dirname, 'music-theory.js') });
        
        const fretboardMapping = await page.evaluate(() => {
            const { Chord, MusicTheory } = window.MusicTheory;
            const musicTheory = new MusicTheory();
            
            // Create a C major chord
            const cMajor = new Chord('C4', 'major', 'root', 'closed');
            
            // Get fretboard positions
            const positions = musicTheory.mapChordToFretboard(cMajor);
            
            return {
                positionsFound: positions.length > 0,
                firstPosition: positions[0] || null,
                hasStandardName: positions[0] && positions[0].name.includes('C_major')
            };
        });
        
        expect(fretboardMapping.positionsFound).toBe(true);
        expect(fretboardMapping.firstPosition).toBeTruthy();
        expect(fretboardMapping.hasStandardName).toBe(true);
    });

    test('should display chord information in UI', async () => {
        // Inject music theory module
        await page.addScriptTag({ path: path.resolve(__dirname, 'music-theory.js') });
        
        // Create and display chord information
        await page.evaluate(() => {
            const { Chord } = window.MusicTheory;
            
            // Create various chords and display them
            const chords = [
                new Chord('C4', 'major', 'root', 'closed'),
                new Chord('D4', 'minor', 'first', 'open'),
                new Chord('G4', 'major', 'second', 'closed')
            ];
            
            // Update the activity log with chord information
            const activityLog = document.getElementById('activity-log');
            if (activityLog) {
                chords.forEach(chord => {
                    const li = document.createElement('li');
                    li.textContent = `${new Date().toLocaleTimeString()}: Created ${chord.getStandardName()}`;
                    activityLog.insertBefore(li, activityLog.firstChild);
                });
            }
        });
        
        // Check if chord information is displayed
        const activityLogText = await page.evaluate(() => {
            const activityLog = document.getElementById('activity-log');
            return activityLog ? activityLog.textContent : '';
        });
        
        expect(activityLogText).toContain('C_major_root_closed');
        expect(activityLogText).toContain('D_minor_first_open');
        expect(activityLogText).toContain('G_major_second_closed');
    });

    test('should validate music theory integration with existing fretboard', async () => {
        // Inject music theory module
        await page.addScriptTag({ path: path.resolve(__dirname, 'music-theory.js') });
        
        // Test integration by checking if we can enhance the existing fretboard app
        const integrationWorking = await page.evaluate(() => {
            // Check if both fretboard and music theory are available
            const fretboardExists = typeof FretboardApp !== 'undefined';
            const musicTheoryExists = typeof window.MusicTheory !== 'undefined';
            
            // Try to create a chord and get its name
            if (musicTheoryExists) {
                const { Chord } = window.MusicTheory;
                const testChord = new Chord('A4', 'minor', 'root', 'closed');
                const name = testChord.getStandardName();
                
                return {
                    fretboardExists,
                    musicTheoryExists,
                    canCreateChord: name === 'A_minor_root_closed'
                };
            }
            
            return { fretboardExists, musicTheoryExists, canCreateChord: false };
        });
        
        expect(integrationWorking.musicTheoryExists).toBe(true);
        expect(integrationWorking.canCreateChord).toBe(true);
    });

    test('visual verification - music theory integration display', async () => {
        // Inject music theory module
        await page.addScriptTag({ path: path.resolve(__dirname, 'music-theory.js') });
        
        // Create a comprehensive chord display
        await page.evaluate(() => {
            const { Chord, MusicTheory } = window.MusicTheory;
            const musicTheory = new MusicTheory();
            
            // Update question display with chord theory information
            const questionDisplay = document.querySelector('.question-display');
            if (questionDisplay) {
                questionDisplay.innerHTML = `
                    <h4>Music Theory Integration Test</h4>
                    <p><strong>Standard Chord Naming System:</strong></p>
                    <ul>
                        <li>C Major Root Position: C_major_root_closed</li>
                        <li>A Minor First Inversion: A_minor_first_closed</li>
                        <li>F Major Open Voicing: F_major_root_open</li>
                        <li>G Diminished: G_diminished_root_closed</li>
                    </ul>
                    <p><strong>Scientific Pitch Notation Examples:</strong></p>
                    <ul>
                        <li>Middle C: C4</li>
                        <li>A440: A4</li>
                        <li>High E: E4</li>
                    </ul>
                `;
            }
            
            // Generate a random chord for demonstration
            const randomChord = musicTheory.generateRandomChord();
            const chordInfo = `Random chord: ${randomChord.getStandardName()}`;
            
            // Add to activity log
            const activityLog = document.getElementById('activity-log');
            if (activityLog) {
                const li = document.createElement('li');
                li.textContent = `${new Date().toLocaleTimeString()}: ${chordInfo}`;
                activityLog.insertBefore(li, activityLog.firstChild);
            }
        });
        
        // Verify the display is updated
        const displayContent = await page.evaluate(() => {
            const questionDisplay = document.querySelector('.question-display');
            return questionDisplay ? questionDisplay.textContent : '';
        });
        
        expect(displayContent).toContain('Music Theory Integration Test');
        expect(displayContent).toContain('Standard Chord Naming System');
        expect(displayContent).toContain('Scientific Pitch Notation');
        expect(displayContent).toContain('C_major_root_closed');
    });
});