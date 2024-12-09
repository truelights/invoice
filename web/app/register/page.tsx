"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { register } from "@/utils/api";
import { AxiosError } from "axios"; // Add this if using Axios

type RegistrationData = {
  email: string;
  password: string;
  businessName: string;
  gst: string;
  address: string;
  phone: string;
};

type FormErrors = {
  email?: string;
  password?: string;
  businessName?: string;
  gst?: string;
  address?: string;
  phone?: string;
  logo?: string;
};

export default function Register() {
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    businessName: "",
    gst: "",
    address: "",
    phone: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const fileList = e.target.files;
      if (fileList && fileList.length > 0) {
        setLogo(fileList[0]);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Check if any field is empty
    if (!formData.email) errors.email = "Email is required.";
    if (!formData.password) errors.password = "Password is required.";
    if (!formData.businessName)
      errors.businessName = "Business name is required.";
    if (!formData.gst) errors.gst = "GST number is required.";
    if (!formData.address) errors.address = "Address is required.";
    if (!formData.phone) errors.phone = "Phone number is required.";
    if (!logo) errors.logo = "Logo is required.";

    // Set errors state
    setFormErrors(errors);

    // If there are errors, return false
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, isPaidPlan: boolean) => {
    e.preventDefault();

    // Validate form fields before submitting
    if (!validateForm()) {
      return; // Don't submit if there are validation errors
    }

    try {
      // Send regular form data as an object
      const formDataToSend = { ...formData, isPaidPlan };

      // If logo is available, append it to FormData for file upload
      const formDataForFile = new FormData();
      if (logo) {
        formDataForFile.append("logo", logo);
      }

      // Send the form data (you can choose between sending regular object or FormData depending on your backend)
      const response = await register(formDataToSend);

      login(response.data.token);
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // Check if error is an AxiosError
        console.error(error);
        const errorMessage =
          error?.response?.data?.message || "An unexpected error occurred.";
        setError(errorMessage);
      } else {
        // Handle other types of errors
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/rr-5-10.png"
            alt="Logo"
            width={80}
            height={80}
            className="mb-8"
          />
        </div>

        {/* Form */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                {formErrors.password && (
                  <p className="text-red-500">{formErrors.password}</p>
                )}
              </div>
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  required
                />
                {formErrors.businessName && (
                  <p className="text-red-500">{formErrors.businessName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="gst">GST Number</Label>
                <Input
                  id="gst"
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                  placeholder="Enter your GST number"
                  required
                />
                {formErrors.gst && (
                  <p className="text-red-500">{formErrors.gst}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  required
                />
                {formErrors.address && (
                  <p className="text-red-500">{formErrors.address}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
                {formErrors.phone && (
                  <p className="text-red-500">{formErrors.phone}</p>
                )}
              </div>
              <div>
                <Label htmlFor="logo">Business Logo</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  onChange={handleChange}
                  accept="image/*"
                  required
                />
                {formErrors.logo && (
                  <p className="text-red-500">{formErrors.logo}</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-center" role="alert">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              type="submit"
              onClick={(e) => handleSubmit(e, true)}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Signup and Buy Plan
            </Button>
            <Button
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Start Free Trial- 14 Days
            </Button>
          </div>
        </form>

        {/* Footer */}
        <footer className="text-center space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <Link
              href="https://www.softflowsolutions.com"
              className="text-blue-500 hover:underline"
            >
              www.softflowsolutions.com
            </Link>
          </div>
          <p>© Softflow Solutions 2024</p>
        </footer>
      </div>
    </div>
  );
}
