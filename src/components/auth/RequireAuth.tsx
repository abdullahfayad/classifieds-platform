"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RequireAuth({
  children,
  moderatorRequired = false,
}: {
  children: React.ReactNode;
  moderatorRequired?: boolean;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(
          window.location.pathname
        )}`
      );
    } else if (moderatorRequired && session.user.role !== "moderator") {
      router.push("/");
    }
  }, [session, status, router, moderatorRequired]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (
    status === "authenticated" &&
    (!moderatorRequired || session.user.role === "moderator")
  ) {
    return <>{children}</>;
  }

  return null;
}
