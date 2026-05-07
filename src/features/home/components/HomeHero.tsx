import Image from "next/image";
import Link from "next/link";

const HERO_DATA = {
  partner: {
    name: "Burns Engineering",
    headline:
      "DwyerOmega welcomes Burns Engineering, a leading provider of temperature measurement solutions.",
    readMoreHref: "/news/burns-engineering",
    logo: {
      src: "https://assets.dwyeromega.com/homepage-assets/hero-banner/burns-banner-logo.png",
      alt: "Burns Engineering",
      width: 160,
      height: 40,
    },
  },
  productImage: {
    src: "https://assets.dwyeromega.com/homepage-assets/hero-banner/burns-banner-prodImg.png?imwidth=1024",
    alt: "Burns Engineering temperature sensor",
  },
};

export function HomeHero() {
  return (
    <section className="bg-zinc-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 py-10 lg:grid-cols-[1fr_minmax(320px,1.2fr)_360px] lg:gap-10">
        <PartnerAnnouncement />
        <ProductShowcase />
        <QuickOrderPanel />
      </div>
    </section>
  );
}

function PartnerAnnouncement() {
  return (
    <div>
      <Image
        src={HERO_DATA.partner.logo.src}
        alt={HERO_DATA.partner.logo.alt}
        width={HERO_DATA.partner.logo.width}
        height={HERO_DATA.partner.logo.height}
        style={{ height: 36, width: "auto" }}
        priority
      />
      <p className="mt-4 max-w-md text-3xl font-bold leading-tight text-[#1F2D63]">
        {HERO_DATA.partner.headline}
      </p>
      <Link
        href={HERO_DATA.partner.readMoreHref}
        className="mt-6 inline-block text-sm font-semibold text-[#1F2D63] underline underline-offset-4 hover:text-[#16224d]"
      >
        Read more
      </Link>
    </div>
  );
}

function ProductShowcase() {
  return (
    <div className="relative h-56 w-full overflow-hidden lg:h-72">
      <Image
        src={HERO_DATA.productImage.src}
        alt={HERO_DATA.productImage.alt}
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
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
