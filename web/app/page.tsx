"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PurchaseBill from "@/components/purchase-bill";
import SalesBill from "@/components/sales-bill";

export default function Home() {
  const [billType, setBillType] = useState<"purchase" | "sales">("purchase");
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) =>
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          )
        )
        .catch((error) =>
          console.log("Service Worker registration failed:", error)
        );
    }
  }, []);
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-6">Billing System</h1>
        <div className="flex justify-center gap-4">
          <Button
            variant={billType === "purchase" ? "default" : "outline"}
            onClick={() => setBillType("purchase")}
          >
            Purchase Bill
          </Button>
          <Button
            variant={billType === "sales" ? "default" : "outline"}
            onClick={() => setBillType("sales")}
          >
            Sales Bill
          </Button>
        </div>
      </div>
      {billType === "purchase" ? <PurchaseBill /> : <SalesBill />}
    </main>
  );
}
