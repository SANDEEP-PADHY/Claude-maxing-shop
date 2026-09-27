import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { PricingCard } from "@/components/PricingCard";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Shield,
  CreditCard,
  UserCheck,
  Layers,
  Send,
  Lock,
} from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[#2D2D2D] bg-grid-subtle overflow-hidden">
        {/* Ambient Top Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151515] border border-[#2D2D2D] mb-8 animate-in fade-in duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] animate-pulse" />
            <span className="text-xs font-mono text-[#A3A3A3] tracking-wide uppercase">
              {siteConfig.name}
            </span>
            <span className="text-[#3D3D3D]">/</span>
            <span className="text-xs text-[#F5F5F5] font-mono">Claude-powered access</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F5F5F5] max-w-3xl leading-[1.12] mb-6">
            Managed Claude-powered API access.
          </h1>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-base md:text-lg text-[#A3A3A3] max-w-2xl font-normal leading-relaxed mb-10">
            Dedicated monthly capacity allocations for serious builders and professionals.
            Simple INR checkout via Cashfree, and delivery via Email or WhatsApp.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-16">
            <Link href="#plans" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                <span>View access plans</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                How it works
              </Button>
            </Link>
          </div>

          {/* Stylized Abstract Product Preview Frame */}
          <div className="w-full max-w-5xl rounded-[20px] bg-[#151515] border border-[#2D2D2D] p-3 sm:p-5 shadow-2xl relative overflow-hidden text-left">
            {/* Window Top Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D2D2D]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D2D2D]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D2D2D]" />
                <span className="ml-2 text-xs font-mono text-[#6F6F6F]">
                  managed-api-access // status
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#202020] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Capacity: Active Allocation
                </span>
              </div>
            </div>

            {/* Asymmetric Modular Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Primary Panel */}
              <div className="md:col-span-7 bg-[#202020] rounded-[14px] p-5 border border-[#2D2D2D] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs uppercase tracking-wider font-mono text-[#6F6F6F]">
                      Usage Tier Allocation
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D97757]/15 text-[#D97757] font-medium font-mono border border-[#D97757]/30">
                      Claude-powered access
                    </span>
                  </div>
                  <div className="text-xl font-semibold tracking-tight text-[#F5F5F5] mb-1">
                    Continuous High Throughput
                  </div>
                  <div className="text-xs text-[#A3A3A3] mb-6 font-mono">
                    Expanded message quotas • Extended multi-file context sessions
                  </div>

                  {/* Allocation Status Indicator */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#A3A3A3]">Dedicated Throughput</span>
                      <span className="text-[#F5F5F5] font-semibold">Allocated & Ready</span>
                    </div>
                    <div className="w-full h-2 bg-[#0B0B0B] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#D97757] w-full rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#2D2D2D]">
                  <div>
                    <span className="text-[10px] font-mono text-[#6F6F6F] block uppercase">
                      Availability
                    </span>
                    <span className="text-xs font-semibold text-[#F5F5F5] font-mono">
                      99.9%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#6F6F6F] block uppercase">
                      Term
                    </span>
                    <span className="text-xs font-semibold text-[#F5F5F5] font-mono">
                      30 Days
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#6F6F6F] block uppercase">
                      Delivery
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      Email / WhatsApp
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Bento Cards */}
              <div className="md:col-span-5 grid grid-cols-1 gap-4">
                <div className="bg-[#202020] rounded-[14px] p-5 border border-[#2D2D2D] space-y-2">
                  <div className="text-xs uppercase tracking-wider font-mono text-[#6F6F6F]">
                    256-Bit Protection
                  </div>
                  <div className="text-sm font-semibold text-[#F5F5F5]">
                    Encrypted Key Storage
                  </div>
                  <p className="text-xs text-[#A3A3A3] leading-relaxed">
                    Keys are stored encrypted at rest with AES-256-GCM. Unmasked access requires explicit confirmation.
                  </p>
                </div>

                <div className="bg-[#202020] rounded-[14px] p-5 border border-[#2D2D2D] space-y-2">
                  <div className="text-xs uppercase tracking-wider font-mono text-[#6F6F6F]">
                    Verified Fulfillment
                  </div>
                  <div className="text-sm font-semibold text-[#F5F5F5]">
                    Strict Server Verification
                  </div>
                  <p className="text-xs text-[#A3A3A3] leading-relaxed">
                    Keys are only assigned after verified Cashfree payment confirmation, preventing phantom allocations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6" id="plans">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-4">
            Access Plans
          </h2>
          <p className="text-sm sm:text-base text-[#A3A3A3]">
            Choose the capacity that fits your workflow. Simple monthly pricing with zero surprise charges.
          </p>
        </div>

        {/* Pricing Cards Grid (Exactly two cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {siteConfig.plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="py-20 md:py-28 border-t border-[#2D2D2D] bg-[#0E0E0E]"
        id="how-it-works"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-4">
              How it works
            </h2>
            <p className="text-sm sm:text-base text-[#A3A3A3]">
              Simple, transparent purchase and delivery workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="p-6 rounded-[16px] bg-[#151515] border border-[#2D2D2D] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-[#202020] border border-[#2D2D2D] flex items-center justify-center text-[#D97757]">
                  <Layers size={18} />
                </div>
                <span className="font-mono text-xs text-[#6F6F6F]">STEP 01</span>
              </div>
              <h3 className="text-lg font-semibold text-[#F5F5F5]">Select your access plan</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                Choose 5X Access (₹999/month) or 20X Access (₹1,999/month) depending on your usage requirements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-[16px] bg-[#151515] border border-[#2D2D2D] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-[#202020] border border-[#2D2D2D] flex items-center justify-center text-[#D97757]">
                  <Send size={18} />
                </div>
                <span className="font-mono text-xs text-[#6F6F6F]">STEP 02</span>
              </div>
              <h3 className="text-lg font-semibold text-[#F5F5F5]">Select delivery method</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                Choose how you want to receive your access: direct automated Email or verified WhatsApp delivery.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-[16px] bg-[#151515] border border-[#2D2D2D] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-[#202020] border border-[#2D2D2D] flex items-center justify-center text-[#D97757]">
                  <Lock size={18} />
                </div>
                <span className="font-mono text-xs text-[#6F6F6F]">STEP 03</span>
              </div>
              <h3 className="text-lg font-semibold text-[#F5F5F5]">Pay & receive access</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                Complete payment via Cashfree. Once verified server-side, your 30-day access is activated and delivered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 max-w-4xl mx-auto px-4 sm:px-6" id="faq">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#A3A3A3]">
            Clear answers about access tiers, delivery methods, and policy guidelines.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
            <h4 className="text-sm sm:text-base font-semibold text-[#F5F5F5] mb-2">
              What is the difference between 5X Access and 20X Access?
            </h4>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              5X Access (₹999/month) provides 5X capacity allocation for regular daily workflows and coding tasks. 20X Access (₹1,999/month) provides 20X capacity allocation for heavier daily use and demanding professional workflows.
            </p>
          </div>

          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
            <h4 className="text-sm sm:text-base font-semibold text-[#F5F5F5] mb-2">
              How will I receive my access?
            </h4>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              During checkout, you choose your preferred delivery method: Email (dispatched automatically to your verified account email) or WhatsApp (delivered to your account phone number). You can also view and copy your access key directly in your customer dashboard under Access Details.
            </p>
          </div>

          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
            <h4 className="text-sm sm:text-base font-semibold text-[#F5F5F5] mb-2">
              What is the cancellation and refund policy?
            </h4>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              {siteConfig.refundPolicySummary}
            </p>
          </div>

          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
            <h4 className="text-sm sm:text-base font-semibold text-[#F5F5F5] mb-2">
              What payment methods are supported?
            </h4>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              All transactions are processed through Cashfree Payment Gateway in Indian Rupees (INR). You can pay via UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking across 50+ Indian banks, or Credit & Debit Cards.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
