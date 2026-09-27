"use client";

import React from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { Check } from "lucide-react";

export interface PlanItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billingPeriod: string;
  multiplier: string;
  description: string;
  features: string[];
  cta: string;
}

interface PricingCardProps {
  plan: PlanItem;
  onSelect?: (planId: string) => void;
  isLoading?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  onSelect,
  isLoading,
}) => {
  return (
    <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 flex flex-col justify-between hover:border-[#3D3D3D] transition-all duration-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-[#F5F5F5] tracking-tight">
            {plan.name}
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#202020] border border-[#2D2D2D] text-[#A3A3A3] font-mono">
            {plan.multiplier} tier
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#A3A3A3] mb-6 min-h-[40px] leading-relaxed">
          {plan.description}
        </p>

        <div className="flex items-baseline gap-1.5 mb-8 pb-6 border-b border-[#2D2D2D]">
          <span className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight">
            ₹{plan.price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-[#6F6F6F] font-medium">
            / {plan.billingPeriod}
          </span>
        </div>

        {/* Feature List */}
        <div className="space-y-3 mb-8">
          <div className="text-[11px] font-mono uppercase text-[#6F6F6F] tracking-wider mb-2">
            Included in this tier:
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-[#A3A3A3]">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#202020] border border-[#2D2D2D] flex items-center justify-center text-[#D97757] shrink-0 mt-0.5">
                  <Check size={11} strokeWidth={2.5} />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-2">
        {onSelect ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            onClick={() => onSelect(plan.id)}
          >
            {plan.cta}
          </Button>
        ) : (
          <Link href={`/checkout/init?plan=${plan.slug}`} className="block w-full">
            <Button variant="primary" size="lg" className="w-full">
              {plan.cta}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
