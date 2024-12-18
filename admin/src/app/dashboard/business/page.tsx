"use client";

import { useState, useEffect } from "react";
import {
  getBusinessInfo,
  updateBusinessInfo,
  getPlans,
  changePlan,
} from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Plan {
  _id: string;
  id: string;
  name: string;
  price: number;
  features: string[];
  createdAt: string;
  description: string; // Ensure this is always a string
}

interface PlanData {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  features?: string[];
  createdAt?: string;
  description?: string;
}

interface Business {
  _id: string;
  name: string;
  gst: string;
  address: string;
  phone: string;
  logo: string | null;
  expenseLabels: string[];
  commission: number;
  plan: string;
  planExpiry: string;
  verified: boolean;
  products: Array<{ name: string; price: number; _id: string }>;
  customers: Array<{
    name: string;
    address: string;
    phone: string;
    _id: string;
  }>;
  vendors: Array<{
    name: string;
    address: string;
    phone: string;
    _id: string;
  }>;
  lastReceiptNumber: number;
  lastReceiptDate: string;
  lastInvoiceNumber: number;
}

interface Business {
  _id: string;
  name: string;
  gst: string;
  address: string;
  phone: string;
  logo: string | null;
  expenseLabels: string[];
  commission: number;
  plan: string;
  planExpiry: string;
  verified: boolean;
  products: Array<{ name: string; price: number; _id: string }>;
  customers: Array<{
    name: string;
    address: string;
    phone: string;
    _id: string;
  }>;
  vendors: Array<{ name: string; address: string; phone: string; _id: string }>;
  lastReceiptNumber: number;
  lastReceiptDate: string;
  lastInvoiceNumber: number;
}

interface BusinessInfo {
  _id?: string;
  name?: string;
  gst?: string;
  address?: string;
  phone?: string;
  logo?: string | null;
  expenseLabels?: string[];
  commission?: number;
  plan?: string;
  planExpiry?: string;
  verified?: boolean;
  products?: Array<{ name: string; price: number; _id: string }>;
  customers?: Array<{
    name: string;
    address: string;
    phone: string;
    _id: string;
  }>;
  vendors?: Array<{
    name: string;
    address: string;
    phone: string;
    _id: string;
  }>;
  lastReceiptNumber?: number;
  lastReceiptDate?: string;
  lastInvoiceNumber?: number;
}

export default function BusinessInfoPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null
  );
  const [editedBusiness, setEditedBusiness] = useState<Business | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const businessData = await getBusinessInfo();
        const plansData = await getPlans();

        setBusinesses(
          Array.isArray(businessData)
            ? businessData.map(convertToBusinessType)
            : [convertToBusinessType(businessData)]
        );
        setPlans(plansData.map(convertToPlanType));
        if (businessData) {
          const firstBusiness = Array.isArray(businessData)
            ? businessData[0]
            : businessData;
          setSelectedBusinessId(firstBusiness._id);
          setEditedBusiness(convertToBusinessType(firstBusiness));
          setSelectedPlan(firstBusiness.plan);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const convertToBusinessType = (data: BusinessInfo): Business => {
    if (!data._id) {
      throw new Error("BusinessInfo is missing required _id property.");
    }
    return {
      _id: data._id,
      name: data.name || "",
      gst: data.gst || "",
      address: data.address || "",
      phone: data.phone || "",
      logo: data.logo || null,
      expenseLabels: data.expenseLabels || [],
      commission: data.commission || 0,
      plan: data.plan || "",
      planExpiry: data.planExpiry || "",
      verified: data.verified || false,
      products: data.products || [],
      customers: data.customers || [],
      vendors: data.vendors || [],
      lastReceiptNumber: data.lastReceiptNumber || 0,
      lastReceiptDate: data.lastReceiptDate || "",
      lastInvoiceNumber: data.lastInvoiceNumber || 0,
    };
  };

  const convertToPlanType = (data: PlanData): Plan => {
    return {
      _id: data._id || "",
      id: data.id || data._id || "",
      name: data.name || "",
      price: data.price || 0,
      features: data.features || [],
      createdAt: data.createdAt || "",
      description: data.description || "",
    };
  };

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    const selectedBusiness = businesses.find((b) => b._id === businessId);
    if (selectedBusiness) {
      setEditedBusiness(selectedBusiness);
      setSelectedPlan(selectedBusiness.plan);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedBusiness) {
      setEditedBusiness({ ...editedBusiness, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editedBusiness) {
      try {
        const updatedBusiness = await updateBusinessInfo(
          editedBusiness,
          editedBusiness._id
        );
        alert("Business information updated successfully!");

        setEditedBusiness(convertToBusinessType(updatedBusiness));
      } catch (error) {
        console.error("Failed to update business info:", error);
        alert("Failed to update business information. Please try again.");
      }
    }
  };

  const handlePlanChange = async (planId: string) => {
    if (editedBusiness && selectedBusinessId) {
      const newPlan = plans.find((p) => p._id === planId);
      if (newPlan) {
        try {
          await changePlan(selectedBusinessId, newPlan);
          setSelectedPlan(planId);
          setEditedBusiness({ ...editedBusiness, plan: planId });
          alert("Plan changed successfully!");
        } catch (error) {
          console.error("Failed to change plan:", error);
          alert("Failed to change plan. Please try again.");
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Business</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={handleBusinessSelect}
            value={selectedBusinessId || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((business) => (
                <SelectItem key={business._id} value={business._id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {editedBusiness && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={editedBusiness.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="gst"
                  className="block text-sm font-medium text-gray-700"
                >
                  GST Number
                </label>
                <Input
                  id="gst"
                  name="gst"
                  value={editedBusiness.gst}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <Input
                  id="address"
                  name="address"
                  value={editedBusiness.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={editedBusiness.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="commission"
                  className="block text-sm font-medium text-gray-700"
                >
                  Commission (%)
                </label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  value={editedBusiness.commission.toString()}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit">Update Business Information</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {editedBusiness && (
        <Card>
          <CardHeader>
            <CardTitle>Change Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={handlePlanChange}
              value={selectedPlan || undefined}
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
          </CardContent>
        </Card>
      )}

      {editedBusiness && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {editedBusiness.products.map((product) => (
                  <li key={product._id}>
                    {product.name} - ₹{product.price}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {editedBusiness.customers.map((customer) => (
                  <li key={customer._id}>
                    {customer.name} - {customer.phone}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {editedBusiness.vendors.map((vendor) => (
                  <li key={vendor._id}>
                    {vendor.name} - {vendor.phone}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
