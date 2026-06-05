import type { PLPCategoryResponse } from "@shared/types/plp";

export const categoryPLPAPI = {
  get: async (category: string): Promise<PLPCategoryResponse> => {
    if (!category) {
      throw new Error("Category slug is required");
    }

    const params = new URLSearchParams();
    params.set("account_id", "6594");
    params.set("url", "1");
    params.set("request_type", "search");
    params.set("search_type", "keyword");
    params.set("catalog_name", "category_en_dwyer");
    params.set("q", category);
    params.set("start", "0");
    params.set("rows", "10");
    params.set("fl", "item_id,name,url,image,parentCategory,description,order");

    const urlString = `https://staging-core.dxpapi.com/api/v1/core/?${params.toString()}`;
    
    try {
      const url = new URL(urlString);
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Failed to fetch category: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("Invalid URL")) {
        console.error("Invalid URL constructed:", urlString);
        throw new Error(`Invalid category URL: ${category}`);
      }
      throw error;
    }
  },
} as const;