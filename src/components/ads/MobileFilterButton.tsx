"use client";

import { Filter } from "lucide-react";

interface MobileFilterButtonProps {
  className?: string;
  selectedCategory?: string;
  selectedSubcategory?: string;
}

export default function MobileFilterButton({
  className = "",
  selectedCategory,
  selectedSubcategory,
}: MobileFilterButtonProps) {
  const handleFilterClick = () => {
    const filterDrawerEvent = new CustomEvent("toggle-filter-drawer");
    document.dispatchEvent(filterDrawerEvent);
  };

  const hasActiveFilters = selectedCategory || selectedSubcategory;

  return (
    <button
      onClick={handleFilterClick}
      className={`${className} flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm transition
        ${
          hasActiveFilters
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
    >
      <Filter className="h-5 w-5 mr-1.5" />
      <span>Filter</span>
      {hasActiveFilters && (
        <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-blue-600">
          {selectedSubcategory ? "2" : "1"}
        </span>
      )}
    </button>
  );
}
