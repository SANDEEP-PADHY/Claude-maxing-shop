"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "./ui/StatusBadge";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { siteConfig } from "@/lib/config";
import { FileText, ExternalLink, Printer, HelpCircle, CheckCircle2, MessageSquare, Mail } from "lucide-react";

export interface OrderRowData {
  id: string;
  planName: string;
  amount: number;
  currency: string;
  status: string; // Payment status: PAID, PAYMENT_PENDING, etc.
  deliveryMethod: string; // Email | WhatsApp
  deliveryStatus: string; // PENDING, DELIVERED, etc.
  purchaseDate: string | Date;
  expiryDate: string | Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod?: string | null;
  cashfreeOrderId?: string | null;
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-[14px] border border-[#2D2D2D] bg-[#151515]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#2D2D2D] bg-[#1A1A1A] text-[#A3A3A3] font-mono uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 font-medium">Order ID</th>
              <th className="py-3.5 px-4 font-medium">Plan</th>
              <th className="py-3.5 px-4 font-medium">Amount</th>
              <th className="py-3.5 px-4 font-medium">Payment status</th>
              <th className="py-3.5 px-4 font-medium">Delivery method</th>
              <th className="py-3.5 px-4 font-medium">Delivery status</th>
              <th className="py-3.5 px-4 font-medium">Purchase date</th>
              <th className="py-3.5 px-4 font-medium">Expiry date</th>
              <th className="py-3.5 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D2D2D] text-[#F5F5F5]">
            {orders.map((order) => {
              const purchaseFormatted = formatDate(order.purchaseDate);
              const expiryFormatted = formatDate(order.expiryDate);

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
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      {order.deliveryMethod === "WHATSAPP" ? (
                        <MessageSquare size={13} className="text-emerald-400" />
                      ) : (
                        <Mail size={13} className="text-sky-400" />
                      )}
                      <span>{order.deliveryMethod === "WHATSAPP" ? "WhatsApp" : "Email"}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                        order.deliveryStatus === "DELIVERED"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                          : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                      }`}
                    >
                      {order.deliveryStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#A3A3A3] font-mono">
                    {purchaseFormatted}
                  </td>
                  <td className="py-3.5 px-4 text-[#A3A3A3] font-mono">
                    {expiryFormatted}
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
                <p className="text-[11px] text-[#6F6F6F]">
                  Claude-powered API access
                </p>
                <p className="text-[11px] text-[#6F6F6F]">
                  WhatsApp: {siteConfig.whatsapp} • {siteConfig.email}
                </p>
              </div>

              <div className="text-right font-mono">
                <div className="text-[#F5F5F5] font-semibold">{selectedOrder.id}</div>
                <div className="text-[11px] text-[#6F6F6F]">
                  Date: {formatDate(selectedOrder.purchaseDate)}
                </div>
                <div className="mt-1">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
            </div>

            {/* Billed To / Delivery info */}
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-[#2D2D2D]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">
                  Billed To
                </span>
                <div className="font-semibold text-[#F5F5F5]">{selectedOrder.customerName}</div>
                <div className="font-mono text-[11px]">{selectedOrder.customerEmail}</div>
                <div className="font-mono text-[11px]">{selectedOrder.customerPhone}</div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">
                  Delivery & Gateway
                </span>
                <div className="font-mono text-[#F5F5F5]">Method: {selectedOrder.deliveryMethod}</div>
                <div className="font-mono text-[11px] text-[#A3A3A3]">
                  Status: {selectedOrder.deliveryStatus}
                </div>
                <div className="font-mono text-[11px] text-[#A3A3A3]">
                  Gateway: Cashfree Payments
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[#6F6F6F] font-mono uppercase text-[10px] border-b border-[#2D2D2D] pb-1.5">
                <span>Description</span>
                <span>Amount (INR)</span>
              </div>
              <div className="flex justify-between items-center text-[#F5F5F5]">
                <div>
                  <span className="font-medium block">{selectedOrder.planName} (Monthly Access)</span>
                  <span className="text-[11px] text-[#6F6F6F]">
                    Valid: {formatDate(selectedOrder.purchaseDate)} — {formatDate(selectedOrder.expiryDate)}
                  </span>
                </div>
                <span className="font-mono font-semibold">
                  ₹{selectedOrder.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-[#2D2D2D] space-y-1.5 font-mono">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Subtotal</span>
                <span>₹{selectedOrder.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#6F6F6F]">
                <span>Taxes & GST</span>
                <span>Inclusive</span>
              </div>
              <div className="flex justify-between text-[#F5F5F5] font-bold text-sm pt-2 border-t border-[#2D2D2D]">
                <span>Total Paid</span>
                <span className="text-[#D97757]">
                  ₹{selectedOrder.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-[#2D2D2D]">
              <div className="text-[11px] text-[#6F6F6F]">
                Support: {siteConfig.email}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer size={13} />
                <span>Print Receipt</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
