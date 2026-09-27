import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { OrderTable } from "@/components/OrderTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Calendar,
  CreditCard,
  ShieldCheck,
  PlusCircle,
  HelpCircle,
  FileText,
  Activity,
} from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; orderId?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const { payment, orderId } = await searchParams;

  // Fetch active subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { user_id: user.id },
    include: {
      plan: true,
      order: true,
    },
    orderBy: { created_at: "desc" },
  });

  // Fetch orders
  const orders = await prisma.order.findMany({
    where: { user_id: user.id },
    include: {
      plan: true,
      payments: true,
    },
    orderBy: { created_at: "desc" },
    take: 10,
  });

  const activeSubscription = subscriptions.find((s) => s.status === "ACTIVE");

  // Determine greeting based on current hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <AppShell user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
        {/* Payment Confirmation Banner (if just redirected from payment) */}
        {payment === "success" && (
          <div className="p-4 rounded-[14px] bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs sm:text-sm flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-900/60 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="font-semibold block text-[#F5F5F5]">
                  Payment Verified & Subscription Activated
                </span>
                <span className="text-[#A3A3A3] text-xs">
                  Your order {orderId || ""} was processed successfully via Cashfree.
                </span>
              </div>
            </div>
            <Link href="/orders">
              <Button variant="secondary" size="sm" className="shrink-0 text-xs">
                View Receipt
              </Button>
            </Link>
          </div>
        )}

        {/* Dashboard Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2D2D2D] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Customer Portal // Authorized Node</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
              {greeting}, {user.name.split(" ")[0]}
            </h1>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Account: <span className="font-mono text-[#F5F5F5]">{user.email}</span> • Phone: <span className="font-mono text-[#F5F5F5]">{user.phone}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/plans">
              <Button variant="primary" size="sm" className="gap-1.5">
                <PlusCircle size={14} />
                <span>New Subscription</span>
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" size="sm" className="gap-1.5">
                <HelpCircle size={14} />
                <span>Support</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Horizontal Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Current Plan */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-[#6F6F6F] tracking-wider">
              Current Plan
            </div>
            <div className="text-base sm:text-lg font-semibold text-[#F5F5F5] truncate">
              {activeSubscription ? activeSubscription.plan.name : "No Active Plan"}
            </div>
            <div className="text-xs text-[#A3A3A3]">
              {activeSubscription ? `${activeSubscription.plan.multiplier}x usage tier` : "Inactive"}
            </div>
          </div>

          {/* Card 2: Status */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-[#6F6F6F] tracking-wider">
              Subscription Status
            </div>
            <div className="pt-0.5">
              <StatusBadge status={activeSubscription ? activeSubscription.status : "INACTIVE"} />
            </div>
            <div className="text-[11px] text-[#6F6F6F]">
              {activeSubscription ? "Direct Account Provisioning" : "Choose a plan to activate"}
            </div>
          </div>

          {/* Card 3: Renewal / Expiry */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-[#6F6F6F] tracking-wider">
              Renewal / Expiry
            </div>
            <div className="text-base sm:text-lg font-semibold text-[#F5F5F5] font-mono">
              {activeSubscription
                ? new Date(activeSubscription.expires_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </div>
            <div className="text-xs text-[#A3A3A3]">
              {activeSubscription ? "Monthly cycle" : "No active term"}
            </div>
          </div>

          {/* Card 4: Order Status */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-[#6F6F6F] tracking-wider">
              Latest Transaction
            </div>
            <div className="text-base sm:text-lg font-semibold text-[#F5F5F5]">
              {orders.length > 0 ? (
                <span className="font-mono">₹{orders[0].amount.toLocaleString("en-IN")}</span>
              ) : (
                "—"
              )}
            </div>
            <div className="text-xs text-[#A3A3A3]">
              {orders.length > 0 ? (
                <span className="capitalize">{orders[0].status.toLowerCase().replace("_", " ")}</span>
              ) : (
                "No previous transactions"
              )}
            </div>
          </div>
        </div>

        {/* Main Section: My Subscriptions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">
              Current Subscription
            </h2>
            {activeSubscription && (
              <span className="text-xs font-mono text-[#D97757]">
                Ref: {activeSubscription.provider_reference || "Synchronized"}
              </span>
            )}
          </div>

          {activeSubscription ? (
            <SubscriptionCard
              subscription={{
                id: activeSubscription.id,
                planName: activeSubscription.plan.name,
                multiplier: activeSubscription.plan.multiplier,
                price: activeSubscription.plan.price,
                status: activeSubscription.status,
                startsAt: activeSubscription.starts_at,
                expiresAt: activeSubscription.expires_at,
                orderId: activeSubscription.order_id,
                providerReference: activeSubscription.provider_reference,
                customerEmail: user.email,
              }}
            />
          ) : (
            <EmptyState
              title="You haven't purchased a subscription yet."
              description="Select an authorized Claude Max plan to unlock expanded prompt quotas, higher thread capacity, and predictable monthly billing."
              actionText="View plans"
              actionHref="/plans"
            />
          )}
        </section>

        {/* Section: Recent Orders & Invoices */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">
              Recent Orders & Billing History
            </h2>
            <Link href="/orders" className="text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5]">
              View All Orders →
            </Link>
          </div>

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
        </section>
      </div>
    </AppShell>
  );
}
