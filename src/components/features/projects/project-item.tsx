"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineEdit } from "@/components/ui/inline-edit";
import {
    MoreHorizontal,
    Edit,
    Archive,
    ArchiveRestore,
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
import { Project, ProjectStatus } from "@/types/database";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectItemProps {
    project: Project;
    isSelected: boolean;
    onSelect: () => void;
}

const statusConfig = {
    'Active': { icon: Circle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    'Completed': { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    'Archived': { icon: Archive, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/20' }
};

export function ProjectItem({ project, isSelected, onSelect }: ProjectItemProps) {
    const { updateProject, deleteProject, archiveProject } = useAppStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleArchiveToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await archiveProject(project.id, !project.archived);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete "${project.name}"? This will also delete all tasks and subtasks.`)) {
            await deleteProject(project.id);
        }
    };

    const handleStatusChange = async (status: ProjectStatus) => {
        await updateProject(project.id, { status });
        setIsMenuOpen(false);
    };

    const handleNameSave = async (newName: string) => {
        await updateProject(project.id, { name: newName });
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setIsMenuOpen(false);
    };

    const currentStatus = (project.status as ProjectStatus) || 'Active';
    const StatusIcon = statusConfig[currentStatus].icon;
    const isOverdue = project.due_date && new Date(project.due_date) < new Date() && currentStatus !== 'Completed';

    return (
        <Card
            className={cn(
                "p-3 cursor-pointer transition-all hover:shadow-sm border",
                isSelected ? "ring-2 ring-ring border-ring" : "hover:border-border",
                project.archived && "opacity-60",
                isEditing && "cursor-default"
            )}
            onClick={isEditing ? undefined : onSelect}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    {/* Status and Title */}
                    <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className={cn("h-4 w-4", statusConfig[currentStatus].color)} />
                        {isEditing ? (
                            <InlineEdit
                                value={project.name}
                                onSave={handleNameSave}
                                onCancel={() => setIsEditing(false)}
                                placeholder="Project name..."
                                className="flex-1"
                                inputClassName="text-sm font-medium"
                            />
                        ) : (
                            <h3 className="font-medium text-sm truncate">{project.name}</h3>
                        )}
                    </div>

                    {/* Due Date */}
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

                {/* Actions Menu */}
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick();
                        }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Name
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Status Changes */}
                        {currentStatus !== 'Active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange('Active')}>
                                <Circle className="h-4 w-4 mr-2" />
                                Mark Active
                            </DropdownMenuItem>
                        )}
                        {currentStatus !== 'Completed' && (
                            <DropdownMenuItem onClick={() => handleStatusChange('Completed')}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Complete
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={handleArchiveToggle}>
                            {project.archived ? (
                                <>
                                    <ArchiveRestore className="h-4 w-4 mr-2" />
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
                            onClick={handleDelete}
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
