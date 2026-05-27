import { logger } from "@/observability/logger";

/**
 * Tiny in-memory cache with TTL + tag invalidation.
 *
 * Interface-first so phase-2 replacements (Upstash Redis, Memcached, etc.)
 * can drop in without touching call sites. Webhook handlers call
 * `cache.invalidate(tag)`; service-layer wrappers (added when an upstream
 * fetch becomes hot) call `cache.get/set`.
 *
 * NOTE: in-memory state does NOT survive across Vercel serverless function
 * invocations. Promote to Redis when hit-rate matters (see plan §Cache
 * invalidation on Vercel).
 */
export type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  tags: ReadonlyArray<string>;
};

export interface CacheStore {
  get<T>(key: string): T | undefined;
  set<T>(
    key: string,
    value: T,
    opts: { ttlSeconds: number; tags?: ReadonlyArray<string> },
  ): void;
  invalidate(tag: string): number;
  clear(): void;
}

class InMemoryCacheStore implements CacheStore {
  private entries = new Map<string, CacheEntry<unknown>>();
  private tagIndex = new Map<string, Set<string>>();

  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      this.unindex(key, entry.tags);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(
    key: string,
    value: T,
    opts: { ttlSeconds: number; tags?: ReadonlyArray<string> },
  ): void {
    const prior = this.entries.get(key);
    if (prior) this.unindex(key, prior.tags);
    const tags = opts.tags ?? [];
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + opts.ttlSeconds * 1000,
      tags,
    });
    for (const t of tags) {
      let set = this.tagIndex.get(t);
      if (!set) {
        set = new Set();
        this.tagIndex.set(t, set);
      }
      set.add(key);
    }
  }

  invalidate(tag: string): number {
    const keys = this.tagIndex.get(tag);
    if (!keys || keys.size === 0) return 0;
    let removed = 0;
    for (const k of keys) {
      const entry = this.entries.get(k);
      if (entry) {
        this.entries.delete(k);
        this.unindex(k, entry.tags);
        removed++;
      }
    }
    return removed;
  }

  clear(): void {
    this.entries.clear();
    this.tagIndex.clear();
  }

  private unindex(key: string, tags: ReadonlyArray<string>) {
    for (const t of tags) {
      const set = this.tagIndex.get(t);
      if (!set) continue;
      set.delete(key);
      if (set.size === 0) this.tagIndex.delete(t);
    }
  }
}

export const cache: CacheStore = new InMemoryCacheStore();

export function invalidateTag(tag: string): void {
  const removed = cache.invalidate(tag);
  logger.info({ tag, removed }, "cache.invalidate");
}
