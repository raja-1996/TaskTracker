import { X } from "lucide-react";
import { Button } from "./button";

interface ErrorBannerProps {
    message: string;
    onClose: () => void;
}

export function ErrorBanner({ message, onClose }: ErrorBannerProps) {
    return (
        <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="text-destructive text-sm font-medium">Error:</div>
                <div className="text-destructive text-sm">{message}</div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-destructive hover:text-destructive/80"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
