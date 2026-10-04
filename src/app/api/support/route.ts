import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
    const user = await getCurrentUser();
    const body = await req.json();
    const { name, email, orderId, category, subject, message } = body;

    // Rate limiting per IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const isAllowed = checkRateLimit(`support_${ip}`, 5, 60000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many support requests. Please wait 1 minute before trying again." },
        { status: 429 }
      );
    }

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Email, subject, and message are required." },
        { status: 400 }
      );
    }

    // Verify orderId if provided: user must own the order or be admin
    let validOrderId: string | null = null;
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found." },
          { status: 404 }
        );
      }

      // Check ownership: logged-in user must own the order, or must be admin
      if (user) {
        const isOwner = order.user_id === user.id;
        const isAdmin = user.role === "admin";
        if (!isOwner && !isAdmin) {
          return NextResponse.json(
            { error: "You do not have permission to reference this order." },
            { status: 403 }
          );
        }
      }

      validOrderId = order.id;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        user_id: user?.id || null,
        order_id: validOrderId,
        name: name || user?.name || null,
        email: email.trim().toLowerCase(),
        category: category || "Other",
        subject: subject.trim(),
        message: message.trim(),
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.error("Support ticket creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit support ticket." },
      { status: 500 }
    );
  }
}
