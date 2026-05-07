import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";

type SmallHelpCard = {
  eyebrow: string;
  title: string;
  href: string;
  Icon: ComponentType;
};

const CONTACT_CARD = {
  eyebrow: "CONTACT US",
  title: "Contact our specialists any time using our help center form.",
  href: "/contact-us",
};

const RESOURCES_CARD: SmallHelpCard = {
  eyebrow: "RESOURCES",
  title: "Search our Resources center to view our application stories.",
  href: "/resources",
  Icon: ResourcesIllustration,
};

const NEWSLETTER_CARD: SmallHelpCard = {
  eyebrow: "NEWSLETTER SIGN UP",
  title: "Subscribe For our latest News and offers.",
  href: "https://info.dwyeromega.com/communications-signup",
  Icon: NewsletterIllustration,
};

const STORY_CARD = {
  eyebrow: "DWYEROMEGA",
  title:
    "Our story so far. Find out who we are and why we are the number one provider of Measurement Equipment & Services.",
  href: "/about-us",
  imageSrc: "/images/help/story.png",
  imageAlt: "DwyerOmega measurement equipment",
};

const PERSON_IMAGE = {
  src: "/images/help/contact-us.png",
  alt: "DwyerOmega specialist ready to help",
};

export function HelpSection() {
  return (
    <section className="bg-zinc-100 py-14">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-8 text-2xl">
          <span className="font-bold text-zinc-900">Help is here</span>{" "}
          <span className="text-zinc-500">however you need it.</span>
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-[auto_auto]">
          <div className="md:row-span-2">
            <ContactCard card={CONTACT_CARD} />
          </div>
          <SmallCard card={RESOURCES_CARD} />
          <SmallCard card={NEWSLETTER_CARD} />
          <div className="md:col-span-2">
            <StoryCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({ card }: { card: typeof CONTACT_CARD }) {
  return (
    <Link
      href={card.href}
      className="group flex h-full flex-col overflow-hidden rounded-sm bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-3 p-5">
        <p className="text-xs font-semibold tracking-widest text-zinc-500">
          {card.eyebrow}
        </p>
        <p className="text-base font-bold leading-snug text-zinc-900">
          {card.title}
        </p>
      </div>
      <div className="relative mt-auto h-64 w-full">
        <Image
          src={PERSON_IMAGE.src}
          alt={PERSON_IMAGE.alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-contain object-bottom"
        />
      </div>
    </Link>
  );
}

function SmallCard({ card }: { card: SmallHelpCard }) {
  const isExternal = /^https?:\/\//i.test(card.href);
  const inner = (
    <article className="group flex h-full items-center gap-5 rounded-sm bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center">
        <card.Icon />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-xs font-semibold tracking-widest text-zinc-500">
          {card.eyebrow}
        </p>
        <p className="text-base font-bold leading-snug text-zinc-900">
          {card.title}
        </p>
      </div>
    </article>
  );

  if (isExternal) {
    return (
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={card.href} className="block h-full">
      {inner}
    </Link>
  );
}

function StoryCard() {
  return (
    <Link
      href={STORY_CARD.href}
      className="group grid h-full grid-cols-1 overflow-hidden rounded-sm bg-white shadow-sm transition-shadow hover:shadow-md md:grid-cols-[1.4fr_1fr]"
    >
      <div className="flex flex-col gap-3 p-6">
        <div className="inline-flex items-center gap-2 text-[#1F2D63]">
          <DwyerOmegaMark />
          <span className="text-base font-bold tracking-wide">DWYEROMEGA</span>
        </div>
        <p className="text-base leading-snug text-zinc-900">{STORY_CARD.title}</p>
      </div>
      <div className="relative hidden h-full min-h-32 md:block">
        <Image
          src={STORY_CARD.imageSrc}
          alt={STORY_CARD.imageAlt}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover"
        />
      </div>
    </Link>
  );
}

function DwyerOmegaMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-[#D63D2E]">
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
