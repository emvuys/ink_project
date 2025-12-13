import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inkButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-[#1a1a2e] text-white hover:bg-[#252540] shadow-lg hover:shadow-xl",
        secondary: "bg-background text-foreground border border-border hover:bg-secondary shadow-neumorphic hover:shadow-neumorphic-inset",
      },
      size: {
        default: "h-[56px] px-8 text-[13px] rounded-xl",
        full: "h-[56px] w-full px-8 text-[13px] rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface InkButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof inkButtonVariants> {}

const InkButton = React.forwardRef<HTMLButtonElement, InkButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(inkButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
InkButton.displayName = "InkButton";

export { InkButton, inkButtonVariants };
