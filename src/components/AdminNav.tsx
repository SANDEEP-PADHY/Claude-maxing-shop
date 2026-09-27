"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, Key, ArrowLeft } from "lucide-react";

export const AdminNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Orders & Payments", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: Key },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2D2D2D] mb-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-[#A3A3A3] hover:text-[#F5F5F5] font-mono mr-2"
          >
            <ArrowLeft size={13} />
            <span>Customer Portal</span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded bg-[#D97757]/15 text-[#D97757] font-mono font-medium border border-[#D97757]/30">
            Admin Console
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">
          Store Operations Management
        </h1>
      </div>

      <nav className="flex items-center gap-1.5 p-1 rounded-[10px] bg-[#151515] border border-[#2D2D2D] text-xs">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] transition-colors ${
                isActive
                  ? "bg-[#202020] text-[#F5F5F5] font-medium"
                  : "text-[#A3A3A3] hover:text-[#F5F5F5]"
              }`}
            >
              <Icon size={14} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
