import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from 'uuid'; // Add this import

type Customer = {
  _id: string;
  name: string;
  address: string;
  phone: string;
};

type Settings = {
  customers: Customer[];
};

type CustomerSettingsProps = {
    settings: Settings; // `settings` is a complete `Settings` object
    onUpdate: (updatedSettings: Partial<Settings>) => Promise<Settings>; // Ensure it returns `Promise<Settings>`
  };
  
export function CustomerSettings({
  settings,
  onUpdate,
}: CustomerSettingsProps) {
  const [customers, setCustomers] = useState<Customer[]>(settings.customers);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    _id: "",
    name: "",
    address: "",
    phone: "",
  });

  const handleAddCustomer = () => {
    if (
      newCustomer.name.trim() &&
      newCustomer.address.trim() &&
      newCustomer.phone.trim()
    ) {
      const updatedCustomers = [...customers, { ...newCustomer, _id: uuidv4() }];
      setCustomers(updatedCustomers);
      setNewCustomer({ _id: "", name: "", address: "", phone: "" });
      onUpdate({
        customers: updatedCustomers.map((customer) => {
          const { ...rest } = customer;
          return rest;
        }),
      });
    }
  };


  const handleRemoveCustomer = (id: string) => {
    const updatedCustomers = customers.filter((customer) => customer._id !== id);
    setCustomers(updatedCustomers);
    onUpdate({
      customers: updatedCustomers.map((customer) => {
        const { ...rest } = customer;
        return rest;
      }),
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({
      customers: customers.map((customer) => {
        const { ...rest } = customer;
        return rest;
      }),
    });
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={newCustomer.name}
          onChange={(e) =>
            setNewCustomer((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter customer name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerAddress">Customer Address</Label>
        <Input
          id="customerAddress"
          value={newCustomer.address}
          onChange={(e) =>
            setNewCustomer((prev) => ({ ...prev, address: e.target.value }))
          }
          placeholder="Enter customer address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerPhone">Customer Phone</Label>
        <Input
          id="customerPhone"
          value={newCustomer.phone}
          onChange={(e) =>
            setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="Enter customer phone"
        />
      </div>
      <Button type="button" onClick={handleAddCustomer}>
        Add Customer
      </Button>
      <div>
        <Label>Customers</Label>
        <ul className="space-y-2">
          {customers.map((customer) => (
            <li
              key={customer._id} // Use _id as key
              className="flex justify-between items-center"
            >
              <span>
                {customer.name} - {customer.phone}
              </span>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemoveCustomer(customer._id)} // Pass _id to handler
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
