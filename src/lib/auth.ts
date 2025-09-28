import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { Pool } from "pg"
import { z } from "zod"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
}

const pool = new Pool({
    connectionString: DATABASE_URL,
})

// Validation schemas
const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
})

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                name: { label: "Name", type: "text" },
                action: { label: "Action", type: "text" }, // "signin" or "signup"
            },
            async authorize(credentials) {
                if (!credentials) return null

                try {
                    const action = credentials.action || "signin"

                    if (action === "signup") {
                        // Sign up flow
                        const { email, password, name } = signUpSchema.parse(credentials)

                        // Check if user already exists
                        const existingUser = await pool.query(
                            'SELECT id FROM users WHERE email = $1',
                            [email]
                        )

                        if (existingUser.rows.length > 0) {
                            throw new Error("User already exists")
                        }

                        // Hash password
                        const hashedPassword = await bcrypt.hash(password, 12)

                        // Create user
                        const result = await pool.query(
                            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
                            [email, hashedPassword, name]
                        )

                        const user = result.rows[0]
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                        }
                    } else {
                        // Sign in flow
                        const { email, password } = signInSchema.parse(credentials)

                        // Get user from database
                        const result = await pool.query(
                            'SELECT id, email, name, password_hash FROM users WHERE email = $1',
                            [email]
                        )

                        if (result.rows.length === 0) {
                            throw new Error("Invalid credentials")
                        }

                        const user = result.rows[0]

                        // Verify password
                        const isPasswordValid = await bcrypt.compare(password, user.password_hash)

                        if (!isPasswordValid) {
                            throw new Error("Invalid credentials")
                        }

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                        }
                    }
                } catch (error) {
                    console.error("Auth error:", error)
                    return null
                }
            },
        }),
    ],
    session: {
        strategy: "jwt", // Using JWT strategy instead of database for simplicity
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
}
