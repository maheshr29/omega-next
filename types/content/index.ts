/**
 * Public BFF contract for CMS content.
 * Frontend renderers import from here only.
 */

export type ContentImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type ContentBlock =
  | { type: "richText"; html: string }
  | { type: "image"; image: ContentImage }
  | { type: "productCarousel"; title?: string; productCodes: string[] }
  | { type: "callToAction"; label: string; href: string };

export type PageHero = {
  headline?: string;
  subline?: string;
  image?: ContentImage;
  cta?: { label: string; href: string };
};

export type PageContent = {
  id: string;
  slug: string;
  title: string;
  seo?: {
    title?: string;
    description?: string;
  };
  hero?: PageHero;
  body: ContentBlock[];
};
