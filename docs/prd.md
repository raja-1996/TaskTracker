# 📘 Detailed Project Specification: Project Management Tool

This document describes the requirements, features, and expected behaviors of the **Project Management Tool**.

---

## **1. Overview**

The tool is a **personal task management system** for a single user.
It allows the user to manage **Projects → Tasks → Subtasks**, with details and comments for each subtask.

The UI is split into **four main sections**:

1. **Sidebar** (Projects list and create project button)
2. **Tasks column** (all tasks under the selected project)
3. **Subtasks column** (all subtasks under the selected task)
4. **Details panel** (description and comments for the selected subtask)

The user can:

* Create, edit, delete, reorder projects, tasks, and subtasks.
* Update statuses (To-Do, In Progress, Done).
* Add/edit descriptions for subtasks.
* Add threaded comments for subtasks.
* Archive projects when they are no longer active.

---

## **2. Project Requirements**

### **2.1 Projects**

* A project is a **container for tasks**.

* **Attributes:**

  * `id` (unique identifier)
  * `name` (string, required)
  * `due_date` (optional, date)
  * `owner` (string → default: single user, but stored for future expansion)
  * `status` (Active, Completed, Archived)
  * `archived` (boolean → true if project is archived)

* **Features:**

  * Create new project from the sidebar.
  * Edit project details (name, due date, status).
  * Delete project.
  * Archive project (does not delete data, just hides from active list).
  * List all projects in the sidebar.
  * When a project is selected → load its tasks in the second column.
  * By default, select the first project.

---

### **2.2 Tasks**

* A task belongs to a project.

* **Attributes:**

  * `id` (unique identifier)
  * `project_id` (foreign key to Projects)
  * `name` (string, required)
  * `status` (To-Do, In Progress, Done)
  * `order_index` (integer → for drag-and-drop ordering)

* **Features:**

  * Add new tasks under a selected project.
  * Edit task name/status.
  * Delete tasks.
  * Reorder tasks with drag-and-drop.
  * List tasks in the second column.
  * When a task is selected → load its subtasks in the third column.
  * By default, load the first task of the selected project.

---

### **2.3 Subtasks**

* A subtask belongs to a task.

* **Attributes:**

  * `id` (unique identifier)
  * `task_id` (foreign key to Tasks)
  * `name` (string, required)
  * `status` (To-Do, In Progress, Done)
  * `order_index` (integer → for drag-and-drop ordering)

* **Features:**

  * Add new subtasks under a selected task.
  * Edit subtask name/status.
  * Delete subtasks.
  * Reorder subtasks with drag-and-drop.
  * List subtasks in the third column.
  * When a subtask is selected → load details panel (description + comments).
  * By default, load the subtasks of the first task.

---

### **2.4 Subtask Details**

* Each subtask has a **description**.

* **Attributes:**

  * `id` (unique identifier)
  * `subtask_id` (foreign key to Subtasks)
  * `description` (text field, editable)

* **Features:**

  * View and edit description in the details panel.
  * Autosave or explicit save when user edits.

---

### **2.5 Comments**

* Comments are linked to a subtask.

* Since it’s single-user, comments serve as **personal notes/logs**.

* **Attributes:**

  * `id` (unique identifier)
  * `subtask_id` (foreign key to Subtasks)
  * `content` (text, required)
  * `created_at` (timestamp)

* **Features:**

  * Add comments in the details panel.
  * View all comments in chronological order.
  * Delete comments.
  * (Optional: edit comments if needed).

---

## **3. User Interface Flow**

### **3.1 Sidebar (Projects Column)**

* **Top:** Button → "Create New Project".
* **Below:** List of projects.

  * Show project name.
  * Click → loads tasks in second column.
  * Indicate active project visually.
  * Archived projects hidden (or shown in collapsible section).

---

### **3.2 Tasks Column**

* Header → "Tasks".
* List of tasks for the selected project.
* Each task shows:

  * Task name.
  * Task status.
* Clicking a task → loads subtasks in the third column.
* First task auto-selected when project loads.

---

### **3.3 Subtasks Column**

* Header → "Subtasks".
* List of subtasks for the selected task.
* Each subtask shows:

  * Subtask name.
  * Subtask status.
* Clicking a subtask → loads details panel.
* First subtask auto-selected when task loads.

---

### **3.4 Details Panel**

* Two sections:

  1. **Description:**

     * Editable text area.
     * Save changes automatically.
  2. **Comments:**

     * List of comments for this subtask.
     * Input box for adding new comment.
     * Comments listed chronologically.
     * Option to delete (and possibly edit).

---

## **4. Interaction Rules**

1. **Project → Tasks → Subtasks → Details flow:**

   * Selecting higher-level items automatically loads the lower level.
   * Example: Selecting Project → loads tasks, first task auto-selected → loads subtasks.

2. **Drag-and-drop:**

   * Supported for reordering tasks and subtasks.
   * Order is stored in DB using `order_index`.

3. **Statuses:**

   * Tasks and subtasks can have one of three statuses:

     * To-Do
     * In Progress
     * Done

4. **Persistence:**

   * All data is stored in **Supabase**.
   * Updates must sync to backend APIs.

---

## **5. Technology Stack**

* **Frontend:** Next.js (React)
* **Styling:** TailwindCSS, shadcn/ui
* **State Management:** React Context / Zustand
* **Drag-and-drop:** `react-beautiful-dnd` or `dnd-kit`
* **Backend:** Next.js API routes (Node.js)
* **Database:** Supabase

---

## **6. Database Schema (High-level)**

### **projects**

| Column   | Type        | Notes                         |
| -------- | ----------- | ----------------------------- |
| id       | UUID/Serial | Primary key                   |
| name     | Text        | Required                      |
| due_date | Date        | Optional                      |
| owner    | Text        | Default: "user"               |
| status   | Text        | Active / Completed / Archived |
| archived | Boolean     | Default: false                |

### **tasks**

| Column      | Type             | Notes                      |
| ----------- | ---------------- | -------------------------- |
| id          | UUID/Serial      | Primary key                |
| project_id  | FK → projects.id | Required                   |
| name        | Text             | Required                   |
| status      | Text             | To-Do / In Progress / Done |
| order_index | Integer          | For drag-and-drop ordering |

### **subtasks**

| Column      | Type          | Notes                      |
| ----------- | ------------- | -------------------------- |
| id          | UUID/Serial   | Primary key                |
| task_id     | FK → tasks.id | Required                   |
| name        | Text          | Required                   |
| status      | Text          | To-Do / In Progress / Done |
| order_index | Integer       | For drag-and-drop ordering |

### **subtask_details**

| Column      | Type             | Notes            |
| ----------- | ---------------- | ---------------- |
| id          | UUID/Serial      | Primary key      |
| subtask_id  | FK → subtasks.id | Required         |
| description | Text             | Editable by user |

### **comments**

| Column     | Type             | Notes          |
| ---------- | ---------------- | -------------- |
| id         | UUID/Serial      | Primary key    |
| subtask_id | FK → subtasks.id | Required       |
| content    | Text             | Required       |
| created_at | Timestamp        | Default: now() |

---
