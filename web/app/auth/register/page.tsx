"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { AxiosError } from "axios";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

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
  planId: string;
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
  planId?: string;
};

type Plan = {
  _id: string;
  name: string;
  price: number;
};
interface PaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

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
    planId: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { login } = useAuth();
  console.log(plans);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/plans`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch plans");
        }
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setError("Failed to load plans. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

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

  const handlePlanChange = (value: string) => {
    setFormData((prev) => ({ ...prev, planId: value }));
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
    if (!formData.planId) errors.planId = "Please select a plan.";

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const createOrder = (planId: string) =>
    api.post("/payments/create-order", { planId });

  const verifyPayment = (paymentData: PaymentData) =>
    api.post("/payments/verify-payment", paymentData);

  const register = async (userData: {
    email: string;
    password: string;
    businessName: string;
    gst: string;
    address: string;
    phone: string;
    planId: string;
    paymentId?: string;
    orderId?: string;
    signature?: string;
  }) => {
    try {
      // First, create an order
      const orderResponse = await createOrder(userData.planId);
      const { id: orderId, amount } = orderResponse.data;

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "Invoice App",
        description: "Plan Subscription",
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify the payment
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            // If payment is verified, proceed with registration
            const registrationData = {
              ...userData,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            };

            const registrationResponse = await api.post(
              "/auth/register",
              registrationData
            );

            // Handle login after successful registration
            login(registrationResponse.data.token);

            // Redirect to the invoice page
            router.push("/invoice-/invoice");
          } catch (error) {
            console.error(
              "Error during payment verification or registration:",
              error
            );
            throw new Error("Payment verification or registration failed.");
          }
        },
        prefill: {
          email: userData.email,
          contact: userData.phone,
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", (response: RazorpayFailedResponse) => {
        console.error("Payment failed:", response);
        throw new Error("Payment failed");
      });
    } catch (error) {
      console.error("Error in registration flow:", error);
      throw error; // Re-throw the error for further handling
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const mergedAddress = `${formData.address}, ${formData.city}, ${formData.state}`;
      const registrationData = {
        ...formData,
        address: mergedAddress,
      };
      const formDataObj = new FormData();
      Object.entries(registrationData).forEach(([key, value]) => {
        formDataObj.append(key, value as string);
      });

      if (logo) {
        formDataObj.append("logo", logo); // Include logo if uploaded
      }
      await register(registrationData);
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

  if (isLoading) {
    return <div>Loading plans...</div>;
  }

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
        <form className="space-y-6" onSubmit={handleSubmit}>
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
              <div>
                <Label htmlFor="plan">Select a Plan</Label>
                <Select
                  value={formData.planId}
                  onValueChange={handlePlanChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan._id} value={plan._id}>
                        {plan.name} - ₹{plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.planId && (
                  <p className="text-red-500">{formErrors.planId}</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-center" role="alert">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="w-full md:w-auto px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Register and Pay
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
