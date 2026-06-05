import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import type {
  HelpCard,
  HelpSection as HelpSectionData,
} from "@shared/types/helpSection";

const DEFAULT_HREFS = [
  "/contact-us",
  "/resources",
  "https://info.dwyeromega.com/communications-signup",
  "/about-us",
] as const;

const FALLBACK_HELP_SECTION: HelpSectionData = {
  title: "Help is here however you need it.",
  cards: [
    {
      eyebrow: "CONTACT US",
      heading: "Contact our specialists any time using our help center form.",
      image: {
        url: "/images/help/contact-us.png",
        alt: "DwyerOmega specialist ready to help",
      },
      href: DEFAULT_HREFS[0],
    },
    {
      eyebrow: "RESOURCES",
      heading: "Search our Resources center to view our application stories.",
      href: DEFAULT_HREFS[1],
    },
    {
      eyebrow: "NEWSLETTER SIGN UP",
      heading: "Subscribe For our latest News and offers.",
      href: DEFAULT_HREFS[2],
    },
    {
      eyebrow: "DWYEROMEGA",
      description:
        "Our story so far. Find out who we are and why we are the number one provider of Measurement Equipment & Services.",
      image: {
        url: "/images/help/story.png",
        alt: "DwyerOmega measurement equipment",
      },
      href: DEFAULT_HREFS[3],
    },
  ],
};

function splitTitle(title: string): { bold: string; rest: string } {
  const idx = title.indexOf(" ");
  if (idx === -1) return { bold: title, rest: "" };
  const firstTwoEnd = title.indexOf(" ", idx + 1);
  if (firstTwoEnd === -1) return { bold: title, rest: "" };
  return {
    bold: title.slice(0, firstTwoEnd),
    rest: title.slice(firstTwoEnd + 1),
  };
}

function hrefFor(card: HelpCard, index: number): string {
  return card.href ?? DEFAULT_HREFS[index] ?? "#";
}

type HelpSectionProps = {
  data?: HelpSectionData;
};

export function HelpSection({ data: input }: HelpSectionProps = {}) {
  const data =
    input && input.cards.length > 0 ? input : FALLBACK_HELP_SECTION;
  const { bold, rest } = splitTitle(data.title);
  const [contactCard, ...restCards] = data.cards;
  const smallCards = restCards.slice(0, 2);
  const storyCard = restCards[2];

  return (
    <section className="bg-zinc-100 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 text-xl sm:mb-8 sm:text-2xl md:text-3xl">
          <span className="font-bold text-zinc-900">{bold}</span>
          {rest ? <span className="text-zinc-500"> {rest}</span> : null}
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-[auto_auto]">
          {contactCard ? (
            <div className="md:row-span-2">
              <ContactCard card={contactCard} href={hrefFor(contactCard, 0)} />
            </div>
          ) : null}
          {smallCards.map((card, i) => (
            <SmallCard
              key={card.eyebrow ?? card.heading ?? i}
              card={card}
              href={hrefFor(card, i + 1)}
              Icon={DEFAULT_ICONS[i] ?? null}
            />
          ))}
          {storyCard ? (
            <div className="md:col-span-2">
              <StoryCard card={storyCard} href={hrefFor(storyCard, 3)} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ContactCard({ card, href }: { card: HelpCard; href: string }) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-sm bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-3 p-5">
        {card.eyebrow ? (
          <p className="text-xs font-semibold tracking-widest text-zinc-500">
            {card.eyebrow}
          </p>
        ) : null}
        {card.heading ? (
          <p className="text-base font-bold leading-snug text-zinc-900">
            {card.heading}
          </p>
        ) : null}
      </div>
      {card.image?.url ? (
        <div className="relative mt-auto h-48 w-full sm:h-56 md:h-64">
          <Image
            src={card.image.url}
            alt={card.image.alt ?? ""}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-contain object-bottom"
          />
        </div>
      ) : null}
    </Link>
  );
}

function SmallCard({
  card,
  href,
  Icon,
}: {
  card: HelpCard;
  href: string;
  Icon: ComponentType | null;
}) {
  const isExternal = /^https?:\/\//i.test(href);
  const inner = (
    <article className="group flex h-full items-center gap-3 rounded-sm bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-5 sm:p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-16 sm:w-16">
        {card.icon?.url ? (
          <Image
            src={card.icon.url}
            alt={card.icon.alt ?? ""}
            width={card.icon.width ?? 64}
            height={card.icon.height ?? 64}
            className="h-14 w-14 object-contain"
          />
        ) : Icon ? (
          <Icon />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {card.eyebrow ? (
          <p className="text-xs font-semibold tracking-widest text-zinc-500">
            {card.eyebrow}
          </p>
        ) : null}
        {card.heading ? (
          <p className="text-base font-bold leading-snug text-zinc-900">
            {card.heading}
          </p>
        ) : null}
      </div>
    </article>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  );
}

function StoryCard({ card, href }: { card: HelpCard; href: string }) {
  const eyebrow = card.eyebrow ?? "DWYEROMEGA";
  return (
    <Link
      href={href}
      className="group grid h-full grid-cols-1 overflow-hidden rounded-sm bg-white shadow-sm transition-shadow hover:shadow-md md:grid-cols-[1.4fr_1fr]"
    >
      <div className="flex flex-col gap-3 p-6">
        <div className="inline-flex items-center gap-2 text-[#1F2D63]">
          {card.icon?.url ? (
            <Image
              src={card.icon.url}
              alt={card.icon.alt ?? ""}
              width={card.icon.width ?? 24}
              height={card.icon.height ?? 24}
              className="h-6 w-auto"
            />
          ) : (
            <DwyerOmegaMark />
          )}
          <span className="text-base font-bold tracking-wide">{eyebrow}</span>
        </div>
        {card.description ? (
          <p className="text-base leading-snug text-zinc-900">
            {card.description}
          </p>
        ) : card.heading ? (
          <p className="text-base leading-snug text-zinc-900">{card.heading}</p>
        ) : null}
      </div>
      {card.image?.url ? (
        <div className="relative hidden h-full min-h-32 md:block">
          <Image
            src={card.image.url}
            alt={card.image.alt ?? ""}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover"
          />
        </div>
      ) : null}
    </Link>
  );
}

const DEFAULT_ICONS: (ComponentType | null)[] = [
  ResourcesIllustration,
  NewsletterIllustration,
];

function DwyerOmegaMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6 text-[#D63D2E]"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M16 18 L 20 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ResourcesIllustration() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14">
      <path
        d="M6 10 H 50 A 4 4 0 0 1 54 14 V 38 A 4 4 0 0 1 50 42 H 22 L 12 52 V 42 H 10 A 4 4 0 0 1 6 38 Z"
        fill="#E5E7EB"
      />
      <g transform="translate(30 26)">
        <circle cx="0" cy="0" r="9" fill="#D63D2E" />
        <g fill="#FFFFFF">
          <rect x="-1.5" y="-9.5" width="3" height="3.5" />
          <rect x="-1.5" y="6" width="3" height="3.5" />
          <rect x="-9.5" y="-1.5" width="3.5" height="3" />
          <rect x="6" y="-1.5" width="3.5" height="3" />
        </g>
        <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

function NewsletterIllustration() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14">
      <path
        d="M14 38 V 28 a 4 4 0 0 1 4 -4 h 1 V 18 a 3 3 0 0 1 6 0 v 14 h 2 V 14 a 3 3 0 0 1 6 0 v 18 h 2 V 18 a 3 3 0 0 1 6 0 v 16 h 2 V 26 a 3 3 0 0 1 6 0 v 18 a 12 12 0 0 1 -12 12 H 26 a 12 12 0 0 1 -12 -12 z"
        fill="#F9C9A4"
        stroke="#D69468"
        strokeWidth="1"
      />
      <circle
        cx="50"
        cy="14"
        r="9"
        fill="#FFFFFF"
        stroke="#1F2D63"
        strokeWidth="2"
      />
      <path
        d="M46 14 L 49 17 L 54 12"
        stroke="#1F2D63"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
