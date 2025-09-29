"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, CheckCircle2, Clock, PlayCircle, Trash2, RefreshCw, Bot, User } from "lucide-react";
import { CreateSubtaskDialog } from "./create-subtask-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubtaskStatus } from "@/types/database";

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
    } = useAppStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

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
                    <div className="space-y-2">
                        {filteredSubtasks.map((subtask) => (
                            <div
                                key={subtask.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${selectedSubtaskId === subtask.id
                                    ? 'ring-2 ring-ring border-ring'
                                    : 'hover:border-border'
                                    }`}
                                onClick={() => setSelectedSubtask(subtask.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="flex items-center gap-1">
                                            {subtask.source_type === 'ai' ? (
                                                <Bot className="h-3 w-3 text-blue-500" />
                                            ) : (
                                                <User className="h-3 w-3 text-green-500" />
                                            )}
                                            <h3 className="font-medium text-sm">{subtask.name}</h3>
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
                                            {subtask.source_type === 'ai' && (
                                                <>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleGenerateAISubtasks(true);
                                                    }} disabled={isGeneratingSubtasks}>
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Refresh AI Subtasks
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
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
                        ))}
                    </div>
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
