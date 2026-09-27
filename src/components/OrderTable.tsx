"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "./ui/StatusBadge";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { siteConfig } from "@/lib/config";
import { FileText, ExternalLink, Printer, HelpCircle, CheckCircle2 } from "lucide-react";

export interface OrderRowData {
  id: string;
  planName: string;
  amount: number;
  currency: string;
  paymentMethod?: string | null;
  cashfreeOrderId?: string | null;
  paymentId?: string | null;
  date: string | Date;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface OrderTableProps {
  orders: OrderRowData[];
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderRowData | null>(null);

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#6F6F6F] rounded-[14px] bg-[#151515] border border-[#2D2D2D]">
        No orders found.
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-[14px] border border-[#2D2D2D] bg-[#151515]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#2D2D2D] bg-[#1A1A1A] text-[#A3A3A3] font-mono uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 font-medium">Order ID</th>
              <th className="py-3.5 px-4 font-medium">Plan</th>
              <th className="py-3.5 px-4 font-medium">Amount</th>
              <th className="py-3.5 px-4 font-medium">Payment</th>
              <th className="py-3.5 px-4 font-medium">Date</th>
              <th className="py-3.5 px-4 font-medium">Status</th>
              <th className="py-3.5 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
            {orders.map((order) => {
              const orderDate = new Date(order.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <tr
                  key={order.id}
                  className="hover:bg-[#1E1E1E] transition-colors group cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-[#F5F5F5]">
                    {order.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium">{order.planName}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-[#A3A3A3]">
                    {order.paymentMethod || "Cashfree PG"}
                  </td>
                  <td className="py-3.5 px-4 text-[#A3A3A3] font-mono">
                    {orderDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs text-[#A3A3A3] hover:text-[#F5F5F5]"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <FileText size={13} className="mr-1" />
                      Receipt
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invoice / Receipt Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title="Tax Receipt / Order Details"
          maxWidth="lg"
        >
          <div className="space-y-6 text-xs text-[#A3A3A3]" id="invoice-printable">
            {/* Header info */}
            <div className="flex justify-between items-start pb-4 border-b border-[#2D2D2D]">
              <div>
                <span className="text-[11px] font-mono text-[#D97757] uppercase tracking-wider block mb-1">
                  OFFICIAL TAX INVOICE
                </span>
                <h4 className="text-base font-bold text-[#F5F5F5]">
                  {siteConfig.name}
                </h4>
                <p className="text-[11px] text-[#6F6F6F] mt-0.5">
                  {siteConfig.address}
                </p>
                {siteConfig.gstin && (
                  <p className="text-[11px] font-mono text-[#6F6F6F]">
                    GSTIN: {siteConfig.gstin}
                  </p>
                )}
              </div>
              <div className="text-right">
                <StatusBadge status={selectedOrder.status} />
                <div className="text-[11px] font-mono text-[#6F6F6F] mt-2">
                  Date: {new Date(selectedOrder.date).toLocaleDateString("en-IN")}
                </div>
              </div>
            </div>

            {/* Customer & Order Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-[12px] bg-[#1A1A1A] border border-[#2D2D2D]">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#6F6F6F] block mb-1">
                  Billed To
                </span>
                <div className="text-sm font-semibold text-[#F5F5F5]">
                  {selectedOrder.customerName}
                </div>
                <div className="text-xs text-[#A3A3A3]">{selectedOrder.customerEmail}</div>
                <div className="text-xs text-[#A3A3A3] font-mono">
                  {selectedOrder.customerPhone}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#6F6F6F] block mb-1">
                  Order Identifiers
                </span>
                <div className="font-mono text-xs text-[#F5F5F5]">
                  ID: {selectedOrder.id}
                </div>
                {selectedOrder.cashfreeOrderId && (
                  <div className="font-mono text-[11px] text-[#A3A3A3]">
                    CF: {selectedOrder.cashfreeOrderId}
                  </div>
                )}
                <div className="text-[11px] text-[#A3A3A3] mt-1">
                  Payment: {selectedOrder.paymentMethod || "Cashfree PG"}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-[#2D2D2D] rounded-[10px] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A1A1A] border-b border-[#2D2D2D] text-[#A3A3A3] font-mono">
                  <tr>
                    <th className="p-3 font-medium">Description</th>
                    <th className="p-3 font-medium text-right">Qty</th>
                    <th className="p-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D2D]">
                  <tr>
                    <td className="p-3 text-[#F5F5F5]">
                      <div className="font-semibold">{selectedOrder.planName}</div>
                      <div className="text-[11px] text-[#6F6F6F]">
                        Monthly access subscription
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">1</td>
                    <td className="p-3 text-right font-mono font-medium text-[#F5F5F5]">
                      ₹{selectedOrder.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="text-[#6F6F6F]">Total Paid (Inclusive of applicable taxes)</span>
              <span className="text-base font-bold text-[#F5F5F5] font-mono">
                ₹{selectedOrder.amount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Relationship / Disclaimer note */}
            <p className="text-[11px] text-[#6F6F6F] italic leading-normal">
              {siteConfig.disclaimer}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#2D2D2D]">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5"
                >
                  <Printer size={13} />
                  <span>Print Receipt</span>
                </Button>
                <Link href={`/orders/${selectedOrder.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink size={13} />
                    <span>Open Full Page</span>
                  </Button>
                </Link>
              </div>
              <Link href="/support">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <HelpCircle size={13} />
                  <span>Need Help with this Order?</span>
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
