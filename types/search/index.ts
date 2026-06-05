/**
 * Public BFF contract for the search/suggest endpoint.
 * The backend currently passes the Bloomreach response through unchanged,
 * so this shape mirrors `suggestionGroups`. Frontend code should import from
 * here, never from backend internals.
 */

export type SuggestQuerySuggestion = {
  query: string;
  displayText: string;
};

export type SuggestProductVariant = {
  skuid?: string;
  sku_price?: number;
};

export type SuggestProductSuggestion = {
  pid: string;
  title: string;
  brand?: string;
  url?: string;
  displayUrl?: string;
  thumb_image?: string;
  sale_price?: number;
  variants?: SuggestProductVariant[];
};

export type SuggestAttributeSuggestion = {
  name: string;
  value: string;
  attributeType: string;
};

export type SuggestionGroup = {
  catalogName: string;
  view: string;
  querySuggestions?: SuggestQuerySuggestion[];
  searchSuggestions?: SuggestProductSuggestion[];
  attributeSuggestions?: SuggestAttributeSuggestion[];
  product_suggest_query?: string | null;
};

export type SuggestResponse = {
  queryContext: { originalQuery: string };
  suggestionGroups: SuggestionGroup[];
};

export type SuggestParams = {
  q: string;
  sku_rows?: number;
  request_id?: string;
  url?: string;
  ref_url?: string;
  _br_uid_2?: string;
};

/**
 * Pass-through shape from Bloomreach core search for category content.
 */
export type CategoryDoc = {
  item_id?: string;
  name?: string;
  url?: string;
  image?: string;
  parentCategory?: string | string[];
  description?: string;
  order?: number;
};

export type CategoryContentResponse = {
  response: {
    numFound: number;
    start: number;
    docs: CategoryDoc[];
  };
};

export type CategoryContentParams = {
  q: string;
  start?: number;
  rows?: number;
  sort?: string;
};
