/**
 * Public BFF contract for the home page hero banner.
 * Frontend renderers import from here only.
 */

export type HeroBannerImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type HeroBannerReadMore = {
  label: string;
  href: string;
};

export type HeroBanner = {
  headline: string;
  partnerLogo?: HeroBannerImage;
  productImage?: HeroBannerImage;
  readMore?: HeroBannerReadMore;
};
