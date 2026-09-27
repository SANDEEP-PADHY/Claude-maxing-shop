import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { CheckoutClient } from "./CheckoutClient";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/checkout/${orderId}`)}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      plan: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    redirect("/plans");
  }

  if (order.user_id !== user.id && user.role !== "admin") {
    redirect("/dashboard");
  }

  // If already paid, redirect to dashboard
  if (order.status === "PAID") {
    redirect(`/dashboard?orderId=${order.id}`);
  }

  return (
    <AppShell user={user}>
      <CheckoutClient order={order} />
    </AppShell>
  );
}
