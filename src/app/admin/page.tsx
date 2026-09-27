import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { AdminNav } from "@/components/AdminNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Key,
  Users,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin");
  }

  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    paidOrdersRecords,
    pendingDeliveriesCount,
    failedPaymentsCount,
    allKeys,
    activeAssignments,
    expiredAccessCount,
    recentOrders,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { amount: true, created_at: true },
    }),
    prisma.order.count({
      where: {
        status: "PAID",
        delivery_status: "PENDING",
      },
    }),
    prisma.order.count({
      where: {
        OR: [
          { status: "PAYMENT_FAILED" },
          { payment_status: "FAILED" },
        ],
      },
    }),
    prisma.accessKey.findMany({
      include: { plan: true },
    }),
    prisma.accessAssignment.findMany({
      where: {
        status: "ACTIVE",
        expires_at: { gte: now },
      },
      include: { plan: true },
    }),
    prisma.accessAssignment.count({
      where: {
        OR: [
          { status: "EXPIRED" },
          { expires_at: { lt: now } },
        ],
      },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { created_at: "desc" },
      include: {
        plan: true,
        user: { select: { name: true, email: true, phone: true } },
        access_key: true,
      },
    }),
  ]);

  const todaySales = paidOrdersRecords
    .filter((o) => o.created_at >= startOfToday)
    .reduce((sum, o) => sum + o.amount, 0);

  const paidOrdersCount = paidOrdersRecords.length;

  const active5xAllocations = activeAssignments.filter(
    (a) => a.plan.multiplier === 5 || a.plan.slug.includes("5x")
  ).length;

  const active20xAllocations = activeAssignments.filter(
    (a) => a.plan.multiplier === 20 || a.plan.slug.includes("20x")
  ).length;

  const availableKeyCapacity = allKeys
    .filter((k) => k.status === "ACTIVE" || k.status === "AVAILABLE")
    .reduce((sum, k) => sum + Math.max(0, k.max_customers - k.current_customers), 0);

  return (
    <AppShell user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <AdminNav />

        {/* Access Key Management Quick Action Bar */}
        <div className="p-5 rounded-[16px] bg-[#151515] border border-[#2D2D2D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#202020] border border-[#2D2D2D] flex items-center justify-center text-[#D97757]">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F5F5F5]">
                Access Key Pool & Capacity Management
              </h2>
              <p className="text-xs text-[#A3A3A3]">
                Manage encrypted API keys, allocation thresholds (10 for 5X, 5 for 20X), and assignment tracking.
              </p>
            </div>
          </div>
          <Link href="/admin/access-keys">
            <Button variant="primary" size="sm" className="gap-1.5 shrink-0 text-xs">
              <span>Manage Access Keys</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {/* 8 Required Operational Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Today's sales */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>TODAY&apos;S SALES</span>
              <DollarSign size={14} className="text-[#D97757]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#F5F5F5]">
              ₹{todaySales.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Paid volume generated today
            </div>
          </div>

          {/* Metric 2: Paid orders */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>PAID ORDERS</span>
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {paidOrdersCount}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Verified completed payments
            </div>
          </div>

          {/* Metric 3: Pending deliveries */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>PENDING DELIVERIES</span>
              <Clock size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {pendingDeliveriesCount}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              WhatsApp or manual dispatches pending
            </div>
          </div>

          {/* Metric 4: Available key capacity */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>AVAILABLE KEY CAPACITY</span>
              <Key size={14} className="text-[#D97757]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#F5F5F5]">
              {availableKeyCapacity}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Remaining customer slots across keys
            </div>
          </div>

          {/* Metric 5: Active 5X allocations */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>ACTIVE 5X ALLOCATIONS</span>
              <Layers size={14} className="text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-sky-400">
              {active5xAllocations}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Customers active on 5X Access
            </div>
          </div>

          {/* Metric 6: Active 20X allocations */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>ACTIVE 20X ALLOCATIONS</span>
              <Layers size={14} className="text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-400">
              {active20xAllocations}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Customers active on 20X Access
            </div>
          </div>

          {/* Metric 7: Expired access */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>EXPIRED ACCESS</span>
              <Clock size={14} className="text-[#6F6F6F]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#A3A3A3]">
              {expiredAccessCount}
            </div>
            <div className="text-[11px] text-[#6F6F6F]">
              Assignments past 30-day validity
            </div>
          </div>

          {/* Metric 8: Failed payments */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>FAILED PAYMENTS</span>
              <ShieldAlert size={14} className="text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {failedPaymentsCount}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Declined or failed attempts
            </div>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F5F5F5]">
              Recent Orders & Deliveries
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-mono text-[#D97757] hover:underline"
            >
              Manage All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-[14px] border border-[#2D2D2D] bg-[#151515]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1A1A] border-b border-[#2D2D2D] text-[#A3A3A3] font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">Order ID</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Plan</th>
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium">Delivery</th>
                  <th className="py-3 px-4 font-medium">Payment</th>
                  <th className="py-3 px-4 font-medium">Fulfillment</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#1E1E1E] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium">{o.id}</td>
                    <td className="py-3.5 px-4">
                      <div>{o.user.name}</div>
                      <div className="text-[11px] text-[#6F6F6F] font-mono">
                        {o.user.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{o.plan.name}</td>
                    <td className="py-3.5 px-4 font-mono">₹{o.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#202020] border border-[#2D2D2D] text-[11px] font-mono">
                        {o.delivery_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                          o.delivery_status === "DELIVERED"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                            : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                        }`}
                      >
                        {o.delivery_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/admin/orders?q=${o.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
