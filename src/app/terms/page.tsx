import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export default async function TermsPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <LegalPageLayout
        title="Terms & Conditions"
        subtitle="Please read these terms and conditions carefully before subscribing to our authorized Claude subscription access services."
      >
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">1. Acceptance of Terms</h2>
          <p>
            By accessing this website, creating an account, or purchasing any subscription plan from {siteConfig.name} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms &amp; Conditions and our Privacy Policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">2. Service Description &amp; Relationship Notice</h2>
          <p>
            {siteConfig.name} provides commercial subscription management and authorized access provisioning for Claude usage tiers (specifically Claude Max 5x and Claude Max 20x).
          </p>
          <div className="p-4 rounded-[10px] bg-[#151515] border border-[#2D2D2D] text-xs text-[#A3A3A3]">
            <strong className="text-[#F5F5F5]">Relationship Disclosure:</strong> {siteConfig.disclaimer} We operate as an independent facilitator handling localized INR billing, authorized credential assignment, customer invoicing, and technical support.
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">3. Plans, Pricing &amp; Billing</h2>
          <p>
            All prices are denominated in Indian Rupees (INR) and are explicitly stated on the storefront:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A3A3A3]">
            <li>Claude Max 5x: ₹999 per month</li>
            <li>Claude Max 20x: ₹1,999 per month</li>
          </ul>
          <p>
            Prices are inclusive of applicable taxes unless specified otherwise. We reserve the right to modify subscription fees with prior notification to active subscribers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">4. Payment Processing</h2>
          <p>
            Payments are securely routed and processed through the Cashfree Payment Gateway. We do not store card details, CVVs, or Net Banking credentials on our servers. By completing payment, you authorize Cashfree to process your transaction in accordance with RBI regulations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">5. Account &amp; Fulfillment</h2>
          <p>
            Subscriptions are tied to your registered email address. Upon successful payment verification by our backend, the subscription status will transition to ACTIVE, and your expanded usage allocation will be provisioned. Unauthorized sharing, sublicensing, or resale of account credentials is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">6. Limitation of Liability</h2>
          <p>
            In no event shall {siteConfig.name} or its operators be liable for indirect, incidental, special, or consequential damages resulting from upstream AI model latency, API rate limits imposed by the model provider, or network downtime outside our direct control.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">7. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in {siteConfig.address}.
          </p>
        </section>
      </LegalPageLayout>
    </AppShell>
  );
}
