"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface Ad {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user: {
    name: string;
    _id: string;
  };
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

export default function ModerationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [adToReject, setAdToReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/moderation");
      return;
    }

    if (status === "authenticated" && session.user.role !== "moderator") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session.user.role === "moderator") {
      fetchPendingAds();
    }
  }, [status, session, router]);

  const fetchPendingAds = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/moderation/pending");

      if (!response.ok) {
        throw new Error("Failed to fetch pending ads");
      }

      const data = await response.json();
      setAds(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pending ads");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adId: string) => {
    try {
      const response = await fetch(`/api/moderation/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve ad");
      }

      setAds(ads.filter((ad) => ad._id !== adId));
    } catch (err) {
      console.error(err);
      setError("Failed to approve ad");
    }
  };

  const openRejectModal = (adId: string) => {
    setAdToReject(adId);
    setRejectionReason("");
    setShowModal(true);
  };

  const handleReject = async () => {
    if (!adToReject || !rejectionReason.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/moderation/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adId: adToReject,
          reason: rejectionReason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject ad");
      }

      setAds(ads.filter((ad) => ad._id !== adToReject));

      // Close the modl
      setShowModal(false);
      setAdToReject(null);
      setRejectionReason("");
    } catch (err) {
      console.error(err);
      setError("Failed to reject ad");
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ad Moderation Dashboard</h1>

      {ads.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No pending ads</h2>
          <p className="text-gray-500 dark:text-gray-400">
            All ads have been moderated. Check back later for new submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {ads.map((ad) => (
            <div
              key={ad._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1 bg-gray-100 dark:bg-gray-700 p-2">
                  <div className="aspect-w-16 aspect-h-9 relative h-48">
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

                <div className="md:col-span-2 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">{ad.title}</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Posted by {ad.user.name} on{" "}
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                          {ad.category.name}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                          {ad.subcategory.name}
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ${ad.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="text-gray-700 dark:text-gray-300">
                      {ad.description.length > 200
                        ? `${ad.description.substring(0, 200)}...`
                        : ad.description}
                    </p>
                  </div>

                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Location: {ad.location.city}, {ad.location.country}
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <Link
                      href={`/ads/${ad._id}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleApprove(ad._id)}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(ad._id)}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Ad</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Please provide a reason for rejecting this ad:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={4}
              placeholder="Reason for rejection"
              required
            ></textarea>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Ad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
