/**
 * StudyTrack — System Data Backup Engine
 */

const BACKUP_KEYS = [
    'studyTrack_subjects',
    'studyTrack_tasks',
    'studyTrack_syllabus',
    'studyTrack_videos',
    'studyTrack_notes',
    'studyTrack_planner'
];

window.openBackupModal = function() {
    const modal = document.getElementById('backupModal');
    if (modal) modal.style.display = 'flex';
};

window.closeBackupModal = function() {
    const modal = document.getElementById('backupModal');
    if (modal) modal.style.display = 'none';
};

window.exportSystemData = function() {
    const exportObject = {};
    BACKUP_KEYS.forEach(key => {
        try {
            const raw = localStorage.getItem(key);
            exportObject[key] = raw ? JSON.parse(raw) : [];
        } catch (e) {
            exportObject[key] = [];
        }
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `studytrack_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
};

window.importSystemData = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            BACKUP_KEYS.forEach(key => {
                if (data[key]) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                }
            });
            alert("Backup restored successfully!");
            window.location.reload();
        } catch (err) {
            alert("Error importing JSON file.");
        }
    };
    reader.readAsText(file);
};