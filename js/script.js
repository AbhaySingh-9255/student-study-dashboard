/* =========================================================
   STUDYTRACK — MAIN JAVASCRIPT
   Subjects + Tasks + Progress + LocalStorage
   ========================================================= */


/* =========================================================
   1. STORAGE KEYS
   ========================================================= */

const SUBJECTS_KEY = "studyTrack_subjects";
const TASKS_KEY = "studyTrack_tasks";


/* =========================================================
   2. APPLICATION STATE
   ========================================================= */

let subjects = loadData(SUBJECTS_KEY, []);
let tasks = loadData(TASKS_KEY, []);


/* =========================================================
   3. DOM ELEMENTS
   ========================================================= */

const subjectForm =
    document.getElementById("subjectForm");

const subjectNameInput =
    document.getElementById("subjectNameInput");

const subjectDescriptionInput =
    document.getElementById("subjectDescriptionInput");

const subjectList =
    document.getElementById("subjectList");

const emptySubjectMessage =
    document.getElementById("emptySubjectMessage");

const quickSubjectList =
    document.getElementById("quickSubjectList");

const quickEmptyMessage =
    document.getElementById("quickEmptyMessage");

const taskForm =
    document.getElementById("taskForm");

const taskInput =
    document.getElementById("taskInput");

const subjectInput =
    document.getElementById("subjectInput");

const priorityInput =
    document.getElementById("priorityInput");

const deadlineInput =
    document.getElementById("deadlineInput");

const taskList =
    document.getElementById("taskList");

const emptyMessage =
    document.getElementById("emptyMessage");

const searchInput =
    document.getElementById("searchInput");

const filterInput =
    document.getElementById("filterInput");


/* Stats */

const subjectCount =
    document.getElementById("subjectCount");

const taskCount =
    document.getElementById("taskCount");

const completedCount =
    document.getElementById("completedCount");

const progressPercentage =
    document.getElementById("progressPercentage");

const progressText =
    document.getElementById("progressText");

const progressFill =
    document.getElementById("progressFill");


/* Other */

const currentDate =
    document.getElementById("currentDate");

const welcomeMessage =
    document.getElementById("welcomeMessage");

const heroAddSubject =
    document.getElementById("heroAddSubject");

const emptyAddSubject =
    document.getElementById("emptyAddSubject");

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.querySelector(".sidebar");


/* =========================================================
   4. INITIALIZE APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateDate();

    updateGreeting();

    renderSubjects();

    renderQuickSubjects();

    populateSubjectDropdown();

    renderTasks();

    updateStatistics();

    setupMobileMenu();

});


/* =========================================================
   5. LOCAL STORAGE
   ========================================================= */

function loadData(key, fallback) {

    try {

        const saved =
            localStorage.getItem(key);

        if (!saved) {
            return fallback;
        }

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            `Could not load ${key}:`,
            error
        );

        return fallback;
    }
}


function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            `Could not save ${key}:`,
            error
        );
    }
}


/* =========================================================
   6. DATE
   ========================================================= */

function updateDate() {

    if (!currentDate) {
        return;
    }

    const now = new Date();

    const formatted =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );

    currentDate.textContent =
        formatted;
}


/* =========================================================
   7. GREETING
   ========================================================= */

function updateGreeting() {

    if (!welcomeMessage) {
        return;
    }

    const hour =
        new Date().getHours();

    let greeting;

    if (hour < 12) {

        greeting =
            "Good morning.";

    } else if (hour < 18) {

        greeting =
            "Good afternoon.";

    } else {

        greeting =
            "Good evening.";
    }

    welcomeMessage.textContent =
        greeting;
}


/* =========================================================
   8. SUBJECT FORM
   ========================================================= */

if (subjectForm) {

    subjectForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                subjectNameInput.value.trim();

            const description =
                subjectDescriptionInput.value.trim();


            if (!name) {

                subjectNameInput.focus();

                showToast(
                    "Please enter a subject name.",
                    "error"
                );

                return;
            }


            const duplicate =
                subjects.some(
                    subject =>
                        subject.name.toLowerCase() ===
                        name.toLowerCase()
                );


            if (duplicate) {

                showToast(
                    "This subject already exists.",
                    "error"
                );

                return;
            }


            const newSubject = {

                id: Date.now(),

                name,

                description:
                    description ||
                    "No description added."
            };


            subjects.push(newSubject);

            saveData(
                SUBJECTS_KEY,
                subjects
            );


            subjectForm.reset();

            renderSubjects();

            renderQuickSubjects();

            populateSubjectDropdown();

            updateStatistics();


            showToast(
                `${name} added successfully.`,
                "success"
            );

        }
    );

}


/* =========================================================
   9. RENDER SUBJECTS
   ========================================================= */

function renderSubjects() {

    if (!subjectList) {
        return;
    }


    subjectList.innerHTML = "";


    if (subjects.length === 0) {

        if (emptySubjectMessage) {

            emptySubjectMessage.style.display =
                "flex";
        }

        return;
    }


    if (emptySubjectMessage) {

        emptySubjectMessage.style.display =
            "none";
    }


    subjects.forEach(subject => {

        const card =
            document.createElement("div");

        card.className =
            "manage-subject";


        const info =
            document.createElement("div");

        info.className =
            "manage-subject-info";


        const title =
            document.createElement("strong");

        title.textContent =
            subject.name;


        const description =
            document.createElement("span");

        description.textContent =
            subject.description ||
            "No description";


        info.appendChild(title);

        info.appendChild(description);


        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-button";

        deleteButton.type =
            "button";

        deleteButton.innerHTML =
            "×";

        deleteButton.setAttribute(
            "aria-label",
            `Delete ${subject.name}`
        );


        deleteButton.addEventListener(
            "click",
            () => deleteSubject(subject.id)
        );


        card.appendChild(info);

        card.appendChild(deleteButton);

        subjectList.appendChild(card);

    });

}


/* =========================================================
   10. QUICK SUBJECT CARDS
   ========================================================= */

function renderQuickSubjects() {

    if (!quickSubjectList) {
        return;
    }


    quickSubjectList.innerHTML = "";


    if (subjects.length === 0) {

        quickSubjectList.style.display =
            "none";

        if (quickEmptyMessage) {

            quickEmptyMessage.style.display =
                "flex";
        }

        return;
    }


    quickSubjectList.style.display =
        "grid";


    if (quickEmptyMessage) {

        quickEmptyMessage.style.display =
            "none";
    }


    subjects.forEach((subject, index) => {

        const card =
            document.createElement("article");

        card.className =
            "subject-card";


        const progress =
            getSubjectProgress(subject.name);


        card.innerHTML = `

            <div>

                <div class="subject-card-top">

                    <div class="subject-icon">
                        ${getSubjectInitial(subject.name)}
                    </div>

                    <button
                        class="subject-menu"
                        type="button"
                        aria-label="Subject options"
                    >
                        ${index + 1}
                    </button>

                </div>


                <h3>
                    ${escapeHTML(subject.name)}
                </h3>


                <p>
                    ${escapeHTML(
            subject.description ||
            "No description"
        )}
                </p>

            </div>


            <div class="subject-progress">

                <div class="subject-progress-header">

                    <span>
                        ${getSubjectTaskText(subject.name)}
                    </span>

                    <strong>
                        ${progress}%
                    </strong>

                </div>


                <div class="progress-track">

                    <div
                        class="progress-fill"
                        style="width: ${progress}%"
                    ></div>

                </div>

            </div>

        `;


        quickSubjectList.appendChild(card);

    });

}


/* =========================================================
   11. SUBJECT INITIAL
   ========================================================= */

function getSubjectInitial(name) {

    if (!name) {
        return "S";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


/* =========================================================
   12. DELETE SUBJECT
   ========================================================= */

function deleteSubject(id) {

    const subject =
        subjects.find(
            item => item.id === id
        );


    if (!subject) {
        return;
    }


    const relatedTasks =
        tasks.filter(
            task =>
                task.subject ===
                subject.name
        );


    let message =
        `Delete "${subject.name}"?`;


    if (relatedTasks.length > 0) {

        message +=
            ` This will also remove ${relatedTasks.length} related task(s).`;
    }


    const confirmed =
        window.confirm(message);


    if (!confirmed) {
        return;
    }


    subjects =
        subjects.filter(
            item => item.id !== id
        );


    tasks =
        tasks.filter(
            task =>
                task.subject !==
                subject.name
        );


    saveData(
        SUBJECTS_KEY,
        subjects
    );

    saveData(
        TASKS_KEY,
        tasks
    );


    renderSubjects();

    renderQuickSubjects();

    populateSubjectDropdown();

    renderTasks();

    updateStatistics();


    showToast(
        `${subject.name} deleted.`,
        "success"
    );

}


/* =========================================================
   13. SUBJECT DROPDOWN
   ========================================================= */

function populateSubjectDropdown() {

    if (!subjectInput) {
        return;
    }


    subjectInput.innerHTML = `

        <option value="">
            Select subject
        </option>

    `;


    subjects.forEach(subject => {

        const option =
            document.createElement("option");

        option.value =
            subject.name;

        option.textContent =
            subject.name;

        subjectInput.appendChild(option);

    });

}


/* =========================================================
   14. TASK FORM
   ========================================================= */

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const title =
                taskInput.value.trim();

            const subject =
                subjectInput.value;

            const priority =
                priorityInput.value;

            const deadline =
                deadlineInput.value;


            if (!title) {

                taskInput.focus();

                showToast(
                    "Please enter a task.",
                    "error"
                );

                return;
            }


            if (!subject) {

                subjectInput.focus();

                showToast(
                    "Please select a subject.",
                    "error"
                );

                return;
            }


            const newTask = {

                id: Date.now(),

                title,

                subject,

                priority,

                deadline,

                completed: false,

                createdAt:
                    new Date().toISOString()

            };


            tasks.push(newTask);


            saveData(
                TASKS_KEY,
                tasks
            );


            taskForm.reset();


            priorityInput.value =
                "Medium";


            renderTasks();

            renderQuickSubjects();

            updateStatistics();


            showToast(
                "Task added successfully.",
                "success"
            );

        }
    );

}


/* =========================================================
   15. RENDER TASKS
   ========================================================= */

function renderTasks() {

    if (!taskList) {
        return;
    }


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filter =
        filterInput
            ? filterInput.value
            : "all";


    let filteredTasks =
        [...tasks];


    /* Search */

    if (search) {

        filteredTasks =
            filteredTasks.filter(task =>

                task.title
                    .toLowerCase()
                    .includes(search)

                ||

                task.subject
                    .toLowerCase()
                    .includes(search)

            );

    }


    /* Filters */

    if (filter === "pending") {

        filteredTasks =
            filteredTasks.filter(
                task => !task.completed
            );

    }


    if (filter === "completed") {

        filteredTasks =
            filteredTasks.filter(
                task => task.completed
            );

    }


    if (filter === "high") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.priority ===
                    "High"
            );

    }


    taskList.innerHTML = "";


    if (filteredTasks.length === 0) {

        if (emptyMessage) {

            emptyMessage.style.display =
                "flex";
        }

        return;
    }


    if (emptyMessage) {

        emptyMessage.style.display =
            "none";
    }


    filteredTasks
        .sort(sortTasks)
        .forEach(task => {

            taskList.appendChild(
                createTaskElement(task)
            );

        });

}


/* =========================================================
   16. SORT TASKS
   ========================================================= */

function sortTasks(a, b) {

    if (
        a.completed !==
        b.completed
    ) {

        return a.completed
            ? 1
            : -1;
    }


    const priorityOrder = {

        High: 1,

        Medium: 2,

        Low: 3

    };


    return (
        priorityOrder[a.priority] -
        priorityOrder[b.priority]
    );

}


/* =========================================================
   17. CREATE TASK ELEMENT
   ========================================================= */

function createTaskElement(task) {

    const item =
        document.createElement("article");


    item.className =
        "task-item";


    if (task.completed) {

        item.classList.add(
            "completed"
        );

    }


    const check =
        document.createElement("button");

    check.type =
        "button";

    check.className =
        "task-check";


    if (task.completed) {

        check.classList.add(
            "completed"
        );

        check.textContent =
            "✓";

    }


    check.setAttribute(
        "aria-label",
        task.completed
            ? "Mark task incomplete"
            : "Mark task complete"
    );


    check.addEventListener(
        "click",
        () =>
            toggleTask(task.id)
    );


    const info =
        document.createElement("div");

    info.className =
        "task-info";


    const title =
        document.createElement("div");

    title.className =
        "task-title";

    title.textContent =
        task.title;


    const meta =
        document.createElement("div");

    meta.className =
        "task-meta";


    const subject =
        document.createElement("span");

    subject.textContent =
        task.subject;


    meta.appendChild(subject);


    if (task.deadline) {

        const deadline =
            document.createElement("span");

        deadline.textContent =
            `• ${formatDate(task.deadline)}`;

        meta.appendChild(deadline);

    }


    info.appendChild(title);

    info.appendChild(meta);


    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";


    const priority =
        document.createElement("span");

    priority.className =
        `priority-badge priority-${task.priority.toLowerCase()}`;

    priority.textContent =
        task.priority;


    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.className =
        "delete-button";

    deleteButton.innerHTML =
        "×";

    deleteButton.setAttribute(
        "aria-label",
        `Delete ${task.title}`
    );


    deleteButton.addEventListener(
        "click",
        () =>
            deleteTask(task.id)
    );


    actions.appendChild(priority);

    actions.appendChild(deleteButton);


    item.appendChild(check);

    item.appendChild(info);

    item.appendChild(actions);


    return item;

}


/* =========================================================
   18. TOGGLE TASK
   ========================================================= */

function toggleTask(id) {

    const task =
        tasks.find(
            item => item.id === id
        );


    if (!task) {
        return;
    }


    task.completed =
        !task.completed;


    saveData(
        TASKS_KEY,
        tasks
    );


    renderTasks();

    renderQuickSubjects();

    updateStatistics();


    showToast(
        task.completed
            ? "Task completed. Nice work! 🎯"
            : "Task moved back to pending.",
        "success"
    );

}


/* =========================================================
   19. DELETE TASK
   ========================================================= */

function deleteTask(id) {

    const task =
        tasks.find(
            item => item.id === id
        );


    if (!task) {
        return;
    }


    tasks =
        tasks.filter(
            item => item.id !== id
        );


    saveData(
        TASKS_KEY,
        tasks
    );


    renderTasks();

    renderQuickSubjects();

    updateStatistics();


    showToast(
        "Task deleted.",
        "success"
    );

}


/* =========================================================
   20. PROGRESS
   ========================================================= */

function calculateOverallProgress() {

    if (tasks.length === 0) {
        return 0;
    }


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    return Math.round(
        (completed / tasks.length) * 100
    );

}


/* =========================================================
   21. SUBJECT PROGRESS
   ========================================================= */

function getSubjectProgress(subjectName) {

    const subjectTasks =
        tasks.filter(
            task =>
                task.subject ===
                subjectName
        );


    if (subjectTasks.length === 0) {
        return 0;
    }


    const completed =
        subjectTasks.filter(
            task => task.completed
        ).length;


    return Math.round(
        (completed /
            subjectTasks.length) *
        100
    );

}


/* =========================================================
   22. SUBJECT TASK TEXT
   ========================================================= */

function getSubjectTaskText(subjectName) {

    const subjectTasks =
        tasks.filter(
            task =>
                task.subject ===
                subjectName
        );


    const completed =
        subjectTasks.filter(
            task => task.completed
        ).length;


    return `${completed} / ${subjectTasks.length} tasks`;

}


/* =========================================================
   23. UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    const totalTasks =
        tasks.length;


    const completedTasks =
        tasks.filter(
            task => task.completed
        ).length;


    const progress =
        calculateOverallProgress();


    if (subjectCount) {

        subjectCount.textContent =
            subjects.length;
    }


    if (taskCount) {

        taskCount.textContent =
            totalTasks;
    }


    if (completedCount) {

        completedCount.textContent =
            completedTasks;
    }


    if (progressPercentage) {

        progressPercentage.textContent =
            `${progress}%`;
    }


    if (progressText) {

        progressText.textContent =
            `${progress}%`;
    }


    if (progressFill) {

        progressFill.style.width =
            `${progress}%`;
    }

}


/* =========================================================
   24. SEARCH
   ========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderTasks
    );

}


/* =========================================================
   25. FILTER
   ========================================================= */

if (filterInput) {

    filterInput.addEventListener(
        "change",
        renderTasks
    );

}


/* =========================================================
   26. FORMAT DATE
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (Number.isNaN(
        date.getTime()
    )) {

        return dateString;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );

}


/* =========================================================
   27. ESCAPE HTML
   Prevents user-entered content from becoming HTML.
   ========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


/* =========================================================
   28. MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    if (
        !mobileMenu ||
        !sidebar
    ) {
        return;
    }


    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    document
        .querySelectorAll(".nav-item")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    sidebar.classList.remove(
                        "open"
                    );

                }
            );

        });

}


/* =========================================================
   29. HERO ADD SUBJECT
   ========================================================= */

if (heroAddSubject) {

    heroAddSubject.addEventListener(
        "click",
        () => {

            document
                .getElementById("subjects")
                ?.scrollIntoView({
                    behavior: "smooth"
                });


            setTimeout(
                () => {

                    subjectNameInput?.focus();

                },
                400
            );

        }
    );

}


/* =========================================================
   30. EMPTY STATE ADD SUBJECT
   ========================================================= */

if (emptyAddSubject) {

    emptyAddSubject.addEventListener(
        "click",
        () => {

            document
                .getElementById("subjects")
                ?.scrollIntoView({
                    behavior: "smooth"
                });


            setTimeout(
                () => {

                    subjectNameInput?.focus();

                },
                400
            );

        }
    );

}


/* =========================================================
   31. TOAST NOTIFICATIONS
   ========================================================= */

function showToast(
    message,
    type = "success"
) {

    let container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.id =
            "toastContainer";


        container.style.position =
            "fixed";

        container.style.right =
            "20px";

        container.style.bottom =
            "20px";

        container.style.zIndex =
            "9999";

        container.style.display =
            "flex";

        container.style.flexDirection =
            "column";

        container.style.gap =
            "8px";


        document.body.appendChild(
            container
        );

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.textContent =
        message;


    toast.style.padding =
        "11px 14px";

    toast.style.border =
        "1px solid #e4e4e7";

    toast.style.borderRadius =
        "10px";

    toast.style.background =
        "#ffffff";

    toast.style.color =
        type === "error"
            ? "#dc2626"
            : "#18181b";

    toast.style.fontSize =
        "12px";

    toast.style.fontWeight =
        "500";

    toast.style.boxShadow =
        "0 8px 25px rgba(0,0,0,0.08)";

    toast.style.opacity =
        "0";

    toast.style.transform =
        "translateY(8px)";

    toast.style.transition =
        "opacity 160ms ease, transform 160ms ease";


    container.appendChild(
        toast
    );


    requestAnimationFrame(
        () => {

            toast.style.opacity =
                "1";

            toast.style.transform =
                "translateY(0)";

        }
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(8px)";


            setTimeout(
                () => toast.remove(),
                180
            );

        },
        2500
    );

}


/* =========================================================
   32. GLOBAL DEBUG HELPER
   Open browser console and type:
   StudyTrack.debug()
   ========================================================= */

window.StudyTrack = {

    debug() {

        console.table({
            subjects:
                subjects.length,

            tasks:
                tasks.length,

            completed:
                tasks.filter(
                    task =>
                        task.completed
                ).length,

            progress:
                `${calculateOverallProgress()}%`
        });

    },

    reset() {

        const confirmed =
            window.confirm(
                "Reset all StudyTrack data?"
            );


        if (!confirmed) {
            return;
        }


        localStorage.removeItem(
            SUBJECTS_KEY
        );

        localStorage.removeItem(
            TASKS_KEY
        );


        location.reload();

    }

};