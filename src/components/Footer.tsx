import React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Sparkles, Mail, MessageSquare } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0E0E0E] border-t border-[#2D2D2D] text-[#A3A3A3] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Brand & Tagline */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-[6px] bg-[#D97757] flex items-center justify-center text-white font-bold text-xs">
                <Sparkles size={14} />
              </div>
              <span className="font-semibold text-sm text-[#F5F5F5]">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-xs text-[#F5F5F5] font-medium">
              Claude-powered API access
            </p>
            <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-md">
              Managed Claude-powered API access with dedicated capacity allocations. Fast delivery via Email or WhatsApp.
            </p>
            <div className="p-3 rounded-[10px] bg-[#151515] border border-[#2D2D2D] text-[11px] text-[#888888] leading-normal max-w-md">
              {siteConfig.disclaimer}
            </div>
          </div>

          {/* Support */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider font-mono">
              Support
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <MessageSquare size={13} className="text-[#D97757]" />
                <span>WhatsApp:</span>
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#F5F5F5] font-mono hover:underline"
                >
                  {siteConfig.whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-[#D97757]" />
                <span>Email:</span>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-[#F5F5F5] font-mono hover:underline"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>
          </div>

          {/* Legal / Policy Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider font-mono">
              Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-[#F5F5F5] transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#F5F5F5] transition-colors">
                  Privacy
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
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#2D2D2D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F6F6F]">
          <div>
            &copy; {new Date().getFullYear()} {siteConfig.name}. Claude-powered API access.
          </div>
          <div className="font-mono text-[11px]">
            Support: {siteConfig.email} • {siteConfig.whatsapp}
          </div>
        </div>
      </div>
    </footer>
  );
};
