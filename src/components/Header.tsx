"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { Button } from "./ui/Button";
import { Menu, X, Sparkles, User as UserIcon, ShieldCheck } from "lucide-react";

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Plans", href: "/plans" },
    { name: "How it works", href: "/#how-it-works" },
    { name: "Support", href: "/support" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0B]/85 backdrop-blur-md border-b border-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-transform active:scale-95 group"
        >
          <div className="w-7 h-7 rounded-[8px] bg-[#D97757] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            <Sparkles size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight text-[#F5F5F5] text-sm sm:text-base">
              {siteConfig.name}
            </span>
            <span className="text-[10px] text-[#6F6F6F] font-mono leading-none hidden sm:block">
              Authorized Subscription Access
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#151515] border border-[#2D2D2D] text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                  isActive
                    ? "bg-[#202020] text-[#F5F5F5] shadow-sm"
                    : "text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                  pathname.startsWith("/dashboard")
                    ? "bg-[#202020] text-[#F5F5F5]"
                    : "text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/orders"
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                  pathname.startsWith("/orders")
                    ? "bg-[#202020] text-[#F5F5F5]"
                    : "text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
                }`}
              >
                Orders
              </Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-full text-[#D97757] hover:bg-[#202020] transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Trailing CTAs / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link href="/account">
                <Button variant="ghost" size="sm" className="gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full bg-[#202020] border border-[#2D2D2D] flex items-center justify-center text-[#F5F5F5] text-[10px]">
                    <UserIcon size={12} />
                  </div>
                  <span>{user.name.split(" ")[0]}</span>
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="primary" size="sm">
                  Get Claude
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="primary" size="sm">
                  Get Claude
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-[8px] text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#151515] border border-transparent hover:border-[#2D2D2D]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#2D2D2D] bg-[#0E0E0E] px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-[8px] text-sm text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#151515]"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-[8px] text-sm text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#151515]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-[8px] text-sm text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#151515]"
                >
                  Orders
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-[8px] text-sm text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#151515]"
                >
                  Account Profile
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-[8px] text-sm text-[#D97757] hover:bg-[#151515]"
                  >
                    Admin Console
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-[8px] text-sm text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#151515]"
              >
                Sign In
              </Link>
            )}
          </div>
          <div className="pt-2 border-t border-[#2D2D2D] flex flex-col gap-2">
            <Link
              href="/plans"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="primary" size="md" className="w-full">
                Get Claude
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
