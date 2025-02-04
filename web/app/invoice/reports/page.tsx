"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBills } from "@/utils/api";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { DateRange } from "react-day-picker";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { ReportDetails } from "@/components/report-details";
import { Button } from "@/components/ui/button";

dayjs.extend(isBetween);

interface Bill {
  _id: string;
  type: "purchase" | "sales";
  receiptNo: string;
  invoiceNo: string;
  date: string;
  vendorDetails?: string;
  customerDetails?: string;
  items: {
    item: string;
    bags: number;
    weight: number;
    amount: number;
    rate?: number;
    otherCharges?: number;
    applyCommission?: boolean;
  }[];
  expenses: {
    type: string;
    amount: number;
  }[];
  recievedAmount: number;
  totalAmount: number;
  totalExpense: number;
  netAmount: number;
  paymentType: string;
}

interface Totals {
  totalAmount: number;
  totalExpense: number;
  netAmount: number;
  recievedAmount: number;
}

interface ReportTableProps {
  bills: Bill[];
  totals: Totals;
  type: "purchase" | "sales";
  onRowClick: (bill: Bill) => void;
}

const ReportsPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState<"purchase" | "sales">("purchase");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  console.log(bills);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await getBills();
        setBills(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch bills:", error);
      }
    };
    fetchBills();
  }, []);

  const filteredBills = useMemo(() => {
    if (!Array.isArray(bills)) return [];

    const today = dayjs().startOf("day");
    const filtered = bills.filter((bill) => bill.type === activeTab);

    switch (dateFilter) {
      case "today":
        return filtered.filter((bill) => dayjs(bill.date).isSame(today, "day"));
      case "yesterday":
        const yesterday = today.subtract(1, "day");
        return filtered.filter((bill) =>
          dayjs(bill.date).isSame(yesterday, "day")
        );
      case "weekly":
        const weekStart = today.startOf("week");
        const weekEnd = today.endOf("week");
        return filtered.filter((bill) =>
          dayjs(bill.date).isBetween(weekStart, weekEnd, null, "[]")
        );
      case "monthly":
        const monthStart = today.startOf("month");
        const monthEnd = today.endOf("month");
        return filtered.filter((bill) =>
          dayjs(bill.date).isBetween(monthStart, monthEnd, null, "[]")
        );
      case "range":
        if (dateRange?.from && dateRange?.to) {
          return filtered.filter((bill) =>
            dayjs(bill.date).isBetween(
              dayjs(dateRange.from),
              dayjs(dateRange.to),
              null,
              "[]"
            )
          );
        }
        return filtered;
      default:
        return filtered;
    }
  }, [bills, activeTab, dateFilter, dateRange]);

  const totals = useMemo(() => {
    return filteredBills.reduce<Totals>(
      (acc, bill) => {
        acc.totalAmount += bill.totalAmount;
        acc.totalExpense += bill.totalExpense;
        acc.netAmount += bill.netAmount;
        acc.recievedAmount += bill.recievedAmount;
        return acc;
      },
      { totalAmount: 0, totalExpense: 0, netAmount: 0, recievedAmount: 0 }
    );
  }, [filteredBills]);

  const handleRowClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsDrawerOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <Tabs
        defaultValue="purchase"
        onValueChange={(value) => setActiveTab(value as "purchase" | "sales")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        <div className="flex justify-between items-center my-4">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="range">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {dateFilter === "range" && (
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          )}
        </div>
        <TabsContent value="purchase">
          <ReportTable
            bills={filteredBills}
            totals={totals}
            type="purchase"
            onRowClick={handleRowClick}
          />
        </TabsContent>
        <TabsContent value="sales">
          <ReportTable
            bills={filteredBills}
            totals={totals}
            type="sales"
            onRowClick={handleRowClick}
          />
        </TabsContent>
      </Tabs>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Report Details</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="p-4 pb-0">
            {selectedBill && <ReportDetails bill={selectedBill} />}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const ReportTable: React.FC<ReportTableProps> = ({
  bills,
  totals,
  type,
  onRowClick,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{type === "purchase" ? "Purchase" : "Sales"} Report</CardTitle>
    </CardHeader>
    <CardContent className="overflow-auto ">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Invoice No</TableHead>
            <TableHead>{type === "purchase" ? "Vendor" : "Customer"}</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Total Expense</TableHead>
            <TableHead>Net Amount</TableHead>
            <TableHead>Received Amount</TableHead>
            <TableHead>Payment Type</TableHead>
            <TableHead>Batch Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => (
            <TableRow
              key={bill._id}
              onClick={() => onRowClick(bill)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <TableCell>{dayjs(bill.date).format("DD/MM/YYYY")}</TableCell>
              <TableCell>{bill.invoiceNo}</TableCell>
              <TableCell>
                {type === "purchase"
                  ? bill.vendorDetails
                  : bill.customerDetails?.split(",").map(item => item.trim())[0] || "N/A"}
              </TableCell>
              <TableCell>₹{bill.totalAmount.toFixed(2)}</TableCell>
              <TableCell>₹{bill.totalExpense.toFixed(2)}</TableCell>
              <TableCell>₹{bill.netAmount.toFixed(2)}</TableCell>
              <TableCell>₹{bill.recievedAmount.toFixed(2)}</TableCell>
              <TableCell>{bill.paymentType || "Not Recieved"}</TableCell>
              <TableCell>{bill.receiptNo}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold">
            <TableCell colSpan={3}>Totals</TableCell>
            <TableCell>₹{totals.totalAmount.toFixed(2)}</TableCell>
            <TableCell>₹{totals.totalExpense.toFixed(2)}</TableCell>
            <TableCell>₹{totals.netAmount.toFixed(2)}</TableCell>
            <TableCell>₹{totals.recievedAmount.toFixed(2)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default ReportsPage;
