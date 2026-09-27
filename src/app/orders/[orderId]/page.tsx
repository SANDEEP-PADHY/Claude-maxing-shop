import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Printer, Shield, HelpCircle } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=/orders/${orderId}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      plan: true,
      user: true,
      payments: true,
      subscriptions: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Authorization check: only order owner or admin
  if (order.user_id !== user.id && user.role !== "admin") {
    redirect("/orders");
  }

  const latestPayment = order.payments[0];
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AppShell user={user}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5] mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Orders</span>
        </Link>

        {/* Invoice Card Container */}
        <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-10 space-y-8 shadow-2xl">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2D2D2D] gap-4">
            <div>
              <div className="text-[11px] font-mono text-[#D97757] uppercase tracking-wider mb-1">
                TAX INVOICE / OFFICIAL RECEIPT
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">
                {siteConfig.name}
              </h1>
              <p className="text-xs text-[#6F6F6F] mt-1">{siteConfig.address}</p>
              {siteConfig.gstin && (
                <p className="text-xs font-mono text-[#6F6F6F]">
                  GSTIN: {siteConfig.gstin}
                </p>
              )}
            </div>

            <div className="text-left sm:text-right space-y-1">
              <StatusBadge status={order.status} />
              <div className="font-mono text-xs text-[#A3A3A3] pt-1">
                Order ID: {order.id}
              </div>
              <div className="text-[11px] text-[#6F6F6F]">{orderDate}</div>
            </div>
          </div>

          {/* Billed To & Payment Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-[12px] bg-[#1A1A1A] border border-[#2D2D2D]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider block mb-1">
                Customer Billed To
              </span>
              <div className="text-sm font-semibold text-[#F5F5F5]">
                {order.user.name}
              </div>
              <div className="text-xs text-[#A3A3A3] font-mono">{order.user.email}</div>
              <div className="text-xs text-[#A3A3A3] font-mono">{order.user.phone}</div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider block mb-1">
                Payment Verification
              </span>
              <div className="text-xs text-[#A3A3A3]">
                Gateway: <span className="text-[#F5F5F5] font-medium">Cashfree Payment Gateway</span>
              </div>
              {order.cashfree_order_id && (
                <div className="text-xs text-[#A3A3A3] font-mono">
                  CF Order: {order.cashfree_order_id}
                </div>
              )}
              {latestPayment?.cashfree_payment_id && (
                <div className="text-xs text-[#A3A3A3] font-mono">
                  Payment Ref: {latestPayment.cashfree_payment_id}
                </div>
              )}
              <div className="text-xs text-emerald-400 mt-1 font-mono">
                Status: {order.payment_status}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-[12px] border border-[#2D2D2D] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1A1A] border-b border-[#2D2D2D] text-[#A3A3A3] font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">Product / Service Description</th>
                  <th className="py-3 px-4 font-medium text-right">Qty</th>
                  <th className="py-3 px-4 font-medium text-right">Rate</th>
                  <th className="py-3 px-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
                <tr>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-[#F5F5F5]">{order.plan.name}</div>
                    <div className="text-[11px] text-[#A3A3A3] mt-0.5">
                      {order.plan.multiplier}x usage tier monthly allocation
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-mono">1</td>
                  <td className="py-4 px-4 text-right font-mono">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-semibold">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Total */}
          <div className="space-y-2 pt-2 border-t border-[#2D2D2D] text-xs">
            <div className="flex justify-between text-[#A3A3A3]">
              <span>Subtotal</span>
              <span className="font-mono">₹{order.amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-[#6F6F6F]">
              <span>Applicable Taxes & Gateway Surcharges</span>
              <span className="font-mono">Inclusive</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#F5F5F5] pt-2 border-t border-[#2D2D2D]">
              <span>Total Paid</span>
              <span className="font-mono text-xl text-[#D97757]">
                ₹{order.amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Disclaimer & Legal Notice */}
          <div className="p-4 rounded-[10px] bg-[#101010] border border-[#2D2D2D] text-[11px] text-[#888888] space-y-1">
            <span className="text-[#A3A3A3] font-semibold block">Merchant Disclosure:</span>
            <p>{siteConfig.disclaimer}</p>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#2D2D2D]">
            <Link href="/support">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <HelpCircle size={13} />
                <span>Contact Support Regarding this Order</span>
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
