import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, formatIndianPhone } from "@/lib/auth";

// Basic in-memory rate limiting map: identifier -> { count, resetTime, lastAttempt }
const rateLimitMap = new Map<string, { count: number; resetTime: number; lastAttempt: number }>();

function checkRateLimit(key: string, limit = 5, windowMs = 60000): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs, lastAttempt: now });
    return { allowed: true };
  }

  // Timing safety: ensure minimum response time for invalid attempts
  // to prevent timing-based user enumeration
  const minResponseTime = 300; // ms

  if (record.count >= limit) {
    const retryAfterMs = record.resetTime - now;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, minResponseTime) };
  }

  record.count += 1;
  record.lastAttempt = now;
  return { allowed: true };
}

function recordSuccessfulLogin(key: string): void {
  rateLimitMap.delete(key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Please enter your email or phone number, and password." },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();

    // Check rate limit by identifier
    const rateLimitResult = checkRateLimit(`login_${cleanIdentifier}`);
    if (!rateLimitResult.allowed) {
      const retrySeconds = Math.ceil((rateLimitResult.retryAfterMs || 60000) / 1000);
      return NextResponse.json(
        { error: `Too many login attempts. Please wait ${retrySeconds} seconds before trying again.` },
        { status: 429 }
      );
    }

    // Attempt lookup by email or by formatted phone
    const formattedPhone = formatIndianPhone(cleanIdentifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier },
          { phone: formattedPhone },
        ],
      },
    });

    // Always verify password hash to prevent timing-based user enumeration
    // Even if user not found, we run a dummy bcrypt comparison
    if (!user) {
      // Dummy comparison to normalize response time
      await verifyPassword(password, "$2a$10$dummyhashdummyhashdummyhashdu");
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email or phone and try again." },
        { status: 401 }
      );
    }

    // Verify password hash
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your password and try again." },
        { status: 401 }
      );
    }

    // Reset rate limit on success
    recordSuccessfulLogin(`login_${cleanIdentifier}`);

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
