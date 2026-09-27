import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { AccessClient } from "./AccessClient";

export default async function CustomerAccessPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/access");
  }

  // Look for active assignment first
  const assignment = await prisma.accessAssignment.findFirst({
    where: {
      user_id: user.id,
      status: "ACTIVE",
    },
    include: {
      plan: true,
      order: true,
      access_key: true,
    },
    orderBy: { assigned_at: "desc" },
  });

  // Fallback: look for paid order with access_key
  const fallbackOrder = !assignment
    ? await prisma.order.findFirst({
        where: {
          user_id: user.id,
          status: "PAID",
          access_key_id: { not: null },
        },
        include: {
          plan: true,
          access_key: true,
        },
        orderBy: { created_at: "desc" },
      })
    : null;

  let assignmentData = null;

  if (assignment) {
    assignmentData = {
      id: assignment.id,
      status: assignment.status,
      planName: assignment.plan.name,
      multiplier: assignment.plan.multiplier,
      price: assignment.plan.price,
      deliveryMethod: assignment.order?.delivery_method || "EMAIL",
      deliveryStatus: assignment.order?.delivery_status || "PENDING",
      deliveryRecipient: assignment.order?.delivery_recipient || user.email,
      expiresAt: assignment.expires_at.toISOString(),
      assignedAt: assignment.assigned_at.toISOString(),
    };
  } else if (fallbackOrder && fallbackOrder.access_key) {
    const expiresAt = new Date(fallbackOrder.created_at.getTime() + 30 * 24 * 60 * 60 * 1000);
    assignmentData = {
      id: fallbackOrder.id,
      status: "ACTIVE",
      planName: fallbackOrder.plan.name,
      multiplier: fallbackOrder.plan.multiplier,
      price: fallbackOrder.plan.price,
      deliveryMethod: fallbackOrder.delivery_method || "EMAIL",
      deliveryStatus: fallbackOrder.delivery_status || "PENDING",
      deliveryRecipient: fallbackOrder.delivery_recipient || user.email,
      expiresAt: expiresAt.toISOString(),
      assignedAt: fallbackOrder.created_at.toISOString(),
    };
  }

  return (
    <AppShell user={user}>
      <AccessClient assignment={assignmentData} />
    </AppShell>
  );
}
