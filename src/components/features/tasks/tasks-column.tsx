"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, CheckCircle2, Clock, PlayCircle, Trash2, RefreshCw, Bot, User } from "lucide-react";
import { CreateTaskDialog } from "./create-task-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatus } from "@/types/database";

export function TasksColumn() {
    const {
        tasks,
        selectedProjectId,
        selectedTaskId,
        setSelectedTask,
        setSelectedEntity,
        projects,
        updateTask,
        deleteTask,
        generateAITasks,
    } = useAppStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    // Sort tasks: user tasks first, then AI tasks, filtered by search
    const filteredTasks = tasks
        .filter(task => task.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            // User tasks come first, then AI tasks
            if (a.source_type === 'user' && b.source_type === 'ai') return -1;
            if (a.source_type === 'ai' && b.source_type === 'user') return 1;
            // Within same source type, sort by order_index
            return a.order_index - b.order_index;
        });

    const handleStatusChange = async (taskId: string, status: TaskStatus) => {
        await updateTask(taskId, { status });
    };

    const handleDeleteTask = async (taskId: string, taskName: string) => {
        if (confirm(`Are you sure you want to delete "${taskName}"? This will also delete all subtasks.`)) {
            await deleteTask(taskId);
        }
    };

    const handleTaskSelect = async (taskId: string) => {
        await setSelectedTask(taskId);
        // Set the task as the selected entity for details view after auto-selection completes
        setSelectedEntity('task', taskId);
    };

    const handleGenerateAITasks = async (refresh: boolean = false) => {
        if (!selectedProjectId || isGeneratingTasks) return;

        setIsGeneratingTasks(true);
        try {
            await generateAITasks(selectedProjectId, refresh);
        } catch (error) {
            console.error('Failed to generate AI tasks:', error);
        } finally {
            setIsGeneratingTasks(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">Tasks</h2>
                        {selectedProject && (
                            <p className="text-sm text-muted-foreground">{selectedProject.name}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={!selectedProjectId || isGeneratingTasks}
                            className="gap-2"
                            onClick={() => handleGenerateAITasks()}
                        >
                            {isGeneratingTasks ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Bot className="h-4 w-4" />
                            )}
                            {isGeneratingTasks ? 'Generating...' : 'AI Tasks'}
                        </Button>
                        <Button
                            size="sm"
                            disabled={!selectedProjectId}
                            className="gap-2"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Task
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        disabled={!selectedProjectId}
                    />
                </div>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto p-4">
                {!selectedProjectId ? (
                    <div className="text-center text-muted-foreground py-8">
                        <div className="text-sm">Select a project to view its tasks</div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <div className="text-sm">
                            {tasks.length === 0
                                ? "No tasks yet. Create your first task!"
                                : "No tasks match your search."}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${selectedTaskId === task.id
                                    ? 'ring-2 ring-ring border-ring'
                                    : 'hover:border-border'
                                    }`}
                                onClick={() => handleTaskSelect(task.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="flex items-center gap-1">
                                            {task.source_type === 'ai' ? (
                                                <Bot className="h-3 w-3 text-blue-500" />
                                            ) : (
                                                <User className="h-3 w-3 text-green-500" />
                                            )}
                                            <h3 className="font-medium text-sm">{task.name}</h3>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${task.status === 'Done'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : task.status === 'In Progress'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <DropdownMenu>
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
                                            {task.source_type === 'ai' && (
                                                <>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleGenerateAITasks(true);
                                                    }} disabled={isGeneratingTasks}>
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Refresh AI Tasks
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
                                            {task.status !== 'To-Do' && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange(task.id, 'To-Do');
                                                }}>
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    Mark To-Do
                                                </DropdownMenuItem>
                                            )}
                                            {task.status !== 'In Progress' && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange(task.id, 'In Progress');
                                                }}>
                                                    <PlayCircle className="h-4 w-4 mr-2" />
                                                    Mark In Progress
                                                </DropdownMenuItem>
                                            )}
                                            {task.status !== 'Done' && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange(task.id, 'Done');
                                                }}>
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Mark Done
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTask(task.id, task.name);
                                            }} className="text-destructive">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                    {selectedProjectId ? `${filteredTasks.length} tasks` : "No project selected"}
                </div>
            </div>

            {/* Create Task Dialog */}
            <CreateTaskDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}
