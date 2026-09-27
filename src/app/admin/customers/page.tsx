import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { AdminNav } from "@/components/AdminNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Users, Mail, Phone, Calendar, ShoppingBag } from "lucide-react";

export default async function AdminCustomersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/customers");
  }

  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      created_at: true,
      orders: {
        select: {
          id: true,
          amount: true,
          status: true,
        },
      },
      subscriptions: {
        select: {
          id: true,
          status: true,
          fulfilment_status: true,
          plan: { select: { name: true } },
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
              Customer Directory ({customers.length})
            </h2>
            <p className="text-xs text-[#A3A3A3]">
              Registered buyers, verified contact details, and historical subscription allocations.
            </p>
          </div>
          <div className="text-xs text-[#6F6F6F] font-mono">
            Security: Passwords securely hashed (Never exposed)
          </div>
        </div>

        <div className="overflow-x-auto rounded-[14px] border border-[#2D2D2D] bg-[#151515]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1A] border-b border-[#2D2D2D] text-[#A3A3A3] font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">Customer Name</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Phone</th>
                <th className="py-3 px-4 font-medium">Joined</th>
                <th className="py-3 px-4 font-medium">Total Orders</th>
                <th className="py-3 px-4 font-medium">Total Spent</th>
                <th className="py-3 px-4 font-medium">Subscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6F6F6F]">
                    No registered customers yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const paidOrders = c.orders.filter((o) => o.status === "PAID");
                  const totalSpent = paidOrders.reduce((sum, o) => sum + o.amount, 0);
                  const activeSub = c.subscriptions.find((s) => s.status === "ACTIVE");

                  return (
                    <tr key={c.id} className="hover:bg-[#1E1E1E] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#F5F5F5]">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#A3A3A3]">
                        {c.email}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#A3A3A3]">
                        {c.phone}
                      </td>
                      <td className="py-3.5 px-4 text-[#6F6F6F] font-mono">
                        {new Date(c.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-center">
                        {c.orders.length}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        ₹{totalSpent.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        {activeSub ? (
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status="ACTIVE" />
                            <span className="text-[11px] text-[#A3A3A3]">
                              {activeSub.plan.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#6F6F6F] text-[11px]">None</span>
                        )}
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
