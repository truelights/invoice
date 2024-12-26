import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Settings = {
  name: string;
  gst: string;
  address: string;
  phone: string;
  commission: number;
};

type CompanySettingsProps = {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<Settings>; // Ensure it returns `Promise<Settings>`
};

export function CompanySettings({ settings, onUpdate }: CompanySettingsProps) {
  const [formData, setFormData] = useState<Settings>({
    name: settings.name,
    gst: settings.gst,
    address: settings.address,
    phone: settings.phone,
    commission: settings.commission,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "commission" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onUpdate(formData);
    } catch (error) {
      console.error("Error during update:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="gst">GST Number</Label>
        <Input
          id="gst"
          name="gst"
          value={formData.gst}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="commission">Commission</Label>
        <Input
          id="commission"
          name="commission"
          type="number"
          value={formData.commission}
          onChange={handleChange}
        />
      </div>
      <Button type="submit">Update Company Settings</Button>
    </form>
  );
}
