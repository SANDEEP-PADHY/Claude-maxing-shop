import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default async function CancellationPolicyPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <LegalPageLayout
        title="Cancellation Policy"
        subtitle="Policy details regarding monthly access periods and order cancellations."
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
          <h2 className="text-base font-semibold text-[#F5F5F5]">1. Monthly Access Structure</h2>
          <p>
            {siteConfig.name} offers two monthly access plans: 5X Access (₹999/month) and 20X Access (₹1,999/month). Each purchase grants exactly 30 days of managed API access from the activation time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">2. Non-Cancellable Post-Payment Policy</h2>
          <p>
            Because access keys and dedicated allocations are provisioned upon payment verification, orders cannot be cancelled once payment is successfully debited, unless the access key is not delivered according to our stated fulfillment terms or as required by applicable law.
          </p>
          <p>
            There is no automatic recurring debit; you will only be charged when you explicitly place an order for the subsequent 30-day term.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">3. Expiration of Access</h2>
          <p>
            At the end of your 30-day access validity period:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A3A3A3]">
            <li>Your access allocation will transition to EXPIRED automatically on the server.</li>
            <li>No automatic renewal charges will occur.</li>
            <li>You can renew or switch between 5X Access and 20X Access at any time from your customer dashboard.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-2">
          <h2 className="text-base font-semibold text-[#F5F5F5]">4. Questions & Support</h2>
          <p>
            If you need assistance regarding an existing order or fulfillment status:
          </p>
          <div className="text-xs font-mono text-[#A3A3A3] space-y-1">
            <div>WhatsApp: {siteConfig.whatsapp}</div>
            <div>Email: {siteConfig.email}</div>
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
