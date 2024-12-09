import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BillUpdateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
  onUpdate: (billId: string, updates: BillUpdates) => void;
}

interface BillDataSnapshot {
  paymentType: string;
  recievedAmount: number;
  netAmount: number;
}

interface Bill {
  billId: string;
  dataSnapshot: BillDataSnapshot;
}

interface BillUpdates {
  paymentType: string;
  recievedAmount: number;
}
export const BillUpdateDrawer: React.FC<BillUpdateDrawerProps> = ({
  isOpen,
  onClose,
  bill,
  onUpdate,
}) => {
  const [additionalAmount, setAdditionalAmount] = useState<number>(0);
  const [newPaymentType, setNewPaymentType] = useState<string>(
    bill.dataSnapshot.paymentType || ""
  );
  const [newReceivedAmount, setNewReceivedAmount] = useState<number>(
    bill.dataSnapshot.recievedAmount || 0
  );

  useEffect(() => {
    setNewReceivedAmount(bill.dataSnapshot.recievedAmount || 0);
    setNewPaymentType(bill.dataSnapshot.paymentType || "");
    setAdditionalAmount(0);
  }, [bill]);

  const handleUpdate = () => {
    const updatedReceivedAmount = newReceivedAmount + additionalAmount;
    if (updatedReceivedAmount > bill.dataSnapshot.netAmount) {
      alert("Received amount cannot exceed the total bill amount.");
      return;
    }

    const updates: BillUpdates = {
      paymentType: newPaymentType,
      recievedAmount: updatedReceivedAmount,
    };

    onUpdate(bill.billId, updates);
  };

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Update Bill</DrawerTitle>
          <DrawerClose onClick={onClose} />
        </DrawerHeader>
        <div className="p-4">
          <h1>
            Remaining Amount ={" "}
            {bill.dataSnapshot.netAmount - bill.dataSnapshot.recievedAmount}
          </h1>
          <div className="mb-4">
            <Label htmlFor="currentAmount">Current Received Amount</Label>
            <Input
              id="currentAmount"
              value={newReceivedAmount.toFixed(2)}
              onChange={(e) => setNewReceivedAmount(Number(e.target.value))}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="additionalAmount">Additional Amount</Label>
            <Input
              id="additionalAmount"
              type="number"
              value={additionalAmount}
              onChange={(e) => setAdditionalAmount(Number(e.target.value))}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="newTotal">New Total</Label>
            <Input
              id="newTotal"
              value={(newReceivedAmount + additionalAmount).toFixed(2)}
              disabled
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select value={newPaymentType} onValueChange={setNewPaymentType}>
              <SelectTrigger id="paymentType">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleUpdate}>Update Bill</Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
