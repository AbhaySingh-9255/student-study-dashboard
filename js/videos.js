/**
 * Student Study Dashboard - Day 6: YouTube Learning Tracker
 * Vanilla JavaScript Engine
 */

const VIDEOS_STORAGE_KEY = 'studyTrack_videos';
const SUBJECTS_STORAGE_KEY = 'studyTrack_subjects';

/**
 * 1. LOAD VIDEOS FROM LOCALSTORAGE
 */
function loadVideos() {
    try {
        const saved = localStorage.getItem(VIDEOS_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Error loading videos from LocalStorage:", error);
        return [];
    }
}

/**
 * 2. SAVE VIDEOS TO LOCALSTORAGE
 */
function saveVideos(videosData) {
    try {
        localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(videosData));
    } catch (error) {
        console.error("Error saving videos to LocalStorage:", error);
    }
}

/**
 * 3. EXTRACT YOUTUBE VIDEO ID
 */
function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * 4. GENERATE YOUTUBE THUMBNAIL URL
 */
function getYouTubeThumbnail(videoId) {
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
}

/**
 * 5. GET ACTIVE SUBJECTS LIST
 */
function getActiveSubjects() {
    try {
        const saved = localStorage.getItem(SUBJECTS_STORAGE_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return parsed.map(sub => {
            if (typeof sub === 'string') return sub;
            if (sub && typeof sub === 'object') return sub.name || '';
            return '';
        }).filter(Boolean);
    } catch (error) {
        console.error("Error loading subjects list:", error);
        return [];
    }
}

/**
 * 6. POPULATE SUBJECT DROPDOWNS
 */
function populateVideoSubjectDropdown() {
    const formSelect = document.getElementById('videoSubjectInput');
    const filterSelect = document.getElementById('videoFilterSubject');
    const subjectsList = getActiveSubjects();

    if (formSelect) {
        formSelect.innerHTML = '<option value="" disabled selected>Select subject</option>';
        subjectsList.forEach(subj => {
            const opt = document.createElement('option');
            opt.value = subj;
            opt.textContent = subj;
            formSelect.appendChild(opt);
        });
    }

    if (filterSelect) {
        const currentSelected = filterSelect.value || 'All';
        filterSelect.innerHTML = '<option value="All">All Subjects</option>';
        subjectsList.forEach(subj => {
            const opt = document.createElement('option');
            opt.value = subj;
            opt.textContent = subj;
            filterSelect.appendChild(opt);
        });

        const optUnknown = document.createElement('option');
        optUnknown.value = 'Unknown';
        optUnknown.textContent = 'Unknown Subject';
        filterSelect.appendChild(optUnknown);

        filterSelect.value = currentSelected;
    }
}

/**
 * 7. ADD NEW YOUTUBE VIDEO
 */
function handleAddVideo(event) {
    event.preventDefault();

    const titleInput = document.getElementById('videoTitleInput');
    const urlInput = document.getElementById('videoUrlInput');
    const subjectInput = document.getElementById('videoSubjectInput');
    const durationInput = document.getElementById('videoDurationInput');
    const descInput = document.getElementById('videoDescriptionInput');

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const subject = subjectInput.value;
    const duration = durationInput.value.trim() || 'N/A';
    const description = descInput.value.trim() || 'No description provided.';

    if (!title) {
        displayToastMessage("Please enter a video title.", "error");
        return;
    }
    if (!url) {
        displayToastMessage("Please enter a YouTube URL.", "error");
        return;
    }
    const videoId = extractYouTubeId(url);
    if (!videoId) {
        displayToastMessage("Please enter a valid YouTube URL.", "error");
        return;
    }
    if (!subject) {
        displayToastMessage("Please select a subject.", "error");
        return;
    }

    const videos = loadVideos();
    const newVideo = {
        id: 'video_' + Date.now(),
        title: title,
        url: url,
        videoId: videoId,
        subject: subject,
        description: description,
        duration: duration,
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString().split('T')[0]
    };

    videos.unshift(newVideo);
    saveVideos(videos);

    closeAddVideoModal();
    filterAndSearchVideos();
    updateVideoStatistics();
    displayToastMessage("Video tutorial added successfully.", "success");
}

/**
 * 8. INCREMENT PROGRESS (+10%)
 */
function incrementVideoProgress(id) {
    const videos = loadVideos();
    const index = videos.findIndex(v => v.id === id);
    if (index !== -1) {
        let prog = videos[index].progress || 0;
        if (prog < 100) {
            prog += 10;
            if (prog >= 100) {
                prog = 100;
                videos[index].completed = true;
            }
            videos[index].progress = prog;
            saveVideos(videos);
            filterAndSearchVideos();
            updateVideoStatistics();
            displayToastMessage(`Progress increased to ${prog}%!`, "success");
        }
    }
}

/**
 * 9. MARK VIDEO COMPLETED
 */
function markVideoComplete(id) {
    const videos = loadVideos();
    const index = videos.findIndex(v => v.id === id);
    if (index !== -1) {
        videos[index].progress = 100;
        videos[index].completed = true;
        saveVideos(videos);
        filterAndSearchVideos();
        updateVideoStatistics();
        displayToastMessage("Video marked as completed! 🎉", "success");
    }
}

/**
 * 10. RESET PROGRESS
 */
function resetVideoProgress(id) {
    if (confirm("Are you sure you want to reset the progress for this video?")) {
        const videos = loadVideos();
        const index = videos.findIndex(v => v.id === id);
        if (index !== -1) {
            videos[index].progress = 0;
            videos[index].completed = false;
            saveVideos(videos);
            filterAndSearchVideos();
            updateVideoStatistics();
            displayToastMessage("Video progress reset to 0%.", "success");
        }
    }
}

/**
 * 11. DELETE VIDEO
 */
function deleteVideo(id) {
    if (confirm("Are you sure you want to delete this video tracking card?")) {
        let videos = loadVideos();
        videos = videos.filter(v => v.id !== id);
        saveVideos(videos);
        filterAndSearchVideos();
        updateVideoStatistics();
        displayToastMessage("Video deleted successfully.", "success");
    }
}

/**
 * 12. SEARCH AND FILTER PIPELINE
 */
function filterAndSearchVideos() {
    const query = document.getElementById('videoSearchInput')?.value.trim().toLowerCase() || '';
    const selectedSub = document.getElementById('videoFilterSubject')?.value || 'All';
    const videos = loadVideos();
    const activeSubjects = getActiveSubjects();

    const filtered = videos.filter(vid => {
        const matchesSearch = vid.title.toLowerCase().includes(query) ||
                              (vid.subject && vid.subject.toLowerCase().includes(query)) ||
                              (vid.description && vid.description.toLowerCase().includes(query));

        let matchesSubject = true;
        const isSubjectValid = activeSubjects.includes(vid.subject);

        if (selectedSub !== 'All') {
            if (selectedSub === 'Unknown') {
                matchesSubject = !vid.subject || !isSubjectValid;
            } else {
                matchesSubject = (vid.subject === selectedSub) && isSubjectValid;
            }
        }

        return matchesSearch && matchesSubject;
    });

    renderVideos(filtered);
}

/**
 * 13. RENDER VIDEO CARDS
 */
function renderVideos(videosList) {
    const gridContainer = document.getElementById('videoGridContainer');
    const emptyState = document.getElementById('videoEmptyState');

    if (!gridContainer) return;

    if (!videosList || videosList.length === 0) {
        gridContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    gridContainer.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    gridContainer.innerHTML = '';
    const activeSubjects = getActiveSubjects();

    videosList.forEach(vid => {
        const isSubjectValid = activeSubjects.includes(vid.subject);
        const subjectLabel = isSubjectValid ? vid.subject : "Unknown Subject";

        const card = document.createElement('article');
        card.className = 'video-card';

        const videoThumb = getYouTubeThumbnail(vid.videoId);

        card.innerHTML = `
            <div class="video-thumbnail-box">
                <img src="${videoThumb}" alt="${escapeHTMLString(vid.title)}" loading="lazy">
                <span class="video-duration-badge">⏱ ${escapeHTMLString(vid.duration)}</span>
            </div>
            <div class="video-card-body">
                <span class="video-card-tag ${!isSubjectValid ? 'unknown' : ''}">
                    ${escapeHTMLString(subjectLabel)}
                </span>
                <h3 class="video-card-title">${escapeHTMLString(vid.title)}</h3>
                <p class="video-card-desc">${escapeHTMLString(vid.description)}</p>

                <div class="video-card-progress-wrapper">
                    <div class="video-card-progress-header">
                        <span>Progress</span>
                        <span class="video-card-progress-percent">${vid.progress}%</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill ${vid.completed ? 'success' : ''}" style="width: ${vid.progress}%"></div>
                    </div>
                </div>

                <div class="video-card-actions">
                    <a href="${vid.url}" target="_blank" rel="noopener noreferrer" class="btn-sm btn-watch">Watch</a>
                    
                    ${vid.completed 
                        ? `<button class="btn-sm btn-progress" onclick="resetVideoProgress('${vid.id}')">Reset</button>`
                        : `<button class="btn-sm btn-progress" onclick="incrementVideoProgress('${vid.id}')">+10%</button>`
                    }

                    ${vid.completed 
                        ? `<button class="btn-sm btn-complete" disabled style="opacity: 0.6; cursor: not-allowed;">✓ Completed</button>`
                        : `<button class="btn-sm btn-complete" onclick="markVideoComplete('${vid.id}')">Complete</button>`
                    }

                    <button class="btn-sm btn-delete-vid" onclick="deleteVideo('${vid.id}')">Delete</button>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

/**
 * 14. UPDATE VIDEO STATISTICS WIDGET
 */
function updateVideoStatistics() {
    const videos = loadVideos();
    const total = videos.length;
    const completed = videos.filter(v => v.completed).length;
    const inProgress = videos.filter(v => v.progress > 0 && v.progress < 100).length;

    let overallProg = 0;
    if (total > 0) {
        const sum = videos.reduce((acc, v) => acc + (v.progress || 0), 0);
        overallProg = Math.round(sum / total);
    }

    const tEl = document.getElementById('vStatsTotal');
    const cEl = document.getElementById('vStatsCompleted');
    const pEl = document.getElementById('vStatsProgress');
    const aEl = document.getElementById('vStatsAverage');

    if (tEl) tEl.textContent = total;
    if (cEl) cEl.textContent = completed;
    if (pEl) pEl.textContent = inProgress;
    if (aEl) aEl.textContent = `${overallProg}%`;
}

/**
 * MODAL HELPERS
 */
function openAddVideoModal() {
    const modal = document.getElementById('addVideoModal');
    if (modal) {
        populateVideoSubjectDropdown();
        modal.style.display = 'flex';
    }
}

function closeAddVideoModal() {
    const modal = document.getElementById('addVideoModal');
    if (modal) {
        modal.style.display = 'none';
    }
    const form = document.getElementById('videoForm');
    if (form) form.reset();
}

function handleModalOverlayClick(event) {
    if (event.target.id === 'addVideoModal') {
        closeAddVideoModal();
    }
}

function displayToastMessage(msg, type = "success") {
    if (typeof window.showToast === "function") {
        window.showToast(msg, type);
    } else {
        alert(msg);
    }
}

function escapeHTMLString(str) {
    if (!str) return "";
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * INITIAL SETUP ON DOM LOAD
 */
document.addEventListener('DOMContentLoaded', () => {
    populateVideoSubjectDropdown();
    filterAndSearchVideos();
    updateVideoStatistics();

    // Re-validate and populate filters if cross-tab window changes happen
    window.addEventListener('storage', (e) => {
        if (e.key === SUBJECTS_STORAGE_KEY || e.key === VIDEOS_STORAGE_KEY) {
            populateVideoSubjectDropdown();
            filterAndSearchVideos();
            updateVideoStatistics();
        }
    });
});