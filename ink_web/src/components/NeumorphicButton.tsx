import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface NeumorphicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "pressed";
  size?: "sm" | "md" | "lg";
}

const NeumorphicButton = forwardRef<HTMLButtonElement, NeumorphicButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-10 px-4",
      md: "h-12 px-5",
      lg: "h-14 px-6",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "rounded-2xl bg-background flex items-center justify-center transition-all duration-200 active:scale-95",
          variant === "default" && "shadow-neumorphic hover:shadow-neumorphic-inset",
          variant === "pressed" && "shadow-neumorphic-inset",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeumorphicButton.displayName = "NeumorphicButton";

export { NeumorphicButton };

