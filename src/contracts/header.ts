/**
 * Public BFF contract for the site header.
 * Frontend renderers import from here only.
 */

export type HeaderImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type HeaderLink = {
  label: string;
  href?: string;
  external?: boolean;
  children?: HeaderLink[];
};

export type HeaderAnnouncement = {
  text: string;
  link?: HeaderLink;
};

export type HeaderPhone = {
  number: string;
  href: string;
};

export type HeaderLocaleOption = {
  code?: string;
  label: string;
  href: string;
  flag?: HeaderImage;
};

export type Header = {
  logo: HeaderImage;
  logoHref: string;
  phone?: HeaderPhone;
  announcement?: HeaderAnnouncement;
  searchPlaceholder: string;
  searchAction: string;
  utilityLinks: HeaderLink[];
  allProductsNav?: HeaderLink;
  mainNav: HeaderLink[];
  locales: HeaderLocaleOption[];
  activeLocaleCode?: string;
};
