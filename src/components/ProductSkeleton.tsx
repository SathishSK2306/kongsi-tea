export function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden glass border border-border/60 animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="flex items-end justify-between pt-2">
          <div className="h-6 w-20 bg-muted rounded" />
          <div className="size-9 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
