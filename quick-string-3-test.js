// Quick String-3 verification test
const puppeteer = require('puppeteer');

async function quickString3Test() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:8010');
        await page.waitForSelector('#random-chord', { timeout: 5000 });
        
        // Set settings: Major, Closed, Root Position only
        await page.evaluate(() => {
            document.getElementById('chord-type-minor').checked = false;
            document.getElementById('chord-type-diminished').checked = false;
            document.getElementById('chord-type-augmented').checked = false;
            document.getElementById('chord-type-major').checked = true;
            
            document.getElementById('voicing-open').checked = false;
            document.getElementById('voicing-closed').checked = true;
            
            document.getElementById('inversion-first').checked = false;
            document.getElementById('inversion-second').checked = false;
            document.getElementById('inversion-root').checked = true;
        });
        
        console.log('Testing String-3 chord generation...');
        
        let string3Found = false;
        const string3Examples = [];
        
        for (let i = 0; i < 20 && !string3Found; i++) {
            await page.click('#random-chord');
            await page.waitForTimeout(100);
            
            // Simple check - just look for finger dots near String-3 area
            const string3Activity = await page.evaluate(() => {
                const dots = document.querySelectorAll('.finger-dot');
                const string3Y = 250 / 7 * 4; // String-3 Y position (approximately)
                
                let hasString3Dot = false;
                const dotPositions = [];
                
                dots.forEach(dot => {
                    const y = parseFloat(dot.style.top);
                    const x = parseFloat(dot.style.left);
                    
                    dotPositions.push({ x, y });
                    
                    // Check if dot is near String-3 (within 15px tolerance)
                    if (Math.abs(y + 10 - string3Y) < 15) {
                        hasString3Dot = true;
                    }
                });
                
                return { hasString3Dot, dotCount: dots.length, positions: dotPositions };
            });
            
            if (string3Activity.hasString3Dot && string3Activity.dotCount === 3) {
                string3Found = true;
                string3Examples.push({
                    test: i + 1,
                    positions: string3Activity.positions
                });
                console.log(`✅ Found String-3 chord on test ${i + 1}!`);
                break;
            }
        }
        
        if (string3Found) {
            console.log('✅ SUCCESS: String-3 chords are being generated!');
            console.log('String-3 example positions:', string3Examples[0].positions);
        } else {
            console.log('❌ ISSUE: No String-3 chords found in 20 attempts');
        }
        
        // Test chord database accessibility  
        const databaseInfo = await page.evaluate(() => {
            if (window.app && window.app.generateChordDatabase) {
                const chords = window.app.generateChordDatabase();
                const majorClosedRoot = chords.filter(chord => 
                    chord.type === 'major' && 
                    chord.voicing === 'closed' && 
                    chord.inversion === 'root'
                );
                
                return {
                    totalChords: chords.length,
                    majorClosedRoot: majorClosedRoot.length,
                    hasString3Variants: majorClosedRoot.some(chord => 
                        chord.name.includes('String-3')
                    )
                };
            }
            return null;
        });
        
        if (databaseInfo) {
            console.log('✅ Chord database accessible');
            console.log(`  Total chords: ${databaseInfo.totalChords}`);
            console.log(`  Major closed root: ${databaseInfo.majorClosedRoot}`);
            console.log(`  Has String-3 variants: ${databaseInfo.hasString3Variants}`);
        } else {
            console.log('❌ Cannot access chord database');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

quickString3Test();