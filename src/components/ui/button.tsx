import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        // Uber primary: black bg, white text
        default: "bg-[#000000] text-[#FFFFFF] hover:bg-[#333333] dark:bg-[#FFFFFF] dark:text-[#000000] dark:hover:bg-[#E2E2E2]",
        destructive: "bg-[#E11900] text-[#FFFFFF] hover:bg-[#C41600]",
        // Uber outline: transparent with black border
        outline: "border-2 border-[#E2E2E2] bg-transparent text-[#000000] hover:bg-[#F6F6F6] dark:text-[#FFFFFF] dark:border-[#333333] dark:hover:bg-[#1A1A1A]",
        // Uber secondary: gray pill
        secondary: "bg-[#F6F6F6] text-[#000000] hover:bg-[#E2E2E2] dark:bg-[#1A1A1A] dark:text-[#FFFFFF] dark:hover:bg-[#333333]",
        ghost: "hover:bg-[#F6F6F6] hover:text-[#000000] dark:hover:bg-[#1A1A1A] dark:hover:text-[#FFFFFF]",
        link: "text-[#000000] underline-offset-4 hover:underline dark:text-[#FFFFFF]",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-[0.9375rem]",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
