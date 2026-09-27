import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  user,
  hideHeader = false,
  hideFooter = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-[#F5F5F5]">
      {!hideHeader && <Header user={user} />}
      <main className="flex-1 w-full">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};
