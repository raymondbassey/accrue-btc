import { Skeleton } from '@/components/ui/skeleton';

interface ChartSkeletonProps {
  height?: 'sm' | 'lg';
}

export function ChartSkeleton({ height = 'sm' }: ChartSkeletonProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className={height === 'lg' ? 'h-56' : 'h-48'} />
    </div>
  );
}
