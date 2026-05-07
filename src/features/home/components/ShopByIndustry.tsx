import Image from "next/image";
import Link from "next/link";

type IndustryTile = {
  label: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const INDUSTRY_TILES: IndustryTile[] = [
  {
    label: "Beverage",
    href: "/industries/beverage",
    imageSrc: "/images/industry/beverage.gif",
    imageAlt: "Beverage industry application",
  },
  {
    label: "Food",
    href: "/industries/food",
    imageSrc: "/images/industry/food.gif",
    imageAlt: "Food industry application",
  },
  {
    label: "Medical",
    href: "/industries/medical",
    imageSrc: "/images/industry/medical.gif",
    imageAlt: "Medical industry application",
  },
  {
    label: "Cold Chain",
    href: "/industries/cold-chain",
    imageSrc: "/images/industry/cold-chain.gif",
    imageAlt: "Cold chain industry application",
  },
  {
    label: "Aerospace",
    href: "/industries/aerospace",
    imageSrc: "/images/industry/aerospace.gif",
    imageAlt: "Aerospace industry application",
  },
  {
    label: "Read our Blog",
    href: "/resources/blog",
    imageSrc: "/images/industry/blog.png",
    imageAlt: "More markets and blog",
  },
];

export function ShopByIndustry() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-8 text-center text-2xl">
          <span className="font-bold text-zinc-900">Shop by</span>{" "}
          <span className="text-zinc-500">Industry</span>
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {INDUSTRY_TILES.map((tile) => (
            <IndustryTileCard key={tile.label} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustryTileCard({ tile }: { tile: IndustryTile }) {
  return (
    <Link
      href={tile.href}
      className="group relative block aspect-[4/3] overflow-hidden rounded-md"
    >
      <Image
        src={tile.imageSrc}
        alt={tile.imageAlt}
        fill
        sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/90 px-6 py-2 text-base font-semibold text-zinc-900 shadow">
        {tile.label}
      </span>
    </Link>
  );
}
