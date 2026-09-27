import React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { ArrowLeft, Shield } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  subtitle,
  lastUpdated = "27 September 2026",
  children,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5] mb-8 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Storefront</span>
      </Link>

      <div className="border-b border-[#2D2D2D] pb-8 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-4">
          <Shield size={12} className="text-[#D97757]" />
          <span>Compliance & Legal Terms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-3">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed max-w-2xl">
          {subtitle}
        </p>
        <div className="text-xs text-[#6F6F6F] font-mono mt-4">
          Last revised: {lastUpdated} • {siteConfig.name}
        </div>
      </div>

      {/* Main Content */}
      <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-[#A3A3A3] leading-relaxed space-y-6">
        {children}
      </div>

      {/* Merchant Notice Footer Box */}
      <div className="mt-16 p-6 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-2">
        <h4 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider font-mono">
          Merchant Identification & Registered Contact
        </h4>
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          Operating Entity: <strong className="text-[#F5F5F5]">{siteConfig.name}</strong>
          <br />
          Contact Email: <a href={`mailto:${siteConfig.email}`} className="text-[#D97757] hover:underline">{siteConfig.email}</a>
          <br />
          Support Phone: <a href={`tel:${siteConfig.phone}`} className="text-[#D97757] hover:underline">{siteConfig.phone}</a>
          <br />
          Jurisdiction / Address: {siteConfig.address}
        </p>
        <p className="text-[11px] text-[#6F6F6F] pt-2 border-t border-[#2D2D2D]">
          {siteConfig.disclaimer}
        </p>
      </div>
    </div>
  );
};
