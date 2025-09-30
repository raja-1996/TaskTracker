"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineEdit } from "@/components/ui/inline-edit";
import { Plus, Search, MoreHorizontal, CheckCircle2, Clock, PlayCircle, Trash2, RefreshCw, Bot, User, Edit, GripVertical, UserCheck } from "lucide-react";
import { CreateSubtaskDialog } from "./create-subtask-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubtaskStatus } from "@/types/database";
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

interface SortableSubtaskItemProps {
    subtask: any;
    selectedSubtaskId: string | null;
    editingSubtaskId: string | null;
    setSelectedSubtask: (subtaskId: string) => void;
    handleSubtaskNameSave: (subtaskId: string, newName: string) => Promise<void>;
    setEditingSubtaskId: (id: string | null) => void;
    handleEditClick: (subtaskId: string) => void;
    handleStatusChange: (subtaskId: string, status: SubtaskStatus) => void;
    handleDeleteSubtask: (subtaskId: string, subtaskName: string) => void;
    handleGenerateAISubtasks: (refresh?: boolean) => void;
    handleAcceptSubtask: (subtaskId: string, subtaskName: string) => void;
    isGeneratingSubtasks: boolean;
    isAcceptingSubtask: boolean;
}

function SortableSubtaskItem({
    subtask,
    selectedSubtaskId,
    editingSubtaskId,
    setSelectedSubtask,
    handleSubtaskNameSave,
    setEditingSubtaskId,
    handleEditClick,
    handleStatusChange,
    handleDeleteSubtask,
    handleGenerateAISubtasks,
    handleAcceptSubtask,
    isGeneratingSubtasks,
    isAcceptingSubtask,
}: SortableSubtaskItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: subtask.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${selectedSubtaskId === subtask.id
                ? 'ring-2 ring-ring border-ring'
                : 'hover:border-border'
                } ${editingSubtaskId === subtask.id ? 'cursor-default' : ''} ${isDragging ? 'z-50' : ''
                }`}
            onClick={editingSubtaskId === subtask.id ? undefined : () => setSelectedSubtask(subtask.id)}
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
                        {subtask.source_type === 'ai' ? (
                            <Bot className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        ) : (
                            <User className="h-3 w-3 text-green-500 flex-shrink-0" />
                        )}
                        {editingSubtaskId === subtask.id ? (
                            <InlineEdit
                                value={subtask.name}
                                onSave={(newName) => handleSubtaskNameSave(subtask.id, newName)}
                                onCancel={() => setEditingSubtaskId(null)}
                                placeholder="Subtask name..."
                                className="flex-1"
                                inputClassName="text-sm font-medium"
                            />
                        ) : (
                            <h3 className="font-medium text-sm">{subtask.name}</h3>
                        )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${subtask.status === 'Done'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : subtask.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                        {subtask.status}
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
                            handleEditClick(subtask.id);
                        }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Name
                        </DropdownMenuItem>
                        {subtask.source_type === 'ai' && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptSubtask(subtask.id, subtask.name);
                                }} disabled={isAcceptingSubtask}>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Accept Subtask
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateAISubtasks(true);
                                }} disabled={isGeneratingSubtasks}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh AI Subtasks
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        {subtask.status !== 'To-Do' && (
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(subtask.id, 'To-Do');
                            }}>
                                <Clock className="h-4 w-4 mr-2" />
                                Mark To-Do
                            </DropdownMenuItem>
                        )}
                        {subtask.status !== 'In Progress' && (
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(subtask.id, 'In Progress');
                            }}>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Mark In Progress
                            </DropdownMenuItem>
                        )}
                        {subtask.status !== 'Done' && (
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(subtask.id, 'Done');
                            }}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Done
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubtask(subtask.id, subtask.name);
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

export function SubtasksColumn() {
    const {
        subtasks,
        selectedTaskId,
        selectedSubtaskId,
        setSelectedSubtask,
        tasks,
        updateSubtask,
        deleteSubtask,
        generateAISubtasks,
        reorderSubtasks,
        acceptAiSubtask,
        acceptAllAiSubtasks,
    } = useAppStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
    const [isAcceptingSubtask, setIsAcceptingSubtask] = useState(false);
    const [isAcceptingAllSubtasks, setIsAcceptingAllSubtasks] = useState(false);
    const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    // Sort subtasks: user subtasks first, then AI subtasks, filtered by search
    const filteredSubtasks = subtasks
        .filter(subtask => subtask.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            // User subtasks come first, then AI subtasks
            if (a.source_type === 'user' && b.source_type === 'ai') return -1;
            if (a.source_type === 'ai' && b.source_type === 'user') return 1;
            // Within same source type, sort by order_index
            return a.order_index - b.order_index;
        });

    const handleStatusChange = async (subtaskId: string, status: SubtaskStatus) => {
        await updateSubtask(subtaskId, { status });
    };

    const handleDeleteSubtask = async (subtaskId: string, subtaskName: string) => {
        if (confirm(`Are you sure you want to delete "${subtaskName}"?`)) {
            await deleteSubtask(subtaskId);
        }
    };

    const handleGenerateAISubtasks = async (refresh: boolean = false) => {
        if (!selectedTaskId || isGeneratingSubtasks) return;

        setIsGeneratingSubtasks(true);
        try {
            await generateAISubtasks(selectedTaskId, refresh);
        } catch (error) {
            console.error('Failed to generate AI subtasks:', error);
        } finally {
            setIsGeneratingSubtasks(false);
        }
    };

    const handleSubtaskNameSave = async (subtaskId: string, newName: string) => {
        await updateSubtask(subtaskId, { name: newName });
        setEditingSubtaskId(null);
    };

    const handleEditClick = (subtaskId: string) => {
        setEditingSubtaskId(subtaskId);
    };

    const handleAcceptSubtask = async (subtaskId: string, subtaskName: string) => {
        if (isAcceptingSubtask) return;

        setIsAcceptingSubtask(true);
        try {
            await acceptAiSubtask(subtaskId);
        } catch (error) {
            console.error('Failed to accept subtask:', error);
        } finally {
            setIsAcceptingSubtask(false);
        }
    };

    const handleAcceptAllSubtasks = async () => {
        if (!selectedTaskId || isAcceptingAllSubtasks) return;

        const aiSubtasksCount = subtasks.filter(subtask => subtask.source_type === 'ai').length;
        if (aiSubtasksCount === 0) return;

        if (confirm(`Accept all ${aiSubtasksCount} AI-generated subtask${aiSubtasksCount === 1 ? '' : 's'}? This will convert them to user subtasks.`)) {
            setIsAcceptingAllSubtasks(true);
            try {
                await acceptAllAiSubtasks(selectedTaskId);
            } catch (error) {
                console.error('Failed to accept all subtasks:', error);
            } finally {
                setIsAcceptingAllSubtasks(false);
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            // Don't allow reordering when search filter is active to prevent order_index corruption
            if (searchQuery.trim() !== '') {
                console.warn('Reordering is disabled while search filter is active');
                return;
            }

            // Find indices in the full subtasks list (not filtered)
            const oldIndex = subtasks.findIndex((subtask) => subtask.id === active.id);
            const newIndex = subtasks.findIndex((subtask) => subtask.id === over?.id);

            if (oldIndex === -1 || newIndex === -1) {
                console.warn('Could not find subtask indices for reordering');
                return;
            }

            // Reorder the full subtasks array
            const reorderedSubtasks = arrayMove(subtasks, oldIndex, newIndex);

            // Update order_index for all subtasks based on their new positions
            const updatedSubtasks = reorderedSubtasks.map((subtask, index) => ({
                ...subtask,
                order_index: index
            }));

            reorderSubtasks(updatedSubtasks);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">Subtasks</h2>
                        {selectedTask && (
                            <p className="text-sm text-muted-foreground">{selectedTask.name}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={!selectedTaskId || isGeneratingSubtasks}
                            className="gap-2"
                            onClick={() => handleGenerateAISubtasks()}
                        >
                            {isGeneratingSubtasks ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Bot className="h-4 w-4" />
                            )}
                            {isGeneratingSubtasks ? 'Generating...' : 'AI Subtasks'}
                        </Button>
                        {subtasks.filter(subtask => subtask.source_type === 'ai').length > 0 && (
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!selectedTaskId || isAcceptingAllSubtasks}
                                className="gap-2"
                                onClick={handleAcceptAllSubtasks}
                            >
                                {isAcceptingAllSubtasks ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <UserCheck className="h-4 w-4" />
                                )}
                                {isAcceptingAllSubtasks ? 'Accepting...' : 'Accept All AI'}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            disabled={!selectedTaskId}
                            className="gap-2"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Subtask
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search subtasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        disabled={!selectedTaskId}
                    />
                </div>
            </div>

            {/* Subtasks List */}
            <div className="flex-1 overflow-y-auto p-4">
                {!selectedTaskId ? (
                    <div className="text-center text-muted-foreground py-8">
                        <div className="text-sm">Select a task to view its subtasks</div>
                    </div>
                ) : filteredSubtasks.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <div className="text-sm">
                            {subtasks.length === 0
                                ? "No subtasks yet. Create your first subtask!"
                                : "No subtasks match your search."}
                        </div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredSubtasks.map(subtask => subtask.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {filteredSubtasks.map((subtask) => (
                                    <SortableSubtaskItem
                                        key={subtask.id}
                                        subtask={subtask}
                                        selectedSubtaskId={selectedSubtaskId}
                                        editingSubtaskId={editingSubtaskId}
                                        setSelectedSubtask={setSelectedSubtask}
                                        handleSubtaskNameSave={handleSubtaskNameSave}
                                        setEditingSubtaskId={setEditingSubtaskId}
                                        handleEditClick={handleEditClick}
                                        handleStatusChange={handleStatusChange}
                                        handleDeleteSubtask={handleDeleteSubtask}
                                        handleGenerateAISubtasks={handleGenerateAISubtasks}
                                        handleAcceptSubtask={handleAcceptSubtask}
                                        isGeneratingSubtasks={isGeneratingSubtasks}
                                        isAcceptingSubtask={isAcceptingSubtask}
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
                    {selectedTaskId ? `${filteredSubtasks.length} subtasks` : "No task selected"}
                </div>
            </div>

            {/* Create Subtask Dialog */}
            <CreateSubtaskDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}
