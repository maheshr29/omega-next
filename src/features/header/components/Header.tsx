import Image from "next/image";
import Link from "next/link";
import type {
  Header as HeaderData,
  HeaderLink,
  HeaderLocaleOption,
} from "@/contracts/header";
import { HeaderDropdown } from "@/features/header/components/HeaderDropdown";

const DEFAULT_UTILITY_LINKS: HeaderLink[] = [
  { label: "Contact Us", href: "/contact-us" },
];

type HeaderProps = {
  data: HeaderData;
  cartCount?: number;
};

export function Header({ data, cartCount = 0 }: HeaderProps) {
  return (
    <header className="w-full">
      <UtilityBar data={data} />
      <MainBar data={data} cartCount={cartCount} />
      <NavBar data={data} />
    </header>
  );
}

function UtilityBar({ data }: { data: HeaderData }) {
  if (!data.phone && !data.announcement) return null;
  return (
    <div className="bg-zinc-100 text-zinc-700 text-[13px]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2">
        {data.phone && (
          <a
            href={data.phone.href}
            className="font-bold text-[#1F2D63] underline underline-offset-2 hover:text-[#16224d]"
          >
            {data.phone.number}
          </a>
        )}
        {data.phone && data.announcement && (
          <span className="text-zinc-400" aria-hidden="true">
            |
          </span>
        )}
        {data.announcement && (
          <p className="m-0 text-[#1F2D63]">
            {data.announcement.text}
            {data.announcement.link && data.announcement.link.href && (
              <>
                {" "}
                <Link
                  href={data.announcement.link.href}
                  className="font-bold text-[#1F2D63] underline underline-offset-2 hover:text-[#16224d]"
                >
                  {data.announcement.link.label}
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function MainBar({
  data,
  cartCount,
}: {
  data: HeaderData;
  cartCount: number;
}) {
  const utilityLinks =
    data.utilityLinks.length > 0 ? data.utilityLinks : DEFAULT_UTILITY_LINKS;

  return (
    <div className="bg-white">
      <div className="mx-auto flex w-full items-center gap-8 px-4 py-4">
        <Link
          href={data.logoHref}
          className="shrink-0"
          aria-label={data.logo.alt ?? "Home"}
        >
          {data.logo.url ? (
            <Image
              src={data.logo.url}
              alt={data.logo.alt ?? "DwyerOmega"}
              width={data.logo.width ?? 220}
              height={data.logo.height ?? 44}
              priority
              className="h-11 w-auto"
            />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-[#1F2D63]">
              DWYEROMEGA
            </span>
          )}
        </Link>

        <SearchForm
          placeholder={data.searchPlaceholder}
          action={data.searchAction}
        />

        <div className="ml-auto flex items-center gap-7">
          {utilityLinks.map((link) => (
            <NavLinkOrButton
              key={`${link.label}-${link.href ?? ""}`}
              link={link}
              className="text-sm font-semibold text-[#1F2D63] hover:text-[#16224d]"
            />
          ))}

          <Link
            href="/cart"
            className="relative inline-flex items-center text-[#1F2D63] hover:text-[#16224d]"
            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          >
            <CartIcon className="h-7 w-7" />
            <span
              className="absolute -right-2 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1F2D63] px-1 text-[11px] font-semibold text-white"
              aria-hidden="true"
            >
              {cartCount}
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1F2D63] hover:text-[#16224d]"
            aria-haspopup="menu"
            aria-expanded="false"
          >
            My Account
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavBar({ data }: { data: HeaderData }) {
  const allProductsLabel = data.allProductsNav?.label ?? "All Products";
  const allProductsChildren = data.allProductsNav?.children ?? [];

  const allProductsTrigger = (
    <span className="inline-flex items-center gap-2">
      <HamburgerIcon className="h-4 w-4" />
      <span className="underline-offset-4">{allProductsLabel}</span>
      <ChevronUp className="h-3.5 w-3.5" />
    </span>
  );

  const allProductsClass =
    "inline-flex items-center rounded-full bg-[#D63D2E] ml-8 px-6 py-2.5 text-base font-bold uppercase tracking-wide text-white hover:bg-[#bc3526]";

  return (
    <nav className="bg-[#1F2D63] text-white">
      <div className="mx-auto flex w-full items-center px-4 py-2">
        {allProductsChildren.length > 0 ? (
          <HeaderDropdown
            triggerClassName={allProductsClass}
            trigger={allProductsTrigger}
            items={allProductsChildren}
            layout="mega"
          />
        ) : (
          <AllProductsStaticButton
            label={allProductsLabel}
            href={data.allProductsNav?.href}
            className={allProductsClass}
          />
        )}

        <ul className=" flex flex-1 items-center gap-28 ml-16 text-sm">
          {data.mainNav.map((link) => (
            <li key={`${link.label}-${link.href ?? ""}`}>
              {link.children?.length ? (
                <HeaderDropdown
                  triggerClassName="block px-2 py-2 text-sm font-medium text-white hover:text-white/80"
                  trigger={<span>{link.label}</span>}
                  items={link.children}
                  layout="list"
                />
              ) : (
                <NavLinkOrButton
                  link={link}
                  className="block px-2 py-2 text-sm font-medium text-white hover:text-white/80"
                />
              )}
            </li>
          ))}
        </ul>

        <div className="ml-4">
          {data.locales.length > 1 ? (
            <HeaderDropdown
              triggerClassName="inline-flex items-center gap-2 py-2 text-sm font-medium hover:text-white/80"
              trigger={<LocaleTrigger locale={getActiveLocale(data)} />}
              items={data.locales.map((l) => ({
                label: l.label,
                href: l.href,
              }))}
              layout="list"
              align="right"
            />
          ) : data.locales.length === 1 ? (
            <span className="inline-flex items-center gap-2 py-2 text-sm font-medium">
              <LocaleTrigger locale={getActiveLocale(data)} />
            </span>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

function getActiveLocale(data: HeaderData): HeaderLocaleOption | undefined {
  return (
    data.locales.find((l) => l.code === data.activeLocaleCode) ??
    data.locales[0]
  );
}

function LocaleTrigger({ locale }: { locale: HeaderLocaleOption | undefined }) {
  if (!locale) return null;
  const code = locale.code?.toLowerCase();
  return (
    <>
      {locale.flag?.url ? (
        <Image
          src={locale.flag.url}
          alt={locale.flag.alt ?? locale.label}
          width={28}
          height={20}
          className="h-5 w-7 object-cover"
        />
      ) : code?.endsWith("-us") ? (
        <UsFlag className="h-5 w-7" />
      ) : code?.endsWith("-gb") ? (
        <GbFlag className="h-5 w-7" />
      ) : (
        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide">
          {code?.split("-").pop()?.toUpperCase() ?? locale.label}
        </span>
      )}
      <ChevronDown className="h-3.5 w-3.5" />
    </>
  );
}

function AllProductsStaticButton({
  label,
  href,
  className,
}: {
  label: string;
  href?: string;
  className: string;
}) {
  const inner = (
    <span className="inline-flex items-center gap-2">
      <HamburgerIcon className="h-4 w-4" />
      <span className="underline underline-offset-4">{label}</span>
    </span>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {inner}
    </button>
  );
}

function SearchForm({
  placeholder,
  action,
}: {
  placeholder: string;
  action: string;
}) {
  return (
    <form
      action={action}
      method="GET"
      role="search"
      className="flex max-w-xl flex-1 items-stretch overflow-hidden rounded-md border border-zinc-300 bg-white focus-within:border-[#1F2D63]"
    >
      <input
        type="search"
        name="q"
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex items-center justify-center px-4 text-[#1F2D63] hover:text-[#16224d]"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

function NavLinkOrButton({
  link,
  className,
}: {
  link: HeaderLink;
  className?: string;
}) {
  if (link.href) {
    if (link.external) {
      return (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {link.label}
        </a>
      );
    }
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      aria-haspopup={link.children?.length ? "menu" : undefined}
      aria-expanded="false"
    >
      {link.label}
    </button>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
      <path
        d="m17 17-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
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

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m3 4.5 3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m3 7.5 3-3 3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 4h12M2 8h12M2 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="28" height="20" fill="#B22234" />
      <g fill="#fff">
        <rect y="1.54" width="28" height="1.54" />
        <rect y="4.62" width="28" height="1.54" />
        <rect y="7.69" width="28" height="1.54" />
        <rect y="10.77" width="28" height="1.54" />
        <rect y="13.85" width="28" height="1.54" />
        <rect y="16.92" width="28" height="1.54" />
      </g>
      <rect width="11.2" height="10.77" fill="#3C3B6E" />
    </svg>
  );
}

function GbFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="28" height="20" fill="#012169" />
      <path d="M0 0l28 20M28 0L0 20" stroke="#fff" strokeWidth="3" />
      <path
        d="M0 0l28 20M28 0L0 20"
        stroke="#C8102E"
        strokeWidth="2"
        clipPath="url(#gb-diag)"
      />
      <path d="M14 0v20M0 10h28" stroke="#fff" strokeWidth="5" />
      <path d="M14 0v20M0 10h28" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}
