"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("nikal!");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
