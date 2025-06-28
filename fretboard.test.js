const puppeteer = require('puppeteer');
const path = require('path');

describe('Guitar Fretboard', () => {
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

    test('should render fretboard container', async () => {
        const fretboard = await page.$('#fretboard');
        expect(fretboard).toBeTruthy();
    });

    test('should have 6 strings with correct labels', async () => {
        const strings = await page.$$('.string');
        expect(strings).toHaveLength(6);

        const stringLabels = await page.$$eval('.string-label', labels => 
            labels.map(label => label.textContent)
        );
        expect(stringLabels).toEqual(['E', 'B', 'G', 'D', 'A', 'E']);
    });

    test('should render 13 frets (including fret 0)', async () => {
        const frets = await page.$$('.fret');
        expect(frets).toHaveLength(13);
    });

    test('should have fret 0 through 12', async () => {
        const fret0 = await page.$('[data-fret="0"]');
        const fret12 = await page.$('[data-fret="12"]');
        expect(fret0).toBeTruthy();
        expect(fret12).toBeTruthy();
    });

    test('should have varying fret widths (frets closer together towards higher numbers)', async () => {
        const fret1 = await page.$('[data-fret="1"]');
        const fret6 = await page.$('[data-fret="6"]');
        const fret12 = await page.$('[data-fret="12"]');

        const fret1Position = await page.evaluate(el => el.offsetLeft, fret1);
        const fret6Position = await page.evaluate(el => el.offsetLeft, fret6);
        const fret12Position = await page.evaluate(el => el.offsetLeft, fret12);

        const distance1to6 = fret6Position - fret1Position;
        const distance6to12 = fret12Position - fret6Position;

        expect(distance1to6).toBeGreaterThan(distance6to12);
    });

    test('should display fret position markers', async () => {
        await page.waitForSelector('#fretboard');
        
        const markers = await page.$$('#fretboard > div[style*="border-radius: 50%"]');
        expect(markers.length).toBeGreaterThan(0);
    });

    test('should have correct string thicknesses (visually represented by height)', async () => {
        const strings = await page.$$('.string');
        
        const heights = [];
        for (let string of strings) {
            const height = await page.evaluate(el => parseFloat(el.style.height), string);
            heights.push(height);
        }

        for (let i = 1; i < heights.length; i++) {
            expect(heights[i]).toBeGreaterThan(heights[i-1]);
        }
    });

    test('fretboard should have realistic wood-like appearance', async () => {
        const fretboard = await page.$('#fretboard');
        const styles = await page.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                background: computed.background,
                borderRadius: computed.borderRadius,
                boxShadow: computed.boxShadow
            };
        }, fretboard);

        expect(styles.background).toContain('gradient');
        expect(parseFloat(styles.borderRadius)).toBeGreaterThan(0);
        expect(styles.boxShadow).toBeTruthy();
    });

    test('should NOT display fret numbers at bottom', async () => {
        const fretNumbers = await page.$$('.fret-number');
        expect(fretNumbers).toHaveLength(0);
    });

    test('should have enlarged fretboard dimensions', async () => {
        const fretboard = await page.$('#fretboard');
        const dimensions = await page.evaluate(el => ({
            width: el.offsetWidth,
            height: el.offsetHeight,
            styleWidth: el.style.width,
            styleHeight: el.style.height
        }), fretboard);

        expect(dimensions.styleWidth).toBe('1000px');
        expect(dimensions.styleHeight).toBe('250px');
    });

    test('should support empty string (fret 0)', async () => {
        const fret0 = await page.$('[data-fret="0"]');
        expect(fret0).toBeTruthy();
        
        const fret0Position = await page.evaluate(el => el.offsetLeft, fret0);
        expect(fret0Position).toBe(1);
    });

    test('should have improved fret position markers', async () => {
        await page.waitForSelector('#fretboard');
        
        const markers = await page.$$('#fretboard > div[style*="border-radius: 50%"]');
        expect(markers.length).toBeGreaterThan(4);
        
        for (let marker of markers) {
            const styles = await page.evaluate(el => ({
                backgroundColor: el.style.backgroundColor,
                borderRadius: el.style.borderRadius,
                width: el.style.width,
                height: el.style.height
            }), marker);
            
            expect(styles.borderRadius).toBe('50%');
            expect(parseInt(styles.width)).toBeGreaterThan(8);
            expect(parseInt(styles.height)).toBeGreaterThan(8);
        }
    });

    test('should have wider fret spacing with more even distribution', async () => {
        const fret1 = await page.$('[data-fret="1"]');
        const fret2 = await page.$('[data-fret="2"]');
        const fret3 = await page.$('[data-fret="3"]');

        const fret1Pos = await page.evaluate(el => el.offsetLeft, fret1);
        const fret2Pos = await page.evaluate(el => el.offsetLeft, fret2);
        const fret3Pos = await page.evaluate(el => el.offsetLeft, fret3);

        const spacing1to2 = fret2Pos - fret1Pos;
        const spacing2to3 = fret3Pos - fret2Pos;

        // With wider spacing, early frets should have more room
        expect(spacing1to2).toBeGreaterThan(60);
        expect(spacing2to3).toBeGreaterThan(55);
    });

    test('should support up to 16 frets when configured', async () => {
        // This test will initially fail as we need to create a 16-fret instance
        await page.evaluate(() => {
            const container = document.getElementById('fretboard');
            container.innerHTML = '';
            new GuitarFretboard('fretboard', 16);
        });

        await page.waitForSelector('[data-fret="16"]', { timeout: 3000 });
        
        const fret16 = await page.$('[data-fret="16"]');
        expect(fret16).toBeTruthy();
        
        const allFrets = await page.$$('.fret');
        expect(allFrets).toHaveLength(17); // 0-16 = 17 frets
    });

    test('should have more even spacing distribution between first and last frets', async () => {
        const fret0 = await page.$('[data-fret="0"]');
        const fret6 = await page.$('[data-fret="6"]');
        const fret12 = await page.$('[data-fret="12"]');

        const fret0Pos = await page.evaluate(el => el.offsetLeft, fret0);
        const fret6Pos = await page.evaluate(el => el.offsetLeft, fret6);
        const fret12Pos = await page.evaluate(el => el.offsetLeft, fret12);

        const firstHalfDistance = fret6Pos - fret0Pos;
        const secondHalfDistance = fret12Pos - fret6Pos;

        // With wider spacing, the ratio should be more balanced (less extreme)
        const ratio = firstHalfDistance / secondHalfDistance;
        expect(ratio).toBeLessThan(2.0); // Should be more balanced than traditional guitar spacing
        expect(ratio).toBeGreaterThan(1.2);
    });

    test('visual verification - fretboard should look properly spaced', async () => {
        // Visual verification of fretboard dimensions and spacing
        const fretboard = await page.$('#fretboard');
        const boundingBox = await fretboard.boundingBox();
        
        // Verify fretboard has reasonable dimensions (CSS may constrain the final rendered size)
        expect(boundingBox.width).toBeGreaterThan(700);
        expect(boundingBox.height).toBeGreaterThan(240);
        
        // Verify that frets are properly distributed across the fretboard
        const allFrets = await page.$$('.fret');
        expect(allFrets.length).toBeGreaterThanOrEqual(13);
        
        // Check that we have fret position markers visible including the new 15th fret marker
        const markers = await page.$$('#fretboard > div[style*="border-radius: 50%"]');
        expect(markers.length).toBeGreaterThanOrEqual(5);
        
        // Verify wider spacing by checking first few fret positions
        const fret1 = await page.evaluate(() => {
            return document.querySelector('[data-fret="1"]').offsetLeft;
        });
        const fret2 = await page.evaluate(() => {
            return document.querySelector('[data-fret="2"]').offsetLeft;
        });
        
        expect(fret2 - fret1).toBeGreaterThan(60); // Confirms wider spacing
    });

    // New tests for multi-zone layout
    test('should have Settings Zone with proper styling', async () => {
        const settingsZone = await page.$('#settings-zone');
        expect(settingsZone).toBeTruthy();
        
        const styles = await page.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                border: computed.border,
                backgroundColor: computed.backgroundColor,
                gridArea: computed.gridArea
            };
        }, settingsZone);
        
        expect(styles.border).toContain('2px');
        expect(styles.border).toContain('220, 20, 60'); // RGB for #dc143c (red)
    });

    test('should have Question & Answering Zone with proper dimensions', async () => {
        const qaZone = await page.$('#qa-zone');
        expect(qaZone).toBeTruthy();
        
        const boundingBox = await qaZone.boundingBox();
        expect(boundingBox.width).toBeGreaterThan(500);
        expect(boundingBox.height).toBeGreaterThan(200);
        
        const text = await page.evaluate(el => el.textContent, qaZone);
        expect(text).toContain('Question & Answering Zone');
    });

    test('should have Statistics and History Zone', async () => {
        const statsZone = await page.$('#stats-zone');
        expect(statsZone).toBeTruthy();
        
        const styles = await page.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                border: computed.border,
                backgroundColor: computed.backgroundColor
            };
        }, statsZone);
        
        expect(styles.border).toContain('2px');
        expect(styles.border).toContain('220, 20, 60'); // RGB for #dc143c (red)
        
        const text = await page.evaluate(el => el.textContent, statsZone);
        expect(text).toContain('Statistics and History Zone');
    });

    test('should have proper CSS Grid layout structure', async () => {
        const container = await page.$('.app-container');
        expect(container).toBeTruthy();
        
        const styles = await page.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                display: computed.display,
                gridTemplateColumns: computed.gridTemplateColumns,
                gridTemplateRows: computed.gridTemplateRows
            };
        }, container);
        
        expect(styles.display).toBe('grid');
        expect(styles.gridTemplateColumns).toBeTruthy();
        expect(styles.gridTemplateRows).toBeTruthy();
    });

    test('should display finger position dots on fretboard strings', async () => {
        // Test for interactive finger position dots as shown in the image
        const fingerDots = await page.$$('.finger-dot');
        expect(fingerDots.length).toBeGreaterThanOrEqual(3); // Should have some finger positions
        
        // Verify dots are positioned on strings
        for (let dot of fingerDots) {
            const styles = await page.evaluate(el => {
                const computed = window.getComputedStyle(el);
                return {
                    position: computed.position,
                    backgroundColor: computed.backgroundColor,
                    borderRadius: computed.borderRadius
                };
            }, dot);
            
            expect(styles.position).toBe('absolute');
            expect(styles.borderRadius).toBe('50%');
        }
    });

    test('layout should match image reference - visual verification', async () => {
        // Comprehensive layout verification
        const zones = ['#settings-zone', '#fretboard-container', '#qa-zone', '#stats-zone'];
        
        for (let zoneSelector of zones) {
            const zone = await page.$(zoneSelector);
            expect(zone).toBeTruthy();
            
            const boundingBox = await zone.boundingBox();
            expect(boundingBox.width).toBeGreaterThan(0);
            expect(boundingBox.height).toBeGreaterThan(0);
        }
        
        // Verify zones are positioned correctly relative to each other
        const settingsBox = await (await page.$('#settings-zone')).boundingBox();
        const fretboardBox = await (await page.$('#fretboard-container')).boundingBox();
        const qaBox = await (await page.$('#qa-zone')).boundingBox();
        const statsBox = await (await page.$('#stats-zone')).boundingBox();
        
        // Settings should be top-left, fretboard top-right (with some tolerance for grid gaps)
        expect(settingsBox.x).toBeLessThanOrEqual(fretboardBox.x);
        expect(settingsBox.y).toBeLessThanOrEqual(fretboardBox.y + 50);
        
        // QA zone should be below fretboard
        expect(qaBox.y).toBeGreaterThan(fretboardBox.y + fretboardBox.height - 50);
        
        // Stats should be bottom-left
        expect(statsBox.x).toBeLessThan(qaBox.x + qaBox.width);
        expect(statsBox.y).toBeGreaterThan(settingsBox.y + settingsBox.height - 50);
    });
});