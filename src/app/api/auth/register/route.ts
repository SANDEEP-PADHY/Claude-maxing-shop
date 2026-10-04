import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validateIndianPhone, formatIndianPhone, createSession } from "@/lib/auth";

// Basic in-memory rate limiting map: identifier -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password, confirmPassword, agreeTerms } = body;

    // Rate limiting by IP (inferred from request) — server-side fallback
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const isAllowed = checkRateLimit(`register_${ip}`, 5, 60000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait 1 minute before trying again." },
        { status: 429 }
      );
    }

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a valid full name." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!phone || !validateIndianPhone(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian phone number." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password must not exceed 128 characters." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (!agreeTerms) {
      return NextResponse.json(
        { error: "You must agree to the Terms of Service and Privacy Policy." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const formattedPhone = formatIndianPhone(phone);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { phone: formattedPhone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return NextResponse.json(
          { error: "An account with this email address already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "An account with this phone number already exists." },
        { status: 409 }
      );
    }

    // Securely hash password
    const passwordHash = await hashPassword(password);

    // Create user (email and phone are unverified until user confirms)
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: formattedPhone,
        password_hash: passwordHash,
        role: "customer",
      },
    });

    // Create secure session
    await createSession({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
