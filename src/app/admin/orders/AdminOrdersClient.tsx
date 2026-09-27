"use client";

import React, { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Search, Filter, ShieldCheck, Edit, Check } from "lucide-react";

interface AdminOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_status: string;
  cashfree_order_id?: string | null;
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
  payments: Array<{
    id: string;
    cashfree_payment_id?: string | null;
    method?: string | null;
    status: string;
  }>;
  subscriptions: Array<{
    id: string;
    status: string;
    fulfilment_status: string;
    provider_reference?: string | null;
  }>;
}

interface AdminOrdersClientProps {
  initialOrders: AdminOrder[];
}

export const AdminOrdersClient: React.FC<AdminOrdersClientProps> = ({
  initialOrders,
}) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Fulfilment update state
  const [updatingFulfilment, setUpdatingFulfilment] = useState(false);
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [adminNote, setAdminNote] = useState("");

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === "ALL" || o.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.user.email.toLowerCase().includes(q) ||
      o.user.name.toLowerCase().includes(q) ||
      (o.cashfree_order_id && o.cashfree_order_id.toLowerCase().includes(q));

    return matchesStatus && matchesQuery;
  });

  const handleUpdateFulfilment = async () => {
    if (!selectedOrder) return;
    setUpdatingFulfilment(true);

    try {
      const res = await fetch(
        `/api/admin/orders/${selectedOrder.id}/fulfilment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, note: adminNote }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Update local state
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === selectedOrder.id) {
            return {
              ...o,
              subscriptions: o.subscriptions.map((s) => ({
                ...s,
                fulfilment_status: newStatus,
                status: newStatus === "ACTIVE" ? "ACTIVE" : s.status,
              })),
            };
          }
          return o;
        })
      );

      toast(`Fulfilment status updated to ${newStatus}`, "success");
      setSelectedOrder(null);
      setAdminNote("");
    } catch (err: any) {
      toast(err.message || "Failed to update fulfilment", "error");
    } finally {
      setUpdatingFulfilment(false);
    }
  };

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
            placeholder="Search by Order ID, customer name, email, or Cashfree ID..."
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
              <th className="py-3 px-4 font-medium">Payment Ref</th>
              <th className="py-3 px-4 font-medium">Order Status</th>
              <th className="py-3 px-4 font-medium">Fulfilment</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6F6F6F]">
                  No orders match current criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const sub = order.subscriptions[0];
                return (
                  <tr key={order.id} className="hover:bg-[#1E1E1E] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium">{order.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-[11px] font-mono text-[#6F6F6F]">
                        {order.user.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{order.plan.name}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      ₹{order.amount}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#A3A3A3]">
                      {order.payments[0]?.cashfree_payment_id || order.cashfree_order_id || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={sub?.fulfilment_status || "PENDING"}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(sub?.fulfilment_status || "ACTIVE");
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Manage / Manual Fulfilment Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Manage Fulfilment — ${selectedOrder.id}`}
        >
          <div className="space-y-5 text-xs text-[#A3A3A3]">
            {/* Customer & Plan Summary */}
            <div className="p-4 rounded-[10px] bg-[#1A1A1A] border border-[#2D2D2D] space-y-2">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="text-[#F5F5F5] font-medium">{selectedOrder.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-[#F5F5F5] font-mono">{selectedOrder.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="text-[#F5F5F5] font-medium">{selectedOrder.plan.name} (₹{selectedOrder.amount})</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="text-emerald-400 font-mono">{selectedOrder.payment_status}</span>
              </div>
            </div>

            {/* Fulfilment Status Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#F5F5F5]">
                Update Subscription / Fulfilment Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-[#0E0E0E] text-[#F5F5F5] border border-[#2D2D2D] rounded-[8px] p-2.5 text-xs focus:outline-none focus:border-[#D97757]"
              >
                <option value="ACTIVE">ACTIVE (Authorized &amp; Provisioned)</option>
                <option value="FULFILMENT_PENDING">FULFILMENT_PENDING (Processing)</option>
                <option value="FAILED">FAILED (Fulfillment Error)</option>
                <option value="CANCELLED">CANCELLED (Revoked)</option>
              </select>
            </div>

            {/* Admin Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#F5F5F5]">
                Internal Admin Note
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Account assigned via partner console"
                className="w-full bg-[#0E0E0E] text-[#F5F5F5] placeholder-[#6F6F6F] border border-[#2D2D2D] rounded-[8px] p-2.5 text-xs focus:outline-none focus:border-[#D97757]"
              />
            </div>

            <div className="pt-3 border-t border-[#2D2D2D] flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={updatingFulfilment}
                onClick={handleUpdateFulfilment}
              >
                Save Status
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
