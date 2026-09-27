import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { SupportForm } from "@/components/SupportForm";
import { Mail, Phone, Clock, ShieldCheck, HelpCircle } from "lucide-react";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; orderId?: string }>;
}) {
  const user = await getCurrentUser();
  const { category, orderId } = await searchParams;

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-4">
            <HelpCircle size={12} className="text-[#D97757]" />
            <span>Dedicated Customer Support Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-3">
            How can we help you?
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
            Have questions about billing, Cashfree payments, or account activation? Submit a ticket below or reach out via our direct contact channels.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-[12px] bg-[#151515] border border-[#2D2D2D] space-y-1.5 text-xs">
            <div className="text-[#6F6F6F] font-mono text-[11px] flex items-center gap-1.5">
              <Mail size={13} className="text-[#D97757]" />
              <span>EMAIL SUPPORT</span>
            </div>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-[#F5F5F5] font-mono hover:text-[#D97757] block truncate"
            >
              {siteConfig.email}
            </a>
            <div className="text-[11px] text-[#6F6F6F]">Average reply: 2 hours</div>
          </div>

          <div className="p-4 rounded-[12px] bg-[#151515] border border-[#2D2D2D] space-y-1.5 text-xs">
            <div className="text-[#6F6F6F] font-mono text-[11px] flex items-center gap-1.5">
              <Phone size={13} className="text-[#D97757]" />
              <span>PHONE ASSISTANCE</span>
            </div>
            <a
              href={`tel:${siteConfig.phone}`}
              className="text-[#F5F5F5] font-mono hover:text-[#D97757] block truncate"
            >
              {siteConfig.phone}
            </a>
            <div className="text-[11px] text-[#6F6F6F]">Mon–Sat: 10 AM – 7 PM IST</div>
          </div>

          <div className="p-4 rounded-[12px] bg-[#151515] border border-[#2D2D2D] space-y-1.5 text-xs">
            <div className="text-[#6F6F6F] font-mono text-[11px] flex items-center gap-1.5">
              <Clock size={13} className="text-[#D97757]" />
              <span>ACTIVATION SLA</span>
            </div>
            <div className="text-[#F5F5F5] font-medium">Automatic / Immediate</div>
            <div className="text-[11px] text-[#6F6F6F]">Upon Cashfree verification</div>
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#F5F5F5]">
            Submit a Request
          </h2>
          <SupportForm
            initialEmail={user?.email || ""}
            initialOrderId={orderId || ""}
          />
        </div>
      </div>
    </AppShell>
  );
}
