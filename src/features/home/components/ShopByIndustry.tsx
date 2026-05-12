import Image from "next/image";
import Link from "next/link";
import type {
  IndustryCard,
  IndustrySection,
} from "@/contracts/industrySection";
import { getIndustrySection } from "@/server/domains/industrySection/industrySection.service";
import { logger } from "@/server/observability/logger";

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveHref(card: IndustryCard): string {
  if (card.href) return card.href;
  const slug = slugify(card.label);
  if (!slug) return "#";
  if (slug === "read-our-blog") return "/resources/blog";
  return `/industries/${slug}`;
}

function splitTitle(title: string): { bold: string; rest: string } {
  const parts = title.split(" ");
  if (parts.length <= 1) return { bold: title, rest: "" };
  const boldWords = parts.length >= 2 ? parts.slice(0, 2) : parts.slice(0, 1);
  return {
    bold: boldWords.join(" "),
    rest: parts.slice(boldWords.length).join(" "),
  };
}

export async function ShopByIndustry() {
  let data: IndustrySection | null = null;
  try {
    data = await getIndustrySection();
  } catch (err) {
    logger.error({ err }, "industrySection.fetch-failed");
  }

  if (!data || data.cards.length === 0) return null;

  const { bold, rest } = splitTitle(data.title);

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        {data.title ? (
          <h2 className="mb-8 text-center text-2xl">
            <span className="font-bold text-zinc-900">{bold}</span>
            {rest ? <span className="text-zinc-500"> {rest}</span> : null}
          </h2>
        ) : null}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {data.cards.map((card, i) => (
            <IndustryTileCard
              key={`${card.label}-${i}`}
              card={card}
              href={deriveHref(card)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustryTileCard({
  card,
  href,
}: {
  card: IndustryCard;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/3] overflow-hidden rounded-md"
    >
      {card.image?.url ? (
        <Image
          src={card.image.url}
          alt={card.image.alt ?? card.label}
          fill
          sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-zinc-200" aria-hidden="true" />
      )}
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/90 px-6 py-2 text-base font-semibold text-zinc-900 shadow">
        {card.label}
      </span>
    </Link>
  );
}
