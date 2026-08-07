/**
 * Student Study Dashboard - Day 7: Notes Management Engine
 * Vanilla JavaScript Engine (Defensive Compatibility Version)
 */

const NOTES_STORAGE_KEY = 'studyTrack_notes';
const SUBJECTS_STORAGE_KEY = 'studyTrack_subjects';

// =========================================================
// 1. GLOBAL EXPORTS (Bound immediately on load)
// =========================================================
window.openAddNoteModal = openAddNoteModal;
window.closeNoteModal = closeNoteModal;
window.handleNoteModalOverlayClick = handleNoteModalOverlayClick;
window.handleSaveNote = handleSaveNote;
window.filterAndSearchNotes = filterAndSearchNotes;
window.viewNote = viewNote;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.closeViewNoteModal = closeViewNoteModal;
window.handleViewNoteModalOverlayClick = handleViewNoteModalOverlayClick;

/**
 * Safe parser to verify loaded data is a valid array
 */
function loadNotes() {
    try {
        const saved = localStorage.getItem(NOTES_STORAGE_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Error loading notes from LocalStorage:", error);
        return [];
    }
}

/**
 * Safe LocalStorage writer
 */
function saveNotes(notesData) {
    try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesData));
    } catch (error) {
        console.error("Error saving notes to LocalStorage:", error);
    }
}

/**
 * Safe, backward-compatible subject list parser [1]
 */
function getActiveSubjects() {
    try {
        const saved = localStorage.getItem(SUBJECTS_STORAGE_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];

        const list = [];
        for (let i = 0; i < parsed.length; i++) {
            const item = parsed[i];
            if (typeof item === 'string' && item.trim()) {
                list.push(item.trim());
            } else if (item && typeof item === 'object' && item.name) {
                list.push(item.name.trim());
            }
        }
        return list;
    } catch (error) {
        console.error("Error loading subjects list:", error);
        return [];
    }
}

/**
 * Dynamic populator for dropdowns
 */
function populateNotesSubjectDropdowns() {
    const formSelect = document.getElementById('noteSubjectInput');
    const filterSelect = document.getElementById('notesFilterSubject');
    const subjectsList = getActiveSubjects();

    if (formSelect) {
        formSelect.innerHTML = '<option value="" disabled selected>Select subject</option>';
        for (let i = 0; i < subjectsList.length; i++) {
            const opt = document.createElement('option');
            opt.value = subjectsList[i];
            opt.textContent = subjectsList[i];
            formSelect.appendChild(opt);
        }
    }

    if (filterSelect) {
        const currentSelected = filterSelect.value || 'All';
        filterSelect.innerHTML = '<option value="All">All Subjects</option>';
        for (let i = 0; i < subjectsList.length; i++) {
            const opt = document.createElement('option');
            opt.value = subjectsList[i];
            opt.textContent = subjectsList[i];
            filterSelect.appendChild(opt);
        }

        const optUnknown = document.createElement('option');
        optUnknown.value = 'Unknown';
        optUnknown.textContent = 'Unknown Subject';
        filterSelect.appendChild(optUnknown);

        filterSelect.value = currentSelected;
    }
}

/**
 * Scans existing notes and extracts sorted tags
 */
function populateNotesTagFilter() {
    const notes = loadNotes();
    const tagSet = {};
    
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (Array.isArray(note.tags)) {
            for (let j = 0; j < note.tags.length; j++) {
                const tag = note.tags[j];
                if (tag && tag.trim()) {
                    tagSet[tag.trim()] = true;
                }
            }
        }
    }

    const tagsArray = [];
    for (const key in tagSet) {
        if (tagSet.hasOwnProperty(key)) {
            tagsArray.push(key);
        }
    }
    tagsArray.sort();

    const filterTag = document.getElementById('notesFilterTag');
    if (filterTag) {
        const currentSelected = filterTag.value || 'All';
        filterTag.innerHTML = '<option value="All">All Tags</option>';
        for (let i = 0; i < tagsArray.length; i++) {
            const opt = document.createElement('option');
            opt.value = tagsArray[i];
            opt.textContent = '#' + tagsArray[i];
            filterTag.appendChild(opt);
        }
        filterTag.value = currentSelected;
    }
}

/**
 * Safe submission handler
 */
function handleSaveNote(event) {
    if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
    }

    const idInput = document.getElementById('noteIdInput');
    const titleInput = document.getElementById('noteTitleInput');
    const subjectInput = document.getElementById('noteSubjectInput');
    const tagsInput = document.getElementById('noteTagsInput');
    const contentInput = document.getElementById('noteContentInput');

    if (!idInput || !titleInput || !subjectInput || !tagsInput || !contentInput) {
        console.error("Missing note form input elements.");
        return;
    }

    const id = idInput.value;
    const title = titleInput.value.trim();
    const subject = subjectInput.value;
    const rawTags = tagsInput.value.trim();
    const content = contentInput.value.trim();

    // Validation checks [1]
    if (!title) {
        displayToastMessage("Please enter a note title.", "error");
        return;
    }
    if (!subject) {
        displayToastMessage("Please select a subject.", "error");
        return;
    }
    if (!content) {
        displayToastMessage("Please enter some note content.", "error");
        return;
    }

    // Defensive ES5 split/unique tag routine [1]
    const tags = [];
    if (rawTags) {
        const rawArray = rawTags.split(',');
        for (let i = 0; i < rawArray.length; i++) {
            const cleanTag = rawArray[i].trim();
            if (cleanTag && tags.indexOf(cleanTag) === -1) {
                tags.push(cleanTag);
            }
        }
    }

    const notes = loadNotes();
    const now = new Date().toISOString();

    if (id) {
        // Edit Mode (Standard for-loop update)
        let updated = false;
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].id === id) {
                notes[i].title = title;
                notes[i].subject = subject;
                notes[i].content = content;
                notes[i].tags = tags;
                notes[i].updatedAt = now;
                updated = true;
                break;
            }
        }
        if (updated) {
            saveNotes(notes);
            displayToastMessage("Study note updated successfully.", "success");
        }
    } else {
        // Create Mode
        const newNote = {
            id: 'note_' + Date.now(),
            title: title,
            subject: subject,
            content: content,
            tags: tags,
            createdAt: now,
            updatedAt: now
        };
        notes.unshift(newNote);
        saveNotes(notes);
        displayToastMessage("Study note created successfully.", "success");
    }

    closeNoteModal();
    filterAndSearchNotes();
    updateNotesStatistics();
    populateNotesTagFilter();
}

/**
 * Edit Mode Trigger
 */
function editNote(id) {
    const notes = loadNotes();
    let note = null;
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            note = notes[i];
            break;
        }
    }
    if (!note) return;

    openAddNoteModal();

    document.getElementById('note-modal-title').textContent = "Edit Study Note";
    document.getElementById('noteIdInput').value = note.id;
    document.getElementById('noteTitleInput').value = note.title;
    document.getElementById('noteSubjectInput').value = note.subject;
    document.getElementById('noteTagsInput').value = Array.isArray(note.tags) ? note.tags.join(', ') : '';
    document.getElementById('noteContentInput').value = note.content;
    document.getElementById('noteSaveBtn').textContent = "Save Changes";
}

/**
 * Delete Trigger with fallback
 */
function deleteNote(id) {
    if (confirm("Are you sure you want to delete this note?")) {
        const notes = loadNotes();
        const newNotes = [];
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].id !== id) {
                newNotes.push(notes[i]);
            }
        }
        saveNotes(newNotes);

        filterAndSearchNotes();
        updateNotesStatistics();
        populateNotesTagFilter();
        displayToastMessage("Note deleted successfully.", "success");
    }
}

/**
 * View Reader Overlay
 */
function viewNote(id) {
    const notes = loadNotes();
    let note = null;
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            note = notes[i];
            break;
        }
    }
    if (!note) return;

    const activeSubjects = getActiveSubjects();
    const isSubjectValid = activeSubjects.indexOf(note.subject) !== -1;
    const subjectLabel = isSubjectValid ? note.subject : "Unknown Subject";

    document.getElementById('view-note-modal-title').textContent = note.title;

    const subjectBadge = document.getElementById('viewNoteSubject');
    if (subjectBadge) {
        subjectBadge.textContent = subjectLabel;
        if (!isSubjectValid) {
            subjectBadge.classList.add('unknown');
        } else {
            subjectBadge.classList.remove('unknown');
        }
    }

    document.getElementById('viewNoteCreated').textContent = "Created: " + formatNoteDate(note.createdAt);
    document.getElementById('viewNoteUpdated').textContent = "Updated: " + formatNoteDate(note.updatedAt);
    
    // Line breaks safety preservation
    document.getElementById('viewNoteContent').textContent = note.content;

    // Render Tag elements
    const tagsContainer = document.getElementById('viewNoteTagsContainer');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        if (Array.isArray(note.tags) && note.tags.length > 0) {
            for (let i = 0; i < note.tags.length; i++) {
                const span = document.createElement('span');
                span.className = 'note-tag';
                span.textContent = '#' + note.tags[i];
                tagsContainer.appendChild(span);
            }
            tagsContainer.style.display = 'flex';
        } else {
            tagsContainer.style.display = 'none';
        }
    }

    const editBtn = document.getElementById('viewNoteEditBtn');
    if (editBtn) {
        editBtn.onclick = function() {
            closeViewNoteModal();
            editNote(note.id);
        };
    }

    openViewNoteModal();
}

/**
 * Calculates Dashboard Statistics
 */
function updateNotesStatistics() {
    const notes = loadNotes();
    const activeSubjects = getActiveSubjects();
    
    const uniqueSubjectsCovered = {};
    const uniqueTags = {};

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (note.subject && activeSubjects.indexOf(note.subject) !== -1) {
            uniqueSubjectsCovered[note.subject] = true;
        }
        if (Array.isArray(note.tags)) {
            for (let j = 0; j < note.tags.length; j++) {
                const tag = note.tags[j];
                if (tag && tag.trim()) {
                    uniqueTags[tag.trim().toLowerCase()] = true;
                }
            }
        }
    }

    let coveredCount = 0;
    for (const k in uniqueSubjectsCovered) {
        if (uniqueSubjectsCovered.hasOwnProperty(k)) coveredCount++;
    }

    let tagsCount = 0;
    for (const k in uniqueTags) {
        if (uniqueTags.hasOwnProperty(k)) tagsCount++;
    }

    const totalEl = document.getElementById('nStatsTotal');
    const subsEl = document.getElementById('nStatsSubjects');
    const tagsEl = document.getElementById('nStatsTags');

    if (totalEl) totalEl.textContent = notes.length;
    if (subsEl) subsEl.textContent = coveredCount;
    if (tagsEl) tagsEl.textContent = tagsCount;
}

/**
 * Filter Engine Pipeline
 */
function filterAndSearchNotes() {
    const searchInput = document.getElementById('notesSearchInput');
    const filterSubSelect = document.getElementById('notesFilterSubject');
    const filterTagSelect = document.getElementById('notesFilterTag');
    const sortSelect = document.getElementById('notesSortSelect');

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedSub = filterSubSelect ? filterSubSelect.value : 'All';
    const selectedTag = filterTagSelect ? filterTagSelect.value : 'All';
    const sortBy = sortSelect ? sortSelect.value : 'updated';

    const notes = loadNotes();
    const activeSubjects = getActiveSubjects();
    const filtered = [];

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const isSubjectValid = activeSubjects.indexOf(note.subject) !== -1;
        const subjectLabel = isSubjectValid ? note.subject : "Unknown Subject";

        // Query matches checking
        const tagString = Array.isArray(note.tags) ? note.tags.join(' ').toLowerCase() : '';
        const matchesSearch = note.title.toLowerCase().indexOf(query) !== -1 ||
                              note.content.toLowerCase().indexOf(query) !== -1 ||
                              subjectLabel.toLowerCase().indexOf(query) !== -1 ||
                              tagString.indexOf(query) !== -1;

        // Subject check
        let matchesSubject = true;
        if (selectedSub !== 'All') {
            if (selectedSub === 'Unknown') {
                matchesSubject = !note.subject || !isSubjectValid;
            } else {
                matchesSubject = (note.subject === selectedSub) && isSubjectValid;
            }
        }

        // Tag check
        let matchesTag = true;
        if (selectedTag !== 'All') {
            matchesTag = Array.isArray(note.tags) && note.tags.indexOf(selectedTag) !== -1;
        }

        if (matchesSearch && matchesSubject && matchesTag) {
            filtered.push(note);
        }
    }

    // Robust sorting loop
    filtered.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        const createdA = new Date(a.createdAt).getTime();
        const createdB = new Date(b.createdAt).getTime();

        if (sortBy === 'updated') return timeB - timeA;
        if (sortBy === 'created') return createdB - createdA;
        if (sortBy === 'oldest') return createdA - createdB;
        if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '');
        return 0;
    });

    renderNotes(filtered);
}

/**
 * Grid rendering routine
 */
function renderNotes(notesList) {
    const gridContainer = document.getElementById('notesGridContainer');
    const emptyState = document.getElementById('notesEmptyState');

    if (!gridContainer) return;

    if (!notesList || notesList.length === 0) {
        gridContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    gridContainer.style.display = 'grid';
    gridContainer.className = 'notes-grid-container';
    if (emptyState) emptyState.style.display = 'none';

    gridContainer.innerHTML = '';
    const activeSubjects = getActiveSubjects();

    for (let i = 0; i < notesList.length; i++) {
        const note = notesList[i];
        const isSubjectValid = activeSubjects.indexOf(note.subject) !== -1;
        const subjectLabel = isSubjectValid ? note.subject : "Unknown Subject";

        const card = document.createElement('article');
        card.className = 'note-card';

        let preview = note.content || '';
        if (preview.length > 150) {
            preview = preview.substring(0, 150).trim() + '...';
        }

        let tagsHtml = '';
        if (Array.isArray(note.tags)) {
            for (let j = 0; j < note.tags.length; j++) {
                tagsHtml += '<span class="note-tag">#' + escapeNoteHTML(note.tags[j]) + '</span>';
            }
        }

        const formattedDate = formatNoteDate(note.updatedAt || note.createdAt);

        card.innerHTML = `
            <div class="note-card-header">
                <span class="note-card-subject ${!isSubjectValid ? 'unknown' : ''}">
                    ${escapeNoteHTML(subjectLabel)}
                </span>
                <span class="note-card-date">${formattedDate}</span>
            </div>
            <h3 class="note-card-title">${escapeNoteHTML(note.title)}</h3>
            <p class="note-card-preview">${escapeNoteHTML(preview)}</p>
            <div class="note-card-tags">
                ${tagsHtml}
            </div>
            <div class="note-card-actions">
                <button class="btn-sm btn-watch" onclick="viewNote('${note.id}')">View</button>
                <button class="btn-sm btn-progress" onclick="editNote('${note.id}')">Edit</button>
                <button class="btn-sm btn-delete-vid" onclick="deleteNote('${note.id}')">Delete</button>
            </div>
        `;
        gridContainer.appendChild(card);
    }
}

/**
 * Modal visibility helpers
 */
function openAddNoteModal() {
    const modal = document.getElementById('noteModal');
    if (modal) {
        populateNotesSubjectDropdowns();
        const modalTitle = document.getElementById('note-modal-title');
        const saveBtn = document.getElementById('noteSaveBtn');
        if (modalTitle) modalTitle.textContent = "Create Study Note";
        if (saveBtn) saveBtn.textContent = "Save Note";
        modal.style.display = 'flex';
    }
}

function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    if (modal) {
        modal.style.display = 'none';
    }
    const form = document.getElementById('noteForm');
    if (form) form.reset();
    const idInput = document.getElementById('noteIdInput');
    if (idInput) idInput.value = '';
}

function handleNoteModalOverlayClick(event) {
    if (event && event.target && event.target.id === 'noteModal') {
        closeNoteModal();
    }
}

function openViewNoteModal() {
    const modal = document.getElementById('viewNoteModal');
    if (modal) modal.style.display = 'flex';
}

function closeViewNoteModal() {
    const modal = document.getElementById('viewNoteModal');
    if (modal) modal.style.display = 'none';
}

function handleViewNoteModalOverlayClick(event) {
    if (event && event.target && event.target.id === 'viewNoteModal') {
        closeViewNoteModal();
    }
}

/**
 * Safe Toast fallback
 */
function displayToastMessage(msg, type) {
    if (typeof showToast === "function") {
        showToast(msg, type);
    } else if (window.showToast && typeof window.showToast === "function") {
        window.showToast(msg, type);
    } else {
        alert(msg);
    }
}

function formatNoteDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function escapeNoteHTML(str) {
    if (!str) return "";
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * PAGE SETUP EVENT ATTACHMENT
 */
document.addEventListener('DOMContentLoaded', () => {
    populateNotesSubjectDropdowns();
    populateNotesTagFilter();
    filterAndSearchNotes();
    updateNotesStatistics();

    // Escape Key Bindings
    window.addEventListener('keydown', (e) => {
        if (e && e.key === 'Escape') {
            closeNoteModal();
            closeViewNoteModal();
        }
    });

    // Re-verify subject dropdown integrity when storage gets manipulated globally
    window.addEventListener('storage', (e) => {
        if (e && (e.key === SUBJECTS_STORAGE_KEY || e.key === NOTES_STORAGE_KEY)) {
            populateNotesSubjectDropdowns();
            populateNotesTagFilter();
            filterAndSearchNotes();
            updateNotesStatistics();
        }
    });
});