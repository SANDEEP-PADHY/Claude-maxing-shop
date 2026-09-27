import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { AdminNav } from "@/components/AdminNav";
import { AdminOrdersClient } from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/orders");
  }

  const orders = await prisma.order.findMany({
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

  return (
    <AppShell user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <AdminNav />
        <AdminOrdersClient
          initialOrders={orders.map((o) => ({
            id: o.id,
            amount: o.amount,
            currency: o.currency,
            status: o.status,
            payment_status: o.payment_status,
            cashfree_order_id: o.cashfree_order_id,
            created_at: o.created_at.toISOString(),
            plan: {
              id: o.plan.id,
              name: o.plan.name,
              multiplier: o.plan.multiplier,
            },
            user: {
              id: o.user.id,
              name: o.user.name,
              email: o.user.email,
              phone: o.user.phone,
            },
            payments: o.payments.map((p) => ({
              id: p.id,
              cashfree_payment_id: p.cashfree_payment_id,
              method: p.method,
              status: p.status,
            })),
            subscriptions: o.subscriptions.map((s) => ({
              id: s.id,
              status: s.status,
              fulfilment_status: s.fulfilment_status,
              provider_reference: s.provider_reference,
            })),
          }))}
        />
      </div>
    </AppShell>
  );
}
