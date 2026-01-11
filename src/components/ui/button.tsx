import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        outline: "border border-border bg-transparent text-foreground hover:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "hover:bg-secondary text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        emergency: "bg-emergency text-emergency-foreground hover:opacity-90 animate-emergency-pulse",
        emergencyStatic: "bg-emergency text-emergency-foreground hover:opacity-90",
        success: "bg-success text-success-foreground hover:opacity-90",
        warning: "bg-warning text-warning-foreground hover:opacity-90",
        flat: "bg-secondary text-foreground hover:bg-accent",
      },
      size: {
        default: "h-12 px-5 py-2",
        sm: "h-10 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-xl px-6 text-base",
        xl: "h-16 rounded-2xl px-8 text-lg",
        icon: "h-12 w-12",
        iconSm: "h-10 w-10 rounded-lg",
        iconLg: "h-14 w-14",
        emergency: "h-36 w-36 rounded-full text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
