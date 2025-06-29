const puppeteer = require('puppeteer');
const path = require('path');

describe('Settings Panel Configuration', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.goto('http://localhost:8010');
        await page.waitForSelector('#fretboard');
    });

    afterEach(async () => {
        await page.close();
    });

    describe('Chord Type Checkboxes', () => {
        it('should have chord type checkboxes for Major, Minor, Diminished, Augmented', async () => {
            const majorCheckbox = await page.$('#chord-type-major');
            const minorCheckbox = await page.$('#chord-type-minor');
            const diminishedCheckbox = await page.$('#chord-type-diminished');
            const augmentedCheckbox = await page.$('#chord-type-augmented');

            expect(majorCheckbox).not.toBeNull();
            expect(minorCheckbox).not.toBeNull();
            expect(diminishedCheckbox).not.toBeNull();
            expect(augmentedCheckbox).not.toBeNull();
        });

        it('should have Major chord type selected by default', async () => {
            const isChecked = await page.$eval('#chord-type-major', el => el.checked);
            expect(isChecked).toBe(true);
        });

        it('should have other chord types unchecked by default', async () => {
            const minorChecked = await page.$eval('#chord-type-minor', el => el.checked);
            const diminishedChecked = await page.$eval('#chord-type-diminished', el => el.checked);
            const augmentedChecked = await page.$eval('#chord-type-augmented', el => el.checked);

            expect(minorChecked).toBe(false);
            expect(diminishedChecked).toBe(false);
            expect(augmentedChecked).toBe(false);
        });

        it('should allow multiple chord types to be selected', async () => {
            await page.click('#chord-type-minor');
            await page.click('#chord-type-diminished');

            const majorChecked = await page.$eval('#chord-type-major', el => el.checked);
            const minorChecked = await page.$eval('#chord-type-minor', el => el.checked);
            const diminishedChecked = await page.$eval('#chord-type-diminished', el => el.checked);

            expect(majorChecked).toBe(true);
            expect(minorChecked).toBe(true);
            expect(diminishedChecked).toBe(true);
        });
    });

    describe('Voicing Checkboxes', () => {
        it('should have voicing checkboxes for Open and Closed', async () => {
            const openCheckbox = await page.$('#voicing-open');
            const closedCheckbox = await page.$('#voicing-closed');

            expect(openCheckbox).not.toBeNull();
            expect(closedCheckbox).not.toBeNull();
        });

        it('should have Closed voicing selected by default', async () => {
            const isChecked = await page.$eval('#voicing-closed', el => el.checked);
            expect(isChecked).toBe(true);
        });

        it('should have Open voicing unchecked by default', async () => {
            const isChecked = await page.$eval('#voicing-open', el => el.checked);
            expect(isChecked).toBe(false);
        });

        it('should allow both voicing types to be selected', async () => {
            await page.click('#voicing-open');

            const openChecked = await page.$eval('#voicing-open', el => el.checked);
            const closedChecked = await page.$eval('#voicing-closed', el => el.checked);

            expect(openChecked).toBe(true);
            expect(closedChecked).toBe(true);
        });
    });

    describe('Inversion Checkboxes', () => {
        it('should have inversion checkboxes for Root position, 1st inversion, 2nd inversion', async () => {
            const rootCheckbox = await page.$('#inversion-root');
            const firstCheckbox = await page.$('#inversion-first');
            const secondCheckbox = await page.$('#inversion-second');

            expect(rootCheckbox).not.toBeNull();
            expect(firstCheckbox).not.toBeNull();
            expect(secondCheckbox).not.toBeNull();
        });

        it('should have Root position selected by default', async () => {
            const isChecked = await page.$eval('#inversion-root', el => el.checked);
            expect(isChecked).toBe(true);
        });

        it('should have other inversions unchecked by default', async () => {
            const firstChecked = await page.$eval('#inversion-first', el => el.checked);
            const secondChecked = await page.$eval('#inversion-second', el => el.checked);

            expect(firstChecked).toBe(false);
            expect(secondChecked).toBe(false);
        });

        it('should allow multiple inversions to be selected', async () => {
            await page.click('#inversion-first');
            await page.click('#inversion-second');

            const rootChecked = await page.$eval('#inversion-root', el => el.checked);
            const firstChecked = await page.$eval('#inversion-first', el => el.checked);
            const secondChecked = await page.$eval('#inversion-second', el => el.checked);

            expect(rootChecked).toBe(true);
            expect(firstChecked).toBe(true);
            expect(secondChecked).toBe(true);
        });
    });

    describe('Settings Panel Layout', () => {
        it('should display the settings panel in the left-top area of the page', async () => {
            const settingsZone = await page.$('#settings-zone');
            const boundingBox = await settingsZone.boundingBox();

            expect(boundingBox.x).toBeLessThan(400); // Should be on the left
            expect(boundingBox.y).toBeLessThan(200); // Should be at the top
        });

        it('should group checkboxes logically with labels', async () => {
            const chordTypeLabel = await page.$eval('[data-group="chord-type"] label', el => el.textContent);
            const voicingLabel = await page.$eval('[data-group="voicing"] label', el => el.textContent);
            const inversionLabel = await page.$eval('[data-group="inversion"] label', el => el.textContent);

            expect(chordTypeLabel).toContain('Chord Type');
            expect(voicingLabel).toContain('Voicing');
            expect(inversionLabel).toContain('Inversion');
        });
    });
});