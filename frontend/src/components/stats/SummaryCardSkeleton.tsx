import { Skeleton } from '@/components/ui/skeleton';

export function SummaryCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-28 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
