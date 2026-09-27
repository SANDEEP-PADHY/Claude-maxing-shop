"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { User, Shield, KeyRound, LogOut, Calendar, Mail, Phone } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login?redirect=/account");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Logged out successfully", "info");
    router.push("/");
    router.refresh();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Please fill in all password fields", "error");
      return;
    }

    if (newPassword.length < 8) {
      toast("New password must be at least 8 characters long", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast("New passwords do not match", "error");
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("Password changed successfully", "success");
    } catch (err: any) {
      toast(err.message || "Failed to change password", "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#A3A3A3]">
          Loading account profile...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2D2D2D] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-2">
              <User size={12} className="text-[#D97757]" />
              <span>Customer Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
              Account & Security
            </h1>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Manage personal details, verified credentials, and account authentication.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-xs gap-1.5 self-start sm:self-auto"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </Button>
        </div>

        {/* Profile Details Card */}
        <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-semibold text-[#F5F5F5] pb-3 border-b border-[#2D2D2D]">
            Profile Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase">
                Full Name
              </span>
              <div className="text-sm font-semibold text-[#F5F5F5]">{user?.name}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase flex items-center gap-1">
                <Mail size={12} />
                <span>Email Address</span>
              </span>
              <div className="text-sm font-mono text-[#F5F5F5]">{user?.email}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase flex items-center gap-1">
                <Phone size={12} />
                <span>Phone Number</span>
              </span>
              <div className="text-sm font-mono text-[#F5F5F5]">{user?.phone}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[#6F6F6F] font-mono text-[11px] uppercase flex items-center gap-1">
                <Calendar size={12} />
                <span>Account Created</span>
              </span>
              <div className="text-sm text-[#A3A3A3]">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#2D2D2D]">
            <KeyRound size={16} className="text-[#D97757]" />
            <h2 className="text-base font-semibold text-[#F5F5F5]">
              Update Password
            </h2>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-[10px] bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
              Password updated successfully.
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <PasswordInput
              label="Current Password *"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />

            <PasswordInput
              label="New Password (min. 8 characters) *"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />

            <PasswordInput
              label="Confirm New Password *"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={updatingPassword}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
