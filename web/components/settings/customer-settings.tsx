import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().nonempty("Name is required."),
  address: z.string().nonempty("Address is required."),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits.")
    .regex(/^\d+$/, "Phone number must contain only digits."),
});

type Customer = z.infer<typeof customerSchema>;

type Settings = {
  customers: Customer[];
};

type CustomerSettingsProps = {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<Settings>;
};

export function CustomerSettings({ settings, onUpdate }: CustomerSettingsProps) {
  const [customers, setCustomers] = useState<Customer[]>(settings.customers);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    name: "",
    address: "",
    phone: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle adding or updating a customer
  const handleSaveCustomer = async () => {
    try {
      customerSchema.parse(newCustomer); // Validate input

      let updatedCustomers;
      if (editingIndex !== null) {
        // Update existing customer
        updatedCustomers = customers.map((customer, index) =>
          index === editingIndex ? { ...newCustomer } : customer
        );
      } else {
        // Add new customer
        updatedCustomers = [...customers, { ...newCustomer }];
      }

      setCustomers(updatedCustomers);
      setNewCustomer({ name: "", address: "", phone: "" });
      setEditingIndex(null);
      setError(null);

      await onUpdate({ customers: updatedCustomers });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
      }
    }
  };

  // Handle editing a customer
  const handleEditCustomer = (index: number) => {
    setEditingIndex(index);
    setNewCustomer(customers[index]);
  };

  // Handle removing a customer
  const handleRemoveCustomer = async (index: number) => {
    const updatedCustomers = customers.filter((_, i) => i !== index);
    setCustomers(updatedCustomers);
    setEditingIndex(null);
    await onUpdate({ customers: updatedCustomers });
  };

  return (
    <form className="space-y-4">
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
          type="number"
          placeholder="Enter customer phone (min 10 digits)"
        />
      </div>

      <Button type="button" onClick={handleSaveCustomer}>
        {editingIndex !== null ? "Update Customer" : "Add Customer"}
      </Button>
      {editingIndex !== null && (
        <Button type="button" variant="outline" onClick={() => setEditingIndex(null)}>
          Cancel Edit
        </Button>
      )}

      {error && <span style={{ color: "red" }}>{error}</span>}

      <div>
        <Label>Customers</Label>
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Phone</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{customer.name}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.address}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.phone}</td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <Button type="button" variant="outline" onClick={() => handleEditCustomer(index)}>
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => handleRemoveCustomer(index)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
