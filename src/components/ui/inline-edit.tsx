"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
    value: string;
    onSave: (value: string) => Promise<void>;
    onCancel?: () => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
    maxLength?: number;
    autoFocus?: boolean;
}

export function InlineEdit({
    value,
    onSave,
    onCancel,
    placeholder = "Enter text...",
    className,
    inputClassName,
    disabled = false,
    maxLength = 255,
    autoFocus = true
}: InlineEditProps) {
    const [editValue, setEditValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [autoFocus]);

    const handleSave = async () => {
        if (editValue.trim() === value.trim() || editValue.trim() === '') {
            handleCancel();
            return;
        }

        setIsLoading(true);
        try {
            await onSave(editValue.trim());
        } catch (error) {
            console.error('Failed to save:', error);
            // Reset to original value on error
            setEditValue(value);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        onCancel?.();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn("h-8 text-sm", inputClassName)}
                disabled={disabled || isLoading}
                maxLength={maxLength}
            />
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={handleSave}
                disabled={disabled || isLoading || editValue.trim() === ''}
            >
                <Check className="h-3 w-3" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={handleCancel}
                disabled={disabled || isLoading}
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
}
