import Image from "next/image";
import Link from "next/link";
import type { HeroBanner } from "@shared/types/heroBanner";

const FALLBACK_BANNER: HeroBanner = {
  headline:
    "DwyerOmega welcomes Burns Engineering, a leading provider of temperature measurement solutions.",
  partnerLogo: {
    url: "/images/hero/burns-logo.png",
    alt: "Burns Engineering",
    width: 160,
    height: 40,
  },
  productImage: {
    url: "/images/hero/burns-product.png",
    alt: "Burns Engineering temperature sensor",
  },
  readMore: { label: "Read more", href: "/news/burns-engineering" },
};

type HomeHeroProps = {
  data?: HeroBanner;
};

export function HomeHero({ data: banner = FALLBACK_BANNER }: HomeHeroProps = {}) {
  return (
    <section className="bg-zinc-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 py-8 sm:px-6 sm:py-10 md:grid-cols-2 md:gap-8 lg:grid-cols-[1fr_minmax(320px,1.2fr)_360px] lg:gap-10">
        <PartnerAnnouncement banner={banner} />
        <ProductShowcase banner={banner} />
        <div className="md:col-span-2 lg:col-span-1">
          <QuickOrderPanel />
        </div>
      </div>
    </section>
  );
}

function PartnerAnnouncement({ banner }: { banner: HeroBanner }) {
  const logo = banner.partnerLogo;
  return (
    <div>
      {logo?.url ? (
        <Image
          src={logo.url}
          alt={logo.alt ?? ""}
          width={logo.width ?? 160}
          height={logo.height ?? 40}
          style={{ height: 36, width: "auto" }}
          priority
        />
      ) : null}
      <p className="mt-4 max-w-md text-2xl font-bold leading-tight text-[#1F2D63] sm:text-3xl">
        {banner.headline}
      </p>
      {banner.readMore && (
        <Link
          href={banner.readMore.href}
          className="mt-6 inline-block text-sm font-semibold text-[#1F2D63] underline underline-offset-4 hover:text-[#16224d]"
        >
          {banner.readMore.label}
        </Link>
      )}
    </div>
  );
}

function ProductShowcase({ banner }: { banner: HeroBanner }) {
  const image = banner.productImage;
  if (!image?.url) {
    return <div className="relative h-48 w-full sm:h-56 lg:h-72" aria-hidden="true" />;
  }
  return (
    <div className="relative h-48 w-full overflow-hidden sm:h-56 lg:h-72">
      <Image
        src={image.url}
        alt={image.alt ?? ""}
        fill
        priority
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-contain"
      />
    </div>
  );
}

function QuickOrderPanel() {
  return (
    <div className="rounded-md bg-white p-5 shadow-md">
      <h2 className="text-lg font-bold text-[#1F2D63]">Quick Order</h2>
      <p className="mt-1 text-sm text-zinc-700">
        Enter part numbers to order or quote
      </p>
      <p className="mt-1 text-xs text-zinc-500">Need more entry fields?</p>

      <form
        className="mt-4 flex flex-col gap-2"
        action="/cart/quick-add"
        method="POST"
      >
        <PartLineRow />
        <PartLineRow />
        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#1F2D63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#16224d]"
        >
          <CartIconSmall className="h-4 w-4" />
          Add To Cart
        </button>
      </form>
    </div>
  );
}

function PartLineRow() {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        name="partNumber[]"
        placeholder="Part #"
        aria-label="Part number"
        className="flex-1 rounded-sm border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-[#1F2D63] focus:outline-none"
      />
      <input
        type="number"
        name="quantity[]"
        min={1}
        placeholder="Qty"
        aria-label="Quantity"
        className="w-20 rounded-sm border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-[#1F2D63] focus:outline-none"
      />
    </div>
  );
}

function CartIconSmall({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}
