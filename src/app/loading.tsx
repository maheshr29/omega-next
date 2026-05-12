import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col gap-8 px-6 py-16">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </main>
  );
}
