import CategoryCard from "@/components/molecules/CategoryCard";
import { Header } from "@/components/organisms/Header/Header";
import { Footer } from "@/components/organisms/Footer/Footer";
import { categoryPLPAPI } from "@/lib/api/bff";
import { homepageApi } from "@/lib/api/bff";
import type { PLPCategoryPageProps } from "@shared/types/plp";

export default async function PLPCategoryPage({
  params,
}: PLPCategoryPageProps) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    if (!slug || typeof slug !== "string") {
      return <div className="p-4">Invalid category slug</div>;
    }

    const encodedSlug = encodeURIComponent(slug);

    const [categoryData, homepageData] = await Promise.all([
      categoryPLPAPI.get(encodedSlug),
      homepageApi.get(),
    ]);

    const headerSection = homepageData.sections.find(
      (section) => section.type === "header",
    );
    const footerSection = homepageData.sections.find(
      (section) => section.type === "footer",
    );

    if (
      !categoryData?.response?.docs ||
      categoryData.response.docs.length === 0
    ) {
      return (
        <div className="flex flex-col min-h-screen">
          {headerSection && headerSection.type === "header" && (
            <Header data={headerSection.data} />
          )}
          <main className="flex-1 p-4">
            No products found for this category
          </main>
          {footerSection && footerSection.type === "footer" && (
            <Footer data={footerSection.data} />
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-screen">
        {headerSection && headerSection.type === "header" && (
          <Header data={headerSection.data} />
        )}
        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-8 max-w-7xl mx-auto">
            {categoryData.response.docs.map((item) => (
              <CategoryCard
                key={item.item_id}
                {...item}
                tag={item.parentCategory?.[0] || ""}
                title={item.name}
              />
            ))}
          </div>
        </main>
        {footerSection && footerSection.type === "footer" && (
          <Footer data={footerSection.data} />
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching category data:", error);
    return (
      <div className="p-4 text-red-600">
        Failed to load category. Please try again later.
      </div>
    );
  }
}
