import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { SupportForm } from "@/components/SupportForm";
import { Mail, MessageSquare } from "lucide-react";

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-4">
            <Mail size={12} className="text-[#D97757]" />
            <span>Direct Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-3">
            Contact
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
            Get in touch with our team for managed Claude-powered API access support, billing queries, and activation assistance.
          </p>
        </div>

        {/* Business & Support Details Card */}
        <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-semibold text-[#F5F5F5] pb-3 border-b border-[#2D2D2D]">
            Support & Business Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block">
                Business
              </span>
              <div className="text-base font-semibold text-[#F5F5F5]">
                {siteConfig.name}
              </div>
              <div className="text-[11px] text-[#A3A3A3]">
                Claude-powered API access
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <MessageSquare size={12} className="text-[#D97757]" /> WhatsApp Support
              </span>
              <a
                href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-base font-mono text-[#F5F5F5] hover:text-[#D97757]"
              >
                {siteConfig.whatsapp}
              </a>
              <div className="text-[10px] text-[#6F6F6F]">
                Fast assistance & access delivery notifications
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <Mail size={12} className="text-[#D97757]" /> Support Email
              </span>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-base font-mono text-[#D97757] hover:underline"
              >
                {siteConfig.email}
              </a>
              <div className="text-[10px] text-[#6F6F6F]">
                Order queries & billing support
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block">
                Jurisdiction
              </span>
              <div className="text-sm text-[#A3A3A3]">
                {siteConfig.address || "[India - Registered Region]"}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Message Form */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#F5F5F5]">
            Send a Message
          </h2>
          <SupportForm initialEmail={user?.email || ""} />
        </div>
      </div>
    </AppShell>
  );
}
