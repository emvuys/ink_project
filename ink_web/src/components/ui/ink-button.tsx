import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inkButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-bold uppercase transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ink-black text-ink-white hover:opacity-90",
        secondary: "bg-ink-white text-ink-black border border-ink-black hover:opacity-90",
      },
      size: {
        default: "h-[56px] px-8 text-[14px]",
        full: "h-[56px] w-full px-8 text-[14px]",
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
