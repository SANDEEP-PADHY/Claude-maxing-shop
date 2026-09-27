import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { SupportForm } from "@/components/SupportForm";
import { Mail, Phone, MapPin, Clock, Shield } from "lucide-react";

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-4">
            <Mail size={12} className="text-[#D97757]" />
            <span>Direct Merchant Communications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-3">
            Contact Us
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
            Reach out directly to our merchant operations and customer service team. We are here to assist with billing, provisioning, and general inquiries.
          </p>
        </div>

        {/* Official Merchant Details Card */}
        <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-semibold text-[#F5F5F5] pb-3 border-b border-[#2D2D2D]">
            Registered Merchant Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block">
                Operating Business Entity
              </span>
              <div className="text-sm font-semibold text-[#F5F5F5]">
                {siteConfig.name}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <MapPin size={12} /> Office Location / Address
              </span>
              <div className="text-sm text-[#A3A3A3]">{siteConfig.address}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <Mail size={12} /> Official Support Email
              </span>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-sm font-mono text-[#D97757] hover:underline"
              >
                {siteConfig.email}
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <Phone size={12} /> Customer Helpline
              </span>
              <a
                href={`tel:${siteConfig.phone}`}
                className="text-sm font-mono text-[#F5F5F5] hover:text-[#D97757]"
              >
                {siteConfig.phone}
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block flex items-center gap-1">
                <Clock size={12} /> Operating Hours
              </span>
              <div className="text-sm text-[#A3A3A3]">
                Monday – Saturday: 10:00 AM – 7:00 PM IST
              </div>
            </div>

            {siteConfig.gstin && (
              <div className="space-y-1">
                <span className="text-[#6F6F6F] font-mono text-[11px] uppercase block">
                  Tax Registration (GSTIN)
                </span>
                <div className="text-sm font-mono text-[#F5F5F5]">{siteConfig.gstin}</div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#F5F5F5]">
            Send a Direct Message
          </h2>
          <SupportForm initialEmail={user?.email || ""} />
        </div>
      </div>
    </AppShell>
  );
}
