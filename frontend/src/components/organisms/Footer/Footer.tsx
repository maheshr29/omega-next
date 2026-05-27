import Image from "next/image";
import Link from "next/link";
import type {
  Footer as FooterData,
  FooterConnect,
  FooterLink,
  FooterLinkGroup,
  FooterSocialLink,
  FooterTechnologyClub,
} from "@shared/types/footer";

type FooterProps = {
  data: FooterData;
};

export function Footer({ data }: FooterProps) {
  return (
    <footer className="bg-[#1F2D63] text-white">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-12">
        {data.quickLinks && <QuickLinks group={data.quickLinks} />}

        {(data.columns.length > 0 || data.connect) && (
          <div className="mt-10 grid grid-cols-1 gap-10 border-t border-white/15 pt-10 md:grid-cols-3">
            {data.columns.map((col) => (
              <ColumnLinks key={col.title} group={col} />
            ))}
            {data.connect && <ConnectColumn connect={data.connect} />}
          </div>
        )}
      </div>

      {data.bottom && <BottomBar bottom={data.bottom} />}
    </footer>
  );
}

function QuickLinks({ group }: { group: FooterLinkGroup }) {
  if (!group.links.length) return null;
  return (
    <section aria-labelledby="footer-quick-links">
      <h3
        id="footer-quick-links"
        className="text-base font-semibold tracking-wide"
      >
        {group.title}
      </h3>
      <ul className="mt-4 flex flex-wrap gap-3">
        {group.links.map((link) => (
          <li key={`${link.label}-${link.href ?? ""}`}>
            <FooterPillLink link={link} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ColumnLinks({ group }: { group: FooterLinkGroup }) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider">
        {group.title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {group.links.map((link) => (
          <li key={`${link.label}-${link.href ?? ""}`}>
            <FooterTextLink link={link} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConnectColumn({ connect }: { connect: FooterConnect }) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider">
        {connect.title}
      </h3>

      {connect.socialLinks.length > 0 && (
        <ul className="mt-4 flex items-center gap-4">
          {connect.socialLinks.map((s) => (
            <li key={s.name}>
              <SocialIconLink social={s} />
            </li>
          ))}
        </ul>
      )}

      {connect.technologyClub && (
        <TechnologyClubCard club={connect.technologyClub} />
      )}

      {connect.feedbackLink && (
        <div className="mt-4">
          <FooterOutlineButton link={connect.feedbackLink} />
        </div>
      )}
    </section>
  );
}

function TechnologyClubCard({ club }: { club: FooterTechnologyClub }) {
  return (
    <div className="mt-5 rounded-md border border-white/30 p-4">
      <p className="text-sm font-semibold">{club.title}</p>
      {club.description && (
        <p className="mt-1 text-xs text-white/80">{club.description}</p>
      )}
      {club.link && (
        <div className="mt-3">
          <FooterOutlineButton link={club.link} compact />
        </div>
      )}
    </div>
  );
}

function BottomBar({ bottom }: { bottom: NonNullable<FooterData["bottom"]> }) {
  return (
    <div className="border-t border-white/15">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-4 text-xs text-white/85 md:flex-row md:items-center">
        {bottom.copyright.href ? (
          <Link
            href={bottom.copyright.href}
            className="hover:text-white hover:underline"
          >
            {bottom.copyright.text}
          </Link>
        ) : (
          <p className="m-0">{bottom.copyright.text}</p>
        )}

        {bottom.legalLinks.length > 0 && (
          <ul className="flex flex-wrap items-center gap-x-1 gap-y-1">
            {bottom.legalLinks.map((link, i) => (
              <li
                key={`${link.label}-${link.href ?? ""}`}
                className="flex items-center gap-1"
              >
                {i > 0 && (
                  <span className="text-white/40" aria-hidden="true">
                    |
                  </span>
                )}
                <FooterTextLink link={link} className="hover:underline" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FooterPillLink({ link }: { link: FooterLink }) {
  const className =
    "inline-flex items-center rounded-full bg-zinc-100 px-10 py-6 text-18 font-semibold text-[#1F2D63] hover:bg-white";
  return <FooterAnyLink link={link} className={className} />;
}

function FooterTextLink({
  link,
  className,
}: {
  link: FooterLink;
  className?: string;
}) {
  const cls =
    className ?? "text-sm text-white/85 hover:text-white hover:underline";
  return <FooterAnyLink link={link} className={cls} />;
}

function FooterOutlineButton({
  link,
  compact = false,
}: {
  link: FooterLink;
  compact?: boolean;
}) {
  const className = `inline-flex items-center justify-center rounded-md border border-white/40 ${
    compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
  } font-semibold text-white hover:bg-white/10`;
  return <FooterAnyLink link={link} className={className} />;
}

function SocialIconLink({ social }: { social: FooterSocialLink }) {
  const inner = social.icon?.url ? (
    <Image
      src={social.icon.url}
      alt={social.icon.alt ?? social.name}
      width={24}
      height={24}
      className="h-6 w-6 object-contain"
    />
  ) : (
    <span className="text-xs">{social.name}</span>
  );
  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.name}
      className="inline-flex items-center justify-center text-white/90 hover:text-white"
    >
      {inner}
    </a>
  );
}

function FooterAnyLink({
  link,
  className,
}: {
  link: FooterLink;
  className: string;
}) {
  if (!link.href) {
    return <span className={className}>{link.label}</span>;
  }
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
