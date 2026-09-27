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
  ShoppingCart,
  CheckCircle2,
  Clock,
  Key,
  Users,
  ArrowUpRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    todayOrdersCount,
    totalOrdersCount,
    paidOrders,
    pendingFulfilmentsCount,
    activeSubsCount,
    totalCustomersCount,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { created_at: { gte: startOfToday } } }),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { amount: true, created_at: true },
    }),
    prisma.subscription.count({
      where: { fulfilment_status: "FULFILMENT_PENDING" },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { created_at: "desc" },
      include: {
        plan: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const todayRevenue = paidOrders
    .filter((o) => o.created_at >= startOfToday)
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <AppShell user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <AdminNav />

        {/* Top Operational Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>TOTAL REVENUE</span>
              <DollarSign size={14} className="text-[#D97757]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#F5F5F5]">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Today: ₹{todayRevenue.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>TOTAL ORDERS</span>
              <ShoppingCart size={14} className="text-[#D97757]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#F5F5F5]">
              {totalOrdersCount}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Today&apos;s new orders: {todayOrdersCount}
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>ACTIVE SUBSCRIPTIONS</span>
              <Key size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {activeSubsCount}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Total Customers: {totalCustomersCount}
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] font-mono">
              <span>PENDING FULFILMENT</span>
              <Clock size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#F5F5F5]">
              {pendingFulfilmentsCount}
            </div>
            <div className="text-[11px] text-[#A3A3A3]">
              Paid orders awaiting setup
            </div>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F5F5F5]">
              Recent Platform Orders
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
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Status</th>
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
                    <td className="py-3.5 px-4 text-[#A3A3A3] font-mono">
                      {new Date(o.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/admin/orders?q=${o.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          Inspect
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
