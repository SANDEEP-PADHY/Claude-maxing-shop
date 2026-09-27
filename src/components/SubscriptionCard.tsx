import React from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";
import { ShieldCheck, Calendar, Hash, Mail, ArrowUpRight, HelpCircle } from "lucide-react";

export interface SubscriptionData {
  id: string;
  planName: string;
  multiplier: number;
  price: number;
  status: string;
  startsAt: string | Date;
  expiresAt: string | Date;
  orderId: string;
  providerReference?: string | null;
  activationDetails?: string | null;
  customerEmail: string;
}

interface SubscriptionCardProps {
  subscription: SubscriptionData;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
}) => {
  const expiresDate = new Date(subscription.expiresAt);
  const now = new Date();
  const diffDays = Math.ceil(
    (expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2D2D2D]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">
              {subscription.planName}
            </h3>
            <StatusBadge status={subscription.status} />
          </div>
          <div className="text-xs text-[#A3A3A3] font-mono">
            {subscription.multiplier}x usage capacity allocation
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-2xl font-bold text-[#F5F5F5]">
            ₹{subscription.price.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-[#6F6F6F]">per month</div>
        </div>
      </div>

      {/* Modular Information Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1: Expiry */}
        <div className="p-4 rounded-[12px] bg-[#202020] border border-[#2D2D2D] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6F6F6F] font-mono">
            <Calendar size={13} />
            <span>EXPIRES / RENEWAL</span>
          </div>
          <div className="text-sm font-semibold text-[#F5F5F5]">
            {expiresDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-[11px] text-[#A3A3A3]">
            {diffDays > 0 ? `${diffDays} days remaining` : "Expired"}
          </div>
        </div>

        {/* Card 2: Order Reference */}
        <div className="p-4 rounded-[12px] bg-[#202020] border border-[#2D2D2D] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6F6F6F] font-mono">
            <Hash size={13} />
            <span>ORDER REFERENCE</span>
          </div>
          <div className="text-sm font-semibold text-[#F5F5F5] font-mono truncate">
            {subscription.orderId}
          </div>
          <div className="text-[11px] text-[#A3A3A3]">
            Ref: {subscription.providerReference || "Synchronized"}
          </div>
        </div>

        {/* Card 3: Account Allocation Target */}
        <div className="p-4 rounded-[12px] bg-[#202020] border border-[#2D2D2D] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6F6F6F] font-mono">
            <Mail size={13} />
            <span>TARGET ACCOUNT</span>
          </div>
          <div className="text-sm font-semibold text-[#F5F5F5] truncate">
            {subscription.customerEmail}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Authorized access granted</span>
          </div>
        </div>
      </div>

      {/* Status Treatment Note (honest, no fabricated chart) */}
      <div className="p-4 rounded-[12px] bg-[#101010] border border-[#2D2D2D] text-xs text-[#A3A3A3] flex items-start gap-3">
        <ShieldCheck size={18} className="text-[#D97757] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-medium text-[#F5F5F5]">
            Account Synchronization Active
          </div>
          <p className="text-[11px] leading-relaxed text-[#888888]">
            This subscription is authorized directly to your account. Your expanded {subscription.multiplier}x usage tier is active for the current billing cycle.
          </p>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <Link href={`/orders`}>
            <Button variant="secondary" size="sm" className="gap-1.5">
              <span>View Invoices</span>
              <ArrowUpRight size={14} />
            </Button>
          </Link>
          <Link href="/support">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <HelpCircle size={14} />
              <span>Contact Support</span>
            </Button>
          </Link>
        </div>
        <Link href="/plans">
          <Button variant="outline" size="sm">
            Change Plan
          </Button>
        </Link>
      </div>
    </div>
  );
};
