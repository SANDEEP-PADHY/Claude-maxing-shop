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
  CreditCard,
  Building,
  Smartphone,
  Mail,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

interface CheckoutClientProps {
  order: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    delivery_method?: string;
    delivery_recipient?: string | null;
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

  const mode: "sandbox" | "production" =
    process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox";

  const [deliveryMethod, setDeliveryMethod] = useState<"EMAIL" | "WHATSAPP">(
    (order.delivery_method as "EMAIL" | "WHATSAPP") || "EMAIL"
  );
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleDeliverySelect = async (method: "EMAIL" | "WHATSAPP") => {
    setDeliveryMethod(method);
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryMethod: method }),
      });
    } catch (e) {
      console.error("Failed to sync delivery method:", e);
    }
  };

  const handleProceedToPayment = async () => {
    if (!agreedTerms) {
      setError("Please accept the terms and refund policy before proceeding.");
      toast("Please accept the terms and refund policy to proceed.", "error");
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      if (mode === "production") {
        setError(
          "Payments are processed through Cashfree in production. Use the Cashfree Dashboard or customer portal to complete payment for this order."
        );
        toast(
          "Production mode: complete payment via Cashfree Dashboard or customer portal.",
          "error"
        );
        setIsProcessing(false);
        return;
      }

      // Call server verification / Cashfree execution endpoint with chosen deliveryMethod
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          deliveryMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Payment verification failed");
      }

      toast("Payment verified successfully! Access activated.", "success");
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
          <div className="text-[11px] text-[#6F6F6F]">Payment: Cashfree</div>
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
        {/* Left Column: Plan, Delivery, Customer Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Plan Details */}
          <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider block mb-1">
                  Selected Managed Access Tier
                </span>
                <h3 className="text-xl font-semibold text-[#F5F5F5]">
                  {order.plan.name}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#202020] border border-[#2D2D2D] text-[#D97757] font-mono font-medium">
                {order.plan.multiplier}X Access
              </span>
            </div>

            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              {order.plan.description}
            </p>

            <div className="pt-3 border-t border-[#2D2D2D] flex items-center justify-between text-xs">
              <span className="text-[#6F6F6F]">Duration</span>
              <span className="text-[#F5F5F5] font-medium">30 Days Managed Access</span>
            </div>
          </div>

          {/* REQUIRED Delivery Method Selection */}
          <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-[#D97757] tracking-wider font-semibold">
                  Required Selection
                </span>
                <span className="text-[10px] font-mono text-[#6F6F6F]">Step 1 of 2</span>
              </div>
              <h3 className="text-base font-semibold text-[#F5F5F5]">
                How would you like to receive your access?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Email */}
              <button
                type="button"
                onClick={() => handleDeliverySelect("EMAIL")}
                className={`p-4 rounded-[12px] border text-left transition-all flex flex-col justify-between ${
                  deliveryMethod === "EMAIL"
                    ? "border-[#D97757] bg-[#202020] text-[#F5F5F5] shadow-sm"
                    : "border-[#2D2D2D] bg-[#121212] text-[#A3A3A3] hover:border-[#404040]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-sm flex items-center gap-2">
                    <Mail size={16} className={deliveryMethod === "EMAIL" ? "text-[#D97757]" : "text-[#6F6F6F]"} />
                    Email
                  </span>
                  {deliveryMethod === "EMAIL" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97757]"></span>
                  )}
                </div>
                <div className="text-[11px] text-[#A3A3A3] truncate font-mono">
                  {order.user.email}
                </div>
                <div className="text-[10px] text-[#6F6F6F] mt-2 font-mono">
                  Automated delivery to email
                </div>
              </button>

              {/* Option 2: WhatsApp */}
              <button
                type="button"
                onClick={() => handleDeliverySelect("WHATSAPP")}
                className={`p-4 rounded-[12px] border text-left transition-all flex flex-col justify-between ${
                  deliveryMethod === "WHATSAPP"
                    ? "border-[#D97757] bg-[#202020] text-[#F5F5F5] shadow-sm"
                    : "border-[#2D2D2D] bg-[#121212] text-[#A3A3A3] hover:border-[#404040]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-sm flex items-center gap-2">
                    <MessageSquare size={16} className={deliveryMethod === "WHATSAPP" ? "text-[#D97757]" : "text-[#6F6F6F]"} />
                    WhatsApp
                  </span>
                  {deliveryMethod === "WHATSAPP" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97757]"></span>
                  )}
                </div>
                <div className="text-[11px] text-[#A3A3A3] truncate font-mono">
                  {order.user.phone}
                </div>
                <div className="text-[10px] text-[#6F6F6F] mt-2 font-mono">
                  Delivered on WhatsApp
                </div>
              </button>
            </div>

            {/* Recipient Details & Notices */}
            {deliveryMethod === "EMAIL" ? (
              <div className="p-3.5 rounded-[10px] bg-[#121212] border border-[#2D2D2D] text-xs text-[#A3A3A3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>Verified account email:</span>
                <span className="font-mono text-[#F5F5F5] font-medium">{order.user.email}</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-[10px] bg-[#121212] border border-[#2D2D2D] text-xs text-[#A3A3A3] space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>Account phone number:</span>
                  <span className="font-mono text-[#F5F5F5] font-medium">{order.user.phone}</span>
                </div>
                <div className="text-[11px] text-[#D97757] font-medium pt-1">
                  The access key will be delivered directly through WhatsApp to this number.
                </div>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-[#6F6F6F] tracking-wider">
                Account Details
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 size={12} />
                Logged In
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6F6F6F]">Name:</span>
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
              <span>Cashfree Payment Gateway</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#888888]">
              Card and UPI details are securely processed directly on Cashfree. No card numbers or banking secrets are collected or stored on our servers.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[#6F6F6F]">
              <span className="flex items-center gap-1">
                <Smartphone size={12} /> UPI (GPay, PhonePe, Paytm, BHIM)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CreditCard size={12} /> Cards
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building size={12} /> Net Banking
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary, Policy & Payment Button (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-5">
            <h3 className="text-base font-semibold text-[#F5F5F5] border-b border-[#2D2D2D] pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-[#A3A3A3]">
                <span>{order.plan.name} (30 Days)</span>
                <span className="font-mono text-[#F5F5F5]">
                  ₹{order.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6F6F6F]">
                <span>Delivery Method</span>
                <span className="font-mono text-[#F5F5F5]">
                  {deliveryMethod === "EMAIL" ? "Email Delivery" : "WhatsApp Delivery"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6F6F6F]">
                <span>Access Provisioning</span>
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

            {/* Refund & Cancellation Notice Card */}
            <div className="p-3.5 rounded-[10px] bg-[#121212] border border-[#2D2D2D] text-[11px] text-[#A3A3A3] leading-relaxed">
              <div className="font-semibold text-[#F5F5F5] mb-1">Refund & Cancellation Policy</div>
              {siteConfig.refundPolicySummary}
            </div>

            {/* Compliance & Policy Acceptance Checkbox */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#A3A3A3]">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded-[4px] border-[#2D2D2D] bg-[#0E0E0E] text-[#D97757] focus:ring-[#D97757]"
                />
                <span>
                  I understand and accept the{" "}
                  <Link href="/terms" target="_blank" className="text-[#D97757] hover:underline">
                    Terms
                  </Link>
                  ,{" "}
                  <Link href="/privacy" target="_blank" className="text-[#D97757] hover:underline">
                    Privacy Policy
                  </Link>
                  , and{" "}
                  <Link href="/refund-policy" target="_blank" className="text-[#D97757] hover:underline">
                    Refund Policy
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
                <Link href="/contact" target="_blank" className="hover:text-[#A3A3A3] underline flex items-center gap-1">
                  <HelpCircle size={11} /> Support
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
              <span>Proceed to Payment</span>
            </Button>

            <div className="text-center text-[11px] text-[#6F6F6F]">
              Server-side verification confirms payment before key allocation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
