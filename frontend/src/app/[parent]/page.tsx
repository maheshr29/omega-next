import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { HomePageSection } from "@shared/types/homePage";
import type { CategoryDoc } from "@shared/types/search";
import { Footer } from "@/components/organisms/Footer/Footer";
import { FooterFallback } from "@/components/organisms/Footer/FooterFallback";
import { Header } from "@/components/organisms/Header/Header";
import { HeaderFallback } from "@/components/organisms/Header/HeaderFallback";
import { bff } from "@/lib/api/bff";

type Params = { parent: string };

export default async function ParentCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { parent } = await params;

  const [homePage, data] = await Promise.all([
    bff.homepage.get().catch((err: unknown) => {
      console.error("homePage.fetch-failed", err);
      return null;
    }),
    bff.search
      .categoryContent({ q: parent, rows: 24 })
      .catch((err: unknown) => {
        console.error("categoryContent.fetch-failed", err);
        return null;
      }),
  ]);

  if (!data) notFound();

  const sections = homePage?.sections ?? [];
  const header = sections.find(
    (s): s is Extract<HomePageSection, { type: "header" }> => s.type === "header",
  );
  const footer = sections.find(
    (s): s is Extract<HomePageSection, { type: "footer" }> => s.type === "footer",
  );

  const docs: CategoryDoc[] = data.response.docs ?? [];
  const total = data.response.numFound ?? docs.length;
  const title = humanize(parent);

  return (
    <>
      {header ? <Header data={header.data} /> : <HeaderFallback />}
      <main className="flex-1 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 pt-6 pb-16">
          <nav className="mb-6 text-[13px] text-zinc-600">
            <Link href="/" className="hover:text-zinc-900">
              Home
            </Link>
            <span className="mx-2 text-zinc-400">|</span>
            <span className="font-semibold text-zinc-900">{title}</span>
          </nav>

          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
            {title}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">{total} Products</p>

          {docs.length === 0 ? (
            <p className="mt-10 text-sm text-zinc-600">No items found.</p>
          ) : (
            <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {docs.map((doc, i) => (
                <ProductCard key={doc.item_id ?? `${doc.name}-${i}`} doc={doc} />
              ))}
            </ul>
          )}
        </div>
      </main>
      {footer ? <Footer data={footer.data} /> : <FooterFallback />}
    </>
  );
}

function ProductCard({ doc }: { doc: CategoryDoc }) {
  const href = doc.url ?? "#";
  return (
    <li className="group relative flex flex-col rounded-md bg-white p-3 transition-shadow duration-200 hover:shadow-lg hover:ring-1 hover:ring-zinc-200">
      {isConfigurable(doc) && (
        <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3DA5D9]">
          Configurable
        </span>
      )}
      <Link href={href} className="block">
        <div className="relative mb-4 flex aspect-square w-full items-center justify-center bg-white">
          {isValidImageSrc(doc.image) ? (
            <Image
              src={doc.image}
              alt={doc.name ?? ""}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain p-2"
            />
          ) : (
            <div className="h-full w-full bg-zinc-50" />
          )}
        </div>
        <h3 className="text-base font-bold leading-snug text-[#1F2D63] group-hover:underline">
          {doc.name}
        </h3>
      </Link>
      {doc.description && (
        <p className="mt-2 line-clamp-5 text-[13px] leading-relaxed text-zinc-700 group-hover:line-clamp-none">
          {doc.description}
        </p>
      )}
    </li>
  );
}

function isValidImageSrc(src: string | undefined): src is string {
  if (!src) return false;
  return (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  );
}

function isConfigurable(doc: CategoryDoc): boolean {
  const flag = (doc as Record<string, unknown>).isConfigurable;
  if (typeof flag === "boolean") return flag;
  const productType = (doc as Record<string, unknown>).productType;
  if (typeof productType === "string") {
    return productType.toLowerCase().includes("config");
  }
  return false;
}

function humanize(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
