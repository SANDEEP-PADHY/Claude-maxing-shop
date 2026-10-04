import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptAccessKey } from "@/lib/encryption";

// Basic in-memory rate limiting map: identifier -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit = 10, windowMs = 60000): boolean {
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting per user
    const isAllowed = checkRateLimit(`reveal_${user.id}`);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many key reveal attempts. Please wait 1 minute before trying again." },
        { status: 429 }
      );
    }

    // Optional assignmentId can be passed, or default to most recent active assignment
    let assignmentId: string | undefined;
    try {
      const body = await req.json();
      assignmentId = body.assignmentId;
    } catch {
      // Body might be empty
    }

    let assignment;

    if (assignmentId) {
      assignment = await prisma.accessAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          access_key: true,
          plan: true,
        },
      });

      // Strict ownership check
      if (!assignment || (assignment.user_id !== user.id && user.role !== "admin")) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else {
      // Find latest active assignment for this customer
      assignment = await prisma.accessAssignment.findFirst({
        where: {
          user_id: user.id,
          status: "ACTIVE",
        },
        include: {
          access_key: true,
          plan: true,
        },
        orderBy: { assigned_at: "desc" },
      });
    }

    // Fallback: check if customer has a paid order with access_key_id
    if (!assignment) {
      const order = await prisma.order.findFirst({
        where: {
          user_id: user.id,
          status: "PAID",
          access_key_id: { not: null },
        },
        include: {
          access_key: true,
          plan: true,
        },
        orderBy: { created_at: "desc" },
      });

      if (!order || !order.access_key) {
        return NextResponse.json(
          { error: "No active access key found for this account." },
          { status: 404 }
        );
      }

      // Audit log for key reveal from order fallback
      await prisma.auditLog.create({
        data: {
          user_id: user.id,
          action: "ACCESS_KEY_REVEALED",
          entity_type: "ORDER",
          entity_id: order.id,
          metadata: JSON.stringify({
            method: "order_fallback",
            keyId: order.access_key.id,
          }),
        },
      });

      const decrypted = decryptAccessKey(order.access_key.key_value_encrypted);

      return NextResponse.json({
        success: true,
        key: decrypted,
        planName: order.plan.name,
      });
    }

    if (!assignment.access_key) {
      return NextResponse.json(
        { error: "Access key record missing." },
        { status: 404 }
      );
    }

    // Audit log for key reveal
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "ACCESS_KEY_REVEALED",
        entity_type: "ASSIGNMENT",
        entity_id: assignment.id,
        metadata: JSON.stringify({
          method: "assignment",
          keyId: assignment.access_key.id,
          assignmentId: assignment.id,
        }),
      },
    });

    const decrypted = decryptAccessKey(assignment.access_key.key_value_encrypted);

    return NextResponse.json({
      success: true,
      key: decrypted,
      planName: assignment.plan.name,
      expiresAt: assignment.expires_at,
    });
  } catch (error: any) {
    console.error("Reveal access key error:", error);
    return NextResponse.json(
      { error: "Failed to reveal access key securely." },
      { status: 500 }
    );
  }
}
