/**
 * Test runner for all modules
 * Run with: node tests/run-tests.js
 */

import { runTriadGeneratorTests } from './TriadGenerator.test.js';
import { runStatisticsTests } from './Statistics.test.js';
import { runMusicUtilsTests } from './MusicUtils.test.js';
import { runAudioManagerTests } from './AudioManager.test.js';

// Simple test framework for Node.js
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    async runAll() {
        console.log('🎸 Guitar Triad App - Running Unit Tests\n');
        
        for (const test of this.tests) {
            try {
                await test.fn();
                this.results.push({ name: test.name, passed: true });
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.results.push({ name: test.name, passed: false, error });
                console.log(`❌ ${test.name}`);
                console.log(`   Error: ${error.message}\n`);
            }
        }
        
        this.showSummary();
    }
    
    showSummary() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        const successRate = ((passed / total) * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`Passed: ${passed}/${total}`);
        console.log(`Success Rate: ${successRate}%`);
        
        if (passed === total) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('❌ Some tests failed. See details above.');
            
            // Show failed tests
            const failed = this.results.filter(r => !r.passed);
            console.log('\nFailed tests:');
            failed.forEach(test => {
                console.log(`  - ${test.name}: ${test.error.message}`);
            });
        }
        
        process.exit(passed === total ? 0 : 1);
    }
    
    assertEquals(actual, expected, message = '') {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message} Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
        }
    }
    
    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`${message} Expected true, got false`);
        }
    }
    
    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`${message} Expected false, got true`);
        }
    }
    
    assertThrows(fn, message = '') {
        try {
            fn();
            throw new Error(`${message} Expected function to throw an error`);
        } catch (error) {
            // Expected behavior - check if this is the assertion error or the expected error
            if (error.message.includes('Expected function to throw an error')) {
                throw error; // Re-throw assertion error
            }
            // Otherwise, this is the expected thrown error
        }
    }
}

// Mock browser globals for Node.js environment
if (typeof globalThis !== 'undefined') {
    globalThis.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
    };
    
    globalThis.AudioContext = class MockAudioContext {
        constructor() {
            this.state = 'suspended';
            this.destination = {};
        }
        async resume() {
            this.state = 'running';
        }
        createOscillator() {
            return {
                frequency: { value: 440 },
                type: 'sine',
                connect: () => {},
                start: () => {},
                stop: () => {}
            };
        }
        createGain() {
            return {
                gain: { value: 1 },
                connect: () => {}
            };
        }
    };
}

// Run all test suites
async function runAllTests() {
    const runner = new TestRunner();
    
    console.log('Running MusicUtils tests...');
    runMusicUtilsTests(runner);
    
    console.log('Running Statistics tests...');
    runStatisticsTests(runner);
    
    console.log('Running TriadGenerator tests...');
    runTriadGeneratorTests(runner);
    
    console.log('Running AudioManager tests...');
    runAudioManagerTests(runner);
    
    await runner.runAll();
}

// Execute tests
runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
