"use client";

import { useState, useEffect } from "react";
import {
  getBusinessInfo,
  updateBusinessInfo,
  getPlans,
  changePlan,
} from "@/utils/api";
import { Plan, Business } from "@/utils/api";
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
          Array.isArray(businessData) ? businessData : [businessData]
        );
        setPlans(plansData);
        if (businessData) {
          const firstBusiness = Array.isArray(businessData)
            ? businessData[0]
            : businessData;
          setSelectedBusinessId(firstBusiness._id);
          setEditedBusiness(firstBusiness);
          setSelectedPlan(firstBusiness.plan);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

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
      const { name, value } = e.target;
      setEditedBusiness({
        ...editedBusiness,
        [name]: name === "commission" ? parseFloat(value) : value,
      });
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
        setEditedBusiness(updatedBusiness);
        alert("Business information updated successfully!");
      } catch (error) {
        console.error("Failed to update business info:", error);
        alert("Failed to update business information. Please try again.");
      }
    }
  };

  const handlePlanChange = async (planId: string) => {
    if (editedBusiness && selectedBusinessId) {
      const newPlan = plans.find((p) => p.id === planId);
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
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">
        Business Information Management
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Business</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={handleBusinessSelect}
            value={selectedBusinessId || undefined}
          >
            <SelectTrigger className="w-full">
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
                  value={editedBusiness.name || ""}
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
                  value={editedBusiness.gst || ""}
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
                  value={editedBusiness.address || ""}
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
                  value={editedBusiness.phone || ""}
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
                  value={(editedBusiness.commission || 0).toString()}
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ₹{plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {editedBusiness && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
