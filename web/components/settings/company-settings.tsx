import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the Settings type
type Settings = {
  name: string;
  gst: string;
  address: string;
  phone: string;
};

// Define the props for the component
type CompanySettingsProps = {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<void>;
};

export function CompanySettings({ settings, onUpdate }: CompanySettingsProps) {
  // Typing the formData state with the Settings type
  const [formData, setFormData] = useState<Settings>({
    name: settings.name,
    gst: settings.gst,
    address: settings.address,
    phone: settings.phone,
  });

  // Handle changes to the form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send the updated form data to onUpdate
    await onUpdate(formData);
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
      <Button type="submit">Update Company Settings</Button>
    </form>
  );
}
