"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useSettings } from "@/hooks/useSettings";
import { getNewBillNumbers, createBill } from "@/utils/api";

interface BillItem {
  sr: number;
  item: string;
  bags: number;
  weight: number;
  ratePerBag: number;
  amount: number;
}

interface Expense {
  type: string;
  amount: number;
}

interface Vendor {
  name: string;
  address: string;
  phone: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface Settings {
  name: string;
  gst: string;
  address: string;
  phone: string;
  logo?: string;
  expenseLabels: string[];
  vendors: Vendor[];
  products: Product[];
}

interface SettingsHook {
  settings: Settings | null;
  loading: boolean;
  error: Error | null;
}

interface BillNumbers {
  receiptNo: string;
  invoiceNo: string;
}

interface BillData {
  type: string;
  receiptNo: string;
  invoiceNo: string;
  date: string;
  vendorDetails: string;
  items: BillItem[];
  expenses: Expense[];
  totalAmount: number;
  totalExpense: number;
  netAmount: number;
}

export default function PurchaseBill() {
  const { settings, loading, error } = useSettings() as SettingsHook;
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [invoiceNo, setInvoiceNo] = useState<string>("");
  const [vendorDetails, setVendorDetails] = useState<string>("");
  const [items, setItems] = useState<BillItem[]>([
    { sr: 1, item: "", bags: 0, weight: 0, ratePerBag: 0, amount: 0 },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [billDate, setBillDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    console.log("Settings in PurchaseBill:", settings);
    if (settings) {
      console.log("Setting business details:", settings);
      setExpenses(
        settings.expenseLabels?.map((label) => ({ type: label, amount: 0 })) ||
          []
      );
      fetchNewBillNumbers();
    }
  }, [settings]);

  const fetchNewBillNumbers = async () => {
    try {
      const response = await getNewBillNumbers();
      const { receiptNo, invoiceNo } = response.data as BillNumbers;
      setReceiptNo(receiptNo);
      setInvoiceNo(invoiceNo);
    } catch (error) {
      console.error("Error fetching new bill numbers:", error);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        sr: items.length + 1,
        item: "",
        bags: 0,
        weight: 0,
        ratePerBag: 0,
        amount: 0,
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof BillItem,
    value: number | string
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    if (field === "bags" || field === "ratePerBag") {
      newItems[index].amount =
        newItems[index].bags * newItems[index].ratePerBag;
    }

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateExpense = (index: number, amount: number) => {
    const newExpenses = [...expenses];
    newExpenses[index].amount = amount;
    setExpenses(newExpenses);
  };

  const calculateTotals = () => {
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const netAmount = totalAmount - totalExpense;
    return { totalAmount, totalExpense, netAmount };
  };

  const handlePrint = () => window.print();

  const handleSave = async () => {
    const { totalAmount, totalExpense, netAmount } = calculateTotals();
    const billData: BillData = {
      type: "purchase",
      receiptNo,
      invoiceNo,
      date: billDate,
      vendorDetails,
      items,
      expenses,
      totalAmount,
      totalExpense,
      netAmount,
    };

    try {
      const response = await createBill(billData);
      console.log("Bill saved:", response.data);
      fetchNewBillNumbers();
    } catch (error) {
      console.error("Error saving bill:", error);
    }
  };

  const { totalAmount, totalExpense, netAmount } = calculateTotals();

  if (loading) {
    return <p>Loading settings...</p>;
  }

  if (error) {
    return <p>Error loading settings: {error.message}</p>;
  }

  if (!settings) {
    return <p>No settings available</p>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 print:shadow-none">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0 print:pb-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-24 h-24 border rounded-lg flex items-center justify-center print:border-black">
            {settings.logo && (
              <Image src={settings.logo} alt="Logo" height={100} width={100} />
            )}
          </div>
          <div className="space-y-2">
            <p className="font-bold">{settings.name}</p>
            <p>{settings.gst}</p>
            <p>{settings.address}</p>
            <p>{settings.phone}</p>
          </div>
        </div>
        <div className="space-y-2 w-full sm:w-auto">
          <CardTitle className="text-2xl font-bold text-center">
            Purchase Bill
          </CardTitle>
          <Input
            type="date"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
            className="text-right print:border-none"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            value={receiptNo}
            readOnly
            placeholder="Receipt No"
            className="print:border-none"
          />
          <Input
            value={invoiceNo}
            readOnly
            placeholder="Invoice No"
            className="print:border-none"
          />
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Vendor Details</h2>
          <Select
            onValueChange={(value) => {
              const selectedVendor = settings.vendors.find(
                (v) => v.name === value
              );
              if (selectedVendor) {
                setVendorDetails(
                  `${selectedVendor.name}, ${selectedVendor.address}, ${selectedVendor.phone}`
                );
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a vendor" />
            </SelectTrigger>
            <SelectContent>
              {settings.vendors.map((vendor, index) => (
                <SelectItem key={index} value={vendor.name}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={vendorDetails}
            onChange={(e) => setVendorDetails(e.target.value)}
            placeholder="Vendor Details"
            className="print:border-none"
          />
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Sr</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Bags</TableHead>
                <TableHead>Weight (Remark)</TableHead>
                <TableHead>Rate/Bag</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="print:hidden"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.sr}</TableCell>
                  <TableCell>
                    <Select
                      value={item.item}
                      onValueChange={(value) => {
                        const selectedProduct = settings.products.find(
                          (p) => p.name === value
                        );
                        if (selectedProduct) {
                          updateItem(index, "item", selectedProduct.name);
                          updateItem(
                            index,
                            "ratePerBag",
                            selectedProduct.price
                          );
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.products.map((product) => (
                          <SelectItem key={product._id} value={product.name}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.bags}
                      onChange={(e) =>
                        updateItem(index, "bags", Number(e.target.value))
                      }
                      className="w-20 print:border-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.weight}
                      onChange={(e) =>
                        updateItem(index, "weight", Number(e.target.value))
                      }
                      className="w-24 print:border-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.ratePerBag}
                      onChange={(e) =>
                        updateItem(index, "ratePerBag", Number(e.target.value))
                      }
                      className="w-24 print:border-none"
                    />
                  </TableCell>
                  <TableCell>₹{item.amount.toFixed(2)}</TableCell>
                  <TableCell className="print:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button onClick={addItem} className="print:hidden">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Invoice Expenses</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense Type</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense, index) => (
                <TableRow key={index}>
                  <TableCell>{expense.type}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={expense.amount}
                      onChange={(e) =>
                        updateExpense(index, Number(e.target.value))
                      }
                      className="w-24 print:border-none"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t">
          <div className="w-48 h-24 border rounded p-2 text-center print:border-black mb-4 sm:mb-0">
            <p className="mb-8">Space for sign</p>
          </div>
          <div className="space-y-2 text-right">
            <p>Total Amount: ₹{totalAmount.toFixed(2)}</p>
            <p>Total Expense: ₹{totalExpense.toFixed(2)}</p>
            <p className="text-lg font-bold">
              Net Amount: ₹{netAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex justify-between print:hidden">
          <Button onClick={handleSave}>Save Bill</Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Bill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
