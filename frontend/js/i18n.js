/**
 * Internationalization (i18n) module for the Recipes App
 * Supports English (en) and Polish (pl) languages
 * Default language: English
 */

import en from './locales/en.json' with { type: 'json' };
import pl from './locales/pl.json' with { type: 'json' };

const translations = { en, pl };
const STORAGE_KEY = 'recipes-app-language';
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'pl'];

let currentLanguage = DEFAULT_LANGUAGE;
let listeners = [];

/**
 * Initialize i18n module
 * Loads saved language preference or uses default
 */
function init() {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        currentLanguage = savedLanguage;
    }
    updateHtmlLang();
}

/**
 * Get translation for a key path
 * @param {string} keyPath - Dot-separated path to translation (e.g., 'nav.recipes')
 * @param {Object} params - Optional parameters for interpolation
 * @returns {string} Translated string or key if not found
 */
function t(keyPath, params = {}) {
    const keys = keyPath.split('.');
    let value = translations[currentLanguage];

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            console.warn(`Translation not found: ${keyPath}`);
            return keyPath;
        }
    }

    // Handle parameter interpolation (e.g., "Hello {{name}}")
    if (typeof value === 'string' && Object.keys(params).length > 0) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? params[paramKey] : match;
        });
    }

    return value;
}

/**
 * Get current language code
 * @returns {string} Current language code ('en' or 'pl')
 */
function getLanguage() {
    return currentLanguage;
}

/**
 * Set the current language
 * @param {string} langCode - Language code ('en' or 'pl')
 */
function setLanguage(langCode) {
    if (!SUPPORTED_LANGUAGES.includes(langCode)) {
        console.error(`Unsupported language: ${langCode}`);
        return;
    }

    currentLanguage = langCode;
    localStorage.setItem(STORAGE_KEY, langCode);
    updateHtmlLang();
    notifyListeners();
}

/**
 * Toggle between languages
 */
function toggleLanguage() {
    const newLang = currentLanguage === 'en' ? 'pl' : 'en';
    setLanguage(newLang);
}

/**
 * Update the HTML lang attribute
 */
function updateHtmlLang() {
    document.documentElement.lang = currentLanguage;
}

/**
 * Subscribe to language change events
 * @param {Function} callback - Function to call when language changes
 * @returns {Function} Unsubscribe function
 */
function onLanguageChange(callback) {
    listeners.push(callback);
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
}

/**
 * Notify all listeners of language change
 */
function notifyListeners() {
    listeners.forEach(callback => callback(currentLanguage));
}

/**
 * Get all supported languages with their labels
 * @returns {Array} Array of {code, label} objects
 */
function getSupportedLanguages() {
    return [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'pl', label: 'Polski', flag: '🇵🇱' }
    ];
}

// Initialize on module load
init();

export { t, getLanguage, setLanguage, toggleLanguage, onLanguageChange, getSupportedLanguages };
export default { t, getLanguage, setLanguage, toggleLanguage, onLanguageChange, getSupportedLanguages };
