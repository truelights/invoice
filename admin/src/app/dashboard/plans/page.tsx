"use client";

import { useState, useEffect } from "react";
import { getAllPlans, createPlan, updatePlan, deletePlan } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plan } from "@/utils/api";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  const [newPlan, setNewPlan] = useState<Plan>({
    id: "",
    name: "",
    price: 0,
    description: "",
    features: [],
    duration: 0,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    }
  };

  const handleNewPlanChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setNewPlan((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "duration"
          ? Number(value)
          : name === "features"
          ? value.split(",").map((feature) => feature.trim())
          : value,
    }));
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdPlan = await createPlan(newPlan);
      setPlans((prev) => [...prev, createdPlan]);
      setNewPlan({
        id: "",
        name: "",
        price: 0,
        description: "",
        features: [],
        duration: 0,
      });
    } catch (error) {
      console.error("Failed to create plan:", error);
    }
  };

  const handleUpdatePlan = async (id: string, updatedPlan: Partial<Plan>) => {
    try {
      const existingPlan = plans.find((plan) => plan.id === id);
      if (!existingPlan) return;

      const updated = await updatePlan(id, { ...existingPlan, ...updatedPlan });
      setPlans((prev) => prev.map((plan) => (plan.id === id ? updated : plan)));
    } catch (error) {
      console.error("Failed to update plan:", error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deletePlan(id);
      setPlans((prev) => prev.filter((plan) => plan.id !== id));
    } catch (error) {
      console.error("Failed to delete plan:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Plans Management</h1>

      {/* Create Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Plan Name
              </label>
              <Input
                id="name"
                name="name"
                value={newPlan.name}
                onChange={handleNewPlanChange}
                placeholder="Enter plan name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                value={newPlan.price.toString()}
                onChange={handleNewPlanChange}
                placeholder="Enter price"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newPlan.description}
                onChange={handleNewPlanChange}
                placeholder="Enter description"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows={3}
              />
            </div>
            <div>
              <label
                htmlFor="features"
                className="block text-sm font-medium text-gray-700"
              >
                Features
              </label>
              <Input
                id="features"
                name="features"
                value={newPlan.features.join(", ")}
                onChange={handleNewPlanChange}
                placeholder="Enter features (comma-separated)"
                required
              />
            </div>
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration (days)
              </label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={newPlan.duration.toString()}
                onChange={handleNewPlanChange}
                placeholder="Enter duration in days"
                required
              />
            </div>
            <Button type="submit">Create Plan</Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Plans Card */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${plan.price}</p>
                  <p className="text-gray-600">{plan.description}</p>
                  <p className="text-sm text-gray-500">{plan.duration} days</p>
                  <ul className="list-disc pl-5 mt-2">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <div className="mt-4 space-x-2">
                    <Button
                      onClick={() => {
                        const newName = prompt("New name:", plan.name);
                        if (newName)
                          handleUpdatePlan(plan.id, { name: newName });
                      }}
                    >
                      Edit Name
                    </Button>
                    <Button
                      onClick={() => {
                        const newPrice = prompt(
                          "New price:",
                          plan.price.toString()
                        );
                        if (newPrice)
                          handleUpdatePlan(plan.id, {
                            price: parseFloat(newPrice),
                          });
                      }}
                    >
                      Edit Price
                    </Button>
                    <Button
                      onClick={() => {
                        const newDuration = prompt(
                          "New duration:",
                          plan.duration.toString()
                        );
                        if (newDuration)
                          handleUpdatePlan(plan.id, {
                            duration: Number(newDuration),
                          });
                      }}
                    >
                      Edit Duration
                    </Button>
                    <Button
                      onClick={() => handleDeletePlan(plan.id)}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
