// More precise String-3 investigation with better position detection
const puppeteer = require('puppeteer');

async function preciseString3Investigation() {
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
        
        console.log('Precise String-3 investigation using actual fretboard methods...');
        
        const string3Results = [];
        const testCount = 50;
        
        for (let i = 0; i < testCount; i++) {
            await page.click('#random-chord');
            await page.waitForTimeout(50);
            
            // Get chord info using the actual fretboard's fingerDots array
            const chordInfo = await page.evaluate(() => {
                // Access the actual fretboard instance
                const fretboard = window.app ? window.app.fretboard : null;
                if (!fretboard || !fretboard.fingerDots) {
                    return null;
                }
                
                // Get the actual finger dots from the fretboard
                const dots = fretboard.fingerDots.map(dot => ({
                    string: dot.string,
                    fret: dot.fret,
                    note: dot.note
                }));
                
                return dots;
            });
            
            if (chordInfo && chordInfo.length === 3) {
                // Find bass note (highest string number = actual bass)
                const bassPosition = chordInfo.reduce((highest, pos) => 
                    pos.string > highest.string ? pos : highest
                );
                
                const chordData = {
                    test: i + 1,
                    positions: chordInfo,
                    bassString: bassPosition.string,
                    bassFret: bassPosition.fret,
                    bassNote: bassPosition.note
                };
                
                string3Results.push(chordData);
                
                if (bassPosition.string === 3) {
                    console.log(`Test ${i + 1}: String-3 root found - ${bassPosition.note} at String-3, Fret-${bassPosition.fret}`);
                    console.log(`  Full chord: ${chordInfo.map(d => `S${d.string}F${d.fret}(${d.note})`).join(', ')}`);
                }
            }
        }
        
        // Analyze results
        const string3Count = string3Results.filter(chord => chord.bassString === 3).length;
        const bassDistribution = {};
        
        string3Results.forEach(chord => {
            const string = chord.bassString;
            bassDistribution[string] = (bassDistribution[string] || 0) + 1;
        });
        
        console.log(`\nResults after ${testCount} tests:`);
        console.log(`String-3 root notes: ${string3Count}/${testCount} (${(string3Count/testCount*100).toFixed(1)}%)`);
        
        console.log('\nBass string distribution:');
        Object.entries(bassDistribution).forEach(([string, count]) => {
            console.log(`  String-${string}: ${count} (${(count/testCount*100).toFixed(1)}%)`);
        });
        
        // Check the actual chord database in the browser
        const databaseAnalysis = await page.evaluate(() => {
            // Get the actual app instance
            if (!window.app) {
                return null;
            }
            
            const chords = window.app.generateChordDatabase();
            const majorClosedRoot = chords.filter(chord => 
                chord.type === 'major' && 
                chord.voicing === 'closed' && 
                chord.inversion === 'root'
            );
            
            return majorClosedRoot.map(chord => {
                // Find bass position
                const bassPosition = chord.positions.reduce((highest, pos) => 
                    pos[0] > highest[0] ? pos : highest
                );
                
                // Get bass note using fretboard's getNote method
                const bassNote = window.app.fretboard.getNote(bassPosition[0], bassPosition[1]);
                const rootNote = chord.name.split(' ')[0];
                
                return {
                    name: chord.name,
                    positions: chord.positions,
                    bassString: bassPosition[0],
                    bassFret: bassPosition[1],
                    bassNote: bassNote,
                    rootNote: rootNote,
                    isString3: bassPosition[0] === 3
                };
            });
        });
        
        if (databaseAnalysis) {
            console.log('\nActual chord database analysis:');
            databaseAnalysis.forEach(chord => {
                console.log(`  ${chord.name}: ${JSON.stringify(chord.positions)} -> Bass: String-${chord.bassString} (${chord.bassNote}) ${chord.isString3 ? '✓ String-3' : ''}`);
            });
            
            const dbString3Count = databaseAnalysis.filter(chord => chord.isString3).length;
            console.log(`\nDatabase String-3 coverage: ${dbString3Count}/${databaseAnalysis.length} (${(dbString3Count/databaseAnalysis.length*100).toFixed(1)}%)`);
            
            if (dbString3Count === 0) {
                console.log('❌ No chords in database have root on String-3!');
            } else {
                console.log('✓ Database contains String-3 root chords');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

preciseString3Investigation();