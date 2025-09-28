"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case "CredentialsSignin":
                return "Invalid credentials. Please check your email and password."
            case "Configuration":
                return "There is a problem with the server configuration."
            case "AccessDenied":
                return "Access denied. You do not have permission to access this resource."
            case "Verification":
                return "The verification token has expired or has already been used."
            default:
                return "An unexpected error occurred. Please try again."
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-red-600">Authentication Error</CardTitle>
                        <CardDescription>
                            Something went wrong during authentication
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                            {getErrorMessage(error)}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button asChild>
                            <Link href="/auth/signin">
                                Try Again
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
