"use client";

import { ChangeEvent, useState } from 'react';
import { cn } from "@/lib/utils";
import { Eye, Edit3 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

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
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={cn("relative border rounded-md", className)}>
            <div className="flex items-center justify-end gap-1 p-2 border-b bg-muted/30">
                <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={cn(
                        "px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors",
                        viewMode === 'edit'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Edit3 className="h-3 w-3" />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={cn(
                        "px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors",
                        viewMode === 'preview'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Eye className="h-3 w-3" />
                    Preview
                </button>
            </div>

            {viewMode === 'edit' ? (
                <textarea
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "w-full min-h-[200px] p-3 text-sm resize-y",
                        "focus:outline-none focus:ring-0 border-0",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "placeholder:text-muted-foreground",
                        "bg-background"
                    )}
                />
            ) : (
                <div className={cn(
                    "w-full min-h-[200px] p-3 text-sm overflow-y-auto prose prose-sm dark:prose-invert max-w-none",
                    "bg-background"
                )}>
                    {value ? (
                        <ReactMarkdown
                            components={{
                                h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2 first:mt-0">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-2">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                li: ({ children }) => <li className="ml-2">{children}</li>,
                                p: ({ children }) => <p className="my-2">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>,
                            }}
                        >
                            {value}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-muted-foreground italic">{placeholder}</p>
                    )}
                </div>
            )}
        </div>
    );
}
