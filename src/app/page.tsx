"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { ProjectsSidebar } from "@/components/features/projects/projects-sidebar";
import { TasksColumn } from "@/components/features/tasks/tasks-column";
import { SubtasksColumn } from "@/components/features/subtasks/subtasks-column";
import { DetailsPanel } from "@/components/features/details/details-panel";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ResizableLayout } from "@/components/ui/resizable-layout";

export default function Home() {
  const { loadProjects, error, clearError, isLoading } = useAppStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {error && (
        <ErrorBanner message={error} onClose={clearError} />
      )}

      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Tracker</h1>
            <p className="text-sm text-muted-foreground">Personal Project Management</p>
          </div>
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
        </div>
      </header>

      {/* Main 4-Column Resizable Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizableLayout
          defaultWidths={[320, 480, 480]} // Projects: 320px, Tasks: 480px, Subtasks: 480px, Details: remaining space
          minWidths={[250, 350, 350, 400]} // Minimum widths for each column
          storageKey="task-tracker-column-widths"
          className="h-full"
        >
          <div className="border-r border-border bg-card h-full">
            <ProjectsSidebar />
          </div>

          <div className="border-r border-border bg-card h-full">
            <TasksColumn />
          </div>

          <div className="border-r border-border bg-card h-full">
            <SubtasksColumn />
          </div>

          <div className="bg-background h-full">
            <DetailsPanel />
          </div>
        </ResizableLayout>
      </div>
    </div>
  );
}
