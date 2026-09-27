import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptAccessKey, decryptAccessKey, maskAccessKey } from "@/lib/encryption";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const [keys, plans] = await Promise.all([
      prisma.accessKey.findMany({
        include: {
          plan: true,
          assignments: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
              order: { select: { id: true, status: true, delivery_method: true } },
            },
            orderBy: { assigned_at: "desc" },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.plan.findMany({
        where: { active: true },
        orderBy: { price: "asc" },
      }),
    ]);

    const formattedKeys = keys.map((k) => {
      const remaining = Math.max(0, k.max_customers - k.current_customers);
      let masked = "sk-••••••••••••";
      try {
        const decrypted = decryptAccessKey(k.key_value_encrypted);
        masked = maskAccessKey(decrypted);
      } catch {
        masked = "••••••••••••";
      }

      return {
        id: k.id,
        planId: k.plan_id,
        planName: k.plan.name,
        planMultiplier: k.plan.multiplier,
        status: k.status,
        maxCustomers: k.max_customers,
        currentCustomers: k.current_customers,
        remainingCapacity: remaining,
        maskedKey: masked,
        createdAt: k.created_at,
        assignments: k.assignments.map((a) => ({
          id: a.id,
          userName: a.user.name,
          userEmail: a.user.email,
          userPhone: a.user.phone,
          orderId: a.order_id,
          status: a.status,
          assignedAt: a.assigned_at,
          expiresAt: a.expires_at,
        })),
      };
    });

    return NextResponse.json({
      keys: formattedKeys,
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        multiplier: p.multiplier,
        defaultMaxCustomers: p.multiplier === 5 ? 10 : p.multiplier === 20 ? 5 : 10,
      })),
    });
  } catch (error: any) {
    console.error("Fetch access keys error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve access keys." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { planId, keyValue, maxCustomers, status } = await req.json();

    if (!planId || !keyValue) {
      return NextResponse.json(
        { error: "Plan ID and Key Value are required." },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Selected plan not found." }, { status: 404 });
    }

    // Default capacity: 10 for 5X, 5 for 20X
    const defaultCapacity = plan.multiplier === 5 ? 10 : plan.multiplier === 20 ? 5 : 10;
    const capacity = typeof maxCustomers === "number" && maxCustomers > 0 ? maxCustomers : defaultCapacity;

    const encryptedValue = encryptAccessKey(keyValue.trim());

    const newKey = await prisma.accessKey.create({
      data: {
        plan_id: plan.id,
        key_value_encrypted: encryptedValue,
        max_customers: capacity,
        current_customers: 0,
        status: status || "ACTIVE",
      },
    });

    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "ACCESS_KEY_CREATED",
        entity_type: "ACCESS_KEY",
        entity_id: newKey.id,
        metadata: JSON.stringify({
          plan: plan.name,
          capacity,
          status: newKey.status,
        }),
      },
    });

    return NextResponse.json({ success: true, key: newKey });
  } catch (error: any) {
    console.error("Create access key error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create access key." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { keyId, action, status, newKeyValue, maxCustomers } = await req.json();

    if (!keyId) {
      return NextResponse.json({ error: "keyId is required." }, { status: 400 });
    }

    const existingKey = await prisma.accessKey.findUnique({
      where: { id: keyId },
    });

    if (!existingKey) {
      return NextResponse.json({ error: "Access key not found." }, { status: 404 });
    }

    let updatedData: any = {};

    if (action === "SET_STATUS") {
      if (!["ACTIVE", "AVAILABLE", "FULL", "DISABLED"].includes(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      updatedData.status = status;
    } else if (action === "REPLACE_KEY") {
      if (!newKeyValue || typeof newKeyValue !== "string") {
        return NextResponse.json({ error: "New key string is required." }, { status: 400 });
      }
      updatedData.key_value_encrypted = encryptAccessKey(newKeyValue.trim());
    } else if (action === "UPDATE_CAPACITY") {
      if (typeof maxCustomers !== "number" || maxCustomers <= 0) {
        return NextResponse.json({ error: "Invalid maxCustomers capacity." }, { status: 400 });
      }
      updatedData.max_customers = maxCustomers;
      if (existingKey.current_customers >= maxCustomers) {
        updatedData.status = "FULL";
      } else if (existingKey.status === "FULL") {
        updatedData.status = "ACTIVE";
      }
    }

    const updatedKey = await prisma.accessKey.update({
      where: { id: keyId },
      data: updatedData,
    });

    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: `ACCESS_KEY_${action}`,
        entity_type: "ACCESS_KEY",
        entity_id: keyId,
        metadata: JSON.stringify(updatedData),
      },
    });

    return NextResponse.json({ success: true, key: updatedKey });
  } catch (error: any) {
    console.error("Update access key error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update access key." },
      { status: 500 }
    );
  }
}
