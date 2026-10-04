"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Shield, Sparkles } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          confirmPassword,
          agreeTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast("Account created successfully", "success");
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      toast(err.message || "Failed to create account", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-[16px] bg-[#151515] border border-[#2D2D2D] shadow-2xl">
      {/* Top Brand Tag */}
      <div className="text-center mb-8">
        <div className="w-8 h-8 rounded-[8px] bg-[#D97757] flex items-center justify-center text-white font-bold text-sm mx-auto mb-3">
          <Sparkles size={16} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">
          Create an account
        </h2>
        <p className="text-xs text-[#A3A3A3] mt-1.5">
          Create your account for managed API access.
        </p>
      </div>

      {/* Segmented Pill Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[#0E0E0E] border border-[#2D2D2D] mb-6 text-xs font-medium">
        <Link
          href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="py-1.5 rounded-full text-[#A3A3A3] hover:text-[#F5F5F5] text-center transition-colors"
        >
          Sign In
        </Link>
        <button
          type="button"
          className="py-1.5 rounded-full bg-[#202020] text-[#F5F5F5] shadow-sm text-center"
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-[10px] bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label="Full Name *"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex Sharma"
          autoComplete="name"
        />

        <Input
          label="Email Address *"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@company.com"
          autoComplete="email"
        />

        <PhoneInput
          label="Mobile Phone Number (India) *"
          required
          value={phone}
          onChange={(val) => setPhone(val)}
        />

        <PasswordInput
          label="Password (min. 8 characters) *"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm Password *"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />

        {/* Terms Agreement Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#A3A3A3]">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded-[4px] border-[#2D2D2D] bg-[#0E0E0E] text-[#D97757] focus:ring-[#D97757]"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-[#D97757] hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-[#D97757] hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      {/* Security Reassurance */}
      <div className="pt-6 mt-6 border-t border-[#2D2D2D] flex items-center justify-center gap-1.5 text-[11px] text-[#6F6F6F]">
        <Shield size={13} className="text-[#A3A3A3]" />
        <span>Passwords are securely hashed. Plaintext is never stored.</span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AppShell hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="text-xs text-[#A3A3A3]">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </AppShell>
  );
}
