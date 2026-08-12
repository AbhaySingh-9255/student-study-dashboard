/**
 * StudyTrack — Fixed SVG Analytics Chart Renderer
 */

function renderAnalyticsCharts() {
    const chartContainer = document.getElementById('weeklyActivityChart');
    if (!chartContainer) return;

    const tasks = JSON.parse(localStorage.getItem('studyTrack_tasks') || '[]');
    const planner = JSON.parse(localStorage.getItem('studyTrack_planner') || '[]');

    // Calculate completion metrics for the last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    tasks.concat(planner).forEach(item => {
        if (item.completed) {
            const date = new Date(item.completedAt || item.date || Date.now());
            if (!isNaN(date.getTime())) {
                counts[date.getDay()] += 1;
            }
        }
    });

    const max = Math.max(...counts, 5);
    
    // Recalculated canvas dimensions & margins to eliminate top/bottom clipping
    const svgWidth = 500;
    const svgHeight = 230;     // Increased height from 180 -> 230
    const baselineY = 170;     // Lowered baseline from 140 -> 170
    const maxBarHeight = 100;  // Balanced max bar height
    const barWidth = 38;
    const gap = 24;
    const startX = 35;

    let barsSVG = '';
    counts.forEach((val, idx) => {
        const height = (val / max) * maxBarHeight;
        const x = startX + idx * (barWidth + gap);
        const y = baselineY - height;

        barsSVG += `
            <!-- Bar -->
            <rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="6" fill="var(--primary)" opacity="0.9" />
            
            <!-- Value Label (Top) -->
            <text x="${x + barWidth / 2}" y="${y - 10}" font-size="12" font-weight="700" fill="var(--text-main)" text-anchor="middle">${val}</text>
            
            <!-- Day Label (Bottom) -->
            <text x="${x + barWidth / 2}" y="${baselineY + 24}" font-size="12" font-weight="600" fill="var(--text-muted)" text-anchor="middle">${days[idx]}</text>
        `;
    });

    chartContainer.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="overflow: visible;">
            <!-- Baseline -->
            <line x1="20" y1="${baselineY}" x2="480" y2="${baselineY}" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="4 4" />
            ${barsSVG}
        </svg>
    `;
}

document.addEventListener('DOMContentLoaded', renderAnalyticsCharts);