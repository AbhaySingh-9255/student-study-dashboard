/* =====================================================
   STUDENT STUDY DASHBOARD
   DAY 3 - JAVASCRIPT
===================================================== */


/* =====================================================
   TASK DATA
===================================================== */

// Load saved tasks from localStorage

let tasks =
    JSON.parse(
        localStorage.getItem("studentTasks")
    ) || [

        {
            id: 1,
            title: "Complete Java notes",
            completed: false
        },

        {
            id: 2,
            title: "Practice OOP questions",
            completed: true
        },

        {
            id: 3,
            title: "Study Data Visualisation",
            completed: false
        }

    ];


/* =====================================================
   DOM ELEMENTS
===================================================== */

const welcomeMessage =
    document.getElementById(
        "welcomeMessage"
    );


const currentDate =
    document.getElementById(
        "currentDate"
    );


const taskInput =
    document.getElementById(
        "taskInput"
    );


const addTaskButton =
    document.getElementById(
        "addTaskButton"
    );


const taskList =
    document.getElementById(
        "taskList"
    );


const emptyMessage =
    document.getElementById(
        "emptyMessage"
    );


const taskCount =
    document.getElementById(
        "taskCount"
    );


const completedCount =
    document.getElementById(
        "completedCount"
    );


const progressPercentage =
    document.getElementById(
        "progressPercentage"
    );


const progressText =
    document.getElementById(
        "progressText"
    );


const progressFill =
    document.getElementById(
        "progressFill"
    );


/* =====================================================
   SAVE TASKS
===================================================== */

function saveTasks() {

    localStorage.setItem(
        "studentTasks",
        JSON.stringify(tasks)
    );

}


/* =====================================================
   DATE
===================================================== */

function updateDate() {

    const today =
        new Date();


    const options = {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    };


    currentDate.textContent =
        today.toLocaleDateString(
            "en-IN",
            options
        );

}


/* =====================================================
   GREETING
===================================================== */

function updateGreeting() {

    const hour =
        new Date().getHours();


    if (hour < 12) {

        welcomeMessage.textContent =
            "Good morning ☀️";

    }

    else if (hour < 18) {

        welcomeMessage.textContent =
            "Good afternoon 🌤️";

    }

    else {

        welcomeMessage.textContent =
            "Good evening 🌙";

    }

}


/* =====================================================
   RENDER TASKS
===================================================== */

function renderTasks() {

    taskList.innerHTML = "";


    if (tasks.length === 0) {

        emptyMessage.style.display =
            "block";

        return;

    }


    emptyMessage.style.display =
        "none";


    tasks.forEach(function(task) {


        /* Create task container */

        const taskElement =
            document.createElement(
                "div"
            );


        taskElement.className =
            "task-item";


        if (task.completed) {

            taskElement.classList.add(
                "completed"
            );

        }


        /* Create checkbox */

        const checkbox =
            document.createElement(
                "input"
            );


        checkbox.type =
            "checkbox";


        checkbox.className =
            "task-checkbox";


        checkbox.checked =
            task.completed;


        checkbox.addEventListener(
            "change",
            function() {

                toggleTask(
                    task.id
                );

            }
        );


        /* Create task title */

        const title =
            document.createElement(
                "span"
            );


        title.className =
            "task-title";


        title.textContent =
            task.title;


        /* Create delete button */

        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.className =
            "delete-task";


        deleteButton.textContent =
            "🗑️";


        deleteButton.title =
            "Delete task";


        deleteButton.addEventListener(
            "click",
            function() {

                deleteTask(
                    task.id
                );

            }
        );


        /* Add everything */

        taskElement.appendChild(
            checkbox
        );


        taskElement.appendChild(
            title
        );


        taskElement.appendChild(
            deleteButton
        );


        taskList.appendChild(
            taskElement
        );

    });

}


/* =====================================================
   ADD TASK
===================================================== */

function addTask() {

    const title =
        taskInput.value.trim();


    // Don't add empty task

    if (title === "") {

        alert(
            "Please enter a task."
        );

        return;

    }


    const newTask = {

        id:
            Date.now(),

        title:
            title,

        completed:
            false

    };


    tasks.push(
        newTask
    );


    saveTasks();


    taskInput.value =
        "";


    renderTasks();


    updateProgress();

}


/* =====================================================
   TOGGLE TASK
===================================================== */

function toggleTask(taskId) {

    tasks =
        tasks.map(
            function(task) {

                if (
                    task.id === taskId
                ) {

                    return {

                        ...task,

                        completed:
                            !task.completed

                    };

                }


                return task;

            }
        );


    saveTasks();


    renderTasks();


    updateProgress();

}


/* =====================================================
   DELETE TASK
===================================================== */

function deleteTask(taskId) {

    tasks =
        tasks.filter(
            function(task) {

                return task.id !== taskId;

            }
        );


    saveTasks();


    renderTasks();


    updateProgress();

}


/* =====================================================
   UPDATE PROGRESS
===================================================== */

function updateProgress() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function(task) {

                return task.completed;

            }
        ).length;


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


    /* Update task count */

    taskCount.textContent =
        total;


    /* Update completed count */

    completedCount.textContent =
        completed;


    /* Update percentage */

    progressPercentage.textContent =
        percentage + "%";


    progressText.textContent =
        percentage + "%";


    /* Update progress bar */

    progressFill.style.width =
        percentage + "%";

}


/* =====================================================
   ADD TASK BUTTON
===================================================== */

addTaskButton.addEventListener(
    "click",
    addTask
);


/* =====================================================
   ENTER KEY
===================================================== */

taskInput.addEventListener(
    "keypress",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            addTask();

        }

    }
);


/* =====================================================
   INITIALIZE APPLICATION
===================================================== */

updateDate();

updateGreeting();

renderTasks();

updateProgress();