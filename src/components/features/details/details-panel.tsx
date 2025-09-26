"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle, Edit3, Save, X } from "lucide-react";
import { format } from "date-fns";

export function DetailsPanel() {
    const {
        selectedEntityType,
        selectedEntityId,
        projectDetails,
        taskDetails,
        subtaskDetails,
        comments,
        projects,
        tasks,
        subtasks,
        updateProjectDescription,
        updateTaskDescription,
        updateSubtaskDescription,
        createComment,
    } = useAppStore();

    const [description, setDescription] = useState("");
    const [newComment, setNewComment] = useState("");
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isSavingDescription, setIsSavingDescription] = useState(false);
    const [isAddingComment, setIsAddingComment] = useState(false);

    // Get current entity data based on type
    const currentEntity = React.useMemo(() => {
        if (!selectedEntityType || !selectedEntityId) return null;

        switch (selectedEntityType) {
            case 'project':
                return projects.find(p => p.id === selectedEntityId);
            case 'task':
                return tasks.find(t => t.id === selectedEntityId);
            case 'subtask':
                return subtasks.find(s => s.id === selectedEntityId);
            default:
                return null;
        }
    }, [selectedEntityType, selectedEntityId, projects, tasks, subtasks]);

    // Get current details based on type
    const currentDetails = React.useMemo(() => {
        if (!selectedEntityType) return null;

        switch (selectedEntityType) {
            case 'project':
                return projectDetails;
            case 'task':
                return taskDetails;
            case 'subtask':
                return subtaskDetails;
            default:
                return null;
        }
    }, [selectedEntityType, projectDetails, taskDetails, subtaskDetails]);

    // Update description when details change
    React.useEffect(() => {
        if (currentDetails) {
            setDescription(currentDetails.description || "");
        } else {
            setDescription("");
        }
    }, [currentDetails]);

    const handleSaveDescription = async () => {
        if (!selectedEntityType || !selectedEntityId) return;

        try {
            setIsSavingDescription(true);

            switch (selectedEntityType) {
                case 'project':
                    await updateProjectDescription(selectedEntityId, description);
                    break;
                case 'task':
                    await updateTaskDescription(selectedEntityId, description);
                    break;
                case 'subtask':
                    await updateSubtaskDescription(selectedEntityId, description);
                    break;
            }

            setIsEditingDescription(false);
        } catch (error) {
            console.error("Failed to save description:", error);
        } finally {
            setIsSavingDescription(false);
        }
    };

    const handleCancelDescription = () => {
        setDescription(currentDetails?.description || "");
        setIsEditingDescription(false);
    };

    const handleAddComment = async () => {
        if (!selectedEntityType || !selectedEntityId || !newComment.trim()) return;

        try {
            setIsAddingComment(true);
            await createComment({
                entity_type: selectedEntityType,
                entity_id: selectedEntityId,
                content: newComment.trim(),
            });
            setNewComment("");
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setIsAddingComment(false);
        }
    };

    if (!selectedEntityType || !selectedEntityId || !currentEntity) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <div className="text-lg mb-2">No item selected</div>
                    <div className="text-sm">Select a project, task, or subtask to view its details and comments</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Compact Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">
                        {selectedEntityType === 'project' && 'Project Details'}
                        {selectedEntityType === 'task' && 'Task Details'}
                        {selectedEntityType === 'subtask' && 'Subtask Details'}
                    </h2>
                    {(selectedEntityType === 'task' || selectedEntityType === 'subtask') && currentEntity && 'status' in currentEntity && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${currentEntity.status === 'Done'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : currentEntity.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                            {currentEntity.status}
                        </span>
                    )}
                    {selectedEntityType === 'project' && currentEntity && 'status' in currentEntity && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${currentEntity.status === 'Completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : currentEntity.status === 'Active'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                            {currentEntity.status}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{currentEntity.name}</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {/* Inline Description Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Description</span>
                        {!isEditingDescription && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingDescription(true)}
                                className="h-6 px-2 text-xs"
                            >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                        )}
                    </div>

                    {isEditingDescription ? (
                        <div className="space-y-2">
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a detailed description..."
                                className="min-h-[80px] resize-y"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelDescription}
                                    disabled={isSavingDescription}
                                    className="h-6 px-2 text-xs"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveDescription}
                                    disabled={isSavingDescription || (currentDetails?.description || "") === description}
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                >
                                    <Save className="h-3 w-3 mr-1" />
                                    {isSavingDescription ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="min-h-[40px] p-2 border rounded text-sm bg-muted/30">
                            {description || (
                                <span className="text-muted-foreground italic">
                                    Click Edit to add a description...
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Compact Comments Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Comments</span>
                        <span className="text-xs text-muted-foreground">({comments.length})</span>
                    </div>

                    {/* Comments List - More compact */}
                    <div className="space-y-2">
                        {comments.length === 0 ? (
                            <div className="text-xs text-muted-foreground text-center py-2 italic">
                                No comments yet
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="p-2 bg-muted/50 rounded text-xs">
                                    <div className="text-muted-foreground mb-1">
                                        {comment.created_at ? format(new Date(comment.created_at), 'MMM d, h:mm a') : 'Unknown date'}
                                    </div>
                                    <div>{comment.content}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Fixed Comment Input at Bottom */}
            <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                    <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add comment..."
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                        className="h-8 text-sm"
                    />
                    <Button
                        onClick={handleAddComment}
                        disabled={isAddingComment || !newComment.trim()}
                        size="sm"
                        className="h-8 px-2"
                    >
                        <Send className="h-3 w-3" />
                        {isAddingComment && <span className="ml-1 text-xs">Adding...</span>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
