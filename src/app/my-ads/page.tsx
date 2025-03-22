"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Ad {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  category: {
    name: string;
  };
  subcategory: {
    name: string;
  };
  location: {
    city: string;
    country: string;
  };
}

export default function MyAdsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/my-ads");
      return;
    }

    if (status === "authenticated") {
      fetchMyAds();
    }
  }, [status, router]);

  const fetchMyAds = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ads/my-ads");

      if (!response.ok) {
        throw new Error("Failed to fetch ads");
      }

      const data = await response.json();
      setAds(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your ads");
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = () => {
    if (activeTab === "all") {
      return ads;
    }
    return ads.filter((ad) => ad.status === activeTab);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs rounded-full">
            Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs rounded-full">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Advertisements</h1>
        <Link
          href="/ads/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Post New Ad
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm leading-5 ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 focus:outline-none"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm leading-5 ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 focus:outline-none"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm leading-5 ${
                activeTab === "approved"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 focus:outline-none"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm leading-5 ${
                activeTab === "rejected"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 focus:outline-none"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer"
              }`}
            >
              Rejected
            </button>
          </nav>
        </div>

        <div className="p-4">
          {filteredAds().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No ads found in this category.
              </p>
              {activeTab === "all" && (
                <Link
                  href="/ads/create"
                  className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Post your first ad now
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAds().map((ad) => (
                <div
                  key={ad._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 bg-gray-100 dark:bg-gray-700 p-2">
                      <div className="aspect-w-16 aspect-h-9 relative h-40">
                        {ad.images && ad.images.length > 0 ? (
                          <Image
                            src={ad.images[0]}
                            alt={ad.title}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-600 rounded">
                            <span className="text-gray-500 dark:text-gray-400">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-3 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="text-lg font-semibold">{ad.title}</h2>
                          <div className="flex items-center mt-1 space-x-2">
                            {getStatusBadge(ad.status)}
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {new Date(ad.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${ad.price.toLocaleString()}
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {ad.description}
                      </p>

                      {ad.status === "rejected" && ad.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded">
                          <span className="font-semibold">
                            Rejection reason:
                          </span>{" "}
                          {ad.rejectionReason}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            {ad.category.name} / {ad.subcategory.name}
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            {ad.location.city}, {ad.location.country}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            href={`/ads/${ad._id}`}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            href={`/ads/${ad._id}/edit`}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
