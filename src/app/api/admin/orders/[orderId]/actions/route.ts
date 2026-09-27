import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptAccessKey } from "@/lib/encryption";
import { sendAccessEmail, formatAccessDate } from "@/lib/email";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        plan: true,
        user: true,
        access_key: true,
        assignments: {
          include: { access_key: true },
          orderBy: { assigned_at: "desc" },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let decryptedKey = "";
    if (order.access_key) {
      try {
        decryptedKey = decryptAccessKey(order.access_key.key_value_encrypted);
      } catch {
        decryptedKey = "";
      }
    }

    const activeAssignment = order.assignments[0];
    const expiryDate = activeAssignment?.expires_at
      ? activeAssignment.expires_at
      : new Date(order.created_at.getTime() + 30 * 24 * 60 * 60 * 1000);

    const formattedExpiry = formatAccessDate(expiryDate);

    // Standard WhatsApp message template as requested:
    const whatsAppMessage = `Hello ${order.user.name},

Your claudemaxing.shop access is ready.

Plan: ${order.plan.name}
Valid until: ${formattedExpiry}

Access key:
${decryptedKey || "[NO_KEY_ASSIGNED]"}

Please keep this key private.

Support:
WhatsApp +91 96646 50235
Email: support@claudemaxing.shop`;

    // Standard Email message template as requested:
    const emailMessage = `Subject:
Your claudemaxing.shop access details

Body:

Hello ${order.user.name},

Your claudemaxing.shop access is ready.

Plan: ${order.plan.name}
Valid until: ${formattedExpiry}

Access key:
${decryptedKey || "[NO_KEY_ASSIGNED]"}

Please keep this key private.

Support:
WhatsApp +91 96646 50235
Email: support@claudemaxing.shop`;

    return NextResponse.json({
      order,
      decryptedKey,
      whatsAppMessage,
      emailMessage,
      formattedExpiry,
    });
  } catch (error: any) {
    console.error("Admin order detail error:", error);
    return NextResponse.json({ error: "Failed to fetch order detail" }, { status: 500 });
  }
}

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
    const { action, keyId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        plan: true,
        user: true,
        access_key: true,
        assignments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (action === "ASSIGN_KEY" || action === "CHANGE_KEY") {
      if (!keyId) {
        return NextResponse.json({ error: "keyId is required" }, { status: 400 });
      }

      const targetKey = await prisma.accessKey.findUnique({
        where: { id: keyId },
      });

      if (!targetKey) {
        return NextResponse.json({ error: "Target key not found" }, { status: 404 });
      }

      if (targetKey.status === "DISABLED") {
        return NextResponse.json({ error: "Cannot assign a DISABLED key." }, { status: 400 });
      }

      // Check capacity
      if (targetKey.current_customers >= targetKey.max_customers) {
        return NextResponse.json(
          { error: "Cannot assign to a key that has reached capacity (FULL)." },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // If changing from an existing key, decrement old key
        if (order.access_key_id && order.access_key_id !== keyId) {
          const oldKey = await tx.accessKey.findUnique({ where: { id: order.access_key_id } });
          if (oldKey) {
            await tx.accessKey.update({
              where: { id: oldKey.id },
              data: {
                current_customers: { decrement: 1 },
                status: oldKey.status === "FULL" ? "ACTIVE" : oldKey.status,
              },
            });
          }
        }

        // Increment new key
        const newCount = targetKey.current_customers + 1;
        const isFull = newCount >= targetKey.max_customers;

        await tx.accessKey.update({
          where: { id: targetKey.id },
          data: {
            current_customers: { increment: 1 },
            status: isFull ? "FULL" : "ACTIVE",
          },
        });

        // Update or create assignment
        const existingAssignment = await tx.accessAssignment.findFirst({
          where: { order_id: orderId, user_id: order.user_id },
        });

        if (existingAssignment) {
          await tx.accessAssignment.update({
            where: { id: existingAssignment.id },
            data: {
              access_key_id: targetKey.id,
              status: "ACTIVE",
              assigned_at: now,
              expires_at: expiresAt,
            },
          });
        } else {
          await tx.accessAssignment.create({
            data: {
              user_id: order.user_id,
              order_id: orderId,
              access_key_id: targetKey.id,
              plan_id: order.plan_id,
              status: "ACTIVE",
              assigned_at: now,
              expires_at: expiresAt,
            },
          });
        }

        // Update order
        await tx.order.update({
          where: { id: orderId },
          data: {
            access_key_id: targetKey.id,
          },
        });
      });

      return NextResponse.json({ success: true, message: "Key assigned successfully." });
    }

    if (action === "MARK_DELIVERED") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            delivery_status: "DELIVERED",
            delivered_at: now,
          },
        }),
        prisma.accessAssignment.updateMany({
          where: { order_id: orderId },
          data: { delivered_at: now },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Marked as delivered." });
    }

    if (action === "RESEND_EMAIL") {
      return NextResponse.json(
        { error: "Email delivery is strictly manual. Please copy the message template from the admin panel." },
        { status: 400 }
      );
    }

    if (action === "REVOKE_ACCESS") {
      await prisma.$transaction(async (tx) => {
        // Revoke assignment
        await tx.accessAssignment.updateMany({
          where: { order_id: orderId },
          data: { status: "REVOKED" },
        });

        // Revoke subscription if any
        await tx.subscription.updateMany({
          where: { order_id: orderId },
          data: { status: "REVOKED" },
        });

        // Decrement key capacity if assigned
        if (order.access_key_id) {
          const key = await tx.accessKey.findUnique({ where: { id: order.access_key_id } });
          if (key && key.current_customers > 0) {
            await tx.accessKey.update({
              where: { id: key.id },
              data: {
                current_customers: { decrement: 1 },
                status: key.status === "FULL" ? "ACTIVE" : key.status,
              },
            });
          }
        }
      });

      return NextResponse.json({ success: true, message: "Access revoked successfully." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin order action error:", error);
    return NextResponse.json({ error: error.message || "Action failed." }, { status: 500 });
  }
}
