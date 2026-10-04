import { NextResponse } from "next/server";
import { verifyCashfreeSignature, processPaymentSuccess } from "@/lib/cashfree";
import { prisma } from "@/lib/prisma";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function isTimestampWithinWindow(timestamp: string, windowMs: number = FIVE_MINUTES_MS): boolean {
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;
  return Math.abs(Date.now() - ts) <= windowMs;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const signature = req.headers.get("x-webhook-signature") || "";

    // Reject if production mode without credentials
    if (!process.env.CASHFREE_CLIENT_SECRET) {
      if (process.env.CASHFREE_ENV === "production") {
        console.error("Cashfree webhook rejected: production mode without client secret configured.");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }
    }

    // Timestamp validation to prevent replay attacks
    if (!timestamp || !isTimestampWithinWindow(timestamp)) {
      console.warn("Cashfree Webhook rejected: missing or stale timestamp.");
      return NextResponse.json({ error: "Invalid or stale timestamp" }, { status: 401 });
    }

    // Validate signature format (should be base64-encoded)
    if (!signature || !/^[A-Za-z0-9+/=]+$/.test(signature)) {
      console.warn("Cashfree Webhook rejected: invalid signature format.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Verify webhook signature authenticity
    const isValid = verifyCashfreeSignature(rawBody, timestamp, signature);
    if (!isValid) {
      console.warn("Cashfree Webhook signature verification failed!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log("Cashfree Webhook received:", event.type || event.event);

    const eventType = event.type || event.event;
    const orderData = event.data?.order || event.order;
    const paymentData = event.data?.payment || event.payment;

    const orderId = orderData?.order_id || event.data?.order_id;
    const paymentId = paymentData?.cf_payment_id || event.data?.cf_payment_id || `cf_wh_${Date.now()}`;
    const paymentMethod = paymentData?.payment_group || paymentData?.payment_method || "Cashfree Webhook";

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id in webhook" }, { status: 400 });
    }

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK" || eventType === "ORDER_PAID") {
      // Idempotently process payment & provision subscription
      await processPaymentSuccess({
        orderId,
        cashfreePaymentId: String(paymentId),
        paymentMethod,
        rawDetails: event,
      });

      return NextResponse.json({ status: "processed", orderId });
    }

    if (eventType === "PAYMENT_FAILED_WEBHOOK" || eventType === "PAYMENT_DECLINED") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAYMENT_FAILED",
          payment_status: "FAILED",
        },
      });

      return NextResponse.json({ status: "marked_failed", orderId });
    }

    return NextResponse.json({ status: "ignored", eventType });
  } catch (error: any) {
    console.error("Cashfree webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
