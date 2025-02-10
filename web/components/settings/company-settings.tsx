"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";
import { useRouter } from "next/navigation";

// Define Zod schema for validation
const companySchema = z.object({
  name: z.string().nonempty("Company name is required."),
  address: z.string().nonempty("Address is required."),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits."),
  commission: z.number().min(0, "Commission must be a positive number."),
  logo: z.string().optional(),
  planExpiry: z.string().optional(),
  verified: z.boolean().optional(),
});

type Settings = z.infer<typeof companySchema>;

type CompanySettingsProps = {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<Settings>;
};

export function CompanySettings({ settings, onUpdate }: CompanySettingsProps) {
  const [formData, setFormData] = useState<Settings>(settings);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const expiryDate = new Date(formData.planExpiry || "");
  const currentDate = new Date();
  const isNearExpiry = expiryDate && (expiryDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24) <= 30;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "commission" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleLogoUpload = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, logo: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      companySchema.parse(formData);
      setError(null);
      setLoading(true);
      await onUpdate(formData);
      setLoading(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto p-6 shadow-lg rounded-2xl">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Company Settings</h2>

        {/* Display Error Message */}
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Display Plan Expiry & Verification Status */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Plan Expiry:</span> {expiryDate ? expiryDate.toLocaleDateString() : "N/A"}
          </p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${formData.verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
          >
            {formData.verified ? "Verified" : "Not Verified"}
          </span>
        </div>
        {isNearExpiry && (
          <div className="flex justify-end mb-4">
            <Button onClick={() => router.push("/renew")}>Renew Plan</Button>
          </div>
        )}

        {/* Display Company Logo */}
        {formData.logo && (
          <div className="flex justify-between mb-4">
            <div className="mr-4">Company Logo</div>
            <Image src={formData.logo} alt="Company Logo" height={80} width={80} className="rounded-lg shadow-md object-cover" />
          </div>
        )}

        {/* Logo Upload */}
        <div className="flex justify-between mb-4 border pb-4">
          <p className="text-sm text-gray-600 mb-2">Upload new Company Logo</p>
          <ImageUploader onImageUpload={handleLogoUpload} />
        </div>
        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="commission">Commission</Label>
            <Input id="commission" name="commission" type="number" value={formData.commission} onChange={handleChange} />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Company Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
