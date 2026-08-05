/* =========================================================
   STUDYTRACK — MAIN JAVASCRIPT
   Subjects + Tasks + Syllabus + Progress + LocalStorage
   ========================================================= */

/* 1. STORAGE KEYS */
const SUBJECTS_KEY = "studyTrack_subjects";
const TASKS_KEY = "studyTrack_tasks";

/* Default Initial Data */
const DEFAULT_SUBJECTS = [
    { id: 1, name: "Java", description: "Object Oriented Programming" },
    { id: 2, name: "Python", description: "Scripting & Data Science" },
    { id: 3, name: "Data Structures", description: "Algorithms & Logic" }
];

const DEFAULT_TASKS = [
    { id: 1001, title: "Learn Java OOP Basics", subject: "Java", priority: "High", deadline: "2026-08-10", completed: true, createdAt: new Date().toISOString() },
    { id: 1002, title: "Build Python Script", subject: "Python", priority: "Medium", deadline: "2026-08-12", completed: false, createdAt: new Date().toISOString() }
];

/* 2. APPLICATION STATE */
let subjects = loadData(SUBJECTS_KEY, DEFAULT_SUBJECTS);
let tasks = loadData(TASKS_KEY, DEFAULT_TASKS);

/* 3. DOM ELEMENTS */
const subjectForm = document.getElementById("subjectForm");
const subjectNameInput = document.getElementById("subjectNameInput");
const subjectDescriptionInput = document.getElementById("subjectDescriptionInput");
const subjectList = document.getElementById("subjectList");
const emptySubjectMessage = document.getElementById("emptySubjectMessage");

const quickSubjectList = document.getElementById("quickSubjectList");
const quickEmptyMessage = document.getElementById("quickEmptyMessage");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const subjectInput = document.getElementById("subjectInput");
const priorityInput = document.getElementById("priorityInput");
const deadlineInput = document.getElementById("deadlineInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("searchInput");
const filterInput = document.getElementById("filterInput");

/* Stats Elements */
const subjectCount = document.getElementById("subjectCount");
const taskCount = document.getElementById("taskCount");
const completedCount = document.getElementById("completedCount");
const progressPercentage = document.getElementById("progressPercentage");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

/* Syllabus Stat Elements */
const syllabusTotalTopics = document.getElementById("syllabusTotalTopics");
const syllabusCompletedTopics = document.getElementById("syllabusCompletedTopics");
const syllabusProgressPercent = document.getElementById("syllabusProgressPercent");

/* Other UI Elements */
const currentDate = document.getElementById("currentDate");
const welcomeMessage = document.getElementById("welcomeMessage");
const heroAddSubject = document.getElementById("heroAddSubject");
const emptyAddSubject = document.getElementById("emptyAddSubject");
const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.querySelector(".sidebar");

/* 4. INITIALIZE APPLICATION */
document.addEventListener("DOMContentLoaded", () => {
    updateDate();
    updateGreeting();

    if (!localStorage.getItem(SUBJECTS_KEY)) {
        saveData(SUBJECTS_KEY, subjects);
    }
    if (!localStorage.getItem(TASKS_KEY)) {
        saveData(TASKS_KEY, tasks);
    }

    renderSubjects();
    renderQuickSubjects();
    populateSubjectDropdown();
    renderTasks();
    updateStatistics();
    setupMobileMenu();
});

/* 5. LOCAL STORAGE UTILITIES */
function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        if (!saved) return fallback;
        return JSON.parse(saved);
    } catch (error) {
        console.error(`Could not load ${key}:`, error);
        return fallback;
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Could not save ${key}:`, error);
    }
}

/* 6. DATE & GREETING */
function updateDate() {
    if (!currentDate) return;
    const now = new Date();
    currentDate.textContent = now.toLocaleDateString("en-IN", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });
}

function updateGreeting() {
    if (!welcomeMessage) return;
    const hour = new Date().getHours();
    let greeting = "Good morning.";
    if (hour >= 12 && hour < 18) greeting = "Good afternoon.";
    else if (hour >= 18) greeting = "Good evening.";
    welcomeMessage.textContent = greeting;
}

/* 7. SUBJECT FORM SUBMISSION */
if (subjectForm) {
    subjectForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = subjectNameInput.value.trim();
        const description = subjectDescriptionInput.value.trim();

        if (!name) {
            subjectNameInput.focus();
            showToast("Please enter a subject name.", "error");
            return;
        }

        const duplicate = subjects.some(
            subject => subject.name.toLowerCase() === name.toLowerCase()
        );

        if (duplicate) {
            showToast("This subject already exists.", "error");
            return;
        }

        const newSubject = {
            id: Date.now(),
            name,
            description: description || "No description added."
        };

        subjects.push(newSubject);
        saveData(SUBJECTS_KEY, subjects);

        subjectForm.reset();
        renderSubjects();
        renderQuickSubjects();
        populateSubjectDropdown();
        updateStatistics();

        showToast(`${name} added successfully.`, "success");
    });
}

/* 8. RENDER SUBJECTS LIST */
function renderSubjects() {
    if (!subjectList) return;
    subjectList.innerHTML = "";

    if (subjects.length === 0) {
        if (emptySubjectMessage) emptySubjectMessage.style.display = "flex";
        return;
    }

    if (emptySubjectMessage) emptySubjectMessage.style.display = "none";

    subjects.forEach(subject => {
        const card = document.createElement("div");
        card.className = "manage-subject";

        const info = document.createElement("div");
        info.className = "manage-subject-info";

        const title = document.createElement("strong");
        title.textContent = subject.name;

        const description = document.createElement("span");
        description.textContent = subject.description || "No description";

        info.appendChild(title);
        info.appendChild(description);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.innerHTML = "×";
        deleteButton.setAttribute("aria-label", `Delete ${subject.name}`);
        deleteButton.addEventListener("click", () => deleteSubject(subject.id));

        card.appendChild(info);
        card.appendChild(deleteButton);
        subjectList.appendChild(card);
    });
}

/* 9. RENDER DYNAMIC SUBJECT CARDS WITH SYLLABUS INTEGRATION */
function renderQuickSubjects() {
    if (!quickSubjectList) return;
    quickSubjectList.innerHTML = "";

    if (subjects.length === 0) {
        quickSubjectList.style.display = "none";
        if (quickEmptyMessage) quickEmptyMessage.style.display = "flex";
        return;
    }

    quickSubjectList.style.display = "grid";
    if (quickEmptyMessage) quickEmptyMessage.style.display = "none";

    subjects.forEach((subject) => {
        const card = document.createElement("article");
        card.className = "subject-card";
        card.setAttribute("data-subject-id", subject.id);
        card.setAttribute("data-subject-name", subject.name);

        const progress = typeof updateSyllabusProgress === "function" 
            ? updateSyllabusProgress(subject.name) 
            : { total: 0, completed: 0, percentage: 0 };

        card.innerHTML = `
            <div class="subject-card-top">
                <div class="subject-icon">
                    ${getSubjectInitial(subject.name)}
                </div>
                <button class="delete-button" type="button" onclick="deleteSubject(${subject.id})" title="Delete Subject" aria-label="Delete subject">
                    ×
                </button>
            </div>

            <div>
                <h3>${escapeHTML(subject.name)}</h3>
                <p>${escapeHTML(subject.description || "No description")}</p>
            </div>

            <div class="subject-syllabus">
                <div class="syllabus-header">
                    <span class="syllabus-title">Syllabus Progress</span>
                    <strong class="syllabus-percentage">${progress.percentage}%</strong>
                </div>

                <div class="progress-track">
                    <div class="progress-fill ${progress.percentage === 100 ? 'success' : ''}" style="width: ${progress.percentage}%"></div>
                </div>

                <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">
                    Topics (${progress.completed}/${progress.total})
                </div>

                <ul class="syllabus-topic-list"></ul>

                <form class="add-topic-form" onsubmit="handleInlineAddTopic(event, '${escapeHTML(subject.name)}')">
                    <input type="text" class="add-topic-input" placeholder="+ Add new topic..." required />
                    <button type="submit" class="add-topic-btn">Add</button>
                </form>
            </div>
        `;

        quickSubjectList.appendChild(card);
    });

    if (typeof renderSyllabus === "function") {
        renderSyllabus();
    }
}

/* 10. DELETE SUBJECT & ITS ASSOCIATED SYLLABUS & TASKS */
function deleteSubject(id) {
    const subject = subjects.find(item => item.id === id);
    if (!subject) return;

    const relatedTasks = tasks.filter(task => task.subject === subject.name);
    let message = `Delete "${subject.name}"?`;
    if (relatedTasks.length > 0) {
        message += ` This will also remove ${relatedTasks.length} related task(s) and its syllabus.`;
    }

    if (!window.confirm(message)) return;

    subjects = subjects.filter(item => item.id !== id);
    tasks = tasks.filter(task => task.subject !== subject.name);

    saveData(SUBJECTS_KEY, subjects);
    saveData(TASKS_KEY, tasks);

    if (typeof loadSyllabus === "function" && typeof saveSyllabus === "function") {
        let syllabus = loadSyllabus();
        syllabus = syllabus.filter(item => item.subject.toLowerCase() !== subject.name.toLowerCase());
        saveSyllabus(syllabus);
    }

    renderSubjects();
    renderQuickSubjects();
    populateSubjectDropdown();
    renderTasks();
    updateStatistics();

    showToast(`${subject.name} deleted.`, "success");
}

function getSubjectInitial(name) {
    if (!name) return "S";
    return name.trim().charAt(0).toUpperCase();
}

/* 11. TASK FORM SUBMISSION */
if (taskForm) {
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = taskInput.value.trim();
        const subject = subjectInput.value;
        const priority = priorityInput.value;
        const deadline = deadlineInput.value;

        if (!title) {
            taskInput.focus();
            showToast("Please enter a task.", "error");
            return;
        }

        if (!subject) {
            subjectInput.focus();
            showToast("Please select a subject.", "error");
            return;
        }

        const newTask = {
            id: Date.now(),
            title,
            subject,
            priority,
            deadline,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveData(TASKS_KEY, tasks);

        taskForm.reset();
        priorityInput.value = "Medium";

        renderTasks();
        renderQuickSubjects();
        updateStatistics();

        showToast("Task added successfully.", "success");
    });
}

/* 12. RENDER TASKS */
function renderTasks() {
    if (!taskList) return;

    const search = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const filter = filterInput ? filterInput.value : "all";

    let filteredTasks = [...tasks];

    if (search) {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(search) ||
            task.subject.toLowerCase().includes(search)
        );
    }

    if (filter === "pending") filteredTasks = filteredTasks.filter(task => !task.completed);
    if (filter === "completed") filteredTasks = filteredTasks.filter(task => task.completed);
    if (filter === "high") filteredTasks = filteredTasks.filter(task => task.priority === "High");

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        if (emptyMessage) emptyMessage.style.display = "flex";
        return;
    }

    if (emptyMessage) emptyMessage.style.display = "none";

    filteredTasks.sort(sortTasks).forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });
}

function sortTasks(a, b) {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
}

function createTaskElement(task) {
    const item = document.createElement("article");
    item.className = `task-item ${task.completed ? 'completed' : ''}`;

    const check = document.createElement("button");
    check.type = "button";
    check.className = `task-check ${task.completed ? 'completed' : ''}`;
    check.textContent = task.completed ? "✓" : "";
    check.setAttribute("aria-label", task.completed ? "Mark incomplete" : "Mark complete");
    check.addEventListener("click", () => toggleTask(task.id));

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const subject = document.createElement("span");
    subject.textContent = task.subject;
    meta.appendChild(subject);

    if (task.deadline) {
        const deadline = document.createElement("span");
        deadline.textContent = `• ${formatDate(task.deadline)}`;
        meta.appendChild(deadline);
    }

    info.appendChild(title);
    info.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const priority = document.createElement("span");
    priority.className = `priority-badge priority-${task.priority.toLowerCase()}`;
    priority.textContent = task.priority;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = "×";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    actions.appendChild(priority);
    actions.appendChild(deleteButton);

    item.appendChild(check);
    item.appendChild(info);
    item.appendChild(actions);

    return item;
}

function toggleTask(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveData(TASKS_KEY, tasks);

    renderTasks();
    renderQuickSubjects();
    updateStatistics();

    showToast(
        task.completed ? "Task completed. Nice work! 🎯" : "Task moved back to pending.",
        "success"
    );
}

function deleteTask(id) {
    tasks = tasks.filter(item => item.id !== id);
    saveData(TASKS_KEY, tasks);

    renderTasks();
    renderQuickSubjects();
    updateStatistics();

    showToast("Task deleted.", "success");
}

/* 13. STATISTIC UPDATES */
function calculateOverallProgress() {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
}

function updateStatistics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = calculateOverallProgress();

    if (subjectCount) subjectCount.textContent = subjects.length;
    if (taskCount) taskCount.textContent = totalTasks;
    if (completedCount) completedCount.textContent = completedTasks;
    if (progressPercentage) progressPercentage.textContent = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}%`;
    if (progressFill) progressFill.style.width = `${progress}%`;

    if (typeof getOverallSyllabusProgress === "function") {
        const sylProgress = getOverallSyllabusProgress();
        if (syllabusTotalTopics) syllabusTotalTopics.textContent = sylProgress.total;
        if (syllabusCompletedTopics) syllabusCompletedTopics.textContent = sylProgress.completed;
        if (syllabusProgressPercent) syllabusProgressPercent.textContent = `${sylProgress.percentage}%`;
    }
}

/* 14. FILTERS & SEARCH */
if (searchInput) searchInput.addEventListener("input", renderTasks);
if (filterInput) filterInput.addEventListener("change", renderTasks);

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function setupMobileMenu() {
    if (!mobileMenu || !sidebar) return;
    mobileMenu.addEventListener("click", () => sidebar.classList.toggle("open"));
    document.querySelectorAll(".nav-item").forEach(link => {
        link.addEventListener("click", () => sidebar.classList.remove("open"));
    });
}

if (heroAddSubject) {
    heroAddSubject.addEventListener("click", () => {
        document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => subjectNameInput?.focus(), 400);
    });
}

if (emptyAddSubject) {
    emptyAddSubject.addEventListener("click", () => {
        document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => subjectNameInput?.focus(), 400);
    });
}

function showToast(message, type = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
        toast.style.transition = "all 200ms ease";
        setTimeout(() => toast.remove(), 200);
    }, 2500);
}

window.deleteSubject = deleteSubject;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.updateStatistics = updateStatistics;