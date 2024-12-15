import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<void>;
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
      setCustomers((prev) => [
        ...prev,
        { ...newCustomer, _id: Date.now().toString() },
      ]);
      setNewCustomer({ _id: "", name: "", address: "", phone: "" });
    }
  };

  const handleRemoveCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((customer) => customer._id !== id));
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
          {customers.map((customer) => (
            <li
              key={customer._id}
              className="flex justify-between items-center"
            >
              <span>
                {customer.name} - {customer.phone}
              </span>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemoveCustomer(customer._id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <Button type="submit">Update Customers</Button>
    </form>
  );
}
