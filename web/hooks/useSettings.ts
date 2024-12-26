import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "@/utils/api";

// Interface for Settings
export interface Settings {
  _id: string;
  name: string;
  gst: string;
  address: string;
  phone: string;
  expenseLabels: string[];
  products: { _id: string; name: string; price: number }[]; // _id is required for products
  customers: { _id: string; name: string; address: string; phone: string }[]; // _id is required for customers
  vendors: { _id: string; name: string; address: string; phone: string }[];
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch Settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      setSettings(response.data); // Store settings in state
      setError(null); // Reset error if successful
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError(error as Error); // Set error if fetching fails
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  // Update Settings (Handle Partial Updates)
  const updateSettingsData = async (newSettings: Partial<Settings>) => {
    try {
      // Ensure all fields have correct types
      if (newSettings.products) {
        newSettings.products = newSettings.products.map(product => ({
          _id: product._id || "", // Ensure _id is a string (add a default empty string if not provided)
          name: product.name,
          price: product.price,
        }));
      }

      if (newSettings.customers) {
        newSettings.customers = newSettings.customers.map(customer => ({
          _id: customer._id || "", // Ensure _id is a string (add a default empty string if not provided)
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
        }));
      }

      await updateSettings(newSettings); // Send the updated settings to the API

    } catch (error) {
      console.error("Error updating settings:", error);
      setError(error as Error); // Set error if update fails
    }
  };

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Return necessary state and the update function
  return { settings, loading, error, updateSettings: updateSettingsData };
}
