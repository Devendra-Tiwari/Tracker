let currentSubject = '';
let currentChapter = '';

document.addEventListener('DOMContentLoaded', loadData);

function showSubject(subject) {
    currentSubject = subject;
    document.getElementById('subject-page').classList.add('hidden');
    document.getElementById('chapter-page').classList.remove('hidden');
    document.getElementById('chapter-title').innerText = subject;
    loadChapters();
}

function goBack(page) {
    if (page === 'subject') {
        document.getElementById('chapter-page').classList.add('hidden');
        document.getElementById('subject-page').classList.remove('hidden');
    } else if (page === 'chapter') {
        document.getElementById('lecture-page').classList.add('hidden');
        document.getElementById('chapter-page').classList.remove('hidden');
    }
}

function addChapter() {
    const chapterName = prompt("Enter chapter name:");
    if (chapterName) {
        const chapterDiv = document.createElement('div');
        chapterDiv.innerHTML = `
            <button onclick="showLecturePage('${chapterName}')">${chapterName}</button>
            <button onclick="editChapter(this)">✏️</button>
            <button onclick="confirmDeleteChapter(this)">❌</button>
        `;
        document.getElementById('chapters').appendChild(chapterDiv);
        saveData();
    }
}

function confirmDeleteChapter(button) {
    if (confirm("Are you sure you want to delete this chapter?")) {
        deleteChapter(button);
    }
}

function deleteChapter(button) {
    const chapterDiv = button.parentNode;
    chapterDiv.remove();
    saveData();
}

function editChapter(button) {
    const chapterDiv = button.parentNode;
    const currentName = chapterDiv.querySelector('button').innerText;
    const newName = prompt("Edit chapter name:", currentName);
    if (newName) {
        chapterDiv.querySelector('button').innerText = newName;
        saveData();
    }
}

function showLecturePage(chapter) {
    currentChapter = chapter;
    document.getElementById('chapter-page').classList.add('hidden');
    document.getElementById('lecture-page').classList.remove('hidden');
    document.getElementById('lecture-title').innerText = chapter;
    loadLectures();
}

function addLecture() {
    const lectureName = prompt("Enter lecture name:");
    if (lectureName) {
        const lectureDiv = document.createElement('div');
        lectureDiv.classList.add('lecture-container');
        lectureDiv.innerHTML = `
            <span>${lectureName}</span>
            <input type="checkbox" onchange="saveData()">
            <button onclick="confirmDeleteLecture(this)">❌</button>
        `;
        document.getElementById('lectures').appendChild(lectureDiv);
        saveData();
    }
}

function confirmDeleteLecture(button) {
    if (confirm("Are you sure you want to delete this lecture?")) {
        deleteLecture(button);
    }
}

function deleteLecture(button) {
    const lectureDiv = button.parentNode;
    lectureDiv.remove();
    saveData();
}

function loadChapters() {
    const chapters = JSON.parse(localStorage.getItem(currentSubject)) || [];
    const chaptersDiv = document.getElementById('chapters');
    chaptersDiv.innerHTML = '';
    chapters.forEach(chapter => {
        const chapterDiv = document.createElement('div');
        chapterDiv.innerHTML = `
            <button onclick="showLecturePage('${chapter}')">${chapter}</button>
            <button onclick="editChapter(this)">✏️</button>
            <button onclick="confirmDeleteChapter(this)">❌</button>
        `;
        chaptersDiv.appendChild(chapterDiv);
    });
}

function loadLectures() {
    const lectures = JSON.parse(localStorage.getItem(`${currentSubject}_${currentChapter}`)) || [];
    const lecturesDiv = document.getElementById('lectures');
    lecturesDiv.innerHTML = '';
    lectures.forEach(lecture => {
        const lectureDiv = document.createElement('div');
        lectureDiv.classList.add('lecture-container');
        lectureDiv.innerHTML = `
            <span>${lecture.name}</span>
            <input type="checkbox" ${lecture.done ? 'checked' : ''} onchange="saveData()">
            <button onclick="confirmDeleteLecture(this)">❌</button>
        `;
        lecturesDiv.appendChild(lectureDiv);
    });
}

function saveData() {
    const chapters = Array.from(document.getElementById('chapters').children).map(chapterDiv => {
        return chapterDiv.querySelector('button').innerText;
    });
    localStorage.setItem(currentSubject, JSON.stringify(chapters));

    const lectures = Array.from(document.getElementById('lectures').children).map(lectureDiv => {
        return {
            name: lectureDiv.querySelector('span').innerText,
            done: lectureDiv.querySelector('input[type="checkbox"]').checked
        };
    });
    localStorage.setItem(`${currentSubject}_${currentChapter}`, JSON.stringify(lectures));
}

function loadData() {
    const subjects = ['Physics', 'PC', 'IOC', 'OC', 'Botany', 'Zoology'];
    subjects.forEach(subject => {
        const chapters = JSON.parse(localStorage.getItem(subject)) || [];
        chapters.forEach(chapter => {
            const chapterDiv = document.createElement('div');
            chapterDiv.innerHTML = `
                <button onclick="showLecturePage('${chapter}')">${chapter}</button>
                <button onclick="editChapter(this)">✏️</button>
                <button onclick="confirmDeleteChapter(this)">❌</button>
            `;
            document.getElementById('chapters').appendChild(chapterDiv);
        });
    });
}

function backupData() {
    const data = {
        subjects: {}
    };

    // Loop through all subjects
    ['Physics', 'PC', 'IOC', 'OC', 'Botany', 'Zoology'].forEach(subject => {
        const chapters = JSON.parse(localStorage.getItem(subject)) || [];
        data.subjects[subject] = {};

        // Loop through all chapters
        chapters.forEach(chapter => {
            const lectures = JSON.parse(localStorage.getItem(`${subject}_${chapter}`)) || [];
            data.subjects[subject][chapter] = lectures; // Associate lectures with chapters
        });
    });

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study_manager_backup.json';
    a.click();
    URL.revokeObjectURL(url);
}

function restoreData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        
        if (confirm("This will delete old data. Do you want to proceed with the restoration?")) {
            // Clear old data
            localStorage.clear();
            
            // Restore new data
            Object.keys(data.subjects).forEach(subject => {
                localStorage.setItem(subject, JSON.stringify(Object.keys(data.subjects[subject]))); // Store chapter names
                Object.keys(data.subjects[subject]).forEach(chapter => {
                    const lectures = data.subjects[subject][chapter] || [];
                    localStorage.setItem(`${subject}_${chapter}`, JSON.stringify(lectures)); // Store lectures for each chapter
                });
            });
            alert("Data restored successfully!");
            loadData(); // Reload the subjects to reflect restored data
        }
    };
    reader.readAsText(file);
}
