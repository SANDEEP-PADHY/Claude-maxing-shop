import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Button } from "@/components/ui/Button";

export default async function CancellationPolicyPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <LegalPageLayout
        title="Cancellation Policy"
        subtitle="Understand how subscription terms, renewals, and cancellations work at our storefront."
      >
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">1. Subscription Duration</h2>
          <p>
            All subscription tiers offered by {siteConfig.name} (Claude Max 5x at ₹999/month and Claude Max 20x at ₹1,999/month) are structured on a monthly billing term (30 days from activation date).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">2. How Cancellation Works</h2>
          <p>
            You may request cancellation of your subscription at any time prior to the next billing cycle. 
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A3A3A3]">
            <li>
              When you cancel, your current subscription will not automatically renew for subsequent months.
            </li>
            <li>
              You retain full, uninterrupted access to your allocated usage multiplier until the end of your current 30-day paid billing period.
            </li>
            <li>
              Upon the expiration date, the account status will transition to EXPIRED, and no further charges will be billed to your payment method.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">3. Immediate Cancellation vs. Scheduled Expiration</h2>
          <p>
            If you require immediate termination of access rather than waiting for the term to expire (e.g. for enterprise account migration), our support team can fulfill this upon request. Note that early voluntary termination does not automatically entitle the user to a prorated refund unless covered by our Refund Policy.
          </p>
        </section>

        <section className="space-y-3 pt-2">
          <h2 className="text-base font-semibold text-[#F5F5F5]">4. How to Submit a Cancellation Request</h2>
          <p>
            To cancel your plan, navigate to your Account Dashboard or contact our support team with your registered email and Order ID.
          </p>
          <div className="pt-2">
            <Link href="/support?category=Subscription%20issue">
              <Button variant="outline" size="sm">
                Contact Support to Cancel
              </Button>
            </Link>
          </div>
        </section>
      </LegalPageLayout>
    </AppShell>
  );
}
