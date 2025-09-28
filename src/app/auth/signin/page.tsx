"use client"

import { useState } from "react"
import { AuthForm } from "@/components/auth/auth-form"

export default function SignInPage() {
    const [mode, setMode] = useState<"signin" | "signup">("signin")

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <AuthForm
                    mode={mode}
                    onToggleMode={() => setMode(mode === "signin" ? "signup" : "signin")}
                />
            </div>
        </div>
    )
}
