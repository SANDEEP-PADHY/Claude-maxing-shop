import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptAccessKey } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
