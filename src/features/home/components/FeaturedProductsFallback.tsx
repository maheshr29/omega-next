import { Skeleton } from "@/components/ui/Skeleton";

export function FeaturedProductsFallback() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 gap-6 px-12 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="aspect-[4/3] w-full rounded-md" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Skeleton className="h-11 w-48 rounded-full" />
        </div>
      </div>
    </section>
  );
}
