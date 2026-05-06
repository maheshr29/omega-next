type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 ${className}`}
    />
  );
}
