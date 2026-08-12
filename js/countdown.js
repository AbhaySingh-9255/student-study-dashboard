/**
 * StudyTrack — Exam & Deadline Countdown Engine
 */

function renderDeadlineCountdowns() {
    const container = document.getElementById('countdownWidgetContainer');
    if (!container) return;

    const tasks = JSON.parse(localStorage.getItem('studyTrack_tasks') || '[]');
    const upcoming = tasks.filter(t => t.deadline && !t.completed).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (upcoming.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = '';

    upcoming.slice(0, 3).forEach(task => {
        const now = new Date().getTime();
        const target = new Date(task.deadline).getTime();
        const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

        let badgeClass = 'priority-low';
        let statusText = `${diffDays} days left`;

        if (diffDays < 0) {
            badgeClass = 'priority-high';
            statusText = 'Overdue!';
        } else if (diffDays <= 2) {
            badgeClass = 'priority-high';
            statusText = `${diffDays} day(s) left!`;
        } else if (diffDays <= 5) {
            badgeClass = 'priority-medium';
        }

        const box = document.createElement('div');
        box.className = 'summary-item';
        box.style.flex = '1';
        box.innerHTML = `
            <span class="priority-badge ${badgeClass}" style="float: right;">${statusText}</span>
            <strong style="font-size: 14px; display: block; margin-top: 4px;">${escapeCountdownHTML(task.title)}</strong>
            <small style="color: var(--text-muted);">${escapeCountdownHTML(task.subject)} • Due: ${task.deadline}</small>
        `;
        container.appendChild(box);
    });
}

function escapeCountdownHTML(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', renderDeadlineCountdowns);