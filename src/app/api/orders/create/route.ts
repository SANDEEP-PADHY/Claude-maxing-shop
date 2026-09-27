import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCashfreePGOrder } from "@/lib/cashfree";
import { siteConfig } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required before purchasing.", requireLogin: true },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planSlug } = body;

    if (!planSlug) {
      return NextResponse.json({ error: "Plan slug is required" }, { status: 400 });
    }

    // Lookup plan from database to guarantee authentic server-side pricing
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan || !plan.active) {
      return NextResponse.json({ error: "Invalid or inactive plan selected." }, { status: 400 });
    }

    // Generate unique internal Order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Create Order in DB
    const order = await prisma.order.create({
      data: {
        id: orderId,
        user_id: user.id,
        plan_id: plan.id,
        amount: plan.price,
        currency: plan.currency,
        status: "PAYMENT_PENDING",
        payment_status: "PENDING",
      },
    });

    // Create Cashfree PG Order
    const returnUrl = `${siteConfig.appUrl}/api/payments/verify?order_id=${orderId}`;
    const notifyUrl = `${siteConfig.appUrl}/api/webhooks/cashfree`;

    const cfResponse = await createCashfreePGOrder({
      orderId: order.id,
      orderAmount: order.amount,
      orderCurrency: order.currency,
      customerDetails: {
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
      },
      returnUrl,
      notifyUrl,
    });

    // Update order with Cashfree order ID
    if (cfResponse.cfOrderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          cashfree_order_id: cfResponse.cfOrderId,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "ORDER_CREATED",
        entity_type: "ORDER",
        entity_id: orderId,
        metadata: JSON.stringify({
          plan: plan.name,
          amount: plan.price,
          isSimulated: cfResponse.isSimulated,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentSessionId: cfResponse.paymentSessionId,
      cfOrderId: cfResponse.cfOrderId,
      amount: order.amount,
      currency: order.currency,
      isSimulated: cfResponse.isSimulated,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize order." },
      { status: 500 }
    );
  }
}
