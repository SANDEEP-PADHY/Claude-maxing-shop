import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      totalOrders,
      successfulPayments,
      pendingFulfilments,
      activeSubscriptions,
      totalCustomers,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { created_at: { gte: startOfToday } },
      }),
      prisma.order.count(),
      prisma.order.count({
        where: { status: "PAID" },
      }),
      prisma.subscription.count({
        where: { fulfilment_status: "FULFILMENT_PENDING" },
      }),
      prisma.subscription.count({
        where: { status: "ACTIVE" },
      }),
      prisma.user.count({
        where: { role: "customer" },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { created_at: "desc" },
        include: {
          plan: true,
          user: { select: { id: true, name: true, email: true } },
          subscriptions: true,
        },
      }),
    ]);

    // Calculate revenue
    const paidOrders = await prisma.order.findMany({
      where: { status: "PAID" },
      select: { amount: true, created_at: true },
    });

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    const todayRevenue = paidOrders
      .filter((o) => o.created_at >= startOfToday)
      .reduce((sum, o) => sum + o.amount, 0);

    return NextResponse.json({
      todayOrders,
      todayRevenue,
      totalOrders,
      totalRevenue,
      successfulPayments,
      pendingFulfilments,
      activeSubscriptions,
      totalCustomers,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
