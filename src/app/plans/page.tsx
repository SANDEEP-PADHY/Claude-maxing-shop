import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { PricingCard } from "@/components/PricingCard";

export default async function PlansPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-xs font-mono text-[#A3A3A3] mb-4">
            <span>Official Usage Multipliers</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] mb-4">
            Choose your plan
          </h1>
          <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
            Transparent pricing in INR. Predictable monthly access with dedicated throughput.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {siteConfig.plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Plan Comparison Matrix */}
        <div className="max-w-4xl mx-auto rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#2D2D2D] pb-4">
            <h3 className="text-lg font-semibold text-[#F5F5F5]">Plan Specifications</h3>
            <p className="text-xs text-[#A3A3A3]">
              Side-by-side comparison of plan tiers and included features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2D2D2D] text-[#A3A3A3] font-mono">
                  <th className="py-3 px-4 font-medium">Feature</th>
                  <th className="py-3 px-4 font-medium">Claude Max 5x</th>
                  <th className="py-3 px-4 font-medium">Claude Max 20x</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
                <tr>
                  <td className="py-3.5 px-4 font-medium">Price</td>
                  <td className="py-3.5 px-4 font-mono">₹999 / month</td>
                  <td className="py-3.5 px-4 font-mono">₹1,999 / month</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Usage Multiplier</td>
                  <td className="py-3.5 px-4 font-mono text-[#D97757]">5x standard tier</td>
                  <td className="py-3.5 px-4 font-mono text-[#D97757]">20x heavy tier</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Billing Period</td>
                  <td className="py-3.5 px-4 text-[#A3A3A3]">Monthly</td>
                  <td className="py-3.5 px-4 text-[#A3A3A3]">Monthly</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Target Workflows</td>
                  <td className="py-3.5 px-4 text-[#A3A3A3]">Daily coding & analysis</td>
                  <td className="py-3.5 px-4 text-[#A3A3A3]">Continuous batch & heavy tasks</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Payment Gateway</td>
                  <td className="py-3.5 px-4 text-[#A3A3A3]">Cashfree PG (INR)</td>
                  <td className="py-3.5 px-4 text-[#A3A3A3]">Cashfree PG (INR)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Customer Support</td>
                  <td className="py-3.5 px-4 text-[#A3A3A3]">Included</td>
                  <td className="py-3.5 px-4 text-[#A3A3A3]">Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
