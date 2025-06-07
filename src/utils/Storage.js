/**
 * Local storage management for user data and settings
 */

import { STORAGE_KEYS, DEFAULTS } from './Constants.js';

export class Storage {
    /**
     * Save user performance data to local storage
     * @param {Array} performanceData - Array of quiz attempts
     */
    static saveUserPerformance(performanceData) {
        try {
            localStorage.setItem(
                STORAGE_KEYS.USER_PERFORMANCE, 
                JSON.stringify(performanceData)
            );
            console.log('User performance saved to storage');
        } catch (error) {
            console.error('Failed to save user performance to local storage:', error);
        }
    }

    /**
     * Load user performance data from local storage
     * @returns {Array} Array of quiz attempts
     */
    static loadUserPerformance() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USER_PERFORMANCE);
            if (stored) {
                const data = JSON.parse(stored);
                console.log('Loaded user performance from storage:', data.length, 'attempts');
                return data;
            }
        } catch (error) {
            console.error('Failed to load user performance from local storage:', error);
        }
        return [];
    }

    /**
     * Save user settings to local storage
     * @param {Object} settings - User settings object
     */
    static saveUserSettings(settings) {
        try {
            localStorage.setItem(
                STORAGE_KEYS.USER_SETTINGS, 
                JSON.stringify(settings)
            );
            console.log('User settings saved to storage');
        } catch (error) {
            console.error('Failed to save user settings to local storage:', error);
        }
    }

    /**
     * Load user settings from local storage
     * @returns {Object} User settings object with defaults
     */
    static loadUserSettings() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
            if (stored) {
                const settings = JSON.parse(stored);
                console.log('Loaded user settings from storage');
                return {
                    ...DEFAULTS,
                    ...settings
                };
            }
        } catch (error) {
            console.error('Failed to load user settings from local storage:', error);
        }
        
        // Return defaults if no stored settings or error
        return { ...DEFAULTS };
    }

    /**
     * Clear all user data from local storage
     */
    static clearAllData() {
        try {
            localStorage.removeItem(STORAGE_KEYS.USER_PERFORMANCE);
            localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
            console.log('All user data cleared from storage');
        } catch (error) {
            console.error('Failed to clear user data from local storage:', error);
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage details
     */
    static getStorageInfo() {
        try {
            const performanceSize = localStorage.getItem(STORAGE_KEYS.USER_PERFORMANCE)?.length || 0;
            const settingsSize = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)?.length || 0;
            
            return {
                performanceDataSize: performanceSize,
                settingsDataSize: settingsSize,
                totalSize: performanceSize + settingsSize,
                hasPerformanceData: performanceSize > 0,
                hasSettingsData: settingsSize > 0
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return {
                performanceDataSize: 0,
                settingsDataSize: 0,
                totalSize: 0,
                hasPerformanceData: false,
                hasSettingsData: false
            };
        }
    }

    /**
     * Instance method to set a value in localStorage (for testing compatibility)
     * @param {string} key - The key to store the value under
     * @param {any} value - The value to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to set value in storage:', error);
        }
    }

    /**
     * Instance method to get a value from localStorage (for testing compatibility)
     * @param {string} key - The key to retrieve the value for
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} The stored value or default value
     */
    get(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            if (stored !== null) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to get value from storage:', error);
        }
        return defaultValue;
    }
}
