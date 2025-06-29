const puppeteer = require('puppeteer');

async function testRandomChords() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        console.log('Navigating to localhost:8010...');
        await page.goto('http://localhost:8010');
        await page.waitForSelector('#fretboard');
        
        console.log('Testing Random Chord functionality...\n');
        
        // Click Random Chord button several times and log the results
        for (let i = 1; i <= 10; i++) {
            console.log(`=== Random Chord ${i} ===`);
            
            // Click the Random Chord button
            await page.click('#random-chord');
            await page.waitForTimeout(500); // Give time for chord to be displayed
            
            // Get the current finger dot positions
            const fingerDots = await page.evaluate(() => {
                const dots = document.querySelectorAll('.finger-dot');
                return Array.from(dots).map(dot => {
                    const style = dot.style;
                    return {
                        left: style.left,
                        top: style.top
                    };
                });
            });
            
            // Get the latest activity log entry to see which chord was displayed
            const latestActivity = await page.evaluate(() => {
                const log = document.querySelector('#activity-log');
                return log ? log.firstElementChild?.textContent || 'No activity logged' : 'Activity log not found';
            });
            
            console.log(`Activity: ${latestActivity}`);
            console.log(`Finger dots placed: ${fingerDots.length}`);
            console.log(`Dot positions:`, fingerDots.map(dot => `(${dot.left}, ${dot.top})`).join(', '));
            
            // Check current checkbox states
            const chordTypes = await page.evaluate(() => {
                const types = ['major', 'minor', 'diminished', 'augmented'];
                const selected = [];
                types.forEach(type => {
                    const checkbox = document.getElementById(`chord-type-${type}`);
                    if (checkbox && checkbox.checked) {
                        selected.push(type);
                    }
                });
                return selected;
            });
            
            const voicings = await page.evaluate(() => {
                const types = ['open', 'closed'];
                const selected = [];
                types.forEach(type => {
                    const checkbox = document.getElementById(`voicing-${type}`);
                    if (checkbox && checkbox.checked) {
                        selected.push(type);
                    }
                });
                return selected;
            });
            
            const inversions = await page.evaluate(() => {
                const types = ['root', 'first', 'second'];
                const selected = [];
                types.forEach(type => {
                    const checkbox = document.getElementById(`inversion-${type}`);
                    if (checkbox && checkbox.checked) {
                        selected.push(type);
                    }
                });
                return selected;
            });
            
            console.log(`Selected chord types: ${chordTypes.join(', ')}`);
            console.log(`Selected voicings: ${voicings.join(', ')}`);
            console.log(`Selected inversions: ${inversions.join(', ')}`);
            console.log('');
        }
        
    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        await browser.close();
    }
}

testRandomChords();