import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Button } from "@/components/ui/Button";

export default async function RefundPolicyPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <LegalPageLayout
        title="Refund Policy"
        subtitle="Our refund policy is designed to be clear, fair, and fully compliant with Indian consumer protection and payment gateway guidelines."
      >
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">1. Overview</h2>
          <p>
            At {siteConfig.name}, customer satisfaction and transparent fulfillment are fundamental. Because subscription plans grant immediate digital usage allocations, our refund terms balance digital delivery with consumer safeguards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">2. Eligibility for Full Refund</h2>
          <p>
            A customer is eligible for a full 100% refund under any of the following verified conditions:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-[#A3A3A3]">
            <li>
              <strong className="text-[#F5F5F5]">Activation Failure:</strong> If payment has been successfully debited via Cashfree, but subscription allocation is not provisioned within 24 hours of purchase, and our support team is unable to resolve the provisioning manually.
            </li>
            <li>
              <strong className="text-[#F5F5F5]">Duplicate Charges:</strong> If technical latency caused multiple deductions for a single plan order, all excess charges will be refunded immediately without deduction.
            </li>
            <li>
              <strong className="text-[#F5F5F5]">Unfulfilled Orders:</strong> If an order is marked as CANCELLED or FAILED before usage activation begins.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">3. Non-Refundable Scenarios</h2>
          <p>
            Refunds will not be issued under the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A3A3A3]">
            <li>Change of mind after the subscription tier has been activated and used.</li>
            <li>Suspension or termination resulting from violation of fair usage policies or prohibited automated scraping.</li>
            <li>Requests submitted more than 7 calendar days after order payment.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">4. Refund Processing Timeline</h2>
          <p>
            Once a refund is approved by our billing team:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A3A3A3]">
            <li>Refunds are initiated directly via Cashfree to the customer&apos;s original payment method (UPI, bank account, or card).</li>
            <li>Depending on your issuing bank, funds typically reflect in your account within <strong>5 to 7 business days</strong>.</li>
            <li>A Cashfree refund reference ID will be provided to you for tracking.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-2">
          <h2 className="text-base font-semibold text-[#F5F5F5]">5. How to Request a Refund</h2>
          <p>
            To initiate a refund request, navigate to our Support page, select &quot;Refund request&quot;, and provide your Order ID.
          </p>
          <div className="pt-2">
            <Link href="/support?category=Refund%20request">
              <Button variant="primary" size="sm">
                Submit Refund Request
              </Button>
            </Link>
          </div>
        </section>
      </LegalPageLayout>
    </AppShell>
  );
}
