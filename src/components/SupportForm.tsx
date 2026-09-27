"use client";

import React, { useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useToast } from "./ui/Toast";
import { CheckCircle2, Send } from "lucide-react";

interface SupportFormProps {
  initialEmail?: string;
  initialOrderId?: string;
}

export const SupportForm: React.FC<SupportFormProps> = ({
  initialEmail = "",
  initialOrderId = "",
}) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [category, setCategory] = useState("Activation issue");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    "Activation issue",
    "Payment issue",
    "Subscription issue",
    "Refund request",
    "Account issue",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          orderId: orderId || null,
          category,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit support ticket");
      }

      setSubmitted(true);
      toast("Your message has been sent successfully", "success");
    } catch (err: any) {
      toast(err.message || "Failed to submit ticket", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-[16px] bg-[#151515] border border-[#2D2D2D] text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#F5F5F5]">Ticket Submitted</h3>
        <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-md mx-auto leading-relaxed">
          Thank you for contacting us. Our technical support team will review your query and respond to <span className="text-[#F5F5F5] font-mono">{email}</span> within 2 to 4 business hours.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmitted(false);
            setSubject("");
            setMessage("");
          }}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-[16px] bg-[#151515] border border-[#2D2D2D] space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Name (Optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Zenon"
        />
        <Input
          label="Email Address *"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. you@example.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#A3A3A3] tracking-wide">
            Issue Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0E0E0E] text-[#F5F5F5] border border-[#2D2D2D] rounded-[10px] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757]"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#151515]">
                {c}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Order ID (Optional)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. ORD-2026-XXXXX"
          helperText="Include if inquiring about a specific purchase"
        />
      </div>

      <Input
        label="Subject *"
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Brief summary of your question"
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-[#A3A3A3] tracking-wide">
          Message Details *
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please describe your question or issue in detail..."
          className="w-full bg-[#0E0E0E] text-[#F5F5F5] placeholder-[#6F6F6F] border border-[#2D2D2D] rounded-[10px] p-3.5 text-sm transition-all focus:outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757]"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full sm:w-auto"
        isLoading={isLoading}
      >
        <Send size={15} className="mr-1.5" />
        Submit Support Ticket
      </Button>
    </form>
  );
};
