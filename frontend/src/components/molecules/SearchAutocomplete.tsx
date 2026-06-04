"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type {
  SuggestAttributeSuggestion,
  SuggestionGroup,
  SuggestProductSuggestion,
  SuggestQuerySuggestion,
} from "@shared/types/search";
import { BffClientError, searchApi } from "@/lib/api/bff";

type SearchAutocompleteProps = {
  placeholder: string;
  action: string;
};

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const CACHE_MAX_ENTRIES = 50;

// Module-level LRU cache shared across all SearchAutocomplete instances on the
// page. Bloomreach upstream is ~1s — caching prior queries makes backspace /
// repeat-typing feel instant.
const suggestionCache = new Map<string, SuggestionGroup | null>();
function cacheGet(key: string) {
  if (!suggestionCache.has(key)) return undefined;
  const value = suggestionCache.get(key);
  suggestionCache.delete(key);
  suggestionCache.set(key, value as SuggestionGroup | null);
  return value;
}
function cacheSet(key: string, value: SuggestionGroup | null) {
  if (suggestionCache.has(key)) suggestionCache.delete(key);
  suggestionCache.set(key, value);
  if (suggestionCache.size > CACHE_MAX_ENTRIES) {
    const firstKey = suggestionCache.keys().next().value;
    if (firstKey !== undefined) suggestionCache.delete(firstKey);
  }
}

export function SearchAutocomplete({
  placeholder,
  action,
}: SearchAutocompleteProps) {
  const [value, setValue] = useState("");
  const [group, setGroup] = useState<SuggestionGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    const key = trimmed.toLowerCase();
    // Cache hits are applied synchronously in `onChange`; effect handles misses.
    if (suggestionCache.has(key)) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchApi.suggest(
          { q: trimmed, sku_rows: 1, _br_uid_2: readBrUid() },
          { signal: controller.signal },
        );
        const next = res.suggestionGroups[0] ?? null;
        cacheSet(key, next);
        setGroup(next);
      } catch (err) {
        if (controller.signal.aborted) return;
        // Keep the previously-shown group so the panel doesn't flash empty.
        setError(
          err instanceof BffClientError ? err.message : "Search unavailable",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const hasResults =
    !!group &&
    ((group.querySuggestions?.length ?? 0) > 0 ||
      (group.searchSuggestions?.length ?? 0) > 0 ||
      (group.attributeSuggestions?.length ?? 0) > 0);
  const showPanel =
    open && value.trim().length >= MIN_QUERY_LENGTH && (loading || hasResults || !!error);

  return (
    <div
      ref={containerRef}
      className="relative flex max-w-xl flex-1 items-stretch"
    >
      <form
        action={action}
        method="GET"
        role="search"
        className="flex w-full items-stretch overflow-hidden rounded-md border border-zinc-300 bg-white focus-within:border-[#1F2D63]"
      >
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            setOpen(true);
            const trimmed = next.trim();
            if (trimmed.length < MIN_QUERY_LENGTH) {
              setGroup(null);
              setLoading(false);
              setError(null);
              return;
            }
            const cached = cacheGet(trimmed.toLowerCase());
            if (cached !== undefined) {
              setGroup(cached);
              setLoading(false);
              setError(null);
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showPanel}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex items-center justify-center px-4 text-[#1F2D63] hover:text-[#16224d]"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>

      {showPanel && (
        <div
          id={listboxId}
          role="listbox"
          aria-busy={loading}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg"
        >
          {loading && (
            <div
              className="h-0.5 w-full animate-pulse bg-[#1F2D63]"
              aria-hidden="true"
            />
          )}
          {error ? (
            <div className="px-4 py-3 text-sm text-red-600">{error}</div>
          ) : loading && !hasResults ? (
            <div className="px-4 py-3 text-sm text-zinc-500">Searching…</div>
          ) : group ? (
            <SuggestionPanel
              group={group}
              action={action}
              onSelect={() => setOpen(false)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function SuggestionPanel({
  group,
  action,
  onSelect,
}: {
  group: SuggestionGroup;
  action: string;
  onSelect: () => void;
}) {
  const queries = (group.querySuggestions ?? []).slice(0, 5);
  const categories = group.attributeSuggestions ?? [];
  const products = group.searchSuggestions ?? [];

  return (
    <div className="flex flex-col">
      {queries.length > 0 && (
        <ul>
          {queries.map((s) => (
            <li
              key={s.query}
              className="border-b border-zinc-200 last:border-b-0"
            >
              <QuerySuggestionLink
                suggestion={s}
                action={action}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}

      {categories.length > 0 && (
        <>
          <SectionHeader>Suggested Category</SectionHeader>
          <ul>
            {categories.map((s) => (
              <li
                key={`${s.attributeType}:${s.value}`}
                className="border-b border-zinc-200 last:border-b-0"
              >
                <AttributeSuggestionLink suggestion={s} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </>
      )}

      {products.length > 0 && (
        <>
          <SectionHeader>Suggested Products</SectionHeader>
          <ul>
            {products.map((p) => (
              <li
                key={p.pid}
                className="border-b border-zinc-200 last:border-b-0"
              >
                <ProductSuggestionLink product={p} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-y border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-semibold text-[#1F2D63]">
      {children}
    </div>
  );
}

function QuerySuggestionLink({
  suggestion,
  action,
  onSelect,
}: {
  suggestion: SuggestQuerySuggestion;
  action: string;
  onSelect: () => void;
}) {
  const href = `${action}?q=${encodeURIComponent(suggestion.query)}`;
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="block px-4 py-2.5 text-sm text-[#1F2D63] hover:bg-zinc-50"
      role="option"
      aria-selected={false}
    >
      {suggestion.displayText}
    </Link>
  );
}

function AttributeSuggestionLink({
  suggestion,
  onSelect,
}: {
  suggestion: SuggestAttributeSuggestion;
  onSelect: () => void;
}) {
  const href = `/${suggestion.value}`;
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="block px-4 py-2.5 text-sm text-[#1F2D63] hover:bg-zinc-50"
      role="option"
      aria-selected={false}
    >
      {suggestion.name}
    </Link>
  );
}

function ProductSuggestionLink({
  product,
  onSelect,
}: {
  product: SuggestProductSuggestion;
  onSelect: () => void;
}) {
  const href = product.displayUrl ?? product.url ?? "#";
  const isExternal = /^https?:/i.test(href);
  const content = (
    <>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-white">
        {product.thumb_image ? (
          <Image
            src={product.thumb_image}
            alt={product.title}
            width={48}
            height={48}
            className="h-full w-full object-contain"
            unoptimized
          />
        ) : (
          <span className="text-[10px] text-zinc-400">No image</span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-sm text-[#1F2D63]">
        {product.title}
      </div>
    </>
  );
  const className =
    "flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50";

  if (isExternal) {
    return (
      <a
        href={href}
        onClick={onSelect}
        className={className}
        role="option"
        aria-selected={false}
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={className}
      role="option"
      aria-selected={false}
    >
      {content}
    </Link>
  );
}

function readBrUid(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)_br_uid_2=([^;]+)/);
  return match ? decodeURIComponent(match[1]!) : undefined;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
      <path
        d="m17 17-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
