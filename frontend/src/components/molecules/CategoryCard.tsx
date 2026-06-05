"use client";
import Image from "next/image";

interface CategoryCardProps {
  image: string;
  tag: string;
  title: string;
  description: string;
}

const CategoryCard = ({
  image,
  tag,
  title,
  description,
}: CategoryCardProps) => {
  const getImageUrl = (imageUrl: string): string | null => {
    if (!imageUrl || typeof imageUrl !== "string") return null;

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      try {
        new URL(imageUrl);
        return imageUrl;
      } catch {
        return null;
      }
    }

    if (imageUrl.startsWith("/")) {
      return imageUrl;
    }

    return null;
  };

  const validImageUrl = getImageUrl(image);
  const fallbackBg = "bg-gray-200";

  return (
    <div className="max-w-sm bg-white overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
      <div
        className={`relative h-72 mb-6 ${validImageUrl ? "bg-gray-50" : fallbackBg} flex items-center justify-center`}
      >
        {validImageUrl ? (
          <Image
            src={validImageUrl}
            alt={title}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <p>Image unavailable</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <h2 className="text-[20px] font-bold text-[#282A69] leading-[1.1] mb-4 hover:underline">
          {title}
        </h2>
        <p className="text-[#3a414b] text-lg leading-relaxed line-clamp-4">
          {description}
        </p>
      </div>
    </div>
  );
};

export default CategoryCard;
