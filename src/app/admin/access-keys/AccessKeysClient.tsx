"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  Key,
  Plus,
  RefreshCw,
  Users,
  Shield,
  Layers,
  PowerOff,
  Power,
  RotateCcw,
  Eye,
  X,
  AlertTriangle,
  Calendar,
} from "lucide-react";

interface Assignment {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  orderId: string;
  status: string;
  assignedAt: string;
  expiresAt: string;
}

interface AccessKeyItem {
  id: string;
  planId: string;
  planName: string;
  planMultiplier: number;
  status: "AVAILABLE" | "ACTIVE" | "FULL" | "DISABLED";
  maxCustomers: number;
  currentCustomers: number;
  remainingCapacity: number;
  maskedKey: string;
  createdAt: string;
  assignments: Assignment[];
}

interface PlanOption {
  id: string;
  name: string;
  multiplier: number;
  defaultMaxCustomers: number;
}

export const AccessKeysClient: React.FC = () => {
  const { toast } = useToast();
  const [keys, setKeys] = useState<AccessKeyItem[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState<AccessKeyItem | null>(null);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState<AccessKeyItem | null>(null);

  // Add Form state
  const [newPlanId, setNewPlanId] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newMaxCustomers, setNewMaxCustomers] = useState(10);
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "AVAILABLE" | "DISABLED">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replace Form state
  const [replaceKeyValue, setReplaceKeyValue] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/access-keys");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load keys");
      setKeys(data.keys || []);
      setPlans(data.plans || []);
      if (data.plans?.length > 0 && !newPlanId) {
        setNewPlanId(data.plans[0].id);
        setNewMaxCustomers(data.plans[0].defaultMaxCustomers);
      }
    } catch (err: any) {
      toast(err.message || "Failed to load access keys", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handlePlanChange = (planId: string) => {
    setNewPlanId(planId);
    const sel = plans.find((p) => p.id === planId);
    if (sel) {
      setNewMaxCustomers(sel.defaultMaxCustomers);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyValue.trim()) {
      toast("Key value is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/access-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: newPlanId,
          keyValue: newKeyValue.trim(),
          maxCustomers: Number(newMaxCustomers),
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add access key");
      }

      toast("Access key added securely!", "success");
      setNewKeyValue("");
      setShowAddModal(false);
      fetchKeys();
    } catch (err: any) {
      toast(err.message || "Could not add access key", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (key: AccessKeyItem) => {
    const nextStatus = key.status === "DISABLED" ? "ACTIVE" : "DISABLED";
    try {
      const res = await fetch("/api/admin/access-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyId: key.id,
          action: "SET_STATUS",
          status: nextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to change status");
      }

      toast(`Key marked as ${nextStatus}`, "success");
      fetchKeys();
    } catch (err: any) {
      toast(err.message || "Action failed", "error");
    }
  };

  const handleReplaceKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReplaceModal || !replaceKeyValue.trim()) {
      toast("New key string is required", "error");
      return;
    }

    setIsReplacing(true);
    try {
      const res = await fetch("/api/admin/access-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyId: showReplaceModal.id,
          action: "REPLACE_KEY",
          newKeyValue: replaceKeyValue.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to replace key");
      }

      toast("Key replaced successfully and encrypted at rest.", "success");
      setReplaceKeyValue("");
      setShowReplaceModal(null);
      fetchKeys();
    } catch (err: any) {
      toast(err.message || "Could not replace key", "error");
    } finally {
      setIsReplacing(false);
    }
  };

  // Aggregated metrics
  const totalKeys = keys.length;
  const totalCapacity = keys.reduce((sum, k) => sum + k.maxCustomers, 0);
  const totalAssigned = keys.reduce((sum, k) => sum + k.currentCustomers, 0);
  const remainingCapacity = keys
    .filter((k) => k.status === "ACTIVE" || k.status === "AVAILABLE")
    .reduce((sum, k) => sum + k.remainingCapacity, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2D2D2D] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-[11px] font-mono text-[#A3A3A3] mb-2">
            <Shield size={12} className="text-[#D97757]" />
            <span>Encrypted Key Pool & Capacity Allocations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
            Access Key Management
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Automated customer assignment based on remaining capacity (10 for 5X, 5 for 20X). Never assigns FULL or DISABLED keys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchKeys}
            className="gap-1.5 text-xs"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus size={14} />
            <span>Add Access Key</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1">
          <div className="text-[11px] font-mono uppercase text-[#6F6F6F] tracking-wider">
            TOTAL ACCESS KEYS
          </div>
          <div className="text-2xl font-bold font-mono text-[#F5F5F5]">{totalKeys}</div>
          <div className="text-xs text-[#A3A3A3]">Encrypted keys in pool</div>
        </div>

        <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1">
          <div className="text-[11px] font-mono uppercase text-[#6F6F6F] tracking-wider">
            TOTAL CAPACITY
          </div>
          <div className="text-2xl font-bold font-mono text-[#F5F5F5]">{totalCapacity}</div>
          <div className="text-xs text-[#A3A3A3]">Max customer allocation limit</div>
        </div>

        <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1">
          <div className="text-[11px] font-mono uppercase text-[#6F6F6F] tracking-wider">
            ASSIGNED CUSTOMERS
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{totalAssigned}</div>
          <div className="text-xs text-[#A3A3A3]">Active linked assignments</div>
        </div>

        <div className="p-5 rounded-[14px] bg-[#151515] border border-[#2D2D2D] space-y-1">
          <div className="text-[11px] font-mono uppercase text-[#6F6F6F] tracking-wider">
            REMAINING SEATS
          </div>
          <div className="text-2xl font-bold font-mono text-[#D97757]">{remainingCapacity}</div>
          <div className="text-xs text-[#A3A3A3]">Available for immediate order intake</div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F5F5F5]">
            Pool Keys & Capacity Status
          </h2>
          <span className="text-xs font-mono text-[#6F6F6F]">
            Keys encrypted at rest (AES-256-GCM)
          </span>
        </div>

        <div className="overflow-x-auto rounded-[14px] border border-[#2D2D2D] bg-[#151515]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1A] border-b border-[#2D2D2D] text-[#A3A3A3] font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">Key ID</th>
                <th className="py-3 px-4 font-medium">Plan</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Capacity</th>
                <th className="py-3 px-4 font-medium">Assigned</th>
                <th className="py-3 px-4 font-medium">Remaining</th>
                <th className="py-3 px-4 font-medium">Masked Value</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6F6F6F]">
                    No access keys configured yet. Click &quot;Add Access Key&quot; to initialize.
                  </td>
                </tr>
              ) : (
                keys.map((k) => {
                  const isFull = k.status === "FULL" || k.remainingCapacity === 0;
                  const isDisabled = k.status === "DISABLED";

                  return (
                    <tr key={k.id} className="hover:bg-[#1E1E1E] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-[#D97757]">
                        {k.id.slice(0, 10)}...
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#F5F5F5]">{k.planName}</span>
                        <span className="text-[10px] text-[#A3A3A3] font-mono block">
                          {k.planMultiplier}X Tier
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                            k.status === "ACTIVE"
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                              : k.status === "FULL"
                              ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                              : k.status === "AVAILABLE"
                              ? "bg-sky-950/60 text-sky-400 border border-sky-800/40"
                              : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                          }`}
                        >
                          {k.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{k.maxCustomers}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400">
                        {k.currentCustomers}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={
                            k.remainingCapacity === 0
                              ? "text-rose-400"
                              : "text-[#D97757] font-semibold"
                          }
                        >
                          {k.remainingCapacity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#888888]">
                        {k.maskedKey}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Assignments */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAssignmentsModal(k)}
                            className="h-7 px-2 text-[11px] gap-1 text-[#A3A3A3]"
                            title="View linked customers"
                          >
                            <Users size={12} />
                            <span>{k.assignments.length}</span>
                          </Button>

                          {/* Replace Key */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowReplaceModal(k)}
                            className="h-7 px-2 text-[11px] gap-1"
                            title="Replace key string"
                          >
                            <RotateCcw size={12} />
                            <span>Replace</span>
                          </Button>

                          {/* Disable / Enable Toggle */}
                          <Button
                            variant={isDisabled ? "primary" : "outline"}
                            size="sm"
                            onClick={() => handleToggleStatus(k)}
                            className={`h-7 px-2 text-[11px] gap-1 ${
                              isDisabled
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                : "text-rose-400 hover:bg-rose-950/40"
                            }`}
                          >
                            {isDisabled ? (
                              <>
                                <Power size={12} />
                                <span>Enable</span>
                              </>
                            ) : (
                              <>
                                <PowerOff size={12} />
                                <span>Disable</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Key */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F5]">
                <Key size={16} className="text-[#D97757]" />
                <span>Add Access Key to Pool</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6F6F6F] hover:text-[#F5F5F5] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              {/* Plan Selection */}
              <div className="space-y-1.5">
                <label className="text-[#A3A3A3] font-medium block">Select Plan</label>
                <select
                  value={newPlanId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full rounded-[8px] bg-[#202020] border border-[#2D2D2D] p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#D97757]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.multiplier}X Tier — default {p.defaultMaxCustomers} customers)
                    </option>
                  ))}
                </select>
              </div>

              {/* Key Value */}
              <div className="space-y-1.5">
                <label className="text-[#A3A3A3] font-medium block">
                  Access Key String (stored AES-256 encrypted)
                </label>
                <input
                  type="text"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="sk-..."
                  className="w-full font-mono rounded-[8px] bg-[#202020] border border-[#2D2D2D] p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#D97757]"
                  required
                />
              </div>

              {/* Max Customers Allocation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#A3A3A3] font-medium block">
                    Max Customers Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newMaxCustomers}
                    onChange={(e) => setNewMaxCustomers(Number(e.target.value))}
                    className="w-full font-mono rounded-[8px] bg-[#202020] border border-[#2D2D2D] p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#D97757]"
                    required
                  />
                  <span className="text-[10px] text-[#6F6F6F] block">
                    Rule: 10 for 5X, 5 for 20X
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A3A3A3] font-medium block">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full rounded-[8px] bg-[#202020] border border-[#2D2D2D] p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#D97757]"
                  >
                    <option value="ACTIVE">ACTIVE (Ready for assignment)</option>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2D2D2D] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className="gap-1.5"
                >
                  <Key size={14} />
                  <span>Encrypt & Save Key</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Replace Key */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F5]">
                <RotateCcw size={16} className="text-[#D97757]" />
                <span>Replace Key Value</span>
              </div>
              <button
                onClick={() => setShowReplaceModal(null)}
                className="text-[#6F6F6F] hover:text-[#F5F5F5] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReplaceKey} className="space-y-4 text-xs">
              <div className="p-3 rounded-[8px] bg-[#202020] text-[#A3A3A3] space-y-1">
                <div>
                  Key ID: <span className="font-mono text-[#F5F5F5]">{showReplaceModal.id}</span>
                </div>
                <div>
                  Plan: <span className="text-[#F5F5F5] font-medium">{showReplaceModal.planName}</span>
                </div>
                <div>
                  Current Customers: <span className="font-mono text-emerald-400">{showReplaceModal.currentCustomers}</span> / {showReplaceModal.maxCustomers}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A3A3A3] font-medium block">
                  New Access Key String
                </label>
                <input
                  type="text"
                  value={replaceKeyValue}
                  onChange={(e) => setReplaceKeyValue(e.target.value)}
                  placeholder="sk-..."
                  className="w-full font-mono rounded-[8px] bg-[#202020] border border-[#2D2D2D] p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#D97757]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplaceModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isReplacing}
                >
                  Confirm Replacement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: View Customer Assignments */}
      {showAssignmentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-[16px] bg-[#151515] border border-[#2D2D2D] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F5]">
                <Users size={16} className="text-[#D97757]" />
                <span>Key Assignments: {showAssignmentsModal.planName} ({showAssignmentsModal.currentCustomers}/{showAssignmentsModal.maxCustomers})</span>
              </div>
              <button
                onClick={() => setShowAssignmentsModal(null)}
                className="text-[#6F6F6F] hover:text-[#F5F5F5] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-[10px] border border-[#2D2D2D] bg-[#121212] max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A1A1A] border-b border-[#2D2D2D] text-[#A3A3A3] font-mono sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Assigned</th>
                    <th className="py-2.5 px-3">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
                  {showAssignmentsModal.assignments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#6F6F6F]">
                        No customers assigned to this key yet.
                      </td>
                    </tr>
                  ) : (
                    showAssignmentsModal.assignments.map((a) => (
                      <tr key={a.id} className="hover:bg-[#1E1E1E]">
                        <td className="py-2.5 px-3">
                          <div className="font-medium">{a.userName}</div>
                          <div className="text-[10px] text-[#6F6F6F] font-mono">{a.userEmail}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#A3A3A3]">
                          {a.orderId}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#A3A3A3]">
                          {new Date(a.assignedAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#F5F5F5]">
                          {new Date(a.expiresAt).toLocaleDateString("en-GB")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAssignmentsModal(null)}
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
