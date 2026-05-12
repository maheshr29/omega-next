/**
 * Public BFF contract for the home page "Shop by Industry" section.
 * Frontend renderers import from here only.
 */

export type IndustryImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type IndustryCard = {
  label: string;
  href?: string;
  image?: IndustryImage;
};

export type IndustrySection = {
  title: string;
  cards: IndustryCard[];
};
