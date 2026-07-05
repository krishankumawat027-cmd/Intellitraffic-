'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'btn-primary text-white shadow-lg hover:shadow-[0_8px_25px_-5px_rgba(56,189,248,0.4)]',
        secondary: 'btn-secondary text-white hover:bg-white/10',
        danger: 'btn-danger text-white shadow-lg hover:shadow-[0_8px_25px_-5px_rgba(239,68,68,0.4)]',
        outline: 'border border-white/20 bg-transparent text-white hover:bg-white/5 hover:border-white/30',
        ghost: 'bg-transparent text-white hover:bg-white/10',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:shadow-[0_8px_25px_-5px_rgba(34,197,94,0.4)] rounded-xl',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-xl',
        md: 'h-11 px-6 text-sm rounded-xl',
        lg: 'h-12 px-8 text-base rounded-xl',
        xl: 'h-14 px-10 text-lg rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loadingText, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

const MotionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, loadingText, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);
MotionButton.displayName = 'MotionButton';

const IconButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'children'> & { icon: React.ReactNode }>(
  ({ className, size = 'icon', icon, ...props }, ref) => {
    return (
      <Button className={cn('p-0', className)} size={size} ref={ref} {...props}>
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = 'IconButton';

export { Button, MotionButton, IconButton, buttonVariants };
