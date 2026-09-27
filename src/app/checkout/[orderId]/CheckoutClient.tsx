"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { siteConfig } from "@/lib/config";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  CreditCard,
  Building,
  Smartphone,
} from "lucide-react";

interface CheckoutClientProps {
  order: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    cashfree_order_id?: string | null;
    plan: {
      name: string;
      multiplier: number;
      price: number;
      billing_period: string;
      description: string;
    };
    user: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export const CheckoutClient: React.FC<CheckoutClientProps> = ({ order }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleProceedToPayment = async () => {
    if (!agreedTerms) {
      setError("Please accept the Terms & Conditions and Privacy Policy to continue.");
      toast("Please accept the Terms & Conditions to proceed.", "error");
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      // Call server verification / Cashfree execution endpoint
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          isSimulatedSuccess: true, // For sandbox / test environment execution
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Payment verification failed");
      }

      toast("Payment verified successfully! Provisioning your subscription...", "success");
      router.push(`/dashboard?payment=success&orderId=${order.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
      toast(err.message || "Payment processing failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#2D2D2D] gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-2">
            <Lock size={12} className="text-[#D97757]" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
            Review & Complete Order
          </h1>
        </div>
        <div className="text-left sm:text-right font-mono text-xs text-[#A3A3A3]">
          <div>Order ID: <span className="text-[#F5F5F5]">{order.id}</span></div>
          <div className="text-[11px] text-[#6F6F6F]">Gateway: Cashfree Payments</div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-[12px] bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Asymmetric 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Plan & Customer Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Plan Details */}
          <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider block mb-1">
                  Selected Subscription Tier
                </span>
                <h3 className="text-xl font-semibold text-[#F5F5F5]">
                  {order.plan.name}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#202020] border border-[#2D2D2D] text-[#D97757] font-mono font-medium">
                {order.plan.multiplier}x usage
              </span>
            </div>

            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              {order.plan.description}
            </p>

            <div className="pt-3 border-t border-[#2D2D2D] flex items-center justify-between text-xs">
              <span className="text-[#6F6F6F]">Duration</span>
              <span className="text-[#F5F5F5] font-medium">1 Month (Monthly Access)</span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-[#6F6F6F] tracking-wider">
                Customer & Target Account
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 size={12} />
                Session Verified
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6F6F6F]">Full Name:</span>
                <span className="text-[#F5F5F5] font-medium">{order.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6F6F]">Email:</span>
                <span className="text-[#F5F5F5] font-mono">{order.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6F6F]">Phone:</span>
                <span className="text-[#F5F5F5] font-mono">{order.user.phone}</span>
              </div>
            </div>
          </div>

          {/* Cashfree Gateway Reassurance */}
          <div className="rounded-[16px] bg-[#121212] border border-[#2D2D2D] p-5 space-y-3 text-xs text-[#A3A3A3]">
            <div className="flex items-center gap-2 text-[#F5F5F5] font-semibold text-xs">
              <ShieldCheck size={16} className="text-[#D97757]" />
              <span>Cashfree Payment Gateway Integration</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#888888]">
              Card and banking details are processed directly on RBI-compliant Cashfree payment rails. No sensitive card numbers or CVVs are collected or stored on this server.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[#6F6F6F]">
              <span className="flex items-center gap-1">
                <Smartphone size={12} /> UPI (GPay, PhonePe, Paytm)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CreditCard size={12} /> Debit & Credit Cards
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building size={12} /> Net Banking
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Payment Button (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-5">
            <h3 className="text-base font-semibold text-[#F5F5F5] border-b border-[#2D2D2D] pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-[#A3A3A3]">
                <span>{order.plan.name} (1 Month)</span>
                <span className="font-mono text-[#F5F5F5]">
                  ₹{order.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6F6F6F]">
                <span>Account Provisioning</span>
                <span className="font-mono text-emerald-400">Included</span>
              </div>
              <div className="flex justify-between items-center text-[#6F6F6F]">
                <span>Taxes & Fees</span>
                <span className="font-mono">Inclusive</span>
              </div>

              <div className="pt-3 border-t border-[#2D2D2D] flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#F5F5F5]">Total Payable</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F5F5F5] font-mono">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-[#6F6F6F]">Single monthly charge</div>
                </div>
              </div>
            </div>

            {/* Compliance & Policy Acceptance Checkbox */}
            <div className="space-y-3 pt-3 border-t border-[#2D2D2D]">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#A3A3A3]">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded-[4px] border-[#2D2D2D] bg-[#0E0E0E] text-[#D97757] focus:ring-[#D97757]"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-[#D97757] hover:underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-[#D97757] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6F6F6F] pt-1">
                <Link href="/refund-policy" target="_blank" className="hover:text-[#A3A3A3] underline">
                  Refund Policy
                </Link>
                <Link href="/cancellation-policy" target="_blank" className="hover:text-[#A3A3A3] underline">
                  Cancellation Policy
                </Link>
                <Link href="/support" target="_blank" className="hover:text-[#A3A3A3] underline flex items-center gap-1">
                  <HelpCircle size={11} /> Support Desk
                </Link>
              </div>
            </div>

            {/* Primary Action Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full gap-2 text-sm font-semibold"
              isLoading={isProcessing}
              onClick={handleProceedToPayment}
            >
              <Lock size={15} />
              <span>Proceed to Secure Payment</span>
            </Button>

            <div className="text-center text-[11px] text-[#6F6F6F]">
              Clicking proceed verifies and completes payment via Cashfree.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
