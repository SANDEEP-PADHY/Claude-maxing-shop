import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { orderId } = await params;
    const { status, note } = await req.json();

    if (!["ACTIVE", "FAILED", "CANCELLED", "FULFILMENT_PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { subscriptions: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update subscriptions associated with this order
    await prisma.subscription.updateMany({
      where: { order_id: orderId },
      data: {
        fulfilment_status: status,
        status: status === "ACTIVE" ? "ACTIVE" : status === "CANCELLED" ? "CANCELLED" : "PENDING",
      },
    });

    // If active and no subscription exists yet, create one
    if (status === "ACTIVE" && order.subscriptions.length === 0) {
      const now = new Date();
      await prisma.subscription.create({
        data: {
          user_id: order.user_id,
          order_id: order.id,
          plan_id: order.plan_id,
          provider: "anthropic",
          provider_reference: `MANUAL-ADMIN-${Date.now().toString().slice(-6)}`,
          starts_at: now,
          expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          status: "ACTIVE",
          fulfilment_status: "ACTIVE",
          activation_details: JSON.stringify({
            manualAdminActionBy: user.email,
            note: note || "Manually fulfilled by admin",
            timestamp: now.toISOString(),
          }),
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "FULFILMENT_STATUS_UPDATED",
        entity_type: "ORDER",
        entity_id: orderId,
        metadata: JSON.stringify({ status, note, admin: user.email }),
      },
    });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Fulfilment update error:", error);
    return NextResponse.json(
      { error: "Failed to update fulfilment status" },
      { status: 500 }
    );
  }
}
