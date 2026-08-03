/* =====================================================
   PROGRESS PAGE
===================================================== */


let tasks =
    JSON.parse(
        localStorage.getItem("studentTasks")
    ) || [];


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


    taskCount.textContent =
        total;


    completedCount.textContent =
        completed;


    progressPercentage.textContent =
        percentage + "%";


    progressText.textContent =
        percentage + "%";


    progressFill.style.width =
        percentage + "%";

}


updateProgress(); 