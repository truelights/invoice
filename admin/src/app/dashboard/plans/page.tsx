"use client";

import { useState, useEffect } from "react";
import { getAllPlans, createPlan, updatePlan, deletePlan } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    description: "",
    features: "",
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

  const handleNewPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlan({ ...newPlan, [e.target.name]: e.target.value });
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const planData = {
        name: newPlan.name,
        price: parseFloat(newPlan.price),
        description: newPlan.description,
        features: newPlan.features.split(",").map((feature) => feature.trim()),
      };
      const createdPlan = await createPlan(planData);
      setPlans([...plans, createdPlan]);
      setNewPlan({ name: "", price: "", description: "", features: "" });
    } catch (error) {
      console.error("Failed to create plan:", error);
    }
  };

  const handleUpdatePlan = async (id: string, updatedPlan: Partial<Plan>) => {
    try {
      const updated = await updatePlan(id, updatedPlan as Plan);
      setPlans(plans.map((plan) => (plan.id === id ? updated : plan)));
    } catch (error) {
      console.error("Failed to update plan:", error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deletePlan(id);
      setPlans(plans.filter((plan) => plan.id !== id));
    } catch (error) {
      console.error("Failed to delete plan:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <Input
              name="name"
              value={newPlan.name}
              onChange={handleNewPlanChange}
              placeholder="Plan Name"
              required
            />
            <Input
              name="price"
              type="number"
              value={newPlan.price}
              onChange={handleNewPlanChange}
              placeholder="Price"
              required
            />
            <Input
              name="description"
              value={newPlan.description}
              onChange={handleNewPlanChange}
              placeholder="Description"
              required
            />
            <Input
              name="features"
              value={newPlan.features}
              onChange={handleNewPlanChange}
              placeholder="Features (comma-separated)"
              required
            />
            <Button type="submit">Create Plan</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.map((plan) => (
            <div key={plan.id} className="mb-4 p-4 border rounded">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p>Price: ${plan.price}</p>
              <p>Description: {plan.description}</p>
              <ul className="list-disc pl-5">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <div className="mt-2 space-x-2">
                <Button
                  onClick={() => {
                    const newName = prompt("New name:", plan.name);
                    if (newName) handleUpdatePlan(plan.id, { name: newName });
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
                    const newDescription = prompt(
                      "New description:",
                      plan.description
                    );
                    if (newDescription)
                      handleUpdatePlan(plan.id, {
                        description: newDescription,
                      });
                  }}
                >
                  Edit Description
                </Button>
                <Button
                  onClick={() => handleDeletePlan(plan.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
