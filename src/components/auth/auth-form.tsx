"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthFormProps {
    mode?: "signin" | "signup"
    onToggleMode?: () => void
}

export function AuthForm({ mode = "signin", onToggleMode }: AuthFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            if (mode === "signup") {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            name: formData.name,
                        }
                    }
                })

                if (signUpError) {
                    setError(signUpError.message)
                } else if (data.user) {
                    // User data will be automatically inserted by database trigger
                    console.log('User created successfully:', data.user.email)
                    // Force a page refresh to update the session on the server
                    window.location.href = "/"
                }
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                })

                if (signInError) {
                    setError(signInError.message)
                } else if (data.user && data.session) {
                    console.log('User signed in successfully:', data.user.email)
                    // Force a page refresh to update the session on the server
                    window.location.href = "/"
                }
            }
        } catch (error) {
            setError("Something went wrong")
            console.error('Auth error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const isSignUp = mode === "signup"

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                </CardTitle>
                <CardDescription>
                    {isSignUp
                        ? "Create a new account to get started"
                        : "Sign in to your account to continue"
                    }
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                            {error}
                        </div>
                    )}

                    {isSignUp && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
                    </Button>

                    <div className="text-center text-sm">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className="text-primary hover:underline"
                            disabled={isLoading}
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
