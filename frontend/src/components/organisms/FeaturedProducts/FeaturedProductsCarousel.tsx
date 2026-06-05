"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@shared/types/product";

type Props = {
  products: Product[];
  browseAllHref?: string;
  title?: string;
  ctaText?: string;
};

export function FeaturedProductsCarousel({
  products,
  browseAllHref = "/products",
  title = "Featured Products",
  ctaText = "Browse all Products",
}: Props) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstItem = el.querySelector<HTMLLIElement>("[data-carousel-item]");
    const step = firstItem?.offsetWidth ?? el.clientWidth / 2;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-8 text-center text-xl font-bold text-zinc-900 sm:mb-10 sm:text-2xl md:text-3xl">
          {title}
        </h2>

        <div className="relative">
          <ArrowButton
            direction="prev"
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
          />

          <ul
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-6 sm:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <li
                key={product.code}
                data-carousel-item
                className="w-3/4 shrink-0 snap-start sm:w-1/2 lg:w-1/4"
              >
                <FeaturedCard product={product} />
              </li>
            ))}
          </ul>

          <ArrowButton
            direction="next"
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
          />
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={browseAllHref}
            className="inline-flex items-center justify-center rounded-full bg-[#1F2D63] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#16224d]"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ product }: { product: Product }) {
  return (
    <Link
      href={product.slug ?? `/products/${product.code}`}
      className="group flex h-full flex-col items-center gap-3"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            no image
          </div>
        )}
      </div>
      <h3 className="line-clamp-2 px-2 text-center text-sm font-medium text-zinc-900">
        {product.name}
      </h3>
      {product.price && (
        <p className="text-base font-bold text-[#1F2D63]">
          {product.price.formatted ??
            `${product.price.amount.toFixed(2)} ${product.price.currency}`}
        </p>
      )}
    </Link>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? "Previous products" : "Next products"}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#1F2D63]/40 bg-white text-[#1F2D63] shadow-sm transition hover:border-[#1F2D63] hover:bg-[#1F2D63] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#1F2D63] sm:flex ${
        isPrev ? "-left-2" : "-right-2"
      }`}
    >
      <Chevron direction={direction} />
    </button>
  );
}
function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d={direction === "prev" ? "M10 3 L 5 8 L 10 13" : "M6 3 L 11 8 L 6 13"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
