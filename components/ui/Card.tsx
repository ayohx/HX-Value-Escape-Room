'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  animate?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      animate = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-lg bg-white dark:bg-gray-800'

    const variants = {
      default: 'border border-gray-200 dark:border-gray-700',
      bordered: 'border-2 border-gray-300 dark:border-gray-600',
      elevated: 'shadow-lg border border-gray-100 dark:border-gray-700',
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    const CardComponent = animate ? motion.div : 'div'
    const motionProps: MotionProps = animate
      ? {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3 },
        }
      : {}

    return (
      <CardComponent
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${paddings[padding]}
          ${className}
        `}
        {...(motionProps as any)}
        {...props}
      >
        {children}
      </CardComponent>
    )
  }
)

Card.displayName = 'Card'

export default Card

