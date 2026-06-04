/**
 * Raw Bloomreach `suggest` response. Permissive on purpose — frontend consumes
 * the pass-through shape directly.
 */
export type BloomreachSuggestVariant = {
  skuid?: string;
  sku_price?: number;
  [k: string]: unknown;
};

export type BloomreachQuerySuggestion = {
  query: string;
  displayText: string;
};

export type BloomreachSearchSuggestion = {
  pid: string;
  title: string;
  brand?: string;
  url?: string;
  displayUrl?: string;
  thumb_image?: string;
  sale_price?: number;
  variants?: BloomreachSuggestVariant[];
  [k: string]: unknown;
};

export type BloomreachAttributeSuggestion = {
  name: string;
  value: string;
  attributeType: string;
};

export type BloomreachSuggestionGroup = {
  catalogName: string;
  view: string;
  querySuggestions?: BloomreachQuerySuggestion[];
  searchSuggestions?: BloomreachSearchSuggestion[];
  attributeSuggestions?: BloomreachAttributeSuggestion[];
  product_suggest_query?: string | null;
};

export type BloomreachSuggestResponse = {
  queryContext: { originalQuery: string };
  suggestionGroups: BloomreachSuggestionGroup[];
};
