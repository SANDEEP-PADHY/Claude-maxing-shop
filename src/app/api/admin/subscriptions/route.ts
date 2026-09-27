import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { created_at: "desc" },
      include: {
        plan: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        order: { select: { id: true, amount: true, status: true } },
      },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Admin subscriptions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
