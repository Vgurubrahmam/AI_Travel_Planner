import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'border-2 border-primary border-t-transparent rounded-full animate-spin',
          sizeMap[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-muted-foreground animate-pulse-slow">{text}</p>}
    </div>
  );
}
