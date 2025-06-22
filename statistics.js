class StatisticsManager {
    constructor() {
        this.storageKey = 'guitar-triad-stats';
        this.data = this.loadData();
        
        // Initialize data structure if not exists
        if (!this.data.sessions) {
            this.data = {
                sessions: [],
                answers: [],
                totalQuestions: 0,
                correctAnswers: 0,
                streaks: {
                    current: 0,
                    best: 0
                },
                triadStats: {},
                reviewItems: []
            };
            this.saveData();
        }
        
        this.currentSession = this.startNewSession();
    }

    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load statistics:', error);
            return {};
        }
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.warn('Failed to save statistics:', error);
        }
    }

    startNewSession() {
        const session = {
            id: Date.now(),
            startTime: Date.now(),
            endTime: null,
            totalQuestions: 0,
            correctAnswers: 0,
            modes: {
                'mode-a': { questions: 0, correct: 0, totalTime: 0 },
                'mode-b': { questions: 0, correct: 0, totalTime: 0 },
                'review': { questions: 0, correct: 0, totalTime: 0 }
            },
            triadTypes: {},
            averageTime: 0
        };
        
        this.data.sessions.push(session);
        this.saveData();
        return session;
    }

    recordAnswer(answerData) {
        const {
            mode,
            triad,
            isCorrect,
            timeElapsed,
            timestamp,
            details
        } = answerData;
        
        // Record the answer
        const answer = {
            id: Date.now() + Math.random(),
            mode,
            triad,
            isCorrect,
            timeElapsed,
            timestamp,
            details
        };
        
        this.data.answers.push(answer);
        
        // Update global counters
        this.data.totalQuestions++;
        if (isCorrect) {
            this.data.correctAnswers++;
            this.data.streaks.current++;
            this.data.streaks.best = Math.max(this.data.streaks.best, this.data.streaks.current);
        } else {
            this.data.streaks.current = 0;
        }
        
        // Update current session
        this.currentSession.totalQuestions++;
        if (isCorrect) {
            this.currentSession.correctAnswers++;
        }
        
        // Update mode-specific stats
        const modeStats = this.currentSession.modes[mode];
        if (modeStats) {
            modeStats.questions++;
            modeStats.totalTime += timeElapsed;
            if (isCorrect) {
                modeStats.correct++;
            }
        }
        
        // Update triad-specific stats
        const triadKey = `${triad.rootNote}_${triad.triadType}_${triad.inversion}`;
        
        if (!this.data.triadStats[triadKey]) {
            this.data.triadStats[triadKey] = {
                triad: triad,
                totalQuestions: 0,
                correctAnswers: 0,
                averageTime: 0,
                totalTime: 0,
                lastSeen: 0,
                difficulty: 0.5 // 0-1 scale
            };
        }
        
        const triadStats = this.data.triadStats[triadKey];
        triadStats.totalQuestions++;
        triadStats.totalTime += timeElapsed;
        triadStats.averageTime = triadStats.totalTime / triadStats.totalQuestions;
        triadStats.lastSeen = timestamp;
        
        if (isCorrect) {
            triadStats.correctAnswers++;
        }
        
        // Update difficulty based on recent performance
        this.updateTriadDifficulty(triadKey);
        
        // Update session triad stats
        if (!this.currentSession.triadTypes[triad.triadType]) {
            this.currentSession.triadTypes[triad.triadType] = { questions: 0, correct: 0 };
        }
        this.currentSession.triadTypes[triad.triadType].questions++;
        if (isCorrect) {
            this.currentSession.triadTypes[triad.triadType].correct++;
        }
        
        // Update spaced repetition
        this.updateSpacedRepetition(triadKey, isCorrect, timestamp);
        
        this.saveData();
    }

    updateTriadDifficulty(triadKey) {
        const stats = this.data.triadStats[triadKey];
        const recentAnswers = this.data.answers
            .filter(a => 
                `${a.triad.rootNote}_${a.triad.triadType}_${a.triad.inversion}` === triadKey &&
                Date.now() - a.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
            )
            .slice(-10); // Last 10 attempts
        
        if (recentAnswers.length === 0) return;
        
        const recentAccuracy = recentAnswers.filter(a => a.isCorrect).length / recentAnswers.length;
        const recentAvgTime = recentAnswers.reduce((sum, a) => sum + a.timeElapsed, 0) / recentAnswers.length;
        
        // Difficulty based on accuracy (lower accuracy = higher difficulty)
        let difficulty = 1 - recentAccuracy;
        
        // Adjust for response time (slower responses increase difficulty)
        const expectedTime = 5000; // 5 seconds baseline
        const timeMultiplier = Math.min(2, recentAvgTime / expectedTime);
        difficulty = Math.min(1, difficulty * timeMultiplier);
        
        stats.difficulty = difficulty;
    }

    updateSpacedRepetition(triadKey, isCorrect, timestamp) {
        // Remove existing review item if it exists
        this.data.reviewItems = this.data.reviewItems.filter(item => item.triadKey !== triadKey);
        
        // Calculate next review time based on spaced repetition algorithm
        let interval = 1; // Start with 1 day
        
        const stats = this.data.triadStats[triadKey];
        const successRate = stats.correctAnswers / stats.totalQuestions;
        
        if (isCorrect) {
            // Increase interval based on success rate
            if (successRate > 0.8) {
                interval = 7; // 1 week
            } else if (successRate > 0.6) {
                interval = 3; // 3 days
            } else {
                interval = 1; // 1 day
            }
        } else {
            // Review again soon if incorrect
            interval = 0.5; // 12 hours
        }
        
        // Add new review item
        this.data.reviewItems.push({
            triadKey,
            nextReview: timestamp + (interval * 24 * 60 * 60 * 1000),
            interval,
            priority: stats.difficulty
        });
        
        // Sort by next review time
        this.data.reviewItems.sort((a, b) => a.nextReview - b.nextReview);
    }

    getNextReviewItem() {
        const now = Date.now();
        const dueItems = this.data.reviewItems.filter(item => item.nextReview <= now);
        
        if (dueItems.length === 0) return null;
        
        // Return highest priority item
        dueItems.sort((a, b) => b.priority - a.priority);
        const item = dueItems[0];
        
        // Convert back to triad object
        const stats = this.data.triadStats[item.triadKey];
        return stats ? stats.triad : null;
    }

    getOverallStats() {
        const accuracy = this.data.totalQuestions > 0 ? 
            (this.data.correctAnswers / this.data.totalQuestions * 100).toFixed(1) : 0;
        
        const averageTime = this.data.answers.length > 0 ?
            (this.data.answers.reduce((sum, a) => sum + a.timeElapsed, 0) / this.data.answers.length / 1000).toFixed(1) : 0;
        
        return {
            totalQuestions: this.data.totalQuestions,
            correctAnswers: this.data.correctAnswers,
            accuracy: `${accuracy}%`,
            averageTime: `${averageTime}s`,
            currentStreak: this.data.streaks.current,
            bestStreak: this.data.streaks.best,
            totalSessions: this.data.sessions.length
        };
    }

    getSessionStats() {
        const session = this.currentSession;
        const accuracy = session.totalQuestions > 0 ? 
            (session.correctAnswers / session.totalQuestions * 100).toFixed(1) : 0;
        
        return {
            totalQuestions: session.totalQuestions,
            correctAnswers: session.correctAnswers,
            accuracy: `${accuracy}%`,
            modes: session.modes,
            triadTypes: session.triadTypes
        };
    }

    getTriadStats() {
        const stats = Object.values(this.data.triadStats)
            .map(stat => ({
                ...stat,
                accuracy: stat.totalQuestions > 0 ? 
                    (stat.correctAnswers / stat.totalQuestions * 100).toFixed(1) : 0,
                averageTimeSeconds: (stat.averageTime / 1000).toFixed(1)
            }))
            .sort((a, b) => b.totalQuestions - a.totalQuestions);
        
        return stats;
    }

    getPerformanceOverTime() {
        const dailyStats = {};
        
        this.data.answers.forEach(answer => {
            const date = new Date(answer.timestamp).toDateString();
            if (!dailyStats[date]) {
                dailyStats[date] = { total: 0, correct: 0 };
            }
            dailyStats[date].total++;
            if (answer.isCorrect) {
                dailyStats[date].correct++;
            }
        });
        
        return Object.entries(dailyStats)
            .map(([date, stats]) => ({
                date,
                accuracy: (stats.correct / stats.total * 100).toFixed(1),
                total: stats.total
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    getFretboardHeatmap() {
        const heatmap = {};
        
        // Initialize all positions
        for (let fret = 0; fret <= 24; fret++) {
            for (let string = 0; string < 6; string++) {
                const key = `${fret}-${string}`;
                heatmap[key] = { total: 0, correct: 0, accuracy: 0 };
            }
        }
        
        // Process answers
        this.data.answers.forEach(answer => {
            if (answer.details && answer.details.selectedPositions) {
                answer.details.selectedPositions.forEach(pos => {
                    const key = `${pos.fret}-${pos.string}`;
                    if (heatmap[key]) {
                        heatmap[key].total++;
                        if (answer.isCorrect) {
                            heatmap[key].correct++;
                        }
                        heatmap[key].accuracy = heatmap[key].total > 0 ? 
                            heatmap[key].correct / heatmap[key].total : 0;
                    }
                });
            }
        });
        
        return heatmap;
    }

    getReviewQueue() {
        const now = Date.now();
        return this.data.reviewItems
            .filter(item => item.nextReview <= now + 24 * 60 * 60 * 1000) // Due within 24 hours
            .map(item => ({
                ...item,
                triad: this.data.triadStats[item.triadKey]?.triad,
                stats: this.data.triadStats[item.triadKey],
                timeUntilDue: item.nextReview - now
            }))
            .sort((a, b) => a.nextReview - b.nextReview);
    }

    endSession() {
        this.currentSession.endTime = Date.now();
        this.currentSession.averageTime = this.currentSession.totalQuestions > 0 ?
            Object.values(this.currentSession.modes)
                .reduce((sum, mode) => sum + mode.totalTime, 0) / this.currentSession.totalQuestions : 0;
        
        this.saveData();
    }

    exportData() {
        return {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: this.data
        };
    }

    importData(importedData) {
        try {
            if (importedData.data && importedData.version) {
                this.data = importedData.data;
                this.currentSession = this.data.sessions[this.data.sessions.length - 1] || this.startNewSession();
                this.saveData();
                return true;
            }
        } catch (error) {
            console.error('Failed to import data:', error);
        }
        return false;
    }

    clearAllData() {
        this.data = {
            sessions: [],
            answers: [],
            totalQuestions: 0,
            correctAnswers: 0,
            streaks: { current: 0, best: 0 },
            triadStats: {},
            reviewItems: []
        };
        this.currentSession = this.startNewSession();
        this.saveData();
    }
}