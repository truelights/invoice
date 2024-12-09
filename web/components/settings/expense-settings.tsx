import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the Settings type
type Settings = {
  expenseLabels: string[];
};

// Define the props for the component
type ExpenseSettingsProps = {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<void>;
};

export function ExpenseSettings({ settings, onUpdate }: ExpenseSettingsProps) {
  const [expenseLabels, setExpenseLabels] = useState<string[]>(
    settings.expenseLabels
  );
  const [newLabel, setNewLabel] = useState<string>("");

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      setExpenseLabels((prev) => [...prev, newLabel.trim()]);
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (index: number) => {
    setExpenseLabels((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({ expenseLabels });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="newLabel">Add Expense Label</Label>
        <div className="flex space-x-2">
          <Input
            id="newLabel"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Enter new expense label"
          />
          <Button type="button" onClick={handleAddLabel}>
            Add
          </Button>
        </div>
      </div>
      <div>
        <Label>Expense Labels</Label>
        <ul className="space-y-2">
          {expenseLabels.map((label, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{label}</span>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemoveLabel(index)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <Button type="submit">Update Expense Labels</Button>
    </form>
  );
}
