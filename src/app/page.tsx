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
  Zap,
  CreditCard,
  UserCheck,
  ChevronDown,
  Layers,
  Terminal,
  Activity,
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
              Claude subscriptions
            </span>
            <span className="text-[#3D3D3D]">/</span>
            <span className="text-xs text-[#F5F5F5] font-mono">Monthly Access</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F5F5F5] max-w-3xl leading-[1.12] mb-6">
            More room to think, build and create.
          </h1>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-base md:text-lg text-[#A3A3A3] max-w-2xl font-normal leading-relaxed mb-10">
            Choose the Claude plan that fits your workload. Simple monthly access,
            secure checkout and account-based order management.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-16">
            <Link href="#plans" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                <span>View plans</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                How it works
              </Button>
            </Link>
          </div>

          {/* Stylized Abstract Product Preview Frame (Reference layout language) */}
          <div className="w-full max-w-5xl rounded-[20px] bg-[#151515] border border-[#2D2D2D] p-3 sm:p-5 shadow-2xl relative overflow-hidden text-left">
            {/* Window Top Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D2D2D]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D2D2D]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D2D2D]" />
                <span className="ml-2 text-xs font-mono text-[#6F6F6F]">
                  claude-access-session // telemetry
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#202020] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Cluster: Authorized Node
                </span>
              </div>
            </div>

            {/* Asymmetric Modular Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Primary Panel (Col 7) */}
              <div className="md:col-span-7 bg-[#202020] rounded-[14px] p-5 border border-[#2D2D2D] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs uppercase tracking-wider font-mono text-[#6F6F6F]">
                      Usage Tier Allocation
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D97757]/15 text-[#D97757] font-medium font-mono border border-[#D97757]/30">
                      High-Capacity Access
                    </span>
                  </div>
                  <div className="text-xl font-semibold tracking-tight text-[#F5F5F5] mb-1">
                    Continuous Thread Capacity
                  </div>
                  <div className="text-xs text-[#A3A3A3] mb-6 font-mono">
                    Expanded message quotas • Extended multi-file context sessions
                  </div>

                  {/* Allocation Status Indicator */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#A3A3A3]">Dedicated Throughput</span>
                      <span className="text-[#F5F5F5] font-semibold">Active & Stable</span>
                    </div>
                    <div className="w-full h-2 bg-[#0B0B0B] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#D97757] w-full rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#2D2D2D]">
                  <div>
                    <div className="text-[11px] text-[#6F6F6F] font-mono">Billing</div>
                    <div className="text-xs sm:text-sm font-semibold text-[#F5F5F5] font-mono mt-0.5">
                      Monthly INR
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6F6F6F] font-mono">Gateway</div>
                    <div className="text-xs sm:text-sm font-semibold text-[#F5F5F5] font-mono mt-0.5">
                      Cashfree PG
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6F6F6F] font-mono">Sync</div>
                    <div className="text-xs sm:text-sm font-semibold text-emerald-400 font-mono mt-0.5">
                      Direct Account
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Asymmetric Panel (Col 5) */}
              <div className="md:col-span-5 bg-[#202020] rounded-[14px] p-5 border border-[#2D2D2D] flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-mono text-[#6F6F6F] mb-4">
                    Available Multipliers
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-[10px] bg-[#151515] border border-[#2D2D2D] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-[#F5F5F5]">
                          Claude Max 5x
                        </div>
                        <div className="text-[11px] text-[#6F6F6F]">
                          ₹999 / month • 5x usage
                        </div>
                      </div>
                      <span className="text-xs font-mono text-[#A3A3A3]">Tier 01</span>
                    </div>

                    <div className="p-3 rounded-[10px] bg-[#151515] border border-[#D97757]/40 flex items-center justify-between relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D97757]" />
                      <div className="pl-2">
                        <div className="text-xs font-semibold text-[#F5F5F5]">
                          Claude Max 20x
                        </div>
                        <div className="text-[11px] text-[#D97757]">
                          ₹1,999 / month • 20x usage
                        </div>
                      </div>
                      <span className="text-xs font-mono text-[#D97757] font-semibold">
                        Tier 02
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 text-[11px] text-[#6F6F6F] font-mono flex items-center justify-between border-t border-[#2D2D2D] mt-4">
                  <span>Encrypted Checkout</span>
                  <span className="text-[#A3A3A3]">Zero card storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6" id="plans">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-xs font-mono text-[#A3A3A3] mb-4">
            <span>Simple Monthly Billing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-4">
            Choose your plan
          </h2>
          <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
            Predictable monthly billing with expanded capacity for developers,
            researchers, and creators.
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
              A transparent, 3-step checkout and account-based fulfillment workflow.
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
              <h3 className="text-lg font-semibold text-[#F5F5F5]">Choose your plan</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                Select Claude Max 5x or Claude Max 20x based on your daily prompt volume and project intensity.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-[16px] bg-[#151515] border border-[#2D2D2D] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-[#202020] border border-[#2D2D2D] flex items-center justify-center text-[#D97757]">
                  <CreditCard size={18} />
                </div>
                <span className="font-mono text-xs text-[#6F6F6F]">STEP 02</span>
              </div>
              <h3 className="text-lg font-semibold text-[#F5F5F5]">Cashfree Checkout</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                Complete payment securely using Cashfree Payment Gateway. Supports UPI (GPay, PhonePe, Paytm), Net Banking, and Cards.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-[16px] bg-[#151515] border border-[#2D2D2D] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-[#202020] border border-[#2D2D2D] flex items-center justify-center text-[#D97757]">
                  <UserCheck size={18} />
                </div>
                <span className="font-mono text-xs text-[#6F6F6F]">STEP 03</span>
              </div>
              <h3 className="text-lg font-semibold text-[#F5F5F5]">Account Activation</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                Payment is verified server-side. Your authorized subscription is provisioned directly to your account with invoice history.
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
            Clear answers about access tiers, payment security, and fulfillment.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
            <h4 className="text-sm sm:text-base font-semibold text-[#F5F5F5] mb-2">
              What is the difference between Claude Max 5x and 20x?
            </h4>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              Claude Max 5x (₹999/mo) provides substantially expanded capacity over baseline limits for regular daily workflows. Claude Max 20x (₹1,999/mo) provides maximum throughput allocation for high-intensity engineering, research, and data processing.
            </p>
          </div>

          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
            <h4 className="text-sm sm:text-base font-semibold text-[#F5F5F5] mb-2">
              What payment methods are supported?
            </h4>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              All transactions are processed through Cashfree Payment Gateway in Indian Rupees (INR). You can pay via UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking across 50+ Indian banks, or Credit & Debit Cards (Visa, MasterCard, RuPay).
            </p>
          </div>

          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
            <h4 className="text-sm sm:text-base font-semibold text-[#F5F5F5] mb-2">
              How does account fulfillment work?
            </h4>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              Upon verified payment confirmation, access is authorized to your verified customer email. You can monitor subscription status, view renewal dates, and download official receipts directly in your customer dashboard.
            </p>
          </div>

          <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
            <h4 className="text-sm sm:text-base font-semibold text-[#F5F5F5] mb-2">
              What is your relationship to Anthropic?
            </h4>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              {siteConfig.disclaimer} We provide authorized subscription provisioning, customer support, and localized INR payment processing.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
