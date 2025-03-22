"use client";

import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const isUserInput = useRef(false);
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchQuery = searchParams.get("search") || "";

  const [query, setQuery] = useState(searchQuery);

  useEffect(() => {
    if (query !== searchQuery && !isUserInput.current) {
      setQuery(searchQuery);
    }
    isUserInput.current = false;
  }, [searchQuery]);

  useEffect(() => {
    if (!isUserInput.current) return;

    const timer = setTimeout(() => {
      if (query === searchParams.get("search")) return;

      const params = new URLSearchParams(searchParams.toString());

      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }

      router.push(`/?${params.toString()}`);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  useEffect(() => {
    if (searchQuery && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserInput.current = true;
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (query === searchParams.get("search")) return;

    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }

    router.push(`/?${params.toString()}`);
  };

  const clearSearch = () => {
    isUserInput.current = true;
    setQuery("");

    if (searchParams.has("search")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full h-full">
      <input
        ref={searchInputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search ads..."
        className="px-4 py-2 pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <span className="sr-only">Clear search</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
