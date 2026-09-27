import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCashfreeOrderStatus, processPaymentSuccess } from "@/lib/cashfree";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.redirect(new URL("/dashboard?error=missing_order", req.url));
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { subscriptions: true },
    });

    if (!order) {
      return NextResponse.redirect(new URL("/dashboard?error=order_not_found", req.url));
    }

    // Verify order status directly from Cashfree server-side
    const cfStatus = await fetchCashfreeOrderStatus(orderId);

    const isPaid =
      cfStatus?.order_status === "PAID" ||
      cfStatus?.order_status === "SUCCESS" ||
      order.status === "PAID";

    if (isPaid) {
      const paymentId =
        cfStatus?.cf_payment_id || `cf_pay_${Date.now()}`;
      await processPaymentSuccess({
        orderId,
        cashfreePaymentId: String(paymentId),
        paymentMethod: cfStatus?.payment_method || "Cashfree PG",
        rawDetails: cfStatus,
      });

      return NextResponse.redirect(
        new URL(`/dashboard?payment=success&orderId=${orderId}`, req.url)
      );
    }

    // If failed or cancelled
    if (cfStatus?.order_status === "EXPIRED" || cfStatus?.order_status === "FAILED") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAYMENT_FAILED",
          payment_status: "FAILED",
        },
      });
      return NextResponse.redirect(
        new URL(`/checkout/${orderId}?error=payment_failed`, req.url)
      );
    }

    // Pending or user dropped
    return NextResponse.redirect(
      new URL(`/checkout/${orderId}?status=pending`, req.url)
    );
  } catch (error) {
    console.error("Payment verification redirect error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=verification_error", req.url));
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, isSimulatedSuccess } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { subscriptions: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.user_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch verified order status from Cashfree server-side
    const cfStatus = await fetchCashfreeOrderStatus(orderId);

    // If real cashfree verified or explicitly simulating in sandbox
    const isPaid =
      cfStatus?.order_status === "PAID" ||
      cfStatus?.order_status === "SUCCESS" ||
      (isSimulatedSuccess && cfStatus?.isSimulated);

    if (isPaid) {
      const paymentId =
        cfStatus?.cf_payment_id || `cf_pay_sim_${Date.now()}`;
      const result = await processPaymentSuccess({
        orderId,
        cashfreePaymentId: String(paymentId),
        paymentMethod: cfStatus?.payment_method || "Cashfree PG (Verified)",
        rawDetails: cfStatus,
      });

      return NextResponse.json({
        success: true,
        status: "PAID",
        subscription: result.subscription,
      });
    }

    return NextResponse.json({
      success: false,
      status: order.status,
      message: "Payment is pending or not verified by gateway.",
    });
  } catch (error: any) {
    console.error("Payment verification API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
