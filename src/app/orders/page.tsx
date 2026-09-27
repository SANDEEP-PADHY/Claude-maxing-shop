import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { OrderTable } from "@/components/OrderTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Shield } from "lucide-react";

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { user_id: user.id },
    include: {
      plan: true,
      payments: true,
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <AppShell user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2D2D2D] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-2">
              <Shield size={12} className="text-[#D97757]" />
              <span>Billing & Tax Receipts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
              My Orders & Invoices
            </h1>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Review completed transactions, download official GST-compliant tax receipts, and inspect payment references.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="You have not placed any orders yet. Choose a plan to purchase an authorized Claude subscription."
            actionText="View plans"
            actionHref="/plans"
          />
        ) : (
          <OrderTable
            orders={orders.map((o) => ({
              id: o.id,
              planName: o.plan.name,
              amount: o.amount,
              currency: o.currency,
              paymentMethod: o.payments[0]?.method || "Cashfree PG",
              cashfreeOrderId: o.cashfree_order_id,
              paymentId: o.payments[0]?.cashfree_payment_id,
              date: o.created_at,
              status: o.status,
              customerName: user.name,
              customerEmail: user.email,
              customerPhone: user.phone,
            }))}
          />
        )}
      </div>
    </AppShell>
  );
}
