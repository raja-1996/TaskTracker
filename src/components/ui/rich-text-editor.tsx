"use client";

import { ChangeEvent } from 'react';
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = "Enter text...",
    className,
    disabled = false
}: RichTextEditorProps) {
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={cn("relative", className)}>
            <textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "w-full min-h-[200px] p-3 text-sm border rounded-md resize-y",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "placeholder:text-muted-foreground",
                    "bg-background"
                )}
            />
        </div>
    );
}
