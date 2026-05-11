import Image from "next/image";
import type { ProductSummary } from "@/contracts/product";

type ProductCardProps = {
  product: ProductSummary;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            no image
          </div>
        )}
        {!product.inStock && (
          <span className="absolute left-2 top-2 rounded bg-zinc-900/80 px-2 py-0.5 text-xs text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
        {product.price && (
          <p className="text-sm font-semibold text-black">
            {product.price.formatted ??
              `${product.price.amount.toFixed(2)} ${product.price.currency}`}
          </p>
        )}
      </div>
    </article>
  );
}
