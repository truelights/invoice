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
import { Card, CardContent } from "@/components/ui/card";
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
import "./print.css";
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
    if (settings) {
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
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      if (field === "bags" || field === "ratePerBag") {
        newItems[index].amount =
          newItems[index].bags * newItems[index].ratePerBag;
      }

      return newItems;
    });
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

  const generatePrintContent = async () => {
    const { totalAmount, totalExpense, netAmount } = calculateTotals();

    let logoDataUrl = "";
    if (settings?.logo) {
      try {
        const response = await fetch(settings.logo);
        const blob = await response.blob();
        logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error loading logo:", error);
      }
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Bill</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .totals {
            font-weight: bold;
          }
          .signature {
            margin-top: 50px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        ${
          logoDataUrl
            ? `<img src="${logoDataUrl}" alt="Business Logo" style="width: 100px; height: auto; display: block; margin-bottom: 10px;">`
            : ""
        }
        <h1>Purchase Bill</h1>
        <p><strong>Date:</strong> ${billDate}</p>
        <p><strong>Batch No:</strong> ${receiptNo}</p>
        <p><strong>Receipt No:</strong> ${invoiceNo}</p>
        <p><strong>Vendor:</strong> ${vendorDetails}</p>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Item</th>
              <th>Bags</th>
              <th>Weight</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Expense</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, index) => `
              <tr>
                <td>${item.sr}</td>
                <td>${item.item}</td>
                <td>${item.bags}</td>
                <td>${item.weight}</td>
                <td>₹${item.ratePerBag.toFixed(2)}</td>
                <td>₹${item.amount.toFixed(2)}</td>
                <td>${
                  index < expenses.length
                    ? `${expenses[index].type}: ₹${expenses[
                        index
                      ].amount.toFixed(2)}`
                    : ""
                }</td>
              </tr>
            `
              )
              .join("")}
            <tr class="totals">
              <td colspan="5"></td>
              <td>Total: ₹${totalAmount.toFixed(2)}</td>
              <td>Total: ₹${totalExpense.toFixed(2)}</td>
            </tr>
            <tr class="totals">
              <td colspan="5"></td>
              <td colspan="2">Net Amount: ₹${netAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="signature">
          <p>Authorized Signature: _______________________</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const content = await generatePrintContent();
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      alert("Please allow popups for this website to print the bill.");
    }
  };

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
      await createBill(billData);
      fetchNewBillNumbers();
      alert("Invoice saved successfully!, Refresh before creating new Invoice");
    } catch (error) {
      console.error("Error saving bill:", error);
    }
  };

  const { totalAmount, totalExpense, netAmount } = calculateTotals();

  if (loading) {
    return <p>Loading settings...</p>;
  }

  if (error) {
    if (error instanceof Error) {
      return <p>{error.message}</p>;
    }

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return (
        <p>
          {axiosError.response?.data?.message || "An unknown error occurred"}
        </p>
      );
    }

    return <p>An unknown error occurred</p>;
  }
  if (!settings) {
    return <p>No settings available</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between mb-4 print:hidden">

      </div>
      <div className="print-area">
        <Card className="p-6 print:shadow-none print:border-none">
          <CardContent className="space-y-4 print:space-y-2">
            {/* Header Section */}
            <div className="border-b pb-4 print:pb-2">
              <div className="text-center mb-2">
                <h1 className="text-xl font-bold print:text-lg">
                  Purchase Bill
                </h1>
                <div className="text-sm print:text-xs">
                  <Input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-40 mx-auto text-center print:border-none print:p-0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-[auto,1fr] gap-4 items-start">
                <div className="w-24 h-24 print:w-16 print:h-16 border rounded-lg flex items-center justify-center print:border-black">
                  {settings?.logo && (
                    <Image
                      src={settings.logo}
                      alt="Logo"
                      height={64}
                      width={64}
                      className="print:h-12 print:w-12"
                    />
                  )}
                </div>
                <div className="space-y-1 print:space-y-0">
                  <p className="font-bold text-lg print:text-base">
                    {settings?.name}
                  </p>
                  <p className="text-sm print:text-xs">{settings?.gst}</p>
                  <p className="text-sm print:text-xs">{settings?.address}</p>
                  <p className="text-sm print:text-xs">{settings?.phone}</p>
                  <div className="grid grid-cols-2 gap-x-8 text-sm print:text-xs mt-2">
                    <span>Batch No: {receiptNo}</span>
                    <span>Receipt No: {invoiceNo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details Section */}
            <div className="space-y-2 print:space-y-1">
              <div className="print:hidden">
                <Select
                  onValueChange={(value) => {
                    const selectedVendor = settings?.vendors.find(
                      (v) => v.name === value
                    );
                    if (selectedVendor) {
                      setVendorDetails(
                        `${selectedVendor.name}, ${selectedVendor.address}, ${selectedVendor.phone}`
                      );
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings?.vendors.map((vendor, index) => (
                      <SelectItem key={index} value={vendor.name}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="border rounded-lg p-2 print:border-black print:text-sm">
                <p className="font-semibold">Vendor:</p>
                <p>{vendorDetails}</p>
              </div>
            </div>

            {/* Main Content Section */}
            <div className="grid grid-cols-[2fr,1fr] gap-4 print:gap-2">
              {/* Items Table */}
              <div className="overflow-x-auto">
                <Table className="print:text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Sr</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Bags</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="print:hidden"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.sr}</TableCell>
                        <TableCell>
                          <div className="print:hidden">
                            <Select
                              value={item.item}
                              onValueChange={(value) => {
                                const selectedProduct = settings?.products.find(
                                  (p) => p.name === value
                                );
                                if (selectedProduct) {
                                  updateItem(
                                    index,
                                    "item",
                                    selectedProduct.name
                                  );
                                  updateItem(
                                    index,
                                    "ratePerBag",
                                    selectedProduct.price
                                  );
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                {settings?.products.map((product) => (
                                  <SelectItem
                                    key={product._id}
                                    value={product.name}
                                  >
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <span className="hidden print:inline">
                            {item.item}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.bags}
                            onChange={(e) =>
                              updateItem(index, "bags", Number(e.target.value))
                            }
                            className="w-20 print:border-none print:p-0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.weight}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "weight",
                                Number(e.target.value)
                              )
                            }
                            className="w-24 print:border-none print:p-0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.ratePerBag}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "ratePerBag",
                                Number(e.target.value)
                              )
                            }
                            className="w-24 print:border-none print:p-0"
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
                <Button onClick={addItem} className="mt-2 print:hidden">
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>

              {/* Expenses Section */}
              <div className="space-y-4 print:space-y-2">
                <div>
                  <h3 className="font-semibold mb-2 print:mb-1 print:text-sm">
                    Expenses
                  </h3>
                  <Table className="print:text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
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
                              className="w-24 print:border-none print:p-0"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals Section */}
                <div className="space-y-2 print:space-y-1">
                  <div className="grid grid-cols-2 text-sm print:text-xs">
                    <span>Total Amount:</span>
                    <span className="text-right">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                    <span>Total Expense:</span>
                    <span className="text-right">
                      ₹{totalExpense.toFixed(2)}
                    </span>
                    <span className="font-bold">Net Amount:</span>
                    <span className="font-bold text-right">
                      ₹{netAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Signature Space */}
                <div className="border rounded-lg p-2 mt-4 print:mt-2 print:border-black">
                  <p className="text-center text-sm print:text-xs">
                    Space for sign
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleSave}>Save Bill</Button>
          </CardContent>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print Bill
        </Button>
        </Card>
      </div>
    </div>
  );
}
