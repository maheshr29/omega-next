import { Skeleton } from "@/components/atoms/Skeleton";

type Props = {
  title?: string;
};

export function FeaturedProductsFallback({
  title = "Featured Products",
}: Props = {}) {
  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-8 text-center text-xl font-bold text-zinc-900 sm:mb-10 sm:text-2xl md:text-3xl">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:px-12 lg:grid-cols-4">
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
