"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Analytics } from "@/utils/api";
import { Loader2 } from "lucide-react";

// Define the interface for package usage
interface PackageUsage {
  plan: string;
  count: number;
}

// Interface for analytics data matching the API response
interface AnalyticsData {
  totalBusinesses: number;
  totalCustomers: number;
  totalVendors: number;
  totalProducts: number;
  packageUsage: PackageUsage[];
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await Analytics();
        console.log("API Response:", response); // Log to inspect the structure
        setAnalytics(response as unknown as AnalyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError("Failed to fetch analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No analytics data available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Businesses</CardTitle>
          <CardDescription>Number of registered businesses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{analytics.totalBusinesses}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Customers</CardTitle>
          <CardDescription>Number of total customers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{analytics.totalCustomers}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Vendors</CardTitle>
          <CardDescription>Number of total vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{analytics.totalVendors}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Products</CardTitle>
          <CardDescription>Number of total products</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{analytics.totalProducts}</p>
        </CardContent>
      </Card>
      {analytics.packageUsage.length > 0 ? (
        analytics.packageUsage.map((pkg, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{pkg.plan}</CardTitle>
              <CardDescription>
                Number of businesses using this plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pkg.count}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Package Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No package usage data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
