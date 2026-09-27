import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-[#151515] border border-[#2D2D2D]",
      elevated: "bg-[#202020] border border-[#2D2D2D]",
      outline: "bg-transparent border border-[#2D2D2D]",
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            "rounded-[16px] p-6 text-[#F5F5F5] transition-all",
            variantStyles[variant],
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
