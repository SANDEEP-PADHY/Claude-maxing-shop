import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default async function RefundPolicyPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <LegalPageLayout
        title="Refund Policy"
        subtitle="Transparent terms regarding digital access allocations, fulfillment safeguards, and refund eligibility."
      >
        {/* Core Policy Highlight Card */}
        <div className="p-4 rounded-[12px] bg-[#151515] border border-[#D97757]/40 text-[#F5F5F5] text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#D97757]">
            <AlertCircle size={16} />
            <span>Policy Statement</span>
          </div>
          <p className="font-medium">
            All purchases are non-refundable and non-cancellable after successful payment, except where a refund is required by applicable law or where a payment is charged but the service is not delivered according to the merchant&apos;s stated fulfilment terms.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">1. Overview</h2>
          <p>
            {siteConfig.name} provides managed Claude-powered API access allocated for 30-day terms. Because access credentials grant immediate capacity upon server-side payment verification, purchases are non-refundable once successfully delivered.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">2. Exceptions and Refund Eligibility</h2>
          <p>
            A refund may be issued under the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-[#A3A3A3]">
            <li>
              <strong className="text-[#F5F5F5]">Non-Delivery:</strong> If a payment is successfully charged via Cashfree, but the access key is not delivered according to our stated fulfillment terms (either automated via email or manual on WhatsApp) and cannot be resolved by our support team within 24 hours.
            </li>
            <li>
              <strong className="text-[#F5F5F5]">Duplicate Billing:</strong> If technical latency causes multiple charges for the same order, duplicate transactions are refunded immediately.
            </li>
            <li>
              <strong className="text-[#F5F5F5]">Applicable Legal Rights:</strong> Where a refund is explicitly mandated by applicable statutory laws or regulations.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">3. Non-Refundable Situations</h2>
          <p>
            Except where required by law or in the case of unfulfilled access:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A3A3A3]">
            <li>Completed orders where the access key has been generated, delivered, or viewed cannot be refunded.</li>
            <li>Change of mind after payment has been completed.</li>
            <li>Suspension due to fair usage or automated scraping violations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">4. Refund Processing Timeline</h2>
          <p>
            When a refund is approved under our stated fulfillment terms:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A3A3A3]">
            <li>Refunds are initiated directly via Cashfree to the customer&apos;s original payment method (UPI, bank account, or card).</li>
            <li>Depending on your financial institution, funds generally reflect within <strong>5 to 7 business days</strong>.</li>
            <li>A Cashfree refund reference ID will be issued for tracking.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-2">
          <h2 className="text-base font-semibold text-[#F5F5F5]">5. Contact Support</h2>
          <p>
            For questions regarding fulfillment status or order charges, contact our team:
          </p>
          <div className="text-xs font-mono text-[#A3A3A3] space-y-1">
            <div>WhatsApp: {siteConfig.whatsapp}</div>
            <div>Email: {siteConfig.email}</div>
            <div>Email: {siteConfig.emailSecondary}</div>
          </div>
          <div className="pt-2">
            <Link href="/contact">
              <Button variant="outline" size="sm">
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </section>
      </LegalPageLayout>
    </AppShell>
  );
}
