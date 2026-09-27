import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { AdminNav } from "@/components/AdminNav";
import { AccessKeysClient } from "./AccessKeysClient";

export default async function AdminAccessKeysPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin/access-keys");
  }

  return (
    <AppShell user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <AdminNav />
        <AccessKeysClient />
      </div>
    </AppShell>
  );
}
