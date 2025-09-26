"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppStore } from "@/lib/stores/app-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskInsert } from "@/types/database";

const createTaskSchema = z.object({
    name: z.string().min(1, "Task name is required").max(100, "Task name is too long"),
    status: z.enum(["To-Do", "In Progress", "Done"]),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
    const { createTask, selectedProjectId, tasks, isLoading } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateTaskFormData>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            name: "",
            status: "To-Do",
        },
    });

    const onSubmit = async (data: CreateTaskFormData) => {
        if (!selectedProjectId) return;

        try {
            setIsSubmitting(true);

            // Calculate next order index
            const maxOrderIndex = tasks.reduce((max, task) => Math.max(max, task.order_index), -1);
            const nextOrderIndex = maxOrderIndex + 1;

            const taskData: TaskInsert = {
                project_id: selectedProjectId,
                name: data.name,
                status: data.status,
                order_index: nextOrderIndex,
            };

            await createTask(taskData);

            // Reset form and close dialog
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !isSubmitting) {
            form.reset();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to organize your work into smaller subtasks.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter task name..."
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Initial Status</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            disabled={isSubmitting}
                                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                        >
                                            <option value="To-Do">To-Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || isLoading}>
                                {isSubmitting ? "Creating..." : "Create Task"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
