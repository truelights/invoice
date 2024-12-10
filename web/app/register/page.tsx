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
import { AxiosError } from "axios";
type RegistrationData = {
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  gst: string;
  address: string;
  city: string;
  state: string;
  phone: string;
};

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  businessName?: string;
  gst?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  logo?: string;
};

export default function Register() {
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    gst: "",
    address: "",
    city: "",
    state: "",
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

    if (!formData.email) errors.email = "Email is required.";
    if (!formData.password) errors.password = "Password is required.";
    if (!formData.confirmPassword)
      errors.confirmPassword = "Confirm password is required.";
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";
    if (!formData.businessName)
      errors.businessName = "Business name is required.";
    if (!formData.address) errors.address = "Address is required.";
    if (!formData.city) errors.city = "City is required.";
    if (!formData.state) errors.state = "State is required.";
    if (!formData.phone) errors.phone = "Phone number is required.";

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, isPaidPlan: boolean) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const mergedAddress = `${formData.address}, ${formData.city}, ${formData.state}`;
      const formDataToSend = {
        ...formData,
        address: mergedAddress,
        isPaidPlan,
      };

      const formDataForFile = new FormData();
      if (logo) {
        formDataForFile.append("logo", logo);
      }

      const response = await register(formDataToSend);

      login(response.data.token);
      router.push("/invoice");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error);
        const errorMessage =
          error?.response?.data?.message || "An unexpected error occurred.";
        setError(errorMessage);
      } else {
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500">{formErrors.confirmPassword}</p>
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
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  required
                />
                {formErrors.city && (
                  <p className="text-red-500">{formErrors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter your state"
                  required
                />
                {formErrors.state && (
                  <p className="text-red-500">{formErrors.state}</p>
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
                <Label htmlFor="logo">Logo</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  onChange={handleChange}
                  accept="image/*"
                />
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
