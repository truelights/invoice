"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      redirect(`/login`);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
