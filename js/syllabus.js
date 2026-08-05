/* =========================================================
   STUDYTRACK — SYLLABUS MANAGEMENT MODULE (Day 5)
   LocalStorage Key: studyTrack_syllabus
   ========================================================= */

const SYLLABUS_KEY = "studyTrack_syllabus";

/* Default Syllabus Seed Data for Demo/Initial Load */
const DEFAULT_SYLLABUS = [
    // Java
    { id: 101, subject: "Java", title: "Variables", completed: true },
    { id: 102, subject: "Java", title: "Classes", completed: true },
    { id: 103, subject: "Java", title: "Objects", completed: true },
    { id: 104, subject: "Java", title: "Inheritance", completed: false },
    { id: 105, subject: "Java", title: "Polymorphism", completed: false },
    { id: 106, subject: "Java", title: "Collections", completed: false },
    
    // Python
    { id: 201, subject: "Python", title: "Variables", completed: true },
    { id: 202, subject: "Python", title: "Functions", completed: true },
    { id: 203, subject: "Python", title: "Loops", completed: true },
    { id: 204, subject: "Python", title: "Modules", completed: false },
    { id: 205, subject: "Python", title: "OOP", completed: false },
    
    // Data Structures
    { id: 301, subject: "Data Structures", title: "Arrays", completed: true },
    { id: 302, subject: "Data Structures", title: "Linked List", completed: true },
    { id: 303, subject: "Data Structures", title: "Stack", completed: false },
    { id: 304, subject: "Data Structures", title: "Queue", completed: false },
    { id: 305, subject: "Data Structures", title: "Tree", completed: false }
];

/* 1. LOAD SYLLABUS */
function loadSyllabus() {
    try {
        const saved = localStorage.getItem(SYLLABUS_KEY);
        if (!saved) {
            saveSyllabus(DEFAULT_SYLLABUS);
            return DEFAULT_SYLLABUS;
        }
        return JSON.parse(saved);
    } catch (error) {
        console.error("Error loading syllabus from LocalStorage:", error);
        return [];
    }
}

/* 2. SAVE SYLLABUS */
function saveSyllabus(syllabusData) {
    try {
        localStorage.setItem(SYLLABUS_KEY, JSON.stringify(syllabusData));
    } catch (error) {
        console.error("Error saving syllabus to LocalStorage:", error);
    }
}

/* 3. CALCULATE SUBJECT SYLLABUS PROGRESS */
function updateSyllabusProgress(subjectName) {
    const syllabus = loadSyllabus();
    const subjectTopics = syllabus.filter(
        item => item.subject.toLowerCase() === subjectName.toLowerCase()
    );

    const total = subjectTopics.length;
    if (total === 0) {
        return { total: 0, completed: 0, percentage: 0 };
    }

    const completed = subjectTopics.filter(item => item.completed).length;
    const percentage = Math.round((completed / total) * 100);

    return { total, completed, percentage };
}

/* 4. OVERALL SYLLABUS PROGRESS */
function getOverallSyllabusProgress() {
    const syllabus = loadSyllabus();
    const total = syllabus.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };

    const completed = syllabus.filter(item => item.completed).length;
    const percentage = Math.round((completed / total) * 100);

    return { total, completed, percentage };
}

/* 5. ADD SYLLABUS TOPIC */
function addTopic(subjectName, topicTitle) {
    if (!subjectName || !topicTitle || !topicTitle.trim()) {
        if (typeof showToast === "function") {
            showToast("Topic title cannot be empty.", "error");
        }
        return false;
    }

    const syllabus = loadSyllabus();
    const cleanTitle = topicTitle.trim();

    const duplicate = syllabus.some(
        item => item.subject.toLowerCase() === subjectName.toLowerCase() &&
                item.title.toLowerCase() === cleanTitle.toLowerCase()
    );

    if (duplicate) {
        if (typeof showToast === "function") {
            showToast(`Topic "${cleanTitle}" already exists in ${subjectName}.`, "error");
        }
        return false;
    }

    const newTopic = {
        id: Date.now(),
        subject: subjectName,
        title: cleanTitle,
        completed: false
    };

    syllabus.push(newTopic);
    saveSyllabus(syllabus);

    if (typeof showToast === "function") {
        showToast(`Added topic "${cleanTitle}" to ${subjectName}.`, "success");
    }

    renderSyllabus();
    if (typeof updateStatistics === "function") updateStatistics();
    if (typeof renderProgressPage === "function") renderProgressPage();
    return true;
}

/* 6. DELETE SYLLABUS TOPIC */
function deleteTopic(topicId) {
    let syllabus = loadSyllabus();
    const target = syllabus.find(item => item.id === topicId);
    if (!target) return;

    if (!window.confirm(`Delete topic "${target.title}"?`)) {
        return;
    }

    syllabus = syllabus.filter(item => item.id !== topicId);
    saveSyllabus(syllabus);

    if (typeof showToast === "function") {
        showToast(`Topic "${target.title}" deleted.`, "success");
    }

    renderSyllabus();
    if (typeof updateStatistics === "function") updateStatistics();
    if (typeof renderProgressPage === "function") renderProgressPage();
}

/* 7. EDIT SYLLABUS TOPIC */
function editTopic(topicId, customNewTitle = null) {
    const syllabus = loadSyllabus();
    const topic = syllabus.find(item => item.id === topicId);
    if (!topic) return;

    let newTitle = customNewTitle;
    if (newTitle === null) {
        newTitle = window.prompt("Edit Syllabus Topic:", topic.title);
    }

    if (newTitle === null) return;
    newTitle = newTitle.trim();

    if (!newTitle) {
        if (typeof showToast === "function") {
            showToast("Topic title cannot be empty.", "error");
        }
        return;
    }

    topic.title = newTitle;
    saveSyllabus(syllabus);

    if (typeof showToast === "function") {
        showToast(`Topic updated to "${newTitle}".`, "success");
    }

    renderSyllabus();
    if (typeof renderProgressPage === "function") renderProgressPage();
}

/* 8. TOGGLE SYLLABUS TOPIC (COMPLETE / INCOMPLETE) */
function toggleTopic(topicId) {
    const syllabus = loadSyllabus();
    const topic = syllabus.find(item => item.id === topicId);
    if (!topic) return;

    topic.completed = !topic.completed;
    saveSyllabus(syllabus);

    if (typeof showToast === "function") {
        showToast(
            topic.completed
                ? `Completed "${topic.title}"! 🎉`
                : `Marked "${topic.title}" incomplete.`,
            "success"
        );
    }

    renderSyllabus();
    if (typeof updateStatistics === "function") updateStatistics();
    if (typeof renderProgressPage === "function") renderProgressPage();
}

/* 9. POPULATE SUBJECT DROPDOWN FOR SYLLABUS & TASK FORMS */
function populateSubjectDropdown() {
    const taskSubjectDropdown = document.getElementById("subjectInput");
    const syllabusSubjectDropdown = document.getElementById("syllabusSubject");

    const savedSubjects = localStorage.getItem("studyTrack_subjects");
    const subjects = savedSubjects ? JSON.parse(savedSubjects) : [];

    const fillSelect = (selectEl) => {
        if (!selectEl) return;
        selectEl.innerHTML = '<option value="">Select Subject</option>';
        if (subjects.length === 0) {
            selectEl.innerHTML = '<option value="">No Subjects Available</option>';
            return;
        }
        subjects.forEach(subj => {
            const option = document.createElement("option");
            option.value = subj.name;
            option.textContent = subj.name;
            selectEl.appendChild(option);
        });
    };

    fillSelect(taskSubjectDropdown);
    fillSelect(syllabusSubjectDropdown);
}

/* 10. RENDER SYLLABUS INSIDE SUBJECT CARDS ON DASHBOARD */
function renderSyllabus() {
    const syllabus = loadSyllabus();
    const quickSubjectList = document.getElementById("quickSubjectList");
    if (!quickSubjectList) return;

    const savedSubjects = localStorage.getItem("studyTrack_subjects");
    const subjects = savedSubjects ? JSON.parse(savedSubjects) : [];

    if (subjects.length === 0) return;

    const cards = quickSubjectList.querySelectorAll(".subject-card");
    cards.forEach(card => {
        const subjectName = card.getAttribute("data-subject-name");
        if (!subjectName) return;

        const syllabusContainer = card.querySelector(".subject-syllabus");
        if (!syllabusContainer) return;

        const progress = updateSyllabusProgress(subjectName);
        const subjectTopics = syllabus.filter(
            item => item.subject.toLowerCase() === subjectName.toLowerCase()
        );

        const percentEl = syllabusContainer.querySelector(".syllabus-percentage");
        if (percentEl) percentEl.textContent = `${progress.percentage}%`;

        const fillEl = syllabusContainer.querySelector(".progress-fill");
        if (fillEl) fillEl.style.width = `${progress.percentage}%`;

        const listEl = syllabusContainer.querySelector(".syllabus-topic-list");
        if (!listEl) return;

        listEl.innerHTML = "";

        if (subjectTopics.length === 0) {
            listEl.innerHTML = `<li class="empty-topic-msg" style="font-size: 12px; color: var(--text-muted); padding: 6px 0;">No syllabus topics added yet.</li>`;
        } else {
            subjectTopics.forEach(topic => {
                const li = document.createElement("li");
                li.className = `syllabus-topic-item ${topic.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <div class="topic-left">
                        <button type="button" 
                                class="topic-checkbox ${topic.completed ? 'completed' : ''}" 
                                onclick="toggleTopic(${topic.id})"
                                aria-label="${topic.completed ? 'Mark incomplete' : 'Mark complete'}">
                            ${topic.completed ? '✓' : ''}
                        </button>
                        <span class="topic-title" onclick="editTopic(${topic.id})" title="Click to edit topic">${escapeHTML(topic.title)}</span>
                    </div>
                    <div class="topic-actions">
                        <button type="button" class="topic-btn" onclick="editTopic(${topic.id})" title="Edit topic" aria-label="Edit topic">✎</button>
                        <button type="button" class="topic-btn delete" onclick="deleteTopic(${topic.id})" title="Delete topic" aria-label="Delete topic">×</button>
                    </div>
                `;
                listEl.appendChild(li);
            });
        }
    });
}

/* 11. INLINE FORM HANDLER FOR ADDING TOPIC FROM SUBJECT CARD */
function handleInlineAddTopic(event, subjectName) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector(".add-topic-input");
    if (!input) return;

    const topicTitle = input.value.trim();
    if (addTopic(subjectName, topicTitle)) {
        input.value = "";
    }
}

function escapeHTML(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

window.loadSyllabus = loadSyllabus;
window.saveSyllabus = saveSyllabus;
window.renderSyllabus = renderSyllabus;
window.addTopic = addTopic;
window.deleteTopic = deleteTopic;
window.editTopic = editTopic;
window.toggleTopic = toggleTopic;
window.updateSyllabusProgress = updateSyllabusProgress;
window.getOverallSyllabusProgress = getOverallSyllabusProgress;
window.populateSubjectDropdown = populateSubjectDropdown;
window.handleInlineAddTopic = handleInlineAddTopic;