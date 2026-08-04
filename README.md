# 📚 Student Study Dashboard

A modern and responsive **Student Study Dashboard** built to help students organize subjects, manage study tasks, and track their learning progress from one place.

The project is being developed step-by-step as a 10-day web development project, with each day adding new functionality and improving the UI/UX.

---

## 🚀 Live Project

Coming soon...

---

## 📌 Project Goals

The main goal of this project is to build a practical student productivity platform where students can:

- 📚 Manage subjects
- 📝 Add and manage study tasks
- 📊 Track overall study progress
- 🎯 Track progress subject-wise
- 📅 Manage deadlines
- 🔎 Search and filter tasks
- 📱 Use the dashboard on mobile, tablet, and desktop
- 🎥 Add learning resources such as YouTube videos in future versions
- 📈 Track learning progression over time

---

# 🗓️ Development Progress

## ✅ Day 1 — Project Foundation

### Completed

- Created project structure
- Created dashboard HTML structure
- Added CSS folder
- Created initial responsive layout
- Added basic dashboard sections
- Created navigation structure

### Main concepts learned

- HTML5 structure
- Semantic HTML
- CSS basics
- Flexbox
- CSS Grid
- Basic responsive design
- Project folder organization

---

# ✅ Day 2 — Dashboard UI

### Completed

Improved the dashboard interface with:

- Modern navigation
- Dashboard header
- Subject section
- Task section
- Progress section
- Cards
- Buttons
- Responsive layout
- Better typography
- Spacing and alignment

### Main concepts learned

- UI hierarchy
- CSS variables
- Cards and components
- Responsive layouts
- Hover states
- Reusable CSS classes

---

# ✅ Day 3 — Task & Progress Functionality

### Completed

Added functionality for:

- Adding study tasks
- Selecting subjects
- Setting task priority
- Adding deadlines
- Completing tasks
- Deleting tasks
- Searching tasks
- Filtering tasks
- Calculating completion percentage
- Saving data using `localStorage`

### Main concepts learned

- JavaScript DOM manipulation
- Event listeners
- Arrays and objects
- Functions
- `localStorage`
- Dynamic HTML generation
- Filtering and searching
- Basic application state

---

# ✅ Day 4 — Dynamic Subjects

### Completed

The dashboard was upgraded so subjects are no longer fixed.

Students can now:

- ➕ Add subjects
- 📝 Add subject descriptions
- 🗑️ Delete subjects
- 📚 View subjects dynamically
- 📊 View subject-wise task progress
- 🔄 Automatically update task subject dropdowns

Subject data is stored using browser `localStorage`.

### Main concepts learned

- Dynamic UI rendering
- CRUD operations
- JavaScript state management
- Local storage
- Dynamic dropdowns
- Data relationships between subjects and tasks

---

# ✅ Progress Page — Study Analytics

A dedicated progress page was added to give students a clearer view of their learning progress.

### Features

- 📊 Overall completion percentage
- 📚 Total subjects
- 📝 Total tasks
- ✅ Completed tasks
- 📈 Subject-wise progress
- 🕒 Recently completed tasks
- 📱 Responsive design

The Progress page uses the same `localStorage` data as the main dashboard.

---

# 🧠 Current Architecture

```text
Student Study Dashboard
│
├── Dashboard
│   ├── Subjects
│   ├── Tasks
│   └── Overall Progress
│
├── Progress Page
│   ├── Overall Statistics
│   ├── Subject Progress
│   └── Recent Activity
│
└── LocalStorage
    ├── Subjects
    └── Tasks
