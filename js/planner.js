/**
 * StudyTrack — Study Planner Engine (Phase 2)
 */

const PLANNER_STORAGE_KEY = 'studyTrack_planner';
const SUBJECTS_STORAGE_KEY = 'studyTrack_subjects';

// Global exports
window.openPlannerModal = openPlannerModal;
window.closePlannerModal = closePlannerModal;
window.handlePlannerOverlayClick = handlePlannerOverlayClick;
window.savePlannerSession = savePlannerSession;
window.deletePlannerSession = deletePlannerSession;
window.toggleSessionComplete = toggleSessionComplete;
window.filterPlannerSessions = filterPlannerSessions;
window.populatePlannerSubjects = populatePlannerSubjects;

function loadPlanner() {
    try {
        const saved = localStorage.getItem(PLANNER_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Error loading planner data:", e);
        return [];
    }
}

function savePlanner(data) {
    try {
        localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Error saving planner data:", e);
    }
}

function getActiveSubjects() {
    try {
        const saved = localStorage.getItem(SUBJECTS_STORAGE_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return parsed.map(s => (typeof s === 'string' ? s : s.name)).filter(Boolean);
    } catch (e) {
        return [];
    }
}

function populatePlannerSubjects() {
    const formSelect = document.getElementById('plannerSubjectInput');
    const filterSelect = document.getElementById('plannerFilterSubject');
    const subjects = getActiveSubjects();

    if (formSelect) {
        formSelect.innerHTML = '<option value="" disabled selected>Select subject</option>';
        subjects.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            formSelect.appendChild(opt);
        });
    }

    if (filterSelect) {
        const current = filterSelect.value || 'all';
        filterSelect.innerHTML = '<option value="all">All Subjects</option>';
        subjects.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            filterSelect.appendChild(opt);
        });
        filterSelect.value = current;
    }
}

function openPlannerModal() {
    const modal = document.getElementById('plannerModal');
    if (modal) {
        populatePlannerSubjects();
        const dateInput = document.getElementById('plannerDateInput');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        modal.style.display = 'flex';
    }
}

function closePlannerModal() {
    const modal = document.getElementById('plannerModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('plannerForm');
    if (form) form.reset();
    const idInput = document.getElementById('plannerIdInput');
    if (idInput) idInput.value = '';
}

function handlePlannerOverlayClick(event) {
    if (event.target && event.target.id === 'plannerModal') {
        closePlannerModal();
    }
}

function savePlannerSession(event) {
    if (event && event.preventDefault) event.preventDefault();

    const idInput = document.getElementById('plannerIdInput');
    const titleInput = document.getElementById('plannerTitleInput');
    const subjectInput = document.getElementById('plannerSubjectInput');
    const dateInput = document.getElementById('plannerDateInput');
    const durationInput = document.getElementById('plannerDurationInput');

    const title = titleInput.value.trim();
    const subject = subjectInput.value;
    const date = dateInput.value;
    const duration = parseInt(durationInput.value, 10) || 60;

    if (!title || !subject || !date) return;

    const planner = loadPlanner();
    const id = idInput.value;

    if (id) {
        const idx = planner.findIndex(p => p.id === id);
        if (idx !== -1) {
            planner[idx].title = title;
            planner[idx].subject = subject;
            planner[idx].date = date;
            planner[idx].duration = duration;
        }
    } else {
        planner.unshift({
            id: 'session_' + Date.now(),
            title: title,
            subject: subject,
            date: date,
            duration: duration,
            completed: false
        });
    }

    savePlanner(planner);
    closePlannerModal();
    filterPlannerSessions();
    updatePlannerStats();
}

function toggleSessionComplete(id) {
    const planner = loadPlanner();
    const session = planner.find(p => p.id === id);
    if (session) {
        session.completed = !session.completed;
        savePlanner(planner);
        filterPlannerSessions();
        updatePlannerStats();
    }
}

function deletePlannerSession(id) {
    if (confirm("Delete this scheduled study session?")) {
        let planner = loadPlanner();
        planner = planner.filter(p => p.id !== id);
        savePlanner(planner);
        filterPlannerSessions();
        updatePlannerStats();
    }
}

function filterPlannerSessions() {
    const query = document.getElementById('plannerSearchInput')?.value.trim().toLowerCase() || '';
    const selectedSub = document.getElementById('plannerFilterSubject')?.value || 'all';
    const selectedStatus = document.getElementById('plannerFilterStatus')?.value || 'all';

    const planner = loadPlanner();
    const filtered = planner.filter(s => {
        const matchQuery = s.title.toLowerCase().includes(query) || s.subject.toLowerCase().includes(query);
        const matchSub = selectedSub === 'all' || s.subject === selectedSub;
        let matchStatus = true;
        if (selectedStatus === 'planned') matchStatus = !s.completed;
        if (selectedStatus === 'completed') matchStatus = s.completed;

        return matchQuery && matchSub && matchStatus;
    });

    renderPlannerSessions(filtered);
}

function renderPlannerSessions(list) {
    const container = document.getElementById('plannerGridContainer');
    const emptyState = document.getElementById('plannerEmptyState');
    if (!container) return;

    if (!list || list.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = '';

    list.forEach(item => {
        const card = document.createElement('article');
        card.className = `task-item ${item.completed ? 'completed' : ''}`;

        card.innerHTML = `
            <button class="task-check ${item.completed ? 'completed' : ''}" onclick="toggleSessionComplete('${item.id}')">
                ${item.completed ? '✓' : ''}
            </button>
            <div class="task-info">
                <div class="task-title">${escapePlannerHTML(item.title)}</div>
                <div class="task-meta">
                    <span>${escapePlannerHTML(item.subject)}</span>
                    <span>• Date: ${item.date}</span>
                    <span>• Duration: ${item.duration} mins</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="delete-button" onclick="deletePlannerSession('${item.id}')">×</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function updatePlannerStats() {
    const planner = loadPlanner();
    const total = planner.length;
    const totalMinutes = planner.reduce((acc, s) => acc + (s.duration || 0), 0);
    const completedMinutes = planner.filter(s => s.completed).reduce((acc, s) => acc + (s.duration || 0), 0);

    const totalHours = (totalMinutes / 60).toFixed(1);
    const compHours = (completedMinutes / 60).toFixed(1);
    const rate = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;

    const tEl = document.getElementById('pStatsTotal');
    const hEl = document.getElementById('pStatsHours');
    const chEl = document.getElementById('pStatsCompletedHours');
    const rEl = document.getElementById('pStatsRate');
    const fEl = document.getElementById('pStatsRateFill');

    if (tEl) tEl.textContent = total;
    if (hEl) hEl.textContent = `${totalHours}h`;
    if (chEl) chEl.textContent = `${compHours}h`;
    if (rEl) rEl.textContent = `${rate}%`;
    if (fEl) fEl.style.width = `${rate}%`;
}

function escapePlannerHTML(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    populatePlannerSubjects();
    filterPlannerSessions();
    updatePlannerStats();
});