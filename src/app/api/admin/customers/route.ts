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
    const query = searchParams.get("q") || "";

    const where: any = { role: "customer" };
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        created_at: true,
        orders: {
          select: {
            id: true,
            amount: true,
            status: true,
            created_at: true,
          },
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            starts_at: true,
            expires_at: true,
            plan: { select: { name: true, multiplier: true } },
          },
        },
      },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Admin customers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
