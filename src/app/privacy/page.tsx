import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { AppShell } from "@/components/AppShell";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <LegalPageLayout
        title="Privacy Policy"
        subtitle="We take your privacy and data security seriously. This policy outlines how your information is collected, processed, and safeguarded."
      >
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">1. Information We Collect</h2>
          <p>
            When registering for an account and purchasing subscription plans, we collect the following personal information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A3A3A3]">
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Mobile Phone Number (in Indian standard format)</li>
            <li>Encrypted Password Hash (we never store or view plaintext passwords)</li>
            <li>Transaction reference identifiers provided by Cashfree Payment Gateway</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">2. How We Use Your Information</h2>
          <p>
            We use collected data solely for the following legitimate business purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A3A3A3]">
            <li>Authenticating your session and safeguarding your account</li>
            <li>Provisioning authorized Claude usage multipliers and quotas to your target workspace</li>
            <li>Generating official order receipts and tax invoices</li>
            <li>Responding to customer support tickets and dispute requests</li>
            <li>Complying with regulatory obligations under Indian law and RBI payment guidelines</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">3. Payment Gateway &amp; Financial Data</h2>
          <p>
            All financial transactions are conducted directly through Cashfree Payment Gateway. {siteConfig.name} does not capture, store, or transmit sensitive financial credentials such as complete credit card numbers, CVVs, or bank netbanking passwords.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">4. Data Retention &amp; Security</h2>
          <p>
            We employ modern cryptographic hashing (bcrypt) and industry-standard 256-bit SSL encryption for data in transit. Session tokens are preserved in secure, HTTP-only cookies to prevent unauthorized cross-site script access.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#F5F5F5]">5. Your Rights &amp; Contact</h2>
          <p>
            You have the right to request review, correction, or deletion of your personal account data at any time by contacting us at <a href={`mailto:${siteConfig.email}`} className="text-[#D97757] hover:underline">{siteConfig.email}</a>.
          </p>
        </section>
      </LegalPageLayout>
    </AppShell>
  );
}
