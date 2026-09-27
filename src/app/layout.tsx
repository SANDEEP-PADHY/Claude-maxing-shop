import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Claude Subscriptions — Simple Monthly Access & Usage Tiers",
  description:
    "Secure, account-based storefront for purchasing authorized Claude subscription plans. Predictable monthly billing in INR with instant fulfillment.",
  keywords: [
    "Claude Max 5x",
    "Claude Max 20x",
    "Claude subscription",
    "AI subscription India",
    "Cashfree Claude",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0B0B0B] text-[#F5F5F5]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
