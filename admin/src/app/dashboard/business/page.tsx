"use client";

import { useState, useEffect } from "react";
import {
  getBusinessInfo,
  updateBusinessInfo,
  getPlans,
  changePlan,
  createPlan,
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
import { Textarea } from "@/components/ui/textarea";

interface Plan {
  _id: string;
  name: string;
  price: number;
  features: string[];
  createdAt: string;
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

export default function BusinessInfoPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null
  );
  const [editedBusiness, setEditedBusiness] = useState<Business | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState<Omit<Plan, "_id" | "createdAt">>({
    name: "",
    price: 0,
    features: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const businessData = await getBusinessInfo();
        const plansData = await getPlans();
        console.log("Business Data:", businessData);
        console.log("Plans Data:", plansData);

        setBusinesses(
          Array.isArray(businessData) ? businessData : [businessData]
        );
        setPlans(plansData);
        if (businessData) {
          setSelectedBusinessId(
            Array.isArray(businessData) ? businessData[0]._id : businessData._id
          );
          setEditedBusiness(
            Array.isArray(businessData) ? businessData[0] : businessData
          );
          setSelectedPlan(
            Array.isArray(businessData)
              ? businessData[0].plan
              : businessData.plan
          );
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    const selectedBusiness = Array.isArray(businesses)
      ? businesses.find((b) => b._id === businessId)
      : businesses._id === businessId
      ? businesses
      : null;
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
        const updatedBusiness = await updateBusinessInfo(editedBusiness);
        alert("Business information updated successfully!");
        setBusinesses(
          Array.isArray(businesses)
            ? businesses.map((b) =>
                b._id === updatedBusiness._id ? updatedBusiness : b
              )
            : updatedBusiness
        );
        setEditedBusiness(updatedBusiness);
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

  const handleNewPlanChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewPlan((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdPlan = await createPlan({
        ...newPlan,
        features: newPlan.features
          .toString()
          .split(",")
          .map((feature) => feature.trim()),
      });
      setPlans([...plans, createdPlan]);
      setNewPlan({ name: "", price: 0, features: [] });
      alert("New plan created successfully!");
    } catch (error) {
      console.error("Failed to create new plan:", error);
      alert("Failed to create new plan. Please try again.");
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
              {Array.isArray(businesses) ? (
                businesses.map((business) => (
                  <SelectItem key={business._id} value={business._id}>
                    {business.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={businesses._id}>
                  {businesses.name}
                </SelectItem>
              )}
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
                  value={editedBusiness.commission}
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
                    {plan.name} - ${plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <label
                htmlFor="planName"
                className="block text-sm font-medium text-gray-700"
              >
                Plan Name
              </label>
              <Input
                id="planName"
                name="name"
                value={newPlan.name}
                onChange={handleNewPlanChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="planPrice"
                className="block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <Input
                id="planPrice"
                name="price"
                type="number"
                value={newPlan.price}
                onChange={handleNewPlanChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="planFeatures"
                className="block text-sm font-medium text-gray-700"
              >
                Features (comma-separated)
              </label>
              <Textarea
                id="planFeatures"
                name="features"
                value={newPlan.features}
                onChange={handleNewPlanChange}
                required
              />
            </div>
            <Button type="submit">Create New Plan</Button>
          </form>
        </CardContent>
      </Card>

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
                    {product.name} - ${product.price}
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
