import type { HomePage } from "@shared/types/homePage";
import { bffFetch } from "./http";

export const homepageApi = {
  get: () => bffFetch<HomePage>("/homepage"),
} as const;
