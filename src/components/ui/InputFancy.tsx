"use client";

import { Input } from "./Input";
import { useRef, useState } from "react";
import { PasswordHideIcon, PasswordShowIcon } from "../Icons";
import { cn } from "@/lib/utils";

type FancyInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: boolean;
  suffix?: React.ReactNode;
  inputClassName?: string;
  variant?: "default" | "password";
};

export function FancyInput({
  id,
  label,
  error = false,
  suffix,
  inputClassName,
  variant = "default",
  ...props
}: FancyInputProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(props.value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const suffixRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(
    variant === "password" ? false : true
  );

  const isActive = focused || !!value;

  return (
    <div className={cn("relative grow", props.className)}>
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 top-0 -translate-y-1/2 bg-background px-1 transition-all hover:cursor-text",
          error
            ? "text-destructive"
            : isActive
            ? "text-[rgba(80,181,255,1)]"
            : "text-gray-500",
          isActive ? "top-0 text-xs" : "top-1/2 text-sm"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {label}
      </label>

      <Input
        id={id}
        ref={inputRef}
        type={showPassword ? "text" : "password"}
        {...props}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          props.onChange?.(e);
        }}
        className={cn(
          "rounded-md border p-3 text-sm outline-none",
          inputClassName,
          error
            ? "border-red-400 focus:border-destructive focus:ring-destructive/50"
            : isActive
            ? "border-blue-400 focus-visible:border-[rgba(80,181,255,1)]! focus-visible:ring-[rgba(80,181,255,1)]/50"
            : "border-gray-300"
        )}
        style={{
          // eslint-disable-next-line react-hooks/refs
          paddingRight: suffixRef.current
            // eslint-disable-next-line react-hooks/refs
            ? suffixRef.current.clientWidth + 20
            : undefined,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {(suffix || variant === "password") && (
        <div
          ref={suffixRef}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm flex items-center gap-2"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
        >
          {suffix}
          {variant === "password" && (
            <div
              className="cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <PasswordShowIcon /> : <PasswordHideIcon />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
