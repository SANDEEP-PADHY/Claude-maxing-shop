import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showDot = true,
}) => {
  const normalized = status.toUpperCase();

  let styles = "bg-[#202020] text-[#A3A3A3] border-[#2D2D2D]";
  let dotColor = "bg-[#6F6F6F]";

  if (
    normalized === "ACTIVE" ||
    normalized === "PAID" ||
    normalized === "SUCCESS" ||
    normalized === "FULFILLED"
  ) {
    styles = "bg-emerald-950/40 text-emerald-400 border-emerald-800/40";
    dotColor = "bg-emerald-400";
  } else if (
    normalized === "PENDING" ||
    normalized === "PAYMENT_PENDING" ||
    normalized === "FULFILMENT_PENDING" ||
    normalized === "CREATED" ||
    normalized === "PROCESSING" ||
    normalized === "IN_PROGRESS"
  ) {
    styles = "bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30";
    dotColor = "bg-[#D97757]";
  } else if (
    normalized === "FAILED" ||
    normalized === "PAYMENT_FAILED" ||
    normalized === "CANCELLED" ||
    normalized === "EXPIRED"
  ) {
    styles = "bg-rose-950/40 text-rose-400 border-rose-800/40";
    dotColor = "bg-rose-400";
  } else if (normalized === "REFUNDED") {
    styles = "bg-amber-950/40 text-amber-400 border-amber-800/40";
    dotColor = "bg-amber-400";
  }

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border",
          styles,
          className
        )
      )}
    >
      {showDot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", dotColor)}
        />
      )}
      {status}
    </span>
  );
};
