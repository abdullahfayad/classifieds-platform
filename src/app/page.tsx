import Link from "next/link";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import AdCard from "@/components/ads/AdCard";
import SearchBar from "@/components/ads/SearchBar";
import CategoryFilter from "@/components/ads/CategoryFilter";
import MobileFilterButton from "@/components/ads/MobileFilterButton";

import { connectToMongoDB } from "@/lib/db/mongodb";
import { Ad, Category, IAd } from "@/lib/db/models";

async function getAds(
  categoryId?: string,
  subcategoryId?: string,
  searchQuery?: string
) {
  await connectToMongoDB();

  const query: {
    status: string;
    category?: string;
    subcategory?: string;
    $or?: Array<{
      title?: { $regex: string; $options: string };
      description?: { $regex: string; $options: string };
    }>;
  } = { status: "approved" };

  if (categoryId) {
    query.category = categoryId;
  }

  if (subcategoryId) {
    query.subcategory = subcategoryId;
  }

  if (searchQuery) {
    query.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
    ];
  }

  const ads = await Ad.find(query)
    .populate("category")
    .populate("subcategory")
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return JSON.parse(JSON.stringify(ads));
}

async function getCategories() {
  await connectToMongoDB();
  const categories = await Category.find().lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    search?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);
  const isUser = session?.user?.role === "user";

  const params = await searchParams;

  const searchQuery = params.search || undefined;
  const categoryId = params.category || undefined;
  const subcategoryId = params.subcategory || undefined;

  const [ads, categories] = await Promise.all([
    getAds(categoryId, subcategoryId, searchQuery),
    getCategories(),
  ]);

  const isSearching = !!searchQuery;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Ads List</h1>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          {/* When user can post, show buttons in grid layout */}
          {isUser && (
            <div className="grid grid-cols-2 gap-2 w-full md:hidden">
              <MobileFilterButton
                selectedCategory={categoryId}
                selectedSubcategory={subcategoryId}
                className="w-full"
              />

              <Link
                href="/ads/create"
                className="w-full whitespace-nowrap bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Post Ad
              </Link>
            </div>
          )}

          {/* When user can't post, show search bar with filter button beside it */}
          {!isUser && (
            <div className="flex flex-row w-full items-center gap-2 md:hidden">
              <div className="flex-grow">
                <SearchBar />
              </div>
              <div className="flex-shrink-0">
                <MobileFilterButton
                  selectedCategory={categoryId}
                  selectedSubcategory={subcategoryId}
                  className="h-10"
                />
              </div>
            </div>
          )}

          {/* Desktop view - search and post button */}
          <div className="hidden md:flex flex-row w-full items-center gap-3">
            <div className="flex-grow">
              <SearchBar />
            </div>

            {isUser && (
              <div className="flex-shrink-0">
                <Link
                  href="/ads/create"
                  className="whitespace-nowrap bg-blue-600 text-white px-4 py-2 h-10 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Post Ad
                </Link>
              </div>
            )}
          </div>

          {isUser && (
            <div className="md:hidden w-full">
              <SearchBar />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <CategoryFilter
            categories={categories}
            selectedCategory={categoryId}
            filterButtonLocation="outside"
            selectedSubcategory={subcategoryId}
          />
        </div>

        <div className="md:col-span-3">
          {ads.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-700">
                No ads found
              </h2>
              <p className="text-gray-500 mt-2">
                {isSearching
                  ? `No results found for '${searchQuery}'`
                  : categoryId
                  ? subcategoryId
                    ? "No ads in this subcategory yet. Try another subcategory or post one!"
                    : "No ads in this category yet. Try another category or post one!"
                  : "No ads available yet. Be the first to post!"}
              </p>
            </div>
          ) : (
            <>
              {isSearching && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Found {ads.length} result{ads.length !== 1 ? "s" : ""} for
                  &quot;{searchQuery}&quot;
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.map(
                  (
                    ad: IAd & {
                      _id: string;
                      category: { name: string; _id: string };
                      subcategory: { name: string; _id: string };
                      user: { name: string; _id: string };
                    }
                  ) => (
                    <AdCard key={ad._id} ad={ad} />
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
