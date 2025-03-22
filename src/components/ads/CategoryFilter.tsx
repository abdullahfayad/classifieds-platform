"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Filter, X } from "lucide-react";

import { ICategory, ISubcategory } from "@/lib/db/models";

interface CategoryFilterProps {
  categories: Array<ICategory & { _id: string }>;
  selectedCategory?: string;
  selectedSubcategory?: string;
  filterButtonLocation?: "inside" | "outside";
}

interface SubcategoryWithId extends Omit<ISubcategory, "_id" | "category"> {
  _id: string;
  category: {
    _id: string;
    name: string;
  };
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  selectedSubcategory,
  filterButtonLocation = "inside",
}: CategoryFilterProps) {
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [subcategories, setSubcategories] = useState<SubcategoryWithId[]>([]);

  const selectedCategoryName = selectedCategory
    ? categories.find((category) => category._id === selectedCategory)?.name
    : undefined;

  const selectedSubcategoryName =
    selectedSubcategory && subcategories.length > 0
      ? subcategories.find(
          (subcategory) => subcategory._id === selectedSubcategory
        )?.name
      : undefined;

  useEffect(() => {
    if (selectedCategory) {
      setExpandedCategories((prev) => ({
        ...prev,
        [selectedCategory]: true,
      }));
    }
  }, [selectedCategory]);

  useEffect(() => {
    async function fetchSubcategories() {
      try {
        setLoading(true);
        const response = await fetch("/api/subcategories");
        if (!response.ok) throw new Error("Failed to fetch subcategories");
        const data = await response.json();
        setSubcategories(data);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (showFiltersMobile && (selectedCategory || selectedSubcategory)) {
      setShowFiltersMobile(false);
    }
  }, [selectedCategory, selectedSubcategory, showFiltersMobile]);

  useEffect(() => {
    const handleToggleFilterDrawer = () => {
      setShowFiltersMobile((prev) => !prev);
    };

    document.addEventListener("toggle-filter-drawer", handleToggleFilterDrawer);

    return () => {
      document.removeEventListener(
        "toggle-filter-drawer",
        handleToggleFilterDrawer
      );
    };
  }, []);

  const toggleCategory = (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter((subcategory) => {
      if (
        typeof subcategory.category === "object" &&
        subcategory.category !== null
      ) {
        return subcategory.category._id === categoryId;
      }
      return String(subcategory.category) === categoryId;
    });
  };

  const clearFilters = () => {
    window.location.href = "/";
  };

  const filterContent = (
    <div className="space-y-2">
      <Link
        href="/"
        className={`block px-3 py-3 rounded-md ${
          !selectedCategory
            ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        All Categories
      </Link>

      {categories.map((category) => (
        <div key={category._id} className="space-y-1">
          <div className="flex items-center">
            <button
              onClick={(e) => toggleCategory(category._id, e)}
              className="mr-1 text-gray-500 dark:text-gray-400 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              aria-label={
                expandedCategories[category._id]
                  ? "Collapse category"
                  : "Expand category"
              }
            >
              {expandedCategories[category._id] ? (
                <ChevronDown className="h-5 w-5 cursor-pointer" />
              ) : (
                <ChevronRight className="h-5 w-5 cursor-pointer" />
              )}
            </button>

            <Link
              href={`/?category=${category._id}`}
              className={`flex-1 px-3 py-3 rounded-md ${
                selectedCategory === category._id
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {category.name}
            </Link>
          </div>

          {expandedCategories[category._id] && (
            <div className="pl-8 space-y-1">
              {loading ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 pl-3 py-1">
                  Loading...
                </div>
              ) : (
                getSubcategoriesForCategory(category._id).map((subcategory) => (
                  <Link
                    key={subcategory._id}
                    href={`/?category=${category._id}&subcategory=${subcategory._id}`}
                    className={`block px-3 py-2 text-sm rounded-md ${
                      selectedSubcategory === subcategory._id
                        ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {subcategory.name}
                  </Link>
                ))
              )}

              {!loading &&
                getSubcategoriesForCategory(category._id).length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 pl-3 py-1">
                    No subcategories
                  </div>
                )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {filterButtonLocation === "inside" && (
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Filter</span>
            </button>

            {(selectedCategory || selectedSubcategory) && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 dark:text-red-400"
              >
                Clear Filters
              </button>
            )}
          </div>
          {(selectedCategoryName || selectedSubcategoryName) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedCategoryName && (
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center">
                  <span className="mr-1">{selectedCategoryName}</span>
                  <Link href="/" className="ml-1">
                    <X className="h-3 w-3" />
                  </Link>
                </div>
              )}
              {selectedSubcategoryName && (
                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full flex items-center">
                  <span className="mr-1">{selectedSubcategoryName}</span>
                  <Link
                    href={`/?category=${selectedCategory}`}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Always render the filter chips on mobile regardless of filterButtonLocation */}
      {filterButtonLocation === "outside" &&
        (selectedCategoryName || selectedSubcategoryName) && (
          <div className="md:hidden mt-4 mb-4 flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <div className="w-full mb-1 text-xs text-gray-500 dark:text-gray-400">
              Active filters:
            </div>
            {selectedCategoryName && (
              <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center">
                <span>{selectedCategoryName}</span>
                <Link
                  href="/"
                  className="ml-1.5 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
            {selectedSubcategoryName && (
              <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full flex items-center">
                <span>{selectedSubcategoryName}</span>
                <Link
                  href={`/?category=${selectedCategory}`}
                  className="ml-1.5 p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
            {(selectedCategory || selectedSubcategory) && (
              <button
                onClick={clearFilters}
                className="ml-auto px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-full flex items-center"
              >
                <span className="mr-1">Clear All</span>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

      {showFiltersMobile && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setShowFiltersMobile(false)}
            aria-hidden="true"
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Categories</h2>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filterContent}</div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearFilters}
                className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        {filterContent}
      </div>
    </>
  );
}
