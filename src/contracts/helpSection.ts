/**
 * Public BFF contract for the home page "Help is here" section.
 * Frontend renderers import from here only.
 */

export type HelpSectionImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type HelpCard = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  image?: HelpSectionImage;
  icon?: HelpSectionImage;
  href?: string;
};

export type HelpSection = {
  title: string;
  subtitle?: string;
  cards: HelpCard[];
};
