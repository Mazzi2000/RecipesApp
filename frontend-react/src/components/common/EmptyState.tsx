import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center',
        className,
      )}
    >
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
