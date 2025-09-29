"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineEdit } from "@/components/ui/inline-edit";
import { Plus, Search, MoreHorizontal, CheckCircle2, Clock, PlayCircle, Trash2, RefreshCw, Bot, User, Edit, GripVertical } from "lucide-react";
import { CreateTaskDialog } from "./create-task-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatus } from "@/types/database";
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

interface SortableTaskItemProps {
    task: any;
    selectedTaskId: string | null;
    editingTaskId: string | null;
    handleTaskSelect: (taskId: string) => void;
    handleTaskNameSave: (taskId: string, newName: string) => Promise<void>;
    setEditingTaskId: (id: string | null) => void;
    handleEditClick: (taskId: string) => void;
    handleStatusChange: (taskId: string, status: TaskStatus) => void;
    handleDeleteTask: (taskId: string, taskName: string) => void;
    handleGenerateAITasks: (refresh?: boolean) => void;
    isGeneratingTasks: boolean;
}

function SortableTaskItem({
    task,
    selectedTaskId,
    editingTaskId,
    handleTaskSelect,
    handleTaskNameSave,
    setEditingTaskId,
    handleEditClick,
    handleStatusChange,
    handleDeleteTask,
    handleGenerateAITasks,
    isGeneratingTasks,
}: SortableTaskItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${selectedTaskId === task.id
                ? 'ring-2 ring-ring border-ring'
                : 'hover:border-border'
                } ${editingTaskId === task.id ? 'cursor-default' : ''} ${isDragging ? 'z-50' : ''
                }`}
            onClick={editingTaskId === task.id ? undefined : () => handleTaskSelect(task.id)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <div
                        className="cursor-grab active:cursor-grabbing flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground"
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                        {task.source_type === 'ai' ? (
                            <Bot className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        ) : (
                            <User className="h-3 w-3 text-green-500 flex-shrink-0" />
                        )}
                        {editingTaskId === task.id ? (
                            <InlineEdit
                                value={task.name}
                                onSave={(newName) => handleTaskNameSave(task.id, newName)}
                                onCancel={() => setEditingTaskId(null)}
                                placeholder="Task name..."
                                className="flex-1"
                                inputClassName="text-sm font-medium"
                            />
                        ) : (
                            <h3 className="font-medium text-sm">{task.name}</h3>
                        )}
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
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(task.id);
                        }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Name
                        </DropdownMenuItem>
                        {task.source_type === 'ai' && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateAITasks(true);
                                }} disabled={isGeneratingTasks}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh AI Tasks
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
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
    );
}

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
        reorderTasks,
    } = useAppStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    const handleTaskNameSave = async (taskId: string, newName: string) => {
        await updateTask(taskId, { name: newName });
        setEditingTaskId(null);
    };

    const handleEditClick = (taskId: string) => {
        setEditingTaskId(taskId);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            // Don't allow reordering when search filter is active to prevent order_index corruption
            if (searchQuery.trim() !== '') {
                console.warn('Reordering is disabled while search filter is active');
                return;
            }

            // Find indices in the full tasks list (not filtered)
            const oldIndex = tasks.findIndex((task) => task.id === active.id);
            const newIndex = tasks.findIndex((task) => task.id === over?.id);

            if (oldIndex === -1 || newIndex === -1) {
                console.warn('Could not find task indices for reordering');
                return;
            }

            // Reorder the full tasks array
            const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

            // Update order_index for all tasks based on their new positions
            const updatedTasks = reorderedTasks.map((task, index) => ({
                ...task,
                order_index: index
            }));

            reorderTasks(updatedTasks);
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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredTasks.map(task => task.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {filteredTasks.map((task) => (
                                    <SortableTaskItem
                                        key={task.id}
                                        task={task}
                                        selectedTaskId={selectedTaskId}
                                        editingTaskId={editingTaskId}
                                        handleTaskSelect={handleTaskSelect}
                                        handleTaskNameSave={handleTaskNameSave}
                                        setEditingTaskId={setEditingTaskId}
                                        handleEditClick={handleEditClick}
                                        handleStatusChange={handleStatusChange}
                                        handleDeleteTask={handleDeleteTask}
                                        handleGenerateAITasks={handleGenerateAITasks}
                                        isGeneratingTasks={isGeneratingTasks}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
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
