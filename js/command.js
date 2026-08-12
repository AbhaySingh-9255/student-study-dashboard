/**
 * StudyTrack — Global Command Palette Engine (Ctrl+K / Cmd+K)
 */

const KEYS = [
    { key: 'studyTrack_subjects', label: 'Subject', icon: '▦', url: 'index.htm#subjects' },
    { key: 'studyTrack_tasks', label: 'Task', icon: '✓', url: 'index.htm#tasks' },
    { key: 'studyTrack_notes', label: 'Note', icon: '📝', url: 'notes.htm' },
    { key: 'studyTrack_videos', label: 'Video', icon: '▶', url: 'videos.htm' },
    { key: 'studyTrack_planner', label: 'Session', icon: '📅', url: 'planner.htm' }
];

function initCommandPalette() {
    if (document.getElementById('cmdPaletteModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cmdPaletteModal';
    overlay.className = 'modal-overlay';
    overlay.style.display = 'none';
    overlay.onclick = (e) => { if (e.target.id === 'cmdPaletteModal') closeCommandPalette(); };

    overlay.innerHTML = `
        <div class="modal-card" style="max-width: 600px; margin-top: 10vh; vertical-align: top;">
            <div class="modal-header" style="padding: 12px 16px;">
                <input type="text" id="cmdSearchInput" class="input" placeholder="🔍 Search across all tasks, notes, subjects, videos... (Esc to exit)" style="border: none; font-size: 15px;" oninput="searchCommandPalette()">
            </div>
            <div class="modal-body" id="cmdResultsList" style="max-height: 380px; gap: 6px; padding: 12px;">
                <div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 20px;">Type something to search...</div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            toggleCommandPalette();
        }
        if (e.key === 'Escape') closeCommandPalette();
    });
}

function toggleCommandPalette() {
    const modal = document.getElementById('cmdPaletteModal');
    if (!modal) return;
    if (modal.style.display === 'none') {
        modal.style.display = 'flex';
        const input = document.getElementById('cmdSearchInput');
        if (input) { input.value = ''; input.focus(); searchCommandPalette(); }
    } else {
        closeCommandPalette();
    }
}

function closeCommandPalette() {
    const modal = document.getElementById('cmdPaletteModal');
    if (modal) modal.style.display = 'none';
}

function searchCommandPalette() {
    const query = document.getElementById('cmdSearchInput')?.value.trim().toLowerCase() || '';
    const resultsContainer = document.getElementById('cmdResultsList');
    if (!resultsContainer) return;

    if (!query) {
        resultsContainer.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 20px;">Type something to search across StudyTrack...</div>';
        return;
    }

    const matches = [];

    KEYS.forEach(config => {
        try {
            const raw = localStorage.getItem(config.key);
            const items = raw ? JSON.parse(raw) : [];
            items.forEach(item => {
                const title = item.title || item.name || '';
                const desc = item.description || item.content || item.subject || '';
                if (title.toLowerCase().includes(query) || desc.toLowerCase().includes(query)) {
                    matches.push({
                        title,
                        desc,
                        label: config.label,
                        icon: config.icon,
                        url: config.url
                    });
                }
            });
        } catch (e) {}
    });

    if (matches.length === 0) {
        resultsContainer.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 20px;">No matching items found.</div>';
        return;
    }

    resultsContainer.innerHTML = '';
    matches.slice(0, 8).forEach(res => {
        const row = document.createElement('a');
        row.href = res.url;
        row.className = 'syllabus-topic-item';
        row.style.textDecoration = 'none';
        row.innerHTML = `
            <div class="topic-left">
                <span style="font-size: 14px;">${res.icon}</span>
                <div style="display: flex; flex-direction: column;">
                    <strong style="font-size: 13px; color: var(--text-main);">${escapeCmdHTML(res.title)}</strong>
                    <small style="font-size: 11px; color: var(--text-muted);">${escapeCmdHTML(res.desc.substring(0, 60))}</small>
                </div>
            </div>
            <span class="priority-badge priority-low">${res.label}</span>
        `;
        resultsContainer.appendChild(row);
    });
}

function escapeCmdHTML(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', initCommandPalette);