import Link from "next/link";
import Image from "next/image";

import { IAd } from "@/lib/db/models";

interface AdCardProps {
  ad: IAd & {
    category: { name: string; _id: string };
    subcategory: { name: string; _id: string };
    user: { name: string; _id: string };
  };
}

export default function AdCard({ ad }: AdCardProps) {
  return (
    <Link href={`/ads/${ad._id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition border border-gray-200 dark:border-gray-700 h-full flex flex-col">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
          {ad.images && ad.images.length > 0 ? (
            <Image
              src={ad.images[0]}
              alt={ad.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400 dark:text-gray-500">No image</span>
            </div>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {ad.title}
            </h2>
            <p className="text-blue-600 dark:text-blue-400 font-bold">
              ${ad.price.toLocaleString()}
            </p>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {ad.location.city}, {ad.location.country}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
            {ad.description}
          </p>
          <div className="mt-auto pt-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded">
                {ad.category.name}
              </span>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded">
                {ad.subcategory.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
