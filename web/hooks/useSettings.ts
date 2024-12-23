import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "@/utils/api";

export interface Settings {
  _id: string;
  name: string;
  gst: string;
  address: string;
  phone: string;
  expenseLabels: string[];
  products: { name: string; price: number }[];
  customers: { name: string; address: string; phone: string }[];
  vendors: { name: string; address: string; phone: string }[];
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();

      setSettings(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettingsData = async (newSettings: Settings) => {
    try {
      await updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      setError(error as Error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, updateSettings: updateSettingsData };
}
