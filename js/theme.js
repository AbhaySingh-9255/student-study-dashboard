/**
 * StudyTrack — Theme Engine & Dark Mode Manager
 */

const THEME_STORAGE_KEY = 'studyTrack_theme';

function updateDarkModeUI(theme) {
    const btn = document.getElementById('darkModeToggleBtn');
    if (btn) {
        btn.innerHTML = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    updateDarkModeUI(newTheme);
}

// Immediate Theme Setup
(function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const theme = savedTheme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    document.addEventListener('DOMContentLoaded', () => {
        updateDarkModeUI(theme);
    });
})();

window.toggleDarkMode = toggleDarkMode;