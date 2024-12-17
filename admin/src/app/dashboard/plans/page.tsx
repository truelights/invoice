'use client';

import { useState, useEffect } from 'react';
import { getAllPlans, createPlan, updatePlan, deletePlan } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Plan {
  _id: string;
  name: string;
  price: number;
  features: string[];
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', features: '' });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleNewPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlan({ ...newPlan, [e.target.name]: e.target.value });
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdPlan = await createPlan({
        name: newPlan.name,
        price: parseFloat(newPlan.price),
        features: newPlan.features.split(',').map(feature => feature.trim()),
      });
      setPlans([...plans, createdPlan]);
      setNewPlan({ name: '', price: '', features: '' });
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleUpdatePlan = async (id: string, updatedPlan: Partial<Plan>) => {
    try {
      const updated = await updatePlan(id, updatedPlan);
      setPlans(plans.map(plan => plan._id === id ? updated : plan));
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deletePlan(id);
      setPlans(plans.filter(plan => plan._id !== id));
    } catch (error) {
      console.error('Failed to delete plan:', error);
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
          {plans.map(plan => (
            <div key={plan._id} className="mb-4 p-4 border rounded">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p>Price: ${plan.price}</p>
              <ul className="list-disc pl-5">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <div className="mt-2 space-x-2">
                <Button onClick={() => handleUpdatePlan(plan._id, { name: prompt('New name:', plan.name) || plan.name })}>
                  Edit Name
                </Button>
                <Button onClick={() => handleUpdatePlan(plan._id, { price: parseFloat(prompt('New price:', plan.price.toString()) || plan.price.toString()) })}>
                  Edit Price
                </Button>
                <Button onClick={() => handleDeletePlan(plan._id)} variant="destructive">
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

