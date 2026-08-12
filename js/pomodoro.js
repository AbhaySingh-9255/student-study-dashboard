/**
 * StudyTrack — Redesigned Focus Timer (Pomodoro Engine)
 */

let timerInterval = null;
let totalDuration = 25 * 60;
let timeLeft = 25 * 60;
let isRunning = false;
let currentMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'

function initPomodoroWidget() {
    // Remove old widget if exists
    const existing = document.getElementById('pomodoroWidget');
    if (existing) existing.remove();

    // 1. Inject Topbar Timer Pill if topbar exists
    const topbar = document.querySelector('.topbar');
    if (topbar && !document.getElementById('topbarTimerPill')) {
        const topbarPill = document.createElement('div');
        topbarPill.id = 'topbarTimerPill';
        topbarPill.className = 'topbar-timer-pill';
        topbarPill.title = 'Click to toggle Focus Timer Panel';
        topbarPill.onclick = togglePomodoroWidget;
        topbarPill.innerHTML = `
            <span>⏱</span>
            <span class="topbar-timer-time" id="topbarDisplay">25:00</span>
        `;
        // Insert before topbar title or profile
        topbar.insertBefore(topbarPill, topbar.children[1] || null);
    }

    // 2. Create Floating Bottom-Right Timer Panel
    const timerBox = document.createElement('div');
    timerBox.id = 'pomodoroWidget';
    timerBox.className = 'pomodoro-widget';
    timerBox.innerHTML = `
        <div class="pomodoro-header">
            <span class="pomodoro-badge" id="pomoBadge">🧠 FOCUS MODE</span>
            <button onclick="togglePomodoroWidget()" class="topic-btn" title="Minimize Timer">✕</button>
        </div>

        <div class="pomodoro-display-container">
            <div class="pomodoro-display" id="pomoDisplay">25:00</div>
            <div class="pomodoro-progress-bar">
                <div class="pomodoro-progress-fill" id="pomoProgressFill" style="width: 100%"></div>
            </div>
        </div>

        <div class="pomodoro-controls">
            <button onclick="startPomodoro()" class="primary-button" style="padding: 6px 14px; font-size: 12px;" id="pomoStartBtn">▶ Start</button>
            <button onclick="pausePomodoro()" class="secondary-button" style="padding: 6px 12px; font-size: 12px;">⏸ Pause</button>
            <button onclick="resetPomodoro()" class="secondary-button" style="padding: 6px 10px; font-size: 12px;" title="Reset Timer">↺</button>
        </div>

        <div class="pomodoro-modes">
            <button onclick="setPomodoroMode('focus', 25)" class="pomodoro-mode-btn active" id="modeFocus">25m Focus</button>
            <button onclick="setPomodoroMode('shortBreak', 5)" class="pomodoro-mode-btn" id="modeShort">5m Break</button>
            <button onclick="setPomodoroMode('longBreak', 15)" class="pomodoro-mode-btn" id="modeLong">15m Break</button>
        </div>
    `;
    document.body.appendChild(timerBox);
    updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const display = document.getElementById('pomoDisplay');
    const topbarDisplay = document.getElementById('topbarDisplay');
    const progressFill = document.getElementById('pomoProgressFill');

    if (display) display.textContent = formatted;
    if (topbarDisplay) topbarDisplay.textContent = formatted;

    if (progressFill) {
        const percent = (timeLeft / totalDuration) * 100;
        progressFill.style.width = `${percent}%`;
    }
}

function setPomodoroMode(mode, mins) {
    pausePomodoro();
    currentMode = mode;
    totalDuration = mins * 60;
    timeLeft = totalDuration;

    // Update Mode Buttons Active State
    document.querySelectorAll('.pomodoro-mode-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'focus') document.getElementById('modeFocus')?.classList.add('active');
    if (mode === 'shortBreak') document.getElementById('modeShort')?.classList.add('active');
    if (mode ===