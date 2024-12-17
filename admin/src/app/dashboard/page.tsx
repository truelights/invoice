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
export default function DashboardPage() {
  const [analytics, setAnalytics] = useState({
    totalBusinesses: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalProducts: 0,
    packageUsage: [],
  });
  console.log(analytics);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await Analytics();

        const data = response;
        console.log("data", data);

        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }

    fetchAnalytics();
  }, []);

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
      {analytics.packageUsage.map((pkg, index) => (
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
      ))}
    </div>
  );
}
