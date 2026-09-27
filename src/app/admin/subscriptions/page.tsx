import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { AdminNav } from "@/components/AdminNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { KeyRound, Calendar, ShieldCheck } from "lucide-react";

export default async function AdminSubscriptionsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/subscriptions");
  }

  const subscriptions = await prisma.subscription.findMany({
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
      order: {
        select: {
          id: true,
          amount: true,
          status: true,
        },
      },
    },
  });

  return (
    <AppShell user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <AdminNav />

        <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D]">
          <div>
            <h2 className="text-lg font-semibold text-[#F5F5F5]">
              Active &amp; Historical Subscriptions ({subscriptions.length})
            </h2>
            <p className="text-xs text-[#A3A3A3]">
              Provisioned usage tiers, term expirations, and node synchronization audit.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[14px] border border-[#2D2D2D] bg-[#151515]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1A] border-b border-[#2D2D2D] text-[#A3A3A3] font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">Subscription ID</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Plan Tier</th>
                <th className="py-3 px-4 font-medium">Starts At</th>
                <th className="py-3 px-4 font-medium">Expires At</th>
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6F6F6F]">
                    No subscriptions generated yet.
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => {
                  const isExpired = new Date(s.expires_at) < new Date();
                  return (
                    <tr key={s.id} className="hover:bg-[#1E1E1E] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-[#F5F5F5]">
                        {s.id.slice(0, 14)}...
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium">{s.user.name}</div>
                        <div className="text-[11px] font-mono text-[#6F6F6F]">
                          {s.user.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {s.plan.name} ({s.plan.multiplier}x)
                      </td>
                      <td className="py-3.5 px-4 text-[#A3A3A3] font-mono">
                        {new Date(s.starts_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={isExpired ? "text-rose-400" : "text-[#F5F5F5]"}>
                          {new Date(s.expires_at).toLocaleDateString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#A3A3A3]">
                        {s.order_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={isExpired && s.status === "ACTIVE" ? "EXPIRED" : s.status}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/admin/orders?q=${s.order_id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            Inspect Order
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
