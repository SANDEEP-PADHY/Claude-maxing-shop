"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0B0B]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Frame */}
      <div
        className={`relative w-full ${maxWidthClass} bg-[#151515] border border-[#2D2D2D] rounded-[16px] shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D] mb-5">
          <h3 className="text-base font-semibold text-[#F5F5F5]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#202020] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
