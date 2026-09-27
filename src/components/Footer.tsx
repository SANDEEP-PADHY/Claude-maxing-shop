import React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Sparkles, Mail, Phone, MapPin, Shield } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0E0E0E] border-t border-[#2D2D2D] text-[#A3A3A3] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Relationship Disclosure */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-[6px] bg-[#D97757] flex items-center justify-center text-white font-bold text-xs">
                <Sparkles size={14} />
              </div>
              <span className="font-semibold text-sm text-[#F5F5F5]">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-md">
              Secure subscription management platform providing authorized Claude usage tiers.
              Built for predictable monthly allocation, account-based synchronization, and seamless Cashfree checkout.
            </p>
            <div className="p-3 rounded-[10px] bg-[#151515] border border-[#2D2D2D] text-[11px] text-[#888888] leading-normal max-w-md">
              <span className="text-[#A3A3A3] font-semibold block mb-0.5">
                Merchant Relationship Notice:
              </span>
              {siteConfig.disclaimer}
            </div>
          </div>

          {/* Col 2: Navigation & Plans */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider font-mono">
              Product & Store
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/plans" className="hover:text-[#F5F5F5] transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#F5F5F5] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#F5F5F5] transition-colors">
                  Account Dashboard
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#F5F5F5] transition-colors">
                  Order History & Invoices
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-[#F5F5F5] transition-colors">
                  Customer Support Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Legal Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider font-mono">
              Policies & Compliance
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-[#F5F5F5] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#F5F5F5] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#F5F5F5] transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="hover:text-[#F5F5F5] transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F5F5F5] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Merchant Contact Bar */}
        <div className="pt-6 border-t border-[#2D2D2D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#6F6F6F]">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <Mail size={13} className="text-[#A3A3A3]" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-[#A3A3A3]">
                {siteConfig.email}
              </a>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={13} className="text-[#A3A3A3]" />
              <a href={`tel:${siteConfig.phone}`} className="hover:text-[#A3A3A3]">
                {siteConfig.phone}
              </a>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#A3A3A3]" />
              <span>{siteConfig.address}</span>
            </span>
            {siteConfig.gstin && (
              <span className="font-mono text-[11px]">
                GSTIN: {siteConfig.gstin}
              </span>
            )}
          </div>
          <div className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
