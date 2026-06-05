

export type PLPCategoryPageProps = {
  params: Promise<{
    group: string;
    category: string;
    slug: string;
  }>;
};


export type PLPCategoryItem {
  item_id: string;
  name: string;
  url: string;
  image: string;
  parentCategory: string[];
  description: string;
  order: number;
}

export type PLPCategoryResponse {
  response: {
    numFound: number;
    start: number;
    docs: PLPCategoryItem[];
  };
  query_metadata: Record<string, unknown>;
  facet_counts: {
    facet_fields: Record<string, unknown>;
    facet_queries: Record<string, unknown>;
    facet_ranges: Record<string, unknown>;
  };
  did_you_mean: string[];
}