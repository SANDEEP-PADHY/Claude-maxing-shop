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

  const [orders, availableKeys] = await Promise.all([
    prisma.order.findMany({
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
        access_key: true,
        assignments: {
          orderBy: { assigned_at: "desc" },
        },
        payments: true,
      },
    }),
    prisma.accessKey.findMany({
      include: { plan: true },
      orderBy: { created_at: "desc" },
    }),
  ]);

  return (
    <AppShell user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <AdminNav />
        <AdminOrdersClient
          initialOrders={orders.map((o) => {
            const activeAssignment = o.assignments[0];
            return {
              id: o.id,
              amount: o.amount,
              currency: o.currency,
              status: o.status,
              payment_status: o.payment_status,
              cashfree_order_id: o.cashfree_order_id,
              delivery_method: o.delivery_method,
              delivery_status: o.delivery_status,
              delivery_recipient: o.delivery_recipient || (o.delivery_method === "EMAIL" ? o.user.email : o.user.phone),
              delivered_at: o.delivered_at ? o.delivered_at.toISOString() : null,
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
              access_key_id: o.access_key_id,
              assigned_key: o.access_key
                ? {
                    id: o.access_key.id,
                    status: o.access_key.status,
                    current_customers: o.access_key.current_customers,
                    max_customers: o.access_key.max_customers,
                  }
                : null,
              assignment: activeAssignment
                ? {
                    id: activeAssignment.id,
                    status: activeAssignment.status,
                    assigned_at: activeAssignment.assigned_at.toISOString(),
                    expires_at: activeAssignment.expires_at.toISOString(),
                    delivered_at: activeAssignment.delivered_at ? activeAssignment.delivered_at.toISOString() : null,
                  }
                : null,
              payments: o.payments.map((p) => ({
                id: p.id,
                cashfree_payment_id: p.cashfree_payment_id,
                method: p.method,
                status: p.status,
              })),
            };
          })}
          allKeys={availableKeys.map((k) => ({
            id: k.id,
            planId: k.plan_id,
            planMultiplier: k.plan.multiplier,
            status: k.status,
            maxCustomers: k.max_customers,
            currentCustomers: k.current_customers,
            remaining: Math.max(0, k.max_customers - k.current_customers),
          }))}
        />
      </div>
    </AppShell>
  );
}
