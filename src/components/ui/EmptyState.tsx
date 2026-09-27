import React from "react";
import Link from "next/link";
import { Button } from "./Button";
import { PackageOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[16px] bg-[#151515] border border-dashed border-[#2D2D2D] my-4">
      <div className="w-12 h-12 rounded-full bg-[#202020] border border-[#2D2D2D] flex items-center justify-center text-[#A3A3A3] mb-4">
        {icon || <PackageOpen size={22} />}
      </div>
      <h3 className="text-base font-semibold text-[#F5F5F5] mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-sm mb-6">
          {description}
        </p>
      )}
      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" size="sm">
            {actionText}
          </Button>
        </Link>
      )}
      {actionText && !actionHref && onActionClick && (
        <Button variant="primary" size="sm" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
