import type { Footer } from "@/contracts/footer";
import type { Header } from "@/contracts/header";
import { bffFetch } from "./http";

export const layoutApi = {
  getHeader: () => bffFetch<Header>("/header"),
  getFooter: () => bffFetch<Footer>("/footer"),
} as const;
