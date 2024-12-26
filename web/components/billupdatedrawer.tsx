import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
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
  totalAmount: number;
  invoiceNo: string;
  receiptNo: string;
  customerDetails?: string;
  vendorDetails?: string;
  duedate?: string;
}

interface Bill {
  billId: string;
  billType: string;
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
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Bill Details</h2>
            <p>Invoice No: {bill.dataSnapshot.invoiceNo}</p>
            <p>Receipt No: {bill.dataSnapshot.receiptNo}</p>
            <p>
              {bill.billType === "sales" ? "Customer" : "Vendor"}:{" "}
              {bill.billType === "sales"
                ? bill.dataSnapshot.customerDetails
                : bill.dataSnapshot.vendorDetails}
            </p>
            <p>Total Amount: ₹{bill.dataSnapshot.totalAmount.toFixed(2)}</p>
            <p>Net Amount: ₹{bill.dataSnapshot.netAmount.toFixed(2)}</p>
            <p>Received Amount: ₹{bill.dataSnapshot.recievedAmount.toFixed(2)}</p>
            <p>
              Remaining Amount: ₹
              {(bill.dataSnapshot.netAmount - bill.dataSnapshot.recievedAmount).toFixed(2)}
            </p>
            <p>Current Payment Type: {bill.dataSnapshot.paymentType || "N/A"}</p>
            {bill.dataSnapshot.duedate && (
              <p>Due Date: {new Date(bill.dataSnapshot.duedate).toLocaleDateString()}</p>
            )}
          </div>
          <div>
            <Label htmlFor="currentAmount">Current Received Amount</Label>
            <Input
              id="currentAmount"
              value={newReceivedAmount.toFixed(2)}
              onChange={(e) => setNewReceivedAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="additionalAmount">Additional Amount</Label>
            <Input
              id="additionalAmount"
              type="number"
              value={additionalAmount}
              onChange={(e) => setAdditionalAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="newTotal">New Total</Label>
            <Input
              id="newTotal"
              value={(newReceivedAmount + additionalAmount).toFixed(2)}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select value={newPaymentType} onValueChange={setNewPaymentType}>
              <SelectTrigger id="paymentType">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={handleUpdate}>Update Bill</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
