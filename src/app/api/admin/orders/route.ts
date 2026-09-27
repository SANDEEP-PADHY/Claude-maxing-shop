import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const planId = searchParams.get("planId");
    const query = searchParams.get("q");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (planId && planId !== "ALL") {
      where.plan_id = planId;
    }
    if (query) {
      where.OR = [
        { id: { contains: query } },
        { cashfree_order_id: { contains: query } },
        { user: { email: { contains: query } } },
        { user: { name: { contains: query } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: true,
        subscriptions: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
