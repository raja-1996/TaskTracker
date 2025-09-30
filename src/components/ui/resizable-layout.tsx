"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ResizableLayoutProps {
    children: React.ReactElement[];
    defaultWidths?: number[];
    minWidths?: number[];
    className?: string;
    storageKey?: string; // Key for localStorage persistence
}

export function ResizableLayout({
    children,
    defaultWidths = [],
    minWidths = [],
    className = "",
    storageKey = "resizable-layout-widths"
}: ResizableLayoutProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [widths, setWidths] = useState<number[]>(() => {
        // Try to load from localStorage first
        if (typeof window !== 'undefined' && storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsedWidths = JSON.parse(saved);
                    if (Array.isArray(parsedWidths) && parsedWidths.length === children.length - 1) {
                        return [...parsedWidths, 0];
                    }
                }
            } catch (error) {
                console.warn('Failed to load column widths from localStorage:', error);
            }
        }

        // Fall back to provided defaults or computed defaults
        if (defaultWidths.length > 0) {
            return [...defaultWidths, 0];
        }
        // Default equal widths for all panels except the last one
        const count = children.length;
        return Array(count - 1).fill(320).concat([0]); // Last panel takes remaining space
    });

    const [isResizing, setIsResizing] = useState(false);
    const [resizingIndex, setResizingIndex] = useState(-1);
    const startPosRef = useRef(0);
    const startWidthsRef = useRef<number[]>([]);

    // Custom setWidths function that persists to localStorage
    const updateWidths = useCallback((newWidths: number[]) => {
        setWidths(newWidths);

        // Persist to localStorage (only the resizable column widths, not the last flex column)
        if (typeof window !== 'undefined' && storageKey) {
            try {
                const widthsToSave = newWidths.slice(0, -1); // Exclude the last column (flex-1)
                localStorage.setItem(storageKey, JSON.stringify(widthsToSave));
            } catch (error) {
                console.warn('Failed to save column widths to localStorage:', error);
            }
        }
    }, [storageKey]);

    const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        setResizingIndex(index);
        startPosRef.current = e.clientX;
        startWidthsRef.current = [...widths];

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [widths]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing || resizingIndex === -1 || !containerRef.current) return;

        const delta = e.clientX - startPosRef.current;
        const newWidths = [...startWidthsRef.current];

        const minWidth = minWidths[resizingIndex] || 200;
        const nextMinWidth = minWidths[resizingIndex + 1] || 200;

        const currentWidth = newWidths[resizingIndex];
        const nextWidth = newWidths[resizingIndex + 1];

        const isNextColumnLast = resizingIndex + 1 === children.length - 1;

        if (isNextColumnLast) {
            const newCurrentWidth = Math.max(minWidth, currentWidth + delta);

            if (newCurrentWidth >= minWidth) {
                newWidths[resizingIndex] = newCurrentWidth;
                newWidths[resizingIndex + 1] = 0;
                updateWidths(newWidths);
            }
        } else {
            const newCurrentWidth = Math.max(minWidth, currentWidth + delta);
            const newNextWidth = Math.max(nextMinWidth, nextWidth - delta);

            if (newCurrentWidth >= minWidth && newNextWidth >= nextMinWidth) {
                newWidths[resizingIndex] = newCurrentWidth;
                newWidths[resizingIndex + 1] = newNextWidth;
                updateWidths(newWidths);
            }
        }
    }, [isResizing, resizingIndex, minWidths, updateWidths, children.length]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        setResizingIndex(-1);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
        <div ref={containerRef} className={`flex h-full ${className}`}>
            {children.map((child, index) => (
                <React.Fragment key={index}>
                    <div
                        style={{
                            width: index === children.length - 1 ? 'auto' : `${widths[index]}px`,
                            flexGrow: index === children.length - 1 ? 1 : 0,
                            flexShrink: 0
                        }}
                        className={index === children.length - 1 ? 'flex-1' : 'flex-shrink-0'}
                    >
                        {child}
                    </div>

                    {/* Resize handle between panels (except after the last one) */}
                    {index < children.length - 1 && (
                        <div
                            className="w-1 bg-border hover:bg-accent cursor-col-resize relative group"
                            onMouseDown={handleMouseDown(index)}
                        >
                            <div className="absolute inset-0 w-3 -mx-1" />
                            <div className="absolute inset-y-0 left-0 w-1 bg-primary opacity-0 group-hover:opacity-50 transition-opacity" />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
