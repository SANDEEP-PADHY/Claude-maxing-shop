"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Shield, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const { toast } = useToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please enter your email or phone number, and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      toast("Signed in successfully", "success");
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      toast(err.message || "Invalid credentials", "error");
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
          Welcome back
        </h2>
        <p className="text-xs text-[#A3A3A3] mt-1.5">
          Sign in to manage your access.
        </p>
      </div>

      {/* Segmented Pill Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[#0E0E0E] border border-[#2D2D2D] mb-6 text-xs font-medium">
        <button
          type="button"
          className="py-1.5 rounded-full bg-[#202020] text-[#F5F5F5] shadow-sm text-center"
        >
          Sign In
        </button>
        <Link
          href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="py-1.5 rounded-full text-[#A3A3A3] hover:text-[#F5F5F5] text-center transition-colors"
        >
          Create Account
        </Link>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-[10px] bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email or Mobile Phone Number"
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@domain.com or +91 98765 43210"
          autoComplete="username"
        />

        <PasswordInput
          label="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          rightAction={
            <Link
              href="/support?category=Account%20issue"
              className="text-xs text-[#D97757] hover:underline"
            >
              Forgot password?
            </Link>
          }
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Sign In to Account
        </Button>
      </form>

      {/* Security Reassurance */}
      <div className="pt-6 mt-6 border-t border-[#2D2D2D] flex items-center justify-center gap-1.5 text-[11px] text-[#6F6F6F]">
        <Shield size={13} className="text-[#A3A3A3]" />
        <span>Secure session with encrypted credential storage.</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AppShell hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="text-xs text-[#A3A3A3]">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </AppShell>
  );
}
