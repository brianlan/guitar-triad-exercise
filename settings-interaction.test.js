const puppeteer = require('puppeteer');

describe('Settings Panel Interaction Test', () => {
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

    it('should log activity when checkboxes are clicked', async () => {
        // Click minor chord type
        await page.click('#chord-type-minor');
        
        // Wait a bit for the activity to be logged
        await page.waitForTimeout(100);
        
        // Check if activity was logged
        const activityText = await page.$eval('#activity-log', el => el.textContent);
        expect(activityText).toContain('Enabled minor chords');
        
        // Click open voicing
        await page.click('#voicing-open');
        await page.waitForTimeout(100);
        
        const updatedActivityText = await page.$eval('#activity-log', el => el.textContent);
        expect(updatedActivityText).toContain('Enabled open voicing');
        
        // Click first inversion
        await page.click('#inversion-first');
        await page.waitForTimeout(100);
        
        const finalActivityText = await page.$eval('#activity-log', el => el.textContent);
        expect(finalActivityText).toContain('Enabled first inversion');
    });

    it('should prevent unchecking all options in a group', async () => {
        // First ensure minor is also unchecked so only major is checked
        const minorChecked = await page.$eval('#chord-type-minor', el => el.checked);
        if (minorChecked) {
            await page.click('#chord-type-minor'); // Uncheck minor if it's checked
            await page.waitForTimeout(100);
        }
        
        // Try to uncheck major (should be the only one checked now)
        await page.click('#chord-type-major'); // Uncheck major
        await page.waitForTimeout(100);
        
        // Major should be automatically re-checked
        const majorChecked = await page.$eval('#chord-type-major', el => el.checked);
        expect(majorChecked).toBe(true);
        
        // Check activity log shows auto-enable message
        const activityText = await page.$eval('#activity-log', el => el.textContent);
        expect(activityText).toContain('Auto-enabled Major chords');
    });
});