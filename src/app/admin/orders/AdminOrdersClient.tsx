"use client";

import React, { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  Search,
  Key,
  Mail,
  MessageSquare,
  CheckCircle2,
  Copy,
  Clock,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  X,
  ExternalLink,
  Send,
} from "lucide-react";

interface AdminOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_status: string;
  cashfree_order_id?: string | null;
  delivery_method: string;
  delivery_status: string;
  delivery_recipient: string;
  delivered_at: string | null;
  created_at: string;
  plan: {
    id: string;
    name: string;
    multiplier: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  access_key_id?: string | null;
  assigned_key?: {
    id: string;
    status: string;
    current_customers: number;
    max_customers: number;
  } | null;
  assignment?: {
    id: string;
    status: string;
    assigned_at: string;
    expires_at: string;
    delivered_at: string | null;
  } | null;
  payments: Array<{
    id: string;
    cashfree_payment_id?: string | null;
    method?: string | null;
    status: string;
  }>;
}

interface KeyOption {
  id: string;
  planId: string;
  planMultiplier: number;
  status: string;
  maxCustomers: number;
  currentCustomers: number;
  remaining: number;
}

interface AdminOrdersClientProps {
  initialOrders: AdminOrder[];
  allKeys: KeyOption[];
}

export const AdminOrdersClient: React.FC<AdminOrdersClientProps> = ({
  initialOrders,
  allKeys,
}) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected Order Detail Modal
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);
  const [selectedKeyForAssignment, setSelectedKeyForAssignment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isKeyRevealedInModal, setIsKeyRevealedInModal] = useState(false);
  const [orderExtraDetail, setOrderExtraDetail] = useState<{
    decryptedKey?: string;
    whatsAppMessage?: string;
    emailMessage?: string;
    formattedExpiry?: string;
  } | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === "ALL" || o.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.user.email.toLowerCase().includes(q) ||
      o.user.name.toLowerCase().includes(q) ||
      o.user.phone.toLowerCase().includes(q) ||
      (o.cashfree_order_id && o.cashfree_order_id.toLowerCase().includes(q));

    return matchesStatus && matchesQuery;
  });

  const openOrderDetail = async (order: AdminOrder) => {
    setActiveOrder(order);
    setSelectedKeyForAssignment(order.access_key_id || "");
    setIsKeyRevealedInModal(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/actions`);
      const data = await res.json();
      if (res.ok) {
        setOrderExtraDetail({
          decryptedKey: data.decryptedKey,
          whatsAppMessage: data.whatsAppMessage,
          emailMessage: data.emailMessage,
          formattedExpiry: data.formattedExpiry,
        });
      }
    } catch (err) {
      console.error("Failed to load extra details:", err);
    }
  };

  const handleAction = async (action: string, payload: any = {}) => {
    if (!activeOrder) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${activeOrder.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      toast(data.message || "Action completed", "success");

      // Reload order detail
      openOrderDetail(activeOrder);

      // Update local orders list state
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === activeOrder.id) {
            if (action === "MARK_DELIVERED") {
              return {
                ...o,
                delivery_status: "DELIVERED",
                delivered_at: new Date().toISOString(),
              };
            }
            if (action === "ASSIGN_KEY" || action === "CHANGE_KEY") {
              return { ...o, access_key_id: payload.keyId };
            }
          }
          return o;
        })
      );
    } catch (err: any) {
      toast(err.message || "Failed to execute action", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!orderExtraDetail?.decryptedKey) {
      toast("No access key assigned to copy.", "error");
      return;
    }
    navigator.clipboard.writeText(orderExtraDetail.decryptedKey);
    toast("Access key copied to clipboard!", "success");
  };

  const handleCopyWhatsApp = () => {
    if (!orderExtraDetail?.whatsAppMessage) {
      toast("WhatsApp message not generated yet", "error");
      return;
    }
    navigator.clipboard.writeText(orderExtraDetail.whatsAppMessage);
    toast("WhatsApp message copied to clipboard!", "success");
  };

  const handleCopyEmail = () => {
    if (!orderExtraDetail?.emailMessage) {
      toast("Email message not generated yet", "error");
      return;
    }
    navigator.clipboard.writeText(orderExtraDetail.emailMessage);
    toast("Email message copied to clipboard!", "success");
  };

  // Candidate keys for active order's plan
  const candidateKeys = activeOrder
    ? allKeys.filter((k) => k.planMultiplier === activeOrder.plan.multiplier)
    : [];

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6F6F]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, customer, email, phone, or Cashfree ID..."
            className="w-full bg-[#0E0E0E] text-[#F5F5F5] placeholder-[#6F6F6F] border border-[#2D2D2D] rounded-[8px] pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-[#D97757]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {["ALL", "PAID", "PAYMENT_PENDING", "PAYMENT_FAILED", "CANCELLED"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-[8px] transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-[#202020] text-[#F5F5F5] border border-[#3D3D3D]"
                    : "text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-[14px] border border-[#2D2D2D] bg-[#151515]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1A1A1A] border-b border-[#2D2D2D] text-[#A3A3A3] font-mono">
            <tr>
              <th className="py-3 px-4 font-medium">Order ID</th>
              <th className="py-3 px-4 font-medium">Customer</th>
              <th className="py-3 px-4 font-medium">Plan</th>
              <th className="py-3 px-4 font-medium">Amount</th>
              <th className="py-3 px-4 font-medium">Delivery</th>
              <th className="py-3 px-4 font-medium">Payment</th>
              <th className="py-3 px-4 font-medium">Key Assigned</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6F6F6F]">
                  No orders found matching current criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#1E1E1E] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-[#D97757]">
                    {o.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#F5F5F5]">{o.user.name}</div>
                    <div className="text-[11px] text-[#A3A3A3] font-mono">{o.user.email}</div>
                    <div className="text-[10px] text-[#6F6F6F] font-mono">{o.user.phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#F5F5F5]">{o.plan.name}</span>
                    <span className="text-[10px] text-[#A3A3A3] block font-mono">
                      {o.plan.multiplier}X Access
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    ₹{o.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      {o.delivery_method === "WHATSAPP" ? (
                        <MessageSquare size={13} className="text-emerald-400" />
                      ) : (
                        <Mail size={13} className="text-sky-400" />
                      )}
                      <span>{o.delivery_method}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded mt-1 inline-block ${
                        o.delivery_status === "DELIVERED"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                          : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                      }`}
                    >
                      {o.delivery_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {o.access_key_id ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Assigned
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock size={12} />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openOrderDetail(o)}
                      className="h-7 px-2.5 text-xs font-semibold"
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2D2D2D]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider block">
                  ADMIN ORDER DETAIL
                </span>
                <h3 className="text-lg font-bold text-[#F5F5F5] font-mono">
                  {activeOrder.id}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveOrder(null);
                  setOrderExtraDetail(null);
                }}
                className="text-[#6F6F6F] hover:text-[#F5F5F5] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">CUSTOMER</span>
                <div className="font-semibold text-[#F5F5F5]">{activeOrder.user.name}</div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">EMAIL</span>
                <div className="font-mono text-[#F5F5F5] truncate">{activeOrder.user.email}</div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">PHONE</span>
                <div className="font-mono text-[#F5F5F5]">{activeOrder.user.phone}</div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">PLAN</span>
                <div className="font-semibold text-[#D97757]">{activeOrder.plan.name}</div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">AMOUNT</span>
                <div className="font-mono text-[#F5F5F5] font-semibold">₹{activeOrder.amount}</div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">CASHFREE ORDER ID</span>
                <div className="font-mono text-[#F5F5F5] truncate">
                  {activeOrder.cashfree_order_id || "—"}
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">PAYMENT STATUS</span>
                <div><StatusBadge status={activeOrder.status} /></div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">DELIVERY METHOD</span>
                <div className="font-mono text-[#F5F5F5] font-medium">{activeOrder.delivery_method}</div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">DELIVERY RECIPIENT</span>
                <div className="font-mono text-[#F5F5F5] truncate">{activeOrder.delivery_recipient}</div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">DELIVERY STATUS</span>
                <div className="font-mono font-medium text-amber-400">{activeOrder.delivery_status}</div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">EXPIRY DATE</span>
                <div className="font-mono text-[#F5F5F5]">
                  {orderExtraDetail?.formattedExpiry || "—"}
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#202020] space-y-1">
                <span className="text-[#6F6F6F] block font-mono text-[10px]">DELIVERED AT</span>
                <div className="font-mono text-[#F5F5F5]">
                  {activeOrder.delivered_at
                    ? new Date(activeOrder.delivered_at).toLocaleDateString("en-GB")
                    : "Not delivered yet"}
                </div>
              </div>
            </div>

            {/* Assigned Key Section */}
            <div className="p-4 rounded-[12px] bg-[#121212] border border-[#2D2D2D] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6F6F6F] tracking-wider block">
                    KEY
                  </span>
                  <div className="font-mono text-sm font-semibold text-[#F5F5F5] select-all">
                    {orderExtraDetail?.decryptedKey
                      ? isKeyRevealedInModal
                        ? orderExtraDetail.decryptedKey
                        : "••••••••••••••"
                      : "No key assigned"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isKeyRevealedInModal ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsKeyRevealedInModal(true)}
                      className="gap-1 text-xs"
                      disabled={!orderExtraDetail?.decryptedKey}
                    >
                      <Key size={13} />
                      <span>Reveal key</span>
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyKey}
                      className="gap-1 text-xs"
                    >
                      <Copy size={13} />
                      <span>Copy key</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Key Switcher / Reallocation */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-[#222222]">
                <select
                  value={selectedKeyForAssignment}
                  onChange={(e) => setSelectedKeyForAssignment(e.target.value)}
                  className="flex-1 rounded-[8px] bg-[#202020] border border-[#2D2D2D] p-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D97757]"
                >
                  <option value="">-- Reassign / Change Key --</option>
                  {candidateKeys.map((k) => {
                    const isFull = k.currentCustomers >= k.maxCustomers || k.status === "FULL";
                    const isDisabled = k.status === "DISABLED";
                    const disabledOption = isFull || isDisabled;

                    return (
                      <option
                        key={k.id}
                        value={k.id}
                        disabled={disabledOption}
                      >
                        Key: {k.id.slice(0, 10)}... | {k.currentCustomers}/{k.maxCustomers} assigned ({k.remaining} remaining) {isFull ? "[FULL]" : ""} {isDisabled ? "[DISABLED]" : ""}
                      </option>
                    );
                  })}
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAction(
                      activeOrder.access_key_id ? "CHANGE_KEY" : "ASSIGN_KEY",
                      { keyId: selectedKeyForAssignment }
                    )
                  }
                  isLoading={actionLoading}
                  disabled={!selectedKeyForAssignment}
                  className="shrink-0 text-xs gap-1"
                >
                  <Key size={13} />
                  <span>{activeOrder.access_key_id ? "Change Key" : "Assign Key"}</span>
                </Button>
              </div>
            </div>

            {/* Manual Fulfilment Templates (WhatsApp & Email) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp Manual Message Box */}
              <div className="p-4 rounded-[12px] bg-[#121212] border border-[#2D2D2D] space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#252525]">
                    <span className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-emerald-400" />
                      <span>WhatsApp Manual Message</span>
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyWhatsApp}
                      className="h-7 text-xs gap-1 text-emerald-400"
                    >
                      <Copy size={12} />
                      <span>Copy WhatsApp message</span>
                    </Button>
                  </div>

                  <div className="mt-2.5 p-3 rounded-[8px] bg-[#0A0A0A] border border-[#2D2D2D] text-xs font-mono text-[#A3A3A3] whitespace-pre-wrap leading-relaxed select-all max-h-48 overflow-y-auto">
                    {orderExtraDetail?.whatsAppMessage || "Loading WhatsApp message..."}
                  </div>
                </div>
              </div>

              {/* Email Manual Message Box */}
              <div className="p-4 rounded-[12px] bg-[#121212] border border-[#2D2D2D] space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#252525]">
                    <span className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-1.5">
                      <Mail size={14} className="text-sky-400" />
                      <span>Email Manual Message</span>
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyEmail}
                      className="h-7 text-xs gap-1 text-sky-400"
                    >
                      <Copy size={12} />
                      <span>Copy email message</span>
                    </Button>
                  </div>

                  <div className="mt-2.5 p-3 rounded-[8px] bg-[#0A0A0A] border border-[#2D2D2D] text-xs font-mono text-[#A3A3A3] whitespace-pre-wrap leading-relaxed select-all max-h-48 overflow-y-auto">
                    {orderExtraDetail?.emailMessage || "Loading email message..."}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-2 border-t border-[#2D2D2D] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Mark Delivered */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction("MARK_DELIVERED")}
                  isLoading={actionLoading}
                  disabled={activeOrder.delivery_status === "DELIVERED"}
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <CheckCircle2 size={13} />
                  <span>{activeOrder.delivery_status === "DELIVERED" ? "Delivered" : "Mark delivered"}</span>
                </Button>

                {/* Revoke Access */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction("REVOKE_ACCESS")}
                  isLoading={actionLoading}
                  className="gap-1.5 text-xs text-rose-400 hover:bg-rose-950/40"
                >
                  <ShieldAlert size={13} />
                  <span>Revoke Access</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveOrder(null);
                  setOrderExtraDetail(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
