/**
 * StudyTrack — Fully Adjustable Focus Timer (-5m & +5m Below Display)
 */

let timerInterval = null;
let totalDuration = 25 * 60;
let timeLeft = 25 * 60;
let isRunning = false;
let currentMode = 'focus'; // 'focus', 'shortBreak', 'longBreak', 'custom'

function initPomodoroWidget() {
    const existing = document.getElementById('pomodoroWidget');
    if (existing) existing.remove();

    // 1. Inject Topbar Header Pill
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

    // 2. Create Floating Bottom-Right Panel
    const timerBox = document.createElement('div');
    timerBox.id = 'pomodoroWidget';
    timerBox.className = 'pomodoro-widget';
    timerBox.innerHTML = `
        <div class="pomodoro-header">
            <span class="pomodoro-badge" id="pomoBadge">🧠 FOCUS MODE</span>
            <button type="button" onclick="togglePomodoroWidget()" class="topic-btn" title="Close Panel">✕</button>
        </div>

        <div class="pomodoro-display-container">
            <!-- Centered Timer Display -->
            <div class="pomodoro-display" id="pomoDisplay">25:00</div>

            <!-- Only -5m and +5m Adjust Buttons Below Display -->
            <div class="pomodoro-adjust-row-below">
                <button type="button" onclick="adjustTime(-5)" class="pomo-adjust-btn" title="Subtract 5 minutes">-5m</button>
                <button type="button" onclick="adjustTime(5)" class="pomo-adjust-btn" title="Add 5 minutes">+5m</button>
            </div>

            <div class="pomodoro-progress-bar">
                <div class="pomodoro-progress-fill" id="pomoProgressFill" style="width: 100%"></div>
            </div>
        </div>

        <div class="pomodoro-controls">
            <button type="button" onclick="startPomodoro()" class="primary-button" style="padding: 6px 14px; font-size: 12px;" id="pomoStartBtn">▶ Start</button>
            <button type="button" onclick="pausePomodoro()" class="secondary-button" style="padding: 6px 12px; font-size: 12px;">⏸ Pause</button>
            <button type="button" onclick="resetPomodoro()" class="secondary-button" style="padding: 6px 10px; font-size: 12px;" title="Reset Timer">↺</button>
        </div>

        <div class="pomodoro-modes">
            <button type="button" onclick="setPomodoroMode('focus', 25)" class="pomodoro-mode-btn active" id="modeFocus">25m</button>
            <button type="button" onclick="setPomodoroMode('shortBreak', 5)" class="pomodoro-mode-btn" id="modeShort">5m</button>
            <button type="button" onclick="setPomodoroMode('longBreak', 15)" class="pomodoro-mode-btn" id="modeLong">15m</button>
        </div>

        <div class="pomodoro-custom-row">
            <input type="number" id="customMinsInput" class="pomo-custom-input" min="1" max="300" placeholder="Custom mins..." value="25" />
            <button type="button" onclick="applyCustomDuration()" class="btn-sm" style="padding: 4px 10px; font-size: 11px;">Set Mins</button>
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
        const percent = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
        progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
}

function adjustTime(amountMinutes) {
    const amountSeconds = amountMinutes * 60;
    if (timeLeft + amountSeconds < 60) {
        timeLeft = 60; // minimum 1 minute limit
    } else {
        timeLeft += amountSeconds;
        if (timeLeft > totalDuration) {
            totalDuration = timeLeft;
        }
    }
    updatePomodoroDisplay();
}

function applyCustomDuration() {
    const input = document.getElementById('customMinsInput');
    if (!input) return;
    const mins = parseInt(input.value, 10);
    if (isNaN(mins) || mins < 1) {
        alert("Please enter a valid duration in minutes (minimum 1 minute).");
        return;
    }
    setPomodoroMode('custom', mins);
}

function setPomodoroMode(mode, mins) {
    pausePomodoro();
    currentMode = mode;
    totalDuration = mins * 60;
    timeLeft = totalDuration;

    document.querySelectorAll('.pomodoro-mode-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'focus') document.getElementById('modeFocus')?.classList.add('active');
    if (mode === 'shortBreak') document.getElementById('modeShort')?.classList.add('active');
    if (mode === 'longBreak') document.getElementById('modeLong')?.classList.add('active');

    const badge = document.getElementById('pomoBadge');
    if (badge) {
        if (mode === 'focus') {
            badge.textContent = '🧠 FOCUS MODE';
            badge.className = 'pomodoro-badge';
        } else if (mode === 'custom') {
            badge.textContent = `⚡ ${mins}M CUSTOM`;
            badge.className = 'pomodoro-badge';
        } else {
            badge.textContent = mode === 'shortBreak' ? '☕ SHORT BREAK' : '🌴 LONG BREAK';
            badge.className = 'pomodoro-badge break';
        }
    }

    const input = document.getElementById('customMinsInput');
    if (input) input.value = mins;

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
            if (typeof window.showToast === 'function') {
                window.showToast(currentMode === 'focus' || currentMode === 'custom' ? 'Timer completed! Take a break. 🎉' : 'Break ended! Ready to focus. 💪', 'success');
            } else {
                alert(currentMode === 'focus' || currentMode === 'custom' ? 'Timer completed! 🎉' : 'Break time over!');
            }
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

// Global Exports
window.adjustTime = adjustTime;
window.applyCustomDuration = applyCustomDuration;
window.setPomodoroMode = setPomodoroMode;
window.startPomodoro = startPomodoro;
window.pausePomodoro = pausePomodoro;
window.resetPomodoro = resetPomodoro;
window.togglePomodoroWidget = togglePomodoroWidget;

document.addEventListener('DOMContentLoaded', initPomodoroWidget);