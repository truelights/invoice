import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Customer = {
  name: string;
  address: string;
  phone: string;
};

type Settings = {
  customers: Customer[];
};

type CustomerSettingsProps = {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<Settings>;
};

export function CustomerSettings({
  settings,
  onUpdate,
}: CustomerSettingsProps) {
  const [customers, setCustomers] = useState<Customer[]>(settings.customers);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    name: "",
    address: "",
    phone: "",
  });

  const handleAddCustomer = async () => {
    if (
      newCustomer.name.trim() &&
      newCustomer.address.trim() &&
      newCustomer.phone.trim()
    ) {
      const updatedCustomers = [...customers, { ...newCustomer }];
      setCustomers(updatedCustomers);
      setNewCustomer({ name: "", address: "", phone: "" });
      await onUpdate({ customers: updatedCustomers });
    } else {
      console.error("Please fill in all fields.");
    }
  };

  const handleRemoveCustomer = async (index: number) => {
    const updatedCustomers = customers.filter((_, i) => i !== index);
    setCustomers(updatedCustomers);
    await onUpdate({ customers: updatedCustomers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({ customers });
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
          {customers.map((customer, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>
                {customer.name} - {customer.phone}
              </span>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemoveCustomer(index)}
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
