"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Archive, ArchiveRestore } from "lucide-react";
import { ProjectItem } from "./project-item";
import { CreateProjectDialog } from "./create-project-dialog";
import { format } from "date-fns";

export function ProjectsSidebar() {
    const {
        projects,
        selectedProjectId,
        showArchived,
        setSelectedProject,
        setSelectedEntity,
        setShowArchived,
    } = useAppStore();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesArchiveFilter = showArchived ? project.archived : !project.archived;
        return matchesSearch && matchesArchiveFilter;
    });

    const handleProjectSelect = async (projectId: string) => {
        // Always select the project when clicked
        await setSelectedProject(projectId);
        // Set the project as the selected entity for details view after auto-selection completes
        setSelectedEntity('project', projectId);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Projects</h2>
                    <Button
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create
                    </Button>
                </div>

                {/* Search */}
                <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-3"
                />

                {/* Archive Toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                    className="w-full gap-2"
                >
                    {showArchived ? (
                        <>
                            <ArchiveRestore className="h-4 w-4" />
                            Show Active
                        </>
                    ) : (
                        <>
                            <Archive className="h-4 w-4" />
                            Show Archived
                        </>
                    )}
                </Button>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredProjects.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <div className="text-sm">
                            {projects.length === 0
                                ? "No projects yet. Create your first project!"
                                : "No projects match your search."}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredProjects.map((project) => (
                            <ProjectItem
                                key={project.id}
                                project={project}
                                isSelected={selectedProjectId === project.id}
                                onSelect={() => handleProjectSelect(project.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Project Stats */}
            <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                    {showArchived ? "Archived" : "Active"}: {filteredProjects.length} projects
                </div>
            </div>

            {/* Create Project Dialog */}
            <CreateProjectDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}
