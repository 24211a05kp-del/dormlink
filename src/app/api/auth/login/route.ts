import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { name, password, role } = await request.json();

        // SIMPLE MOCK AUTHENTICATION LOGIC
        // In a real app, you would check a database and hash passwords

        if (!name || password.length < 4) {
            return NextResponse.json(
                { message: "Invalid username or password (min 4 chars)" },
                { status: 400 }
            );
        }

        // Role-based mock return
        return NextResponse.json({
            message: "Login successful",
            user: {
                name,
                role,
                id: Math.random().toString(36).substring(7),
            },
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
