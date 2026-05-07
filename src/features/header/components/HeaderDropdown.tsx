"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { HeaderLink } from "@/contracts/header";

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
    return `${base} ${placement} w-[640px] max-w-[90vw] p-6`;
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
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3">
      {items.map((column) => (
        <div key={`${column.label}-${column.href ?? ""}`}>
          <DropdownColumnHeader item={column} onNavigate={onNavigate} />
          {column.children && column.children.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {column.children.map((child) => (
                <li key={`${child.label}-${child.href ?? ""}`}>
                  <DropdownLink
                    item={child}
                    onNavigate={onNavigate}
                    className="block px-0 py-1 text-sm text-zinc-700 hover:text-[#1F2D63]"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function DropdownColumnHeader({
  item,
  onNavigate,
}: {
  item: HeaderLink;
  onNavigate: () => void;
}) {
  const className =
    "text-sm font-semibold uppercase tracking-wide text-[#1F2D63]";
  if (item.href) {
    return (
      <DropdownLink
        item={item}
        onNavigate={onNavigate}
        className={`${className} hover:underline`}
      />
    );
  }
  return <span className={className}>{item.label}</span>;
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
