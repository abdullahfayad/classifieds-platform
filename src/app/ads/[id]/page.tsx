import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";

import { Ad } from "@/lib/db/models";
import { connectToMongoDB } from "@/lib/db/mongodb";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface AdDetailPageProps {
  params: {
    id: string;
  };
}

async function getAd(id: string) {
  try {
    await connectToMongoDB();

    const ad = await Ad.findById(id)
      .populate("user", "name email")
      .populate("category", "name")
      .populate("subcategory", "name")
      .lean();

    if (!ad) {
      return null;
    }

    return JSON.parse(JSON.stringify(ad));
  } catch (error) {
    console.error("Error fetching ad details:", error);
    return null;
  }
}

export default async function AdDetailPage({ params }: AdDetailPageProps) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  const ad = await getAd(id);

  if (!ad) {
    notFound();
  }

  if (
    ad.status === "pending" &&
    (!session?.user ||
      (session.user.id !== ad.user._id && session.user.role !== "moderator"))
  ) {
    redirect("/");
  }

  if (
    ad.status === "rejected" &&
    (!session?.user ||
      (session.user.id !== ad.user._id && session.user.role !== "moderator"))
  ) {
    redirect("/");
  }

  const isOwner = session?.user && session.user.id === ad.user._id;
  const isModerator = session?.user && session.user.role === "moderator";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          &larr; Back to listings
        </Link>
      </div>

      {ad.status !== "approved" && (
        <div
          className={`mb-4 p-4 rounded-md ${
            ad.status === "pending"
              ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          }`}
        >
          {ad.status === "pending" ? (
            <p className="font-medium">
              This ad is pending approval and is only visible to you and
              moderators.
            </p>
          ) : (
            <>
              <p className="font-medium">
                This ad has been rejected and is only visible to you and
                moderators.
              </p>
              {ad.rejectionReason && (
                <p className="mt-2">
                  <span className="font-semibold">Reason:</span>{" "}
                  {ad.rejectionReason}
                </p>
              )}
              {isOwner && (
                <div className="mt-4">
                  <Link
                    href={`/ads/${id}/edit`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Edit Ad
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-4 lg:p-6 lg:col-span-2">
            <div className="relative h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {ad.images && ad.images.length > 0 ? (
                <Image
                  src={ad.images[0]}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400 dark:text-gray-500">
                    No image available
                  </span>
                </div>
              )}
            </div>

            {ad.images && ad.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {ad.images.slice(1).map((image: string, index: number) => (
                  <div
                    key={index}
                    className="relative h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`${ad.title} image ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ad.title}
                </h1>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${ad.price.toLocaleString()}
                </p>
              </div>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {ad.category.name}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                  {ad.subcategory.name}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Location: {ad.location.city}, {ad.location.country}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Posted on {new Date(ad.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {ad.description}
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold mb-4">Contact Seller</h2>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  {ad.user.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {ad.user.email}
                </p>
                <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition">
                  Contact Seller
                </button>
              </div>
            </div>

            {isModerator && ad.status === "pending" && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-lg font-semibold mb-4">
                  Moderation Actions
                </h2>
                <div className="flex space-x-4">
                  <Link
                    href="/moderation"
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                  >
                    Go to Moderation Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
