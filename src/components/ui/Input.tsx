import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#A3A3A3] tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              "w-full bg-[#0E0E0E] text-[#F5F5F5] placeholder-[#6F6F6F] border border-[#2D2D2D] rounded-[10px] px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] disabled:opacity-50 disabled:bg-[#151515]",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[#6F6F6F]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
