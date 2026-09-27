import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { name, email, orderId, category, subject, message } = body;

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Email, subject, and message are required." },
        { status: 400 }
      );
    }

    // Verify orderId if provided
    let validOrderId: string | null = null;
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });
      if (order) validOrderId = order.id;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        user_id: user?.id || null,
        order_id: validOrderId,
        name: name || user?.name || null,
        email: email.trim().toLowerCase(),
        category: category || "Other",
        subject: subject.trim(),
        message: message.trim(),
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.error("Support ticket creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit support ticket." },
      { status: 500 }
    );
  }
}
