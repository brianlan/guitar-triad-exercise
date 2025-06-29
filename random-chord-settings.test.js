const puppeteer = require('puppeteer');

describe('Random Chord Settings Integration', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        await page.goto('http://localhost:8010');
        await page.waitForSelector('#fretboard');
    });

    afterAll(async () => {
        await browser.close();
    });

    it('should only generate major chords when only major is selected', async () => {
        // Ensure only major is selected
        await page.evaluate(() => {
            ['minor', 'diminished', 'augmented'].forEach(type => {
                const checkbox = document.getElementById(`chord-type-${type}`);
                if (checkbox && checkbox.checked) checkbox.click();
            });
        });

        // Generate several chords and verify they're all major
        const chordNames = [];
        for (let i = 0; i < 5; i++) {
            await page.click('#random-chord');
            await page.waitForTimeout(200);
            
            const activity = await page.evaluate(() => {
                const log = document.querySelector('#activity-log');
                return log.firstElementChild?.textContent || '';
            });
            
            const chordName = activity.match(/Displayed (.+) chord/)?.[1];
            if (chordName) chordNames.push(chordName);
        }

        // All chords should be major
        chordNames.forEach(name => {
            expect(name).toMatch(/Major|Major \(Open\)|Major \(1st inv\)|Major \(2nd inv\)/);
        });
    });

    it('should generate minor chords when minor is enabled', async () => {
        // Enable minor chords
        await page.click('#chord-type-minor');
        await page.waitForTimeout(200);

        // Generate chords until we get a minor one (max 10 tries)
        let foundMinor = false;
        for (let i = 0; i < 10 && !foundMinor; i++) {
            await page.click('#random-chord');
            await page.waitForTimeout(200);
            
            const activity = await page.evaluate(() => {
                const log = document.querySelector('#activity-log');
                return log.firstElementChild?.textContent || '';
            });
            
            if (activity.includes('Minor')) {
                foundMinor = true;
            }
        }

        expect(foundMinor).toBe(true);
    });

    it('should generate diminished chords when diminished is enabled', async () => {
        // Enable diminished chords
        await page.click('#chord-type-diminished');
        await page.waitForTimeout(200);

        // Generate chords until we get a diminished one (max 10 tries)
        let foundDiminished = false;
        for (let i = 0; i < 10 && !foundDiminished; i++) {
            await page.click('#random-chord');
            await page.waitForTimeout(200);
            
            const activity = await page.evaluate(() => {
                const log = document.querySelector('#activity-log');
                return log.firstElementChild?.textContent || '';
            });
            
            if (activity.includes('Diminished')) {
                foundDiminished = true;
            }
        }

        expect(foundDiminished).toBe(true);
    });

    it('should generate augmented chords when augmented is enabled', async () => {
        // Enable augmented chords
        await page.click('#chord-type-augmented');
        await page.waitForTimeout(200);

        // Generate chords until we get an augmented one (max 10 tries)
        let foundAugmented = false;
        for (let i = 0; i < 10 && !foundAugmented; i++) {
            await page.click('#random-chord');
            await page.waitForTimeout(200);
            
            const activity = await page.evaluate(() => {
                const log = document.querySelector('#activity-log');
                return log.firstElementChild?.textContent || '';
            });
            
            if (activity.includes('Augmented')) {
                foundAugmented = true;
            }
        }

        expect(foundAugmented).toBe(true);
    });

    it('should generate open voicing chords when open voicing is enabled', async () => {
        // Enable open voicing
        await page.click('#voicing-open');
        await page.waitForTimeout(200);

        // Generate chords until we get an open voicing (max 10 tries)
        let foundOpen = false;
        for (let i = 0; i < 10 && !foundOpen; i++) {
            await page.click('#random-chord');
            await page.waitForTimeout(200);
            
            const activity = await page.evaluate(() => {
                const log = document.querySelector('#activity-log');
                return log.firstElementChild?.textContent || '';
            });
            
            if (activity.includes('(Open)')) {
                foundOpen = true;
            }
        }

        expect(foundOpen).toBe(true);
    });

    it('should generate inversion chords when inversions are enabled', async () => {
        // Enable first and second inversions
        await page.click('#inversion-first');
        await page.click('#inversion-second');
        await page.waitForTimeout(200);

        // Generate chords until we get an inversion (max 15 tries)
        let foundInversion = false;
        for (let i = 0; i < 15 && !foundInversion; i++) {
            await page.click('#random-chord');
            await page.waitForTimeout(200);
            
            const activity = await page.evaluate(() => {
                const log = document.querySelector('#activity-log');
                return log.firstElementChild?.textContent || '';
            });
            
            if (activity.includes('(1st inv)') || activity.includes('(2nd inv)')) {
                foundInversion = true;
            }
        }

        expect(foundInversion).toBe(true);
    });
});