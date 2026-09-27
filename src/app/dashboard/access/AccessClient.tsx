"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  Key,
  Copy,
  Eye,
  ShieldAlert,
  Calendar,
  Layers,
  Send,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react";

interface AccessClientProps {
  assignment: {
    id: string;
    status: string;
    planName: string;
    multiplier: number;
    price: number;
    deliveryMethod: string;
    deliveryStatus?: string;
    deliveryRecipient: string;
    expiresAt: string;
    assignedAt: string;
  } | null;
}

export const AccessClient: React.FC<AccessClientProps> = ({ assignment }) => {
  const { toast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!assignment) {
    return (
      <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-10 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-[#202020] border border-[#2D2D2D] flex items-center justify-center mx-auto text-[#A3A3A3]">
          <Key size={20} />
        </div>
        <h2 className="text-xl font-bold text-[#F5F5F5]">No Active Access</h2>
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          You currently do not have an active Claude-powered managed access allocation. Choose a plan to activate.
        </p>
        <Link href="/plans">
          <Button variant="primary" size="md">
            View Access Plans
          </Button>
        </Link>
      </div>
    );
  }

  const handleReveal = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/access/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: assignment.id }),
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
    if (!revealedKey) {
      toast("Please reveal the key first to copy it.", "info");
      return;
    }
    navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    toast("Access key copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedStart = new Date(assignment.assignedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedExpiry = new Date(assignment.expiresAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isDelivered = assignment.deliveryStatus === "DELIVERED";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#2D2D2D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-2">
            <Key size={12} className="text-[#D97757]" />
            <span>Secure Access Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
            Access Details
          </h1>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Main Access Details Card */}
      <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 space-y-6">
        {/* Tier Details Grid: Plan, Status, Start date, Expiry date, Delivery method, Delivery status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pb-6 border-b border-[#2D2D2D]">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider mb-1">
              Plan
            </div>
            <div className="text-base font-semibold text-[#F5F5F5]">
              {assignment.planName}
            </div>
            <div className="text-[11px] text-[#A3A3A3] font-mono">
              {assignment.multiplier}X Access
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider mb-1">
              Status
            </div>
            <div className="pt-0.5">
              <StatusBadge status={assignment.status} />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider mb-1">
              Start date
            </div>
            <div className="text-sm font-semibold text-[#F5F5F5] font-mono">
              {formattedStart}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider mb-1">
              Expiry date
            </div>
            <div className="text-sm font-semibold text-[#F5F5F5] font-mono">
              {formattedExpiry}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider mb-1">
              Delivery method
            </div>
            <div className="text-sm font-semibold text-[#F5F5F5]">
              {assignment.deliveryMethod === "WHATSAPP" ? "WhatsApp" : "Email"}
            </div>
            <div className="text-[11px] text-[#6F6F6F] font-mono truncate">
              {assignment.deliveryRecipient}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider mb-1">
              Delivery status
            </div>
            <div>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium inline-block ${
                  isDelivered
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                    : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                }`}
              >
                {isDelivered ? "DELIVERED" : "PENDING"}
              </span>
            </div>
          </div>
        </div>

        {/* Access Key Container */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#A3A3A3] tracking-wider">
              Assigned Access Key
            </span>
            {revealedKey && (
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 size={12} />
                Decrypted
              </span>
            )}
          </div>

          {/* Key Display Surface */}
          <div className="p-4 rounded-[12px] bg-[#0E0E0E] border border-[#2D2D2D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="font-mono text-sm tracking-wider break-all text-[#F5F5F5] select-all">
              {revealedKey ? revealedKey : "***************"}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!revealedKey ? (
                <Button
                  variant="primary"
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
          </div>
        </div>

        {/* Security Note */}
        <div className="p-4 rounded-[12px] bg-[#121212] border border-[#2D2D2D] flex items-start gap-3">
          <ShieldAlert size={18} className="text-[#D97757] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#F5F5F5]">
              Security Note
            </div>
            <p className="text-xs leading-relaxed text-[#A3A3A3]">
              Keep this key private. Anyone with the key may be able to use the associated access.
            </p>
          </div>
        </div>
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
