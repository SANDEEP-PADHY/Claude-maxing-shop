import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  className,
  label,
  error,
  helperText,
  id,
  value = "",
  onChange,
  ...props
}) => {
  const inputId = id || props.name || "phone-input";

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d+]/g, "");
    if (onChange) {
      onChange(raw);
    }
  };

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
      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none text-xs font-mono text-[#A3A3A3] border-r border-[#2D2D2D] pr-2.5">
          <span>🇮🇳</span>
          <span>+91</span>
        </div>
        <input
          id={inputId}
          type="tel"
          value={value.replace(/^\+91\s?/, "")}
          onChange={handlePhoneChange}
          placeholder="98765 43210"
          className={twMerge(
            clsx(
              "w-full bg-[#0E0E0E] text-[#F5F5F5] placeholder-[#6F6F6F] border border-[#2D2D2D] rounded-[10px] pl-20 pr-3.5 py-2.5 text-sm transition-all focus:outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] disabled:opacity-50 disabled:bg-[#151515]",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
              className
            )
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-[#6F6F6F]">{helperText}</p>
      )}
    </div>
  );
};
