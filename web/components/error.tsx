"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">
        {error.message || "An unexpected error occurred"}
      </p>
      {error.digest && (
        <p className="text-sm text-gray-500 mb-4">Error ID: {error.digest}</p>
      )}
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
