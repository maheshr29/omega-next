"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { HeaderLink } from "@shared/types/header";

type Layout = "list" | "mega";

type HeaderDropdownProps = {
  trigger: ReactNode;
  triggerClassName: string;
  panelClassName?: string;
  items: HeaderLink[];
  layout: Layout;
  align?: "left" | "right";
};

export function HeaderDropdown({
  trigger,
  triggerClassName,
  panelClassName,
  items,
  layout,
  align = "left",
}: HeaderDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={triggerClassName}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>

      {open && items.length > 0 && (
        <div
          id={panelId}
          role="menu"
          className={panelClassName ?? dropdownPanelClass(layout, align)}
        >
          {layout === "mega" ? (
            <MegaPanel items={items} onNavigate={() => setOpen(false)} />
          ) : (
            <ListPanel items={items} onNavigate={() => setOpen(false)} />
          )}
        </div>
      )}
    </div>
  );
}

function dropdownPanelClass(layout: Layout, align: "left" | "right") {
  const base =
    "absolute top-full z-50 mt-0 border border-zinc-200 bg-white text-zinc-900 shadow-lg";
  const placement = align === "right" ? "right-0" : "left-0";
  if (layout === "mega") {
    return `${base} ${placement} w-max max-w-[95vw] overflow-hidden`;
  }
  return `${base} ${placement} min-w-56 py-2`;
}

function ListPanel({
  items,
  onNavigate,
}: {
  items: HeaderLink[];
  onNavigate: () => void;
}) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li key={`${item.label}-${item.href ?? ""}`}>
          <DropdownLink item={item} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  );
}

function MegaPanel({
  items,
  onNavigate,
}: {
  items: HeaderLink[];
  onNavigate: () => void;
}) {
  const categories = useMemo(
    () => items.filter((item) => (item.children?.length ?? 0) > 0 || item.href),
    [items],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? categories[activeIndex] : null;

  if (categories.length === 0) return null;

  return (
    <div className="flex min-h-[440px]">
      <ul className="w-[300px] shrink-0 bg-zinc-50 py-2">
        {categories.map((category, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={`${category.label}-${category.href ?? ""}`}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={[
                  "flex w-full items-center justify-between gap-3 px-6 py-3 text-left text-[15px] transition-colors",
                  isActive
                    ? "bg-white font-semibold text-[#1F2D63]"
                    : "text-zinc-800 hover:bg-white hover:text-[#1F2D63]",
                ].join(" ")}
                aria-current={isActive ? "true" : undefined}
              >
                <span>{category.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              </button>
            </li>
          );
        })}
      </ul>

      {active && (
        <div className="w-auto px-8 py-6">
          <ActiveCategoryHeader item={active} onNavigate={onNavigate} />
          {active.children && active.children.length > 0 && (
            <ul className="mt-4 flex flex-col">
              {active.children.map((child) => (
                <li key={`${child.label}-${child.href ?? ""}`}>
                  <DropdownLink
                    item={child}
                    onNavigate={onNavigate}
                    className="block py-1 text-[15px] text-zinc-800 hover:text-[#1F2D63] hover:underline"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ActiveCategoryHeader({
  item,
  onNavigate,
}: {
  item: HeaderLink;
  onNavigate: () => void;
}) {
  const className =
    "inline-block border-b-2 border-[#1F2D63] pb-1 text-lg font-medium text-zinc-900";
  if (item.href) {
    return (
      <DropdownLink
        item={item}
        onNavigate={onNavigate}
        className={`${className} hover:text-[#1F2D63]`}
      />
    );
  }
  return <span className={className}>{item.label}</span>;
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m4.5 3 3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DropdownLink({
  item,
  onNavigate,
  className,
}: {
  item: HeaderLink;
  onNavigate: () => void;
  className?: string;
}) {
  const baseClass =
    className ??
    "block px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#1F2D63]";

  if (!item.href) {
    return (
      <span className={baseClass} aria-disabled="true">
        {item.label}
      </span>
    );
  }
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        onClick={onNavigate}
        role="menuitem"
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link
      href={item.href}
      className={baseClass}
      onClick={onNavigate}
      role="menuitem"
    >
      {item.label}
    </Link>
  );
}
