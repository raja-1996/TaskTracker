

# 📄 Product Requirements Document (PRD)

**Feature:** AI-Powered Task & Subtask Suggestion System
**Owner:** [Your Name / Product Manager]
**Target Developer:** Junior Developer

---

## 1. Objective

We want to build a system that helps users automatically generate **tasks** and **subtasks** for a project using **LangChain + Gemini LLM**.

The system should:

* Suggest **tasks** and **subtasks** based on:

  * Project details (title, description, comments).
  * Previously generated tasks & subtasks.
  * User-accepted or user-created tasks & subtasks.
* Provide **titles and detailed descriptions** for all tasks/subtasks.
* Store generated results in a database to avoid repetitive calls.
* Allow users to **refresh** AI suggestions when needed.
* **Always display user-accepted or user-written tasks/subtasks above LLM-generated ones.**

---

## 2. User Stories

1. **As a user,** when I click on a project, I want to see suggested tasks (with descriptions and subtasks) so I don’t have to manually plan everything.
2. **As a user,** when I click on a task, I want to see suggested subtasks (with descriptions) so I can break it down into actionable steps.
3. **As a user,** I want a **Refresh** button to regenerate tasks or subtasks if I don’t like the current suggestions.
4. **As a user,** I want previously accepted or written tasks/subtasks to be considered when generating new ones, so the system stays consistent with my work.
5. **As a user,** I want my accepted/written tasks and subtasks to appear **above AI-generated ones** so I can clearly prioritize my own inputs over suggestions.

---

## 3. Scope

### 3.1 In Scope

* Generating tasks with subtasks using Gemini.
* Refresh button to regenerate results at project level.
* Caching results in a database.
* Storing both AI-generated and user-accepted items.
* Displaying user-accepted/manual items above AI-generated ones.

### 3.2 Out of Scope

* Advanced UI/UX features like drag-and-drop task management.
* Collaboration features (multiple users editing simultaneously).
* Analytics or reporting on tasks/subtasks.

---

## 4. Functional Requirements

### 4.1 Project Click → Generate Tasks

* **Input to LLM:**

  * Project Title, Description, Comments.
  * Previously written/accepted tasks + subtasks title, Description, Comments.
* **Output:**

  * A list of tasks with:

    * Task Title
    * Task Description
    * Subtasks (each with Title + Description).
* **Storage:** Save results in DB.
* **Refresh behavior:** Discard cached tasks → regenerate via Gemini → overwrite DB.
if user click on a refresh, the tasks should be generated For only that particular project

* **Display rule:**

  * Show **user-accepted/manual tasks** first.
  * Show **LLM-generated tasks** after user tasks.

### 4.2 Task Click → Generate Subtasks

* **Input to LLM:**

  * Task Title, Task Description, Task Comments.
  * Project Title, Description, Comments.
  * Previously written/accepted subtasks title, Description, Comments.
  * User-accepted/written subtasks title, Description, Comments.
* **Output:**

  * List of subtasks (each with Title + Description).
* **Storage:** Save results in DB.
* **Refresh behavior:** Discard cached subtasks → regenerate via Gemini → overwrite DB.
if user click on a refresh, the subtasks should be generated For only that particular task and that particular project
* **Display rule:**

  * Show **user-accepted/manual subtasks** first.
  * Show **LLM-generated subtasks** after user subtasks.


## 6. System Workflow

### 6.1 Project Click Workflow

1. User clicks a project.
2. System checks DB for tasks related to project.

   * If tasks exist → display cached results.
   * If no tasks OR Refresh clicked → call Gemini.
3. Gemini generates tasks + subtasks (considering project details + past tasks + user-accepted ones).
4. Store results in DB.
5. **Display:**

   * User-accepted/manual tasks at the top.
   * LLM-generated tasks at the bottom.

### 6.2 Task Click Workflow

1. User clicks a task.
2. System checks DB for subtasks related to the task.

   * If subtasks exist → display cached results.
   * If no subtasks OR Refresh clicked → call Gemini.
3. Gemini generates subtasks (considering project details + past subtasks + user-accepted ones).
4. Store results in DB.
5. **Display:**

   * User-accepted/manual subtasks at the top.
   * LLM-generated subtasks at the bottom.

---

## 7. UI Requirements

* **Project Page:**

  * Show list of tasks (Title + short Description).
  * Expand each task to show subtasks.
  * "Refresh" button at the top (regenerates tasks).
  * **Ordering:** User tasks → AI tasks.

* **Task Page:**

  * Show list of subtasks (Title + short Description).
  * "Refresh" button for subtasks.
  * **Ordering:** User subtasks → AI subtasks.

* **Indicators:**

  * Mark which tasks/subtasks are **AI-generated** vs **User-added/accepted**.

## 9. Open Questions

* Should we allow users to **edit AI-generated results** before saving to DB?
Not required
* Should we version tasks/subtasks when refreshed, or just overwrite?
Overwrite
* Do we need a **limit** on number of tasks/subtasks generated per request?
Yes - Max 5 tasks/subtasks per request
