import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
interface Item {
  item: string;
  bags: number;
  weight: number;
  amount: number;
}
interface Expense {
  type: string;
  amount: number;
}
interface Bill {
  type: "purchase" | "sales";
  invoiceNo: string;
  date: string;
  customerDetails: string;
  vendorDetails?: string;
  paymentType: string;
  items: Item[];
  expenses: Expense[];
  totalAmount: number;
  totalExpense: number;
  netAmount: number;
  recievedAmount: number;
}
interface ReportDetailsProps {
  bill: Bill;
}
export const ReportDetails: React.FC<ReportDetailsProps> = ({ bill }) => {
  return (
    <div className="space-y-6 overflow-auto h-100 p-10">
      <h2 className="text-2xl font-bold">
        {bill.type === "purchase" ? "Purchase" : "Sales"} Report Details
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Invoice No:</p>
          <p>{bill.invoiceNo}</p>
        </div>
        <div>
          <p className="font-semibold">Date:</p>
          <p>{dayjs(bill.date).format("DD/MM/YYYY")}</p>
        </div>
        <div>
          <p className="font-semibold">
            {bill.type === "purchase" ? "Vendor" : "Customer"}:
          </p>
          <p>{bill.vendorDetails || bill.customerDetails.split(",").map(item => item.trim())[0]}</p>
        </div>
        <div>
          <p className="font-semibold">Payment Type:</p>
          <p>{bill.paymentType || "Not Received"}</p>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Items</h3>
        <Table className="w-full border-collapse bg-gray-50">
          <TableHeader className="border-separate  border border-gray-400  ">
            <TableRow className="border border-gray-300">
              <TableHead>Item</TableHead>
              <TableHead>Bags</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border border-gray-300">
            {bill.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.item || "Unnamed Item"}</TableCell>
                <TableCell>{item.bags}</TableCell>
                <TableCell>{item.weight}</TableCell>
                <TableCell>₹{item.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Expenses</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.expenses.map((expense, index) => (
              <TableRow key={index}>
                <TableCell>{expense.type}</TableCell>
                <TableCell>₹{expense.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Total Amount:</p>
          <p>₹{bill.totalAmount.toFixed(2)}</p>
        </div>
        <div>
          <p className="font-semibold">Total Expense:</p>
          <p>₹{bill.totalExpense.toFixed(2)}</p>
        </div>
        <div>
          <p className="font-semibold">Net Amount:</p>
          <p>₹{bill.netAmount.toFixed(2)}</p>
        </div>
        <div>
          <p className="font-semibold">Received Amount:</p>
          <p>₹{bill.recievedAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
