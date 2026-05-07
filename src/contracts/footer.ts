/**
 * Public BFF contract for the site footer.
 * Frontend renderers import from here only.
 */

export type FooterImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type FooterLink = {
  label: string;
  href?: string;
  external?: boolean;
};

export type FooterLinkGroup = {
  title: string;
  links: FooterLink[];
};

export type FooterSocialLink = {
  name: string;
  url: string;
  icon?: FooterImage;
};

export type FooterTechnologyClub = {
  title: string;
  description?: string;
  link?: FooterLink;
};

export type FooterConnect = {
  title: string;
  socialLinks: FooterSocialLink[];
  technologyClub?: FooterTechnologyClub;
  feedbackLink?: FooterLink;
};

export type FooterBottom = {
  copyright: { text: string; href?: string };
  legalLinks: FooterLink[];
};

export type Footer = {
  quickLinks?: FooterLinkGroup;
  columns: FooterLinkGroup[];
  connect?: FooterConnect;
  bottom?: FooterBottom;
};
