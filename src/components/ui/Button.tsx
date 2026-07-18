'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
}

// ボタン規約(STYLE_GUIDE「コンポーネント規約」):
// - 主ボタン: bg-accent。金は1画面に1要素まで。使う側で守ること
// - 副ボタン: 背景なし + border-line。hoverは色の変化のみ
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'medium',
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md',
          'transition-colors duration-quick ease-standard',
          'disabled:pointer-events-none disabled:text-disabled',

          {
            'px-3 py-1.5 text-sm': size === 'small',
            'px-5 py-2.5 text-sm': size === 'medium',
            'px-6 py-3.5 text-base': size === 'large',
          },

          {
            'bg-accent text-on-accent hover:bg-accent-hover disabled:bg-line':
              variant === 'primary',
            'border border-line bg-transparent text-secondary hover:text-primary':
              variant === 'secondary',
            'bg-transparent text-secondary hover:text-primary': variant === 'ghost',
          },

          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
