import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/db/users";

/**
 * Registration endpoint.
 *
 * Expects password to be pre-hashed with SHA-256 on the client side.
 * The SHA-256 hash is then bcrypt-hashed for secure storage.
 * This ensures the raw password never leaves the browser.
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Password should be a SHA-256 hash (64 hex characters)
    if (typeof password !== "string" || password.length !== 64) {
      return NextResponse.json(
        { error: "Invalid password format" },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // bcrypt-hash the SHA-256 hash for storage
    const password_hash = await bcrypt.hash(password, 12);

    const user = await createUser({
      name: name || null,
      email,
      password_hash,
    });

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
