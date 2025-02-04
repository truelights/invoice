import { useState, useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

interface BillUpdateDrawerProps {
  isOpen: boolean
  onClose: () => void
  bill: Bill
  onUpdate: (billId: string, updates: BillUpdates) => void
}

interface BillDataSnapshot {
  paymentType: string
  recievedAmount: number
  netAmount: number
  totalAmount: number
  invoiceNo: string
  receiptNo: string
  customerDetails?: string
  vendorDetails?: string
  duedate?: string
}

interface Bill {
  billId: string
  billType: string
  dataSnapshot: BillDataSnapshot
}

interface BillUpdates {
  paymentType: string
  recievedAmount: number
}

export const BillUpdateDrawer: React.FC<BillUpdateDrawerProps> = ({ isOpen, onClose, bill, onUpdate }) => {
  const [additionalAmount, setAdditionalAmount] = useState<number>(0)
  const [newPaymentType, setNewPaymentType] = useState<string>(bill.dataSnapshot.paymentType || "")
  const [newReceivedAmount, setNewReceivedAmount] = useState<number>(bill.dataSnapshot.recievedAmount || 0)

  useEffect(() => {
    setNewReceivedAmount(bill.dataSnapshot.recievedAmount || 0)
    setNewPaymentType(bill.dataSnapshot.paymentType || "")
    setAdditionalAmount(0)
  }, [bill])

  const handleUpdate = () => {
    const updatedReceivedAmount = newReceivedAmount + additionalAmount
    if (updatedReceivedAmount > bill.dataSnapshot.netAmount) {
      alert("Received amount cannot exceed the total bill amount.")
      return
    }

    const updates: BillUpdates = {
      paymentType: newPaymentType,
      recievedAmount: updatedReceivedAmount,
    }

    onUpdate(bill.billId, updates)
  }

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Update Bill</DrawerTitle>
          <DrawerClose onClick={onClose} />
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Bill Details</h2>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Invoice No</TableCell>
                <TableCell>{bill.dataSnapshot.invoiceNo}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Receipt No</TableCell>
                <TableCell>{bill.dataSnapshot.receiptNo}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{bill.billType === "sales" ? "Customer" : "Vendor"}</TableCell>
                <TableCell>
                  {bill.billType === "sales" ? bill.dataSnapshot.customerDetails : bill.dataSnapshot.vendorDetails}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Amount</TableCell>
                <TableCell>₹{bill.dataSnapshot.totalAmount.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Net Amount</TableCell>
                <TableCell>₹{bill.dataSnapshot.netAmount.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Received Amount</TableCell>
                <TableCell>₹{bill.dataSnapshot.recievedAmount.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Remaining Amount</TableCell>
                <TableCell>₹{(bill.dataSnapshot.netAmount - bill.dataSnapshot.recievedAmount).toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Current Payment Type</TableCell>
                <TableCell>{bill.dataSnapshot.paymentType || "N/A"}</TableCell>
              </TableRow>
              {bill.dataSnapshot.duedate && (
                <TableRow>
                  <TableCell className="font-medium">Due Date</TableCell>
                  <TableCell>{new Date(bill.dataSnapshot.duedate).toLocaleDateString()}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
            <Input id="newTotal" value={(newReceivedAmount + additionalAmount).toFixed(2)} disabled />
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
  )
}
