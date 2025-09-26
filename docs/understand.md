# 📋 Project Understanding: Task Tracker

This document serves as a comprehensive reference for implementing the Task Tracker project management tool.

---

## **🎯 Project Overview**

**Task Tracker** is a **personal task management system** for a single user with a hierarchical structure:
- **Projects** → **Tasks** → **Subtasks** → **Details & Comments**

### **Core Purpose**
- Manage personal projects with detailed task breakdown
- Track progress through three-state workflow (To-Do → In Progress → Done)
- Add detailed descriptions and personal notes to subtasks
- Provide intuitive drag-and-drop reordering

---

## **🏗️ Architecture**

### **Tech Stack**
- **Frontend**: Next.js 14+ (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Icons**: Lucide React
- **Forms**: react-hook-form + zod validation
- **Dates**: date-fns

### **Key Libraries**
```json
{
  "@supabase/supabase-js": "Latest",
  "@supabase/ssr": "Latest", 
  "@dnd-kit/core": "Latest",
  "@dnd-kit/sortable": "Latest",
  "zustand": "Latest",
  "react-hook-form": "Latest",
  "zod": "Latest",
  "date-fns": "Latest"
}
```

---

## **🎨 UI Structure (4-Column Layout)**

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   SIDEBAR   │    TASKS    │  SUBTASKS   │   DETAILS   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ [+ Create]  │   Task 1    │ SubTask 1   │ Description │
│             │   Task 2    │ SubTask 2   │ [textarea]  │
│ Project 1   │   Task 3    │ SubTask 3   │             │
│ Project 2   │             │             │ Comments    │
│ Project 3   │             │             │ [list+input]│
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **Navigation Flow**
1. **Select Project** → Loads first task's subtasks automatically
2. **Select Task** → Loads its subtasks, selects first subtask
3. **Select Subtask** → Loads description and comments in details panel

### **UI Features**
- **Status badges** for all items (To-Do, In Progress, Done)
- **Active selection** visual indicators
- **Add buttons** (+) for creating new items
- **Drag handles** for reordering
- **Archive toggle** for completed projects

---

## **📊 Database Schema**

### **projects**
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
name        TEXT NOT NULL
due_date    DATE
owner       TEXT DEFAULT 'user'
status      TEXT DEFAULT 'Active' -- Active/Completed/Archived
archived    BOOLEAN DEFAULT false
created_at  TIMESTAMPTZ DEFAULT now()
updated_at  TIMESTAMPTZ DEFAULT now()
```

### **tasks**
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id  UUID REFERENCES projects(id) ON DELETE CASCADE
name        TEXT NOT NULL
status      TEXT DEFAULT 'To-Do' -- To-Do/In Progress/Done
order_index INTEGER NOT NULL
created_at  TIMESTAMPTZ DEFAULT now()
updated_at  TIMESTAMPTZ DEFAULT now()
```

### **subtasks**
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
task_id     UUID REFERENCES tasks(id) ON DELETE CASCADE
name        TEXT NOT NULL
status      TEXT DEFAULT 'To-Do' -- To-Do/In Progress/Done
order_index INTEGER NOT NULL
created_at  TIMESTAMPTZ DEFAULT now()
updated_at  TIMESTAMPTZ DEFAULT now()
```

### **subtask_details**
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
subtask_id  UUID REFERENCES subtasks(id) ON DELETE CASCADE UNIQUE
description TEXT DEFAULT ''
updated_at  TIMESTAMPTZ DEFAULT now()
```

### **comments**
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
subtask_id  UUID REFERENCES subtasks(id) ON DELETE CASCADE
content     TEXT NOT NULL
created_at  TIMESTAMPTZ DEFAULT now()
```

---

## **🔧 Key Features & Functionality**

### **Projects Management**
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Archive/Unarchive (soft delete)
- ✅ Status tracking (Active/Completed/Archived)
- ✅ Due date support

### **Tasks Management**
- ✅ CRUD operations
- ✅ Drag-and-drop reordering
- ✅ Status updates (To-Do/In Progress/Done)
- ✅ Auto-selection on project change

### **Subtasks Management**
- ✅ CRUD operations
- ✅ Drag-and-drop reordering
- ✅ Status updates
- ✅ Auto-selection on task change

### **Subtask Details**
- ✅ Rich text description editing
- ✅ Autosave functionality
- ✅ Comments system (threaded personal notes)
- ✅ Timestamp tracking

### **Real-time Updates**
- ✅ Supabase real-time subscriptions
- ✅ Live data synchronization
- ✅ Optimistic UI updates

---

## **📁 Project Structure**

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/
│   ├── ui/                # shadcn/ui components
│   └── features/          # Feature-specific components
│       ├── projects/      # Project sidebar components
│       ├── tasks/         # Tasks column components
│       ├── subtasks/      # Subtasks column components
│       └── details/       # Details panel components
├── lib/
│   ├── supabase/          # Supabase client & utilities
│   │   ├── client.ts      # Supabase client setup
│   │   └── types.ts       # Generated TypeScript types
│   ├── stores/            # Zustand stores
│   │   └── app-store.ts   # Main application state
│   └── utils.ts           # Utility functions
├── types/                 # Custom TypeScript types
│   └── database.ts        # Database type definitions
└── hooks/                 # Custom React hooks
    └── use-supabase.ts    # Supabase integration hooks
```

---

## **🚀 Implementation Priority**

### **Phase 1: Foundation**
1. Database schema setup in Supabase
2. Next.js project setup with TypeScript
3. shadcn/ui components installation
4. Basic 4-column layout

### **Phase 2: Core Features**
1. Projects CRUD with Zustand store
2. Tasks CRUD with drag-and-drop
3. Subtasks CRUD with drag-and-drop
4. Details panel (description + comments)

### **Phase 3: Enhancement**
1. Real-time subscriptions
2. Status management UI
3. Archive functionality
4. Polish and error handling

---

## **🎯 Success Criteria**

- [ ] User can create and manage projects
- [ ] Hierarchical navigation works smoothly (Project → Task → Subtask)
- [ ] Drag-and-drop reordering is intuitive
- [ ] Status updates reflect immediately
- [ ] Comments system works for personal notes
- [ ] Data persists correctly in Supabase
- [ ] Real-time updates work across sessions
- [ ] UI is responsive and polished

---

*This document will be updated as the project evolves and new requirements are discovered.*
