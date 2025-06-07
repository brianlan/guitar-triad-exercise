/**
 * Unit tests for Statistics module
 */

import { Statistics } from '../src/utils/Statistics.js';

export function runStatisticsTests(runner) {
    runner.test('Statistics - Initial state', () => {
        const stats = new Statistics();
        const data = stats.getStats();
        
        runner.assertEquals(data.total, 0, 'Initial total should be 0');
        runner.assertEquals(data.correct, 0, 'Initial correct should be 0');
        runner.assertEquals(data.accuracy, 0, 'Initial accuracy should be 0');
        runner.assertEquals(data.averageTime, 0, 'Initial average time should be 0');
    });
    
    runner.test('Statistics - Adding results', () => {
        const stats = new Statistics();
        
        stats.addResult('identification', {
            correct: true,
            timeTaken: 2000,
            rootNote: 'C',
            triadType: 'Major',
            inversion: 0
        });
        
        const data = stats.getStats();
        runner.assertEquals(data.total, 1, 'Total should be 1');
        runner.assertEquals(data.correct, 1, 'Correct should be 1');
        runner.assertEquals(data.accuracy, 100, 'Accuracy should be 100%');
        runner.assertEquals(data.averageTime, 2, 'Average time should be 2 seconds');
    });
    
    runner.test('Statistics - Mixed results calculation', () => {
        const stats = new Statistics();
        
        // Add correct answer
        stats.addResult('identification', {
            correct: true,
            timeTaken: 1500,
            rootNote: 'C',
            triadType: 'Major',
            inversion: 0
        });
        
        // Add incorrect answer
        stats.addResult('identification', {
            correct: false,
            timeTaken: 4500,
            rootNote: 'G',
            triadType: 'Minor',
            inversion: 1
        });
        
        // Add another correct answer
        stats.addResult('completion', {
            correct: true,
            timeTaken: 3000,
            rootNote: 'F',
            triadType: 'Major',
            inversion: 0
        });
        
        const data = stats.getStats();
        runner.assertEquals(data.total, 3, 'Total should be 3');
        runner.assertEquals(data.correct, 2, 'Correct should be 2');
        runner.assertEquals(data.accuracy, 67, 'Accuracy should be 67% (rounded)');
        runner.assertEquals(data.averageTime, 3, 'Average time should be 3 seconds');
    });
    
    runner.test('Statistics - Mode-specific stats', () => {
        const stats = new Statistics();
        
        // Add identification results
        stats.addResult('identification', { correct: true, timeTaken: 2000 });
        stats.addResult('identification', { correct: false, timeTaken: 3000 });
        
        // Add completion results
        stats.addResult('completion', { correct: true, timeTaken: 4000 });
        stats.addResult('completion', { correct: true, timeTaken: 2000 });
        stats.addResult('completion', { correct: false, timeTaken: 5000 });
        
        const data = stats.getStats();
        
        // Check identification stats
        runner.assertEquals(data.identification.total, 2, 'ID total should be 2');
        runner.assertEquals(data.identification.correct, 1, 'ID correct should be 1');
        runner.assertEquals(data.identification.accuracy, 50, 'ID accuracy should be 50%');
        runner.assertEquals(data.identification.averageTime, 2.5, 'ID avg time should be 2.5s');
        
        // Check completion stats
        runner.assertEquals(data.completion.total, 3, 'Completion total should be 3');
        runner.assertEquals(data.completion.correct, 2, 'Completion correct should be 2');
        runner.assertEquals(data.completion.accuracy, 67, 'Completion accuracy should be 67%');
        runner.assertEquals(data.completion.averageTime, 3.7, 'Completion avg time should be 3.7s');
    });
    
    runner.test('Statistics - Reset functionality', () => {
        const stats = new Statistics();
        
        // Add some data
        stats.addResult('identification', { correct: true, timeTaken: 2000 });
        stats.addResult('completion', { correct: false, timeTaken: 3000 });
        
        // Reset
        stats.reset();
        
        const data = stats.getStats();
        runner.assertEquals(data.total, 0, 'Total should be 0 after reset');
        runner.assertEquals(data.correct, 0, 'Correct should be 0 after reset');
        runner.assertEquals(data.identification.total, 0, 'ID total should be 0 after reset');
        runner.assertEquals(data.completion.total, 0, 'Completion total should be 0 after reset');
    });
    
    runner.test('Statistics - Performance tracking over time', () => {
        const stats = new Statistics();
        
        // Add results with timestamps
        const baseTime = Date.now();
        
        stats.addResult('identification', {
            correct: true,
            timeTaken: 2000,
            timestamp: baseTime
        });
        
        stats.addResult('identification', {
            correct: false,
            timeTaken: 3000,
            timestamp: baseTime + 60000 // 1 minute later
        });
        
        const recentStats = stats.getRecentStats(1); // Last 1 hour
        runner.assertEquals(recentStats.total, 2, 'Recent stats should include both results');
    });
    
    runner.test('Statistics - Difficulty tracking', () => {
        const stats = new Statistics();
        
        // Add results with different difficulty levels
        stats.addResult('identification', {
            correct: true,
            timeTaken: 2000,
            rootNote: 'C',
            triadType: 'Major',
            inversion: 0
        });
        
        stats.addResult('identification', {
            correct: false,
            timeTaken: 5000,
            rootNote: 'F#',
            triadType: 'Diminished',
            inversion: 2
        });
        
        const difficultyStats = stats.getStatsByDifficulty();
        runner.assertTrue('Major' in difficultyStats, 'Should track Major triad stats');
        runner.assertTrue('Diminished' in difficultyStats, 'Should track Diminished triad stats');
    });
    
    runner.test('Statistics - Export functionality', () => {
        const stats = new Statistics();
        
        stats.addResult('identification', {
            correct: true,
            timeTaken: 2000,
            rootNote: 'C',
            triadType: 'Major',
            inversion: 0
        });
        
        const exportData = stats.exportData();
        runner.assertTrue(typeof exportData === 'string', 'Export should return string');
        
        const parsed = JSON.parse(exportData);
        runner.assertTrue('overall' in parsed, 'Export should contain overall stats');
        runner.assertTrue('byMode' in parsed, 'Export should contain mode stats');
        runner.assertTrue('results' in parsed, 'Export should contain raw results');
    });
}
