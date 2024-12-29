import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

// Define Zod schema for validation
const companySchema = z.object({
  name: z.string().nonempty("Company name is required."),
  address: z.string().nonempty("Address is required."),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits."),
  commission: z
    .number()
    .min(0, "Commission must be a positive number.")
});

type Settings = z.infer<typeof companySchema>;

type CompanySettingsProps = {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<Settings>;
};

export function CompanySettings({ settings, onUpdate }: CompanySettingsProps) {
  const [formData, setFormData] = useState<Settings>(settings);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "commission" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate the form data using Zod
      companySchema.parse(formData);

      setError(null); // Clear previous errors
      await onUpdate(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message); // Display the first validation error
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div style={{ color: "red" }}>{error}</div>}
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
