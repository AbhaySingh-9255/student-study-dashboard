/**
 * StudyTrack — Focus Timer Engine
 */

let timerInterval = null;
let totalDuration = 25 * 60;
let timeLeft = 25 * 60;
let isRunning = false;
let currentMode = 'focus';

function initPomodoroWidget() {
    const existing = document.getElementById('pomodoroWidget');
    if (existing) existing.remove();

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
        topbar.insertBefore(topbarPill, topbar.children[1] || null);
    }

    const timerBox = document.createElement('div');
    timerBox.id = 'pomodoroWidget';
    timerBox.className = 'pomodoro-widget';
    timerBox.innerHTML = `
        <div class="pomodoro-header">
            <span class="pomodoro-badge" id="pomoBadge">🧠 FOCUS MODE</span>
            <button onclick="togglePomodoroWidget()" class="topic-btn">✕</button>
        </div>

        <div class="pomodoro-display-container">
            <div class="pomodoro-display" id="pomoDisplay">25:00</div>
        </div>

        <div class="pomodoro-controls">
            <button onclick="startPomodoro()" class="primary-button" style="padding: 6px 14px; font-size: 12px;" id="pomoStartBtn">▶ Start</button>
            <button onclick="pausePomodoro()" class="secondary-button" style="padding: 6px 12px; font-size: 12px;">⏸ Pause</button>
            <button onclick="resetPomodoro()" class="secondary-button" style="padding: 6px 10px; font-size: 12px;">↺</button>
        </div>

        <div class="pomodoro-modes">
            <button onclick="setPomodoroMode('focus', 25)" class="pomodoro-mode-btn active" id="modeFocus">25m Focus</button>
            <button onclick="setPomodoroMode('shortBreak', 5)" class="pomodoro-mode-btn" id="modeShort">5m Break</button>
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

    if (display) display.textContent = formatted;
    if (topbarDisplay) topbarDisplay.textContent = formatted;
}

function setPomodoroMode(mode, mins) {
    pausePomodoro();
    currentMode = mode;
    totalDuration = mins * 60;
    timeLeft = totalDuration;

    document.querySelectorAll('.pomodoro-mode-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'focus') document.getElementById('modeFocus')?.classList.add('active');
    if (mode === 'shortBreak') document.getElementById('modeShort')?.classList.add('active');

    const badge = document.getElementById('pomoBadge');
    if (badge) {
        if (mode === 'focus') {
            badge.textContent = '🧠 FOCUS MODE';
            badge.className = 'pomodoro-badge';
        } else {
            badge.textContent = '☕ SHORT BREAK';
            badge.className = 'pomodoro-badge break';
        }
    }

    updatePomodoroDisplay();
}

function startPomodoro() {
    if (isRunning) return;
    isRunning = true;

    const startBtn = document.getElementById('pomoStartBtn');
    if (startBtn) startBtn.textContent = '⚡ Running...';

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updatePomodoroDisplay();
        } else {
            pausePomodoro();
            alert(currentMode === 'focus' ? 'Focus session completed! 🎉' : 'Break time over!');
        }
    }, 1000);
}

function pausePomodoro() {
    isRunning = false;
    clearInterval(timerInterval);
    const startBtn = document.getElementById('pomoStartBtn');
    if (startBtn) startBtn.textContent = '▶ Start';
}

function resetPomodoro() {
    pausePomodoro();
    timeLeft = totalDuration;
    updatePomodoroDisplay();
}

function togglePomodoroWidget() {
    const widget = document.getElementById('pomodoroWidget');
    if (!widget) return;
    widget.style.display = widget.style.display === 'none' ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', initPomodoroWidget);