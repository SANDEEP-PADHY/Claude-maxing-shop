import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { SupportForm } from "@/components/SupportForm";
import { Mail, MessageSquare, Phone, MapPin, Clock } from "lucide-react";

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-4">
            <Mail size={12} className="text-[#D97757]" />
            <span>Contact Us</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-3">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
            For any queries related to orders, payments, fulfillment, or account access, please reach out to us through any of the channels below.
          </p>
        </div>

        {/* Business Details Card */}
        <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-semibold text-[#F5F5F5] pb-3 border-b border-[#2D2D2D]">
            Business Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Business Name */}
            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block">
                Business Name
              </span>
              <div className="text-base font-semibold text-[#F5F5F5]">
                {siteConfig.name}
              </div>
              <div className="text-[11px] text-[#A3A3A3]">
                Claude-powered API access
              </div>
            </div>

            {/* Registered Email */}
            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <Mail size={12} className="text-[#D97757]" /> Registered Email
              </span>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-sm font-mono text-[#D97757] hover:underline block"
              >
                {siteConfig.email}
              </a>
              <a
                href={`mailto:${siteConfig.emailSecondary}`}
                className="text-[11px] font-mono text-[#A3A3A3] hover:text-[#D97757] block"
              >
                {siteConfig.emailSecondary}
              </a>
            </div>

            {/* Phone / WhatsApp */}
            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <Phone size={12} className="text-[#D97757]" /> Phone / WhatsApp
              </span>
              <a
                href={`tel:${siteConfig.phone}`}
                className="text-sm font-mono text-[#F5F5F5] hover:text-[#D97757]"
              >
                {siteConfig.phone}
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#A3A3A3] hover:text-[#D97757] block"
              >
                WhatsApp: {siteConfig.whatsapp}
              </a>
            </div>

            {/* Business Hours */}
            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <Clock size={12} className="text-[#D97757]" /> Business Hours
              </span>
              <div className="text-sm text-[#A3A3A3]">
                Monday – Saturday
              </div>
              <div className="text-[11px] text-[#A3A3A3]">
                10:00 AM – 7:00 PM IST
              </div>
            </div>

            {/* Jurisdiction */}
            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <MapPin size={12} className="text-[#D97757]" /> Jurisdiction
              </span>
              <div className="text-sm text-[#A3A3A3]">
                {siteConfig.address || "India"}
              </div>
            </div>

            {/* Payment Processor */}
            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block">
                Payment Processor
              </span>
              <div className="text-sm text-[#A3A3A3]">
                Cashfree Payment Gateway
              </div>
              <div className="text-[11px] text-[#A3A3A3]">
                RBI-regulated payment processing
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
