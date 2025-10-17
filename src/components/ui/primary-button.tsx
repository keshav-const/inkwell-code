import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PrimaryButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  angled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glow = false,
  angled = false,
  className,
  children,
  disabled = false,
  onClick,
  type = 'button',
}) => {
  const baseClasses = "font-medium transition-all duration-normal focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    ghost: "btn-ghost",
    accent: "bg-accent hover:bg-accent/90 text-accent-foreground border border-transparent",
    outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-sm",
    md: "px-4 py-2 text-sm rounded-md",
    lg: "px-6 py-3 text-base rounded-lg"
  };
  
  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    glow && "btn-glow",
    angled && "btn-angled",
    className
  );

  return (
    <motion.button
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.button>
  );
};