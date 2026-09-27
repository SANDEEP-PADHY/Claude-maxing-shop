import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      paidOrdersRecords,
      pendingDeliveries,
      failedPayments,
      allKeys,
      activeAssignments,
      expiredAssignmentsCount,
      recentOrders,
    ] = await Promise.all([
      // Paid orders
      prisma.order.findMany({
        where: { status: "PAID" },
        select: { id: true, amount: true, created_at: true },
      }),
      // Pending deliveries
      prisma.order.count({
        where: {
          status: "PAID",
          delivery_status: "PENDING",
        },
      }),
      // Failed payments
      prisma.order.count({
        where: {
          OR: [
            { status: "PAYMENT_FAILED" },
            { payment_status: "FAILED" },
          ],
        },
      }),
      // All access keys
      prisma.accessKey.findMany({
        include: { plan: true },
      }),
      // Active access assignments
      prisma.accessAssignment.findMany({
        where: {
          status: "ACTIVE",
          expires_at: { gte: now },
        },
        include: { plan: true },
      }),
      // Expired access count
      prisma.accessAssignment.count({
        where: {
          OR: [
            { status: "EXPIRED" },
            { expires_at: { lt: now } },
          ],
        },
      }),
      // Recent orders with customer and key details
      prisma.order.findMany({
        take: 10,
        orderBy: { created_at: "desc" },
        include: {
          plan: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
          access_key: true,
          payments: true,
        },
      }),
    ]);

    // Today's sales
    const todaySales = paidOrdersRecords
      .filter((o) => o.created_at >= startOfToday)
      .reduce((sum, o) => sum + o.amount, 0);

    const paidOrders = paidOrdersRecords.length;

    // Active 5X allocations and 20X allocations
    const active5xAllocations = activeAssignments.filter(
      (a) => a.plan.multiplier === 5 || a.plan.slug.includes("5x")
    ).length;

    const active20xAllocations = activeAssignments.filter(
      (a) => a.plan.multiplier === 20 || a.plan.slug.includes("20x")
    ).length;

    // Available key capacity across active/available keys
    const availableKeyCapacity = allKeys
      .filter((k) => k.status === "ACTIVE" || k.status === "AVAILABLE")
      .reduce((sum, k) => sum + Math.max(0, k.max_customers - k.current_customers), 0);

    return NextResponse.json({
      todaySales,
      paidOrders,
      pendingDeliveries,
      active5xAllocations,
      active20xAllocations,
      availableKeyCapacity,
      expiredAccess: expiredAssignmentsCount,
      failedPayments,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
