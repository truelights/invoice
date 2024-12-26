"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSettings, updateSettings } from "@/utils/api";
import { CompanySettings } from "@/components/settings/company-settings";
import { ExpenseSettings } from "@/components/settings/expense-settings";
import ProductSettings from "@/components/settings/product-settings";
import { CustomerSettings } from "@/components/settings/customer-settings";
import { VendorSettings } from "@/components/settings/vendor-settings";

export type Settings = {
  _id: string;
  name: string;
  gst: string;
  address: string;
  phone: string;
  logo: string;
  expenseLabels: string[];
  products: Array<{ _id: string; name: string; price: number }>;
  customers: Array<{
    _id: string;
    name: string;
    address: string;
    phone: string;
  }>;
  vendors: Array<{ _id: string; name: string; address: string; phone: string }>;
  lastReceiptNumber: number;
  commission: number;
  lastReceiptDate: string;
  lastInvoiceNumber: number;
  plan: string;
  verified: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        setSettings(response.data); // Correctly accessing AxiosResponse data
      } catch (err) {
        console.log(err);
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdateSettings = async (
    updatedSettings: Partial<Settings>
  ): Promise<Settings> => {
    try {
      const response = await updateSettings(updatedSettings);
      const updatedData = response.data;
      setSettings(updatedData);
      return updatedData;
    } catch (err) {
      console.error(err);
      setError("Failed to update settings");
      throw err;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!settings) return <div>No settings found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Tabs defaultValue="company">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="vendor">Vendor</TabsTrigger>
        </TabsList>
        <TabsContent value="company">
          <CompanySettings
            settings={settings}
            onUpdate={handleUpdateSettings}
          />
        </TabsContent>
        <TabsContent value="expenses">
          <ExpenseSettings
            settings={settings}
            onUpdate={handleUpdateSettings}
          />
        </TabsContent>
        <TabsContent value="products">
          <ProductSettings
            settings={settings}
            onUpdate={handleUpdateSettings}
          />
        </TabsContent>
        <TabsContent value="customers">
          <CustomerSettings
            settings={settings}
            onUpdate={handleUpdateSettings}
          />
        </TabsContent>
        <TabsContent value="vendor">
          <VendorSettings
            settings={settings}
            onUpdate={handleUpdateSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
