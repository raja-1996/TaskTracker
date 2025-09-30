"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Archive, ArchiveRestore, GripVertical } from "lucide-react";
import { CreateProjectDialog } from "./create-project-dialog";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import {
    CSS,
} from '@dnd-kit/utilities';
import { Project } from "@/types/database";
import { Card } from "@/components/ui/card";
import { InlineEdit } from "@/components/ui/inline-edit";
import {
    MoreHorizontal,
    Edit,
    ArchiveRestore as ArchiveRestoreIcon,
    Trash2,
    Calendar,
    CheckCircle2,
    Circle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ProjectStatus } from "@/types/database";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SortableProjectItemProps {
    project: Project;
    isSelected: boolean;
    onSelect: () => void;
    editingProjectId: string | null;
    setEditingProjectId: (id: string | null) => void;
    handleEditClick: (projectId: string) => void;
    handleNameSave: (projectId: string, newName: string) => Promise<void>;
    handleStatusChange: (projectId: string, status: ProjectStatus) => void;
    handleArchiveToggle: (projectId: string, archived: boolean) => void;
    handleDelete: (projectId: string, projectName: string) => void;
}

function SortableProjectItem({
    project,
    isSelected,
    onSelect,
    editingProjectId,
    setEditingProjectId,
    handleEditClick,
    handleNameSave,
    handleStatusChange,
    handleArchiveToggle,
    handleDelete,
}: SortableProjectItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const currentStatus = (project.status as ProjectStatus) || 'Active';
    const isOverdue = project.due_date && new Date(project.due_date) < new Date() && currentStatus !== 'Completed';

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                "p-3 cursor-pointer transition-all hover:shadow-sm border",
                isSelected ? "ring-2 ring-ring border-ring" : "hover:border-border",
                project.archived && "opacity-60",
                editingProjectId === project.id && "cursor-default",
                isDragging && "z-50"
            )}
            onClick={editingProjectId === project.id ? undefined : onSelect}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div
                        className="cursor-grab active:cursor-grabbing flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground mt-1"
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {editingProjectId === project.id ? (
                                <InlineEdit
                                    value={project.name}
                                    onSave={(newName) => handleNameSave(project.id, newName)}
                                    onCancel={() => setEditingProjectId(null)}
                                    placeholder="Project name..."
                                    className="flex-1"
                                    inputClassName="text-sm font-medium"
                                />
                            ) : (
                                <h3 className="font-medium text-sm truncate">{project.name}</h3>
                            )}
                        </div>

                        {project.due_date && (
                            <div className={cn(
                                "flex items-center gap-1 text-xs",
                                isOverdue ? "text-destructive" : "text-muted-foreground"
                            )}>
                                <Calendar className="h-3 w-3" />
                                {format(new Date(project.due_date), 'MMM d, yyyy')}
                            </div>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(project.id);
                        }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Name
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {currentStatus !== 'Active' && (
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(project.id, 'Active');
                            }}>
                                <Circle className="h-4 w-4 mr-2" />
                                Mark Active
                            </DropdownMenuItem>
                        )}
                        {currentStatus !== 'Completed' && (
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(project.id, 'Completed');
                            }}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Complete
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveToggle(project.id, !project.archived);
                        }}>
                            {project.archived ? (
                                <>
                                    <ArchiveRestoreIcon className="h-4 w-4 mr-2" />
                                    Unarchive
                                </>
                            ) : (
                                <>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                </>
                            )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(project.id, project.name);
                            }}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    );
}

export function ProjectsSidebar() {
    const {
        projects,
        selectedProjectId,
        showArchived,
        setSelectedProject,
        setSelectedEntity,
        setShowArchived,
        updateProject,
        deleteProject,
        archiveProject,
        reorderProjects,
    } = useAppStore();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesArchiveFilter = showArchived ? project.archived : !project.archived;
        return matchesSearch && matchesArchiveFilter;
    });

    const handleProjectSelect = async (projectId: string) => {
        await setSelectedProject(projectId);
        setSelectedEntity('project', projectId);
    };

    const handleEditClick = (projectId: string) => {
        setEditingProjectId(projectId);
    };

    const handleNameSave = async (projectId: string, newName: string) => {
        await updateProject(projectId, { name: newName });
        setEditingProjectId(null);
    };

    const handleStatusChange = async (projectId: string, status: ProjectStatus) => {
        await updateProject(projectId, { status });
    };

    const handleArchiveToggle = async (projectId: string, archived: boolean) => {
        await archiveProject(projectId, archived);
    };

    const handleDelete = async (projectId: string, projectName: string) => {
        if (confirm(`Are you sure you want to delete "${projectName}"? This will also delete all tasks and subtasks.`)) {
            await deleteProject(projectId);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            if (searchQuery.trim() !== '') {
                console.warn('Reordering is disabled while search filter is active');
                return;
            }

            const oldIndex = projects.findIndex((project) => project.id === active.id);
            const newIndex = projects.findIndex((project) => project.id === over?.id);

            if (oldIndex === -1 || newIndex === -1) {
                console.warn('Could not find project indices for reordering');
                return;
            }

            const reorderedProjects = arrayMove(projects, oldIndex, newIndex);

            const updatedProjects = reorderedProjects.map((project, index) => ({
                ...project,
                order_index: index
            }));

            reorderProjects(updatedProjects);
        }
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

                <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-3"
                />

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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredProjects.map(project => project.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {filteredProjects.map((project) => (
                                    <SortableProjectItem
                                        key={project.id}
                                        project={project}
                                        isSelected={selectedProjectId === project.id}
                                        onSelect={() => handleProjectSelect(project.id)}
                                        editingProjectId={editingProjectId}
                                        setEditingProjectId={setEditingProjectId}
                                        handleEditClick={handleEditClick}
                                        handleNameSave={handleNameSave}
                                        handleStatusChange={handleStatusChange}
                                        handleArchiveToggle={handleArchiveToggle}
                                        handleDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Project Stats */}
            <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                    {showArchived ? "Archived" : "Active"}: {filteredProjects.length} projects
                </div>
            </div>

            <CreateProjectDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}