import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import brushStroke from "@/assets/brush-stroke.png";

interface InkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

const InkButton = forwardRef<HTMLButtonElement, InkButtonProps>(
  ({ className, size = "md", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-14 min-w-[200px]",
      md: "h-16 min-w-[260px]",
      lg: "h-20 min-w-[320px]",
    };

    const imgSizeClasses = {
      sm: "w-[320px] h-[140px]",
      md: "w-[400px] h-[170px]",
      lg: "w-[480px] h-[200px]",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative flex items-center justify-center transition-all duration-200 active:scale-95 hover:opacity-90 bg-transparent border-none outline-none overflow-visible",
          sizeClasses[size],
          className
        )}
        style={{ background: 'none' }}
        {...props}
      >
        {/* Brush stroke background image */}
        <img
          src={brushStroke}
          alt=""
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none",
            imgSizeClasses[size]
          )}
        />
        {/* Button text */}
        <span className="relative z-10 text-white font-medium tracking-widest uppercase text-xs">
          {children}
        </span>
      </button>
    );
  }
);

InkButton.displayName = "InkButton";

export { InkButton };