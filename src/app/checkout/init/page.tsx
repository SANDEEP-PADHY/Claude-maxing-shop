import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCashfreePGOrder } from "@/lib/cashfree";
import { siteConfig } from "@/lib/config";

export default async function CheckoutInitPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planSlug } = await searchParams;
  const user = await getCurrentUser();

  let targetPlanSlug = planSlug || "5x-access";
  if (targetPlanSlug === "claude-max-5x" || targetPlanSlug === "5x") targetPlanSlug = "5x-access";
  if (targetPlanSlug === "claude-max-20x" || targetPlanSlug === "20x") targetPlanSlug = "20x-access";

  // If unauthenticated: preserve selected plan and redirect to login
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/checkout/init?plan=${targetPlanSlug}`)}`);
  }

  // Lookup plan
  let plan = await prisma.plan.findUnique({
    where: { slug: targetPlanSlug },
  });

  if (!plan) {
    // Fallback to first active plan
    plan = await prisma.plan.findFirst({
      where: { active: true },
      orderBy: { price: "asc" },
    });
  }

  if (!plan) {
    redirect("/plans");
  }

  // Create order
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${randomSuffix}`;

  const order = await prisma.order.create({
    data: {
      id: orderId,
      user_id: user.id,
      plan_id: plan.id,
      amount: plan.price,
      currency: plan.currency,
      status: "PAYMENT_PENDING",
      payment_status: "PENDING",
      delivery_method: "EMAIL",
      delivery_status: "PENDING",
      delivery_recipient: user.email,
    },
  });

  // Call Cashfree PG Order
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

  if (cfResponse.cfOrderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: { cashfree_order_id: cfResponse.cfOrderId },
    });
  }

  redirect(`/checkout/${order.id}`);
}
