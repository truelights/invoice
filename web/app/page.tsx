"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PurchaseBill from "@/components/purchase-bill";
import SalesBill from "@/components/sales-bill";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Home() {
  const [billType, setBillType] = useState<"purchase" | "sales">("sales");
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
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex gap-4">
            <Link href="/invoice/invoice">
              <Button variant="ghost">Bills</Button>
            </Link>
            <Link href="/invoice/transactions">
              <Button variant="ghost">Transactions</Button>
            </Link>
            <Link href="/invoice/reports">
              <Button variant="ghost">Reports</Button>
            </Link>
            <Link href="/invoice/settings">
              <Button variant="ghost">Settings</Button>
            </Link>
          </div>
        </div>
      </nav>
      <Button onClick={handleLogout}>Logout</Button>
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
