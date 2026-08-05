/* =========================================================
   STUDYTRACK — PROGRESS PAGE
   ========================================================= */


/* =========================================================
   1. STORAGE
   ========================================================= */

const SUBJECTS_KEY =
    "studyTrack_subjects";

const TASKS_KEY =
    "studyTrack_tasks";

const SYLLABUS_KEY="studyTrack_syllabus";


/* =========================================================
   2. LOAD DATA
   ========================================================= */

let subjects =
    loadData(
        SUBJECTS_KEY,
        []
    );


let tasks =
    loadData(
        TASKS_KEY,
        []
    );


let syllabus =
loadData(
        SYLLABUS_KEY,
        []
    );


/* =========================================================
   3. DOM
   ========================================================= */

const progressRing =
    document.getElementById(
        "progressRing"
    );


const overallPercentage =
    document.getElementById(
        "overallPercentage"
    );


const totalSubjects =
    document.getElementById(
        "totalSubjects"
    );


const totalTasks =
    document.getElementById(
        "totalTasks"
    );


const completedTasks =
    document.getElementById(
        "completedTasks"
    );


const subjectProgressList =
    document.getElementById(
        "subjectProgressList"
    );


const subjectProgressEmpty =
    document.getElementById(
        "subjectProgressEmpty"
    );


const recentActivity =
    document.getElementById(
        "recentActivity"
    );


const activityEmpty =
    document.getElementById(
        "activityEmpty"
    );


/* =========================================================
   4. INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateOverview();

        renderSubjectProgress();

        renderRecentActivity();

        setupMobileMenu();

    }
);


/* =========================================================
   5. LOCAL STORAGE
   ========================================================= */

function loadData(
    key,
    fallback
) {

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


/* =========================================================
   6. OVERALL PROGRESS
   ========================================================= */

function calculateProgress() {

    if (tasks.length === 0) {

        return 0;

    }


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    return Math.round(
        (
            completed /
            tasks.length
        ) * 100
    );

}


/* =========================================================
   7. UPDATE OVERVIEW
   ========================================================= */

function updateOverview() {

    const progress =
        calculateProgress();


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    if (totalSubjects) {

        totalSubjects.textContent =
            subjects.length;

    }


    if (totalTasks) {

        totalTasks.textContent =
            tasks.length;

    }


    if (completedTasks) {

        completedTasks.textContent =
            completed;

    }


    if (overallPercentage) {

        overallPercentage.textContent =
            `${progress}%`;

    }


    if (progressRing) {

        progressRing.style
            .setProperty(
                "--progress",
                `${progress}%`
            );

    }

}


/* =========================================================
   8. SUBJECT PROGRESS
   ========================================================= */

function renderSubjectProgress() {

    if (!subjectProgressList) {
        return;
    }


    subjectProgressList.innerHTML =
        "";


    if (subjects.length === 0) {

        subjectProgressList.style.display =
            "none";


        if (subjectProgressEmpty) {

            subjectProgressEmpty.style.display =
                "flex";

        }

        return;

    }


    subjectProgressList.style.display =
        "flex";


    if (subjectProgressEmpty) {

        subjectProgressEmpty.style.display =
            "none";

    }


    subjects.forEach(
        subject => {

            const subjectTasks =
                tasks.filter(
                    task =>
                        task.subject ===
                        subject.name
                );


            const completed =
                subjectTasks.filter(
                    task =>
                        task.completed
                ).length;


            const progress =
                subjectTasks.length === 0
                    ? 0
                    : Math.round(
                        (
                            completed /
                            subjectTasks.length
                        ) * 100
                    );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "progress-subject";


            item.innerHTML = `

                <div class="progress-subject-header">

                    <div class="progress-subject-name">

                        <div class="progress-subject-icon">
                            ${getInitial(subject.name)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(
                subject.name
            )}
                            </strong>

                            <span>
                                ${completed}
                                of
                                ${subjectTasks.length}
                                tasks completed
                            </span>

                        </div>

                    </div>


                    <span class="progress-subject-percent">
                        ${progress}%
                    </span>

                </div>


                <div class="progress-track">

                    <div
                        class="progress-fill"
                        style="width: ${progress}%"
                    ></div>

                </div>

            `;


            subjectProgressList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   9. RECENT ACTIVITY
   ========================================================= */

function renderRecentActivity() {

    if (!recentActivity) {
        return;
    }


    recentActivity.innerHTML =
        "";


    const completed =
        tasks
            .filter(
                task =>
                    task.completed
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.completedAt ||
                        b.createdAt ||
                        0
                    ) -
                    new Date(
                        a.completedAt ||
                        a.createdAt ||
                        0
                    )
            )
            .slice(
                0,
                5
            );


    if (completed.length === 0) {

        recentActivity.style.display =
            "none";


        if (activityEmpty) {

            activityEmpty.style.display =
                "flex";

        }

        return;

    }


    recentActivity.style.display =
        "flex";


    if (activityEmpty) {

        activityEmpty.style.display =
            "none";

    }


    completed.forEach(
        task => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "activity-item";


            const icon =
                document.createElement(
                    "div"
                );


            icon.className =
                "activity-icon";


            icon.textContent =
                "✓";


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "activity-info";


            const title =
                document.createElement(
                    "strong"
                );


            title.textContent =
                task.title;


            const meta =
                document.createElement(
                    "span"
                );


            meta.textContent =
                `${task.subject} • Completed`;


            info.appendChild(
                title
            );


            info.appendChild(
                meta
            );


            item.appendChild(
                icon
            );


            item.appendChild(
                info
            );


            recentActivity.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   10. INITIAL LETTER
   ========================================================= */

function getInitial(name) {

    if (!name) {

        return "S";

    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


/* =========================================================
   11. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value;


    return element.innerHTML;

}


/* =========================================================
   12. MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


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
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        sidebar.classList.remove(
                            "open"
                        );

                    }
                );

            }
        );

}