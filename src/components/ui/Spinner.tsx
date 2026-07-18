import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        'border-line-strong border-t-secondary',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="読み込み中"
    >
      <span className="sr-only">読み込み中...</span>
    </div>
  );
}

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({ message = '読み込み中...', fullScreen = false, className }: LoadingProps) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4',
      fullScreen ? 'min-h-screen' : 'py-12',
      className
    )}>
      <Spinner size="lg" />
      <p className="text-sm text-secondary">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-base/90">
        {content}
      </div>
    );
  }

  return content;
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={cn('animate-pulse bg-line', variantClasses[variant], className)}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
}

interface LoadingCardProps {
  count?: number;
  className?: string;
}

export function LoadingCard({ count = 1, className }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('rounded-card bg-surface p-6 shadow-card', className)}
        >
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={200} className="w-full" />
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" className="flex-1" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
