"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";
import { useToast } from "./ui/Toast";
import {
  Calendar,
  Send,
  Key,
  ShieldCheck,
  Eye,
  Copy,
  AlertTriangle,
  X,
  ArrowRight,
} from "lucide-react";

export interface SubscriptionData {
  id: string;
  planName: string;
  multiplier: number;
  price: number;
  status: string;
  startsAt: string | Date;
  expiresAt: string | Date;
  orderId: string;
  deliveryMethod?: string;
  deliveryStatus?: string;
  providerReference?: string | null;
  customerEmail: string;
}

interface SubscriptionCardProps {
  subscription: SubscriptionData;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
}) => {
  const { toast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const expiresDate = new Date(subscription.expiresAt);
  const formattedExpiry = expiresDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const deliveryMethodLabel =
    subscription.deliveryMethod === "WHATSAPP" ? "WhatsApp" : "Email";

  const isDelivered = subscription.deliveryStatus === "DELIVERED";

  const handleReveal = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/access/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reveal key");
      }

      setRevealedKey(data.key);
      setShowConfirmModal(false);
      toast("Access key revealed securely.", "success");
    } catch (err: any) {
      toast(err.message || "Could not reveal key.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    toast("Access key copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 space-y-6">
      {/* Top Section Tag */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2D2D2D]">
        <span className="text-[11px] font-mono uppercase text-[#D97757] font-semibold tracking-wider">
          YOUR ACCESS
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={subscription.status} />
        </div>
      </div>

      {/* Main Title & Price */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
            {subscription.planName}
          </h3>
          <div className="text-xs text-[#A3A3A3] mt-1">
            Claude-powered managed API access
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] font-mono">
            ₹{subscription.price.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-[#6F6F6F]">/ month</div>
        </div>
      </div>

      {/* Modular Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1: Expiry */}
        <div className="p-4 rounded-[12px] bg-[#202020] border border-[#2D2D2D] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6F6F6F] font-mono">
            <Calendar size={13} />
            <span>Valid until</span>
          </div>
          <div className="text-sm font-semibold text-[#F5F5F5] font-mono">
            {formattedExpiry}
          </div>
          <div className="text-[11px] text-[#A3A3A3]">
            30-day managed access term
          </div>
        </div>

        {/* Card 2: Delivery */}
        <div className="p-4 rounded-[12px] bg-[#202020] border border-[#2D2D2D] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6F6F6F] font-mono">
            <Send size={13} />
            <span>Delivery</span>
          </div>
          <div className="text-sm font-semibold text-[#F5F5F5] flex items-center justify-between">
            <span>{deliveryMethodLabel}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                isDelivered
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                  : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
              }`}
            >
              {isDelivered ? "DELIVERED" : "PENDING"}
            </span>
          </div>
          <div className="text-[11px] text-[#A3A3A3]">
            {isDelivered
              ? `Dispatched on ${deliveryMethodLabel}`
              : `Pending manual dispatch on ${deliveryMethodLabel}`}
          </div>
        </div>

        {/* Card 3: Key Quick View */}
        <div className="p-4 rounded-[12px] bg-[#202020] border border-[#2D2D2D] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6F6F6F] font-mono">
            <Key size={13} />
            <span>ACCESS KEY</span>
          </div>
          <div className="text-sm font-mono text-[#F5F5F5] truncate">
            {revealedKey ? revealedKey : "••••••••••••••••••••"}
          </div>
          <div className="text-[11px] text-[#D97757]">
            {revealedKey ? "Key visible" : "Protected & encrypted"}
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="p-4 rounded-[12px] bg-[#101010] border border-[#2D2D2D] text-xs text-[#A3A3A3] flex items-start gap-3">
        <ShieldCheck size={18} className="text-[#D97757] shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-[#888888]">
          Keep this key private. Anyone with the key may be able to use the associated access.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2D2D2D]">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/access">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <span>Access details</span>
              <ArrowRight size={14} />
            </Button>
          </Link>

          {!revealedKey ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              className="gap-1.5 text-xs"
            >
              <Eye size={14} />
              <span>Show access key</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-xs"
            >
              <Copy size={14} />
              <span>{copied ? "Copied!" : "Copy key"}</span>
            </Button>
          )}
        </div>

        <Link href="/plans">
          <Button variant="ghost" size="sm" className="text-xs text-[#A3A3A3]">
            Upgrade / Extend
          </Button>
        </Link>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F5]">
                <AlertTriangle size={16} className="text-[#D97757]" />
                <span>Show access key?</span>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-[#6F6F6F] hover:text-[#F5F5F5] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#A3A3A3] leading-relaxed">
              <p className="text-[#F5F5F5] font-medium">
                Make sure nobody else can see your screen.
              </p>
              <p className="text-[#888888]">
                Keep this key private. Anyone with the key may be able to use the associated access.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleReveal}
                isLoading={isLoading}
                className="gap-1.5"
              >
                <Eye size={14} />
                <span>Show key</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
