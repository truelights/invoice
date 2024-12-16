"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  BillItem,
  BusinessDetails,
  Expense,
  Customer,
  Product,
} from "@/types/bill";
import { useSettings } from "@/hooks/useSettings";
import { getNewBillNumbers, createBill } from "@/utils/api";

interface Settings {
  name: string;
  gst: string;
  address: string;
  number: string;
  logo?: string;
  expenseLabels: string[];
  customers: Customer[];
  products: Product[];
  commission: number;
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
  customerDetails: string;
  items: BillItem[];
  expenses: Expense[];
  totalAmount: number;
  totalOtherCharges: number;
  totalExpense: number;
  totalCommission: number;
  netAmount: number;
  paymentType: string;
}

export default function SalesBill() {
  const { settings } = useSettings() as { settings: Settings | null };

  const [business, setBusiness] = useState<BusinessDetails>({});
  const [receiptNo, setReceiptNo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [customerDetails, setCustomerDetails] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [items, setItems] = useState<BillItem[]>([
    {
      sr: 1,
      item: "",
      bags: 0,
      weight: 0,
      rate: 0,
      amount: 0,
      otherCharges: 0,
      applyCommission: false,
    },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [billDate, setBillDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [Commission, setCommission] = useState<number>(0);

  useEffect(() => {
    if (settings) {
      setBusiness(settings);
      setExpenses(
        settings.expenseLabels.map((label: string) => ({
          type: label,
          amount: 0,
        }))
      );
      setCommission(settings?.commission);
      fetchNewBillNumbers();
    }
  }, [settings]);

  const addItem = () => {
    setItems([
      ...items,
      {
        sr: items.length + 1,
        item: "",
        bags: 0,
        weight: 0,
        rate: 0,
        amount: 0,
        otherCharges: 0,
        applyCommission: false,
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof BillItem,
    value: number | string | boolean
  ) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      if (field === "bags" || field === "rate") {
        newItems[index].amount = newItems[index].bags * newItems[index].rate;
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
    const totalOtherCharges = items.reduce(
      (sum, item) => sum + (item.otherCharges || 0),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const commissionAmount = Commission || 0;

    const totalCommission = items.reduce((sum, item) => {
      const itemCommission = item.applyCommission ? commissionAmount : 0;
      return sum + itemCommission;
    }, 0);
    const netAmount =
      totalAmount + totalOtherCharges + totalExpenses + totalCommission;
    return {
      totalAmount,
      totalOtherCharges,
      totalExpenses,
      totalCommission,
      netAmount,
    };
  };

  const validateItems = (): boolean => {
    for (const item of items) {
      if (!item.item || item.item.trim() === "") {
        alert("Please select a product for all items.");
        return false;
      }
    }
    return true;
  };

  const generatePrintContent = async () => {
    const { totalAmount, totalExpenses, netAmount, totalOtherCharges } =
      calculateTotals();

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
            table, tr {
    border: none;
}
        </style>
      </head>
      <body>
        ${
          logoDataUrl
            ? `<img src="${logoDataUrl}" alt="Business Logo" style="width: 100px; height: auto; display: block; margin-bottom: 10px;">`
            : ""
        }
        <h1>Sales Bill</h1>
        <p><strong>Date:</strong> ${billDate}</p>
        <p><strong>Batch No:</strong> ${receiptNo}</p>
        <p><strong>Receipt No:</strong> ${invoiceNo}</p>
        <p><strong>Customer Details:</strong> ${customerDetails}</p>
        
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
                <td>₹${item.rate.toFixed(2)}</td>
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
              <td>Total Amount: ₹${totalAmount.toFixed(2)}</td>
              <td>Total Expenses: ₹${totalExpenses.toFixed(2)}</td>
            </tr>
            <tr class="totals">
              <td colspan="5"></td>
              <td>Other Charges: ₹${totalOtherCharges.toFixed(2)}</td>
            
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
    if (!validateItems()) return;
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

  const fetchNewBillNumbers = async () => {
    try {
      const response = await getNewBillNumbers();
      const data = response.data as BillNumbers;
      setReceiptNo(data.receiptNo);
      setInvoiceNo(data.invoiceNo);
    } catch (error) {
      console.error("Error fetching new bill numbers:", error);
    }
  };

  const handleSave = async () => {
    if (!validateItems()) return;
    const {
      totalAmount,
      totalOtherCharges,
      totalExpenses,
      totalCommission,
      netAmount,
    } = calculateTotals();
    const billData: BillData = {
      type: "sales",
      receiptNo,
      invoiceNo,
      date: billDate,
      customerDetails,
      items,
      expenses,
      totalAmount,
      totalOtherCharges,
      totalExpense: totalExpenses,
      totalCommission,
      netAmount,
      paymentType,
    };

    try {
      await createBill(billData);

      setReceiptNo("");
      setInvoiceNo("");
      setCustomerDetails("");
      setItems([
        {
          sr: 1,
          item: "",
          bags: 0,
          weight: 0,
          rate: 0,
          amount: 0,
          otherCharges: 0,
          applyCommission: false,
        },
      ]);
      setExpenses([]);
      setBillDate(new Date().toISOString().split("T")[0]);
      setPaymentType("");

      fetchNewBillNumbers();

      alert("Invoice saved successfully!");
    } catch (error) {
      console.error("Error saving bill:", error);
    }
  };

  const {
    totalAmount,
    totalOtherCharges,
    totalExpenses,
    totalCommission,
    netAmount,
  } = calculateTotals();

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 print:shadow-none">
      <label htmlFor="commission">Comission</label>
      <Input
        type="number"
        id="commission"
        value={Commission}
        onChange={(e) => setCommission(Number(e.target.value))}
      />
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0 print:pb-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-24 h-24 border rounded-lg flex items-center justify-center print:border-black">
            {business?.logo && (
              <Image src={business.logo} alt="Logo" height={100} width={100} />
            )}
          </div>
          <div className="space-y-2">
            <p className="font-bold">{business?.name}</p>
            <p>{business?.gst}</p>
            <p>{business?.address}</p>
            <p>{business?.number}</p>
          </div>
        </div>
        <div className="space-y-2 w-full sm:w-auto">
          <CardTitle className="text-2xl font-bold text-center">
            Sales Bill
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
          <h2 className="font-semibold">Customer Details</h2>
          <Select
            onValueChange={(value) => {
              const selectedCustomer = settings.customers.find(
                (c) => c.name === value
              );
              if (selectedCustomer) {
                setCustomerDetails(
                  `${selectedCustomer.name}, ${selectedCustomer.address}, ${selectedCustomer.phone}`
                );
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {settings.customers.map((customer, index) => (
                <SelectItem key={index} value={customer.name}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={customerDetails}
            onChange={(e) => setCustomerDetails(e.target.value)}
            placeholder="Customer Details"
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
                <TableHead>Weight</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Other Charges</TableHead>
                <TableHead>Commission</TableHead>
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
                        const selectedProduct = settings?.products.find(
                          (p) => p.name === value
                        );
                        if (selectedProduct) {
                          updateItem(index, "item", selectedProduct.name);
                          updateItem(index, "rate", selectedProduct.price);
                          // Recalculate the amount
                          const newAmount = item.bags * selectedProduct.price;
                          updateItem(index, "amount", newAmount);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings?.products.map((product, productIndex) => (
                          <SelectItem key={productIndex} value={product.name}>
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
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, "rate", Number(e.target.value))
                      }
                      className="w-24 print:border-none"
                    />
                  </TableCell>
                  <TableCell>₹{item.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.otherCharges}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "otherCharges",
                          Number(e.target.value)
                        )
                      }
                      className="w-24 print:border-none"
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={item.applyCommission}
                      onCheckedChange={(checked) =>
                        updateItem(index, "applyCommission", checked as boolean)
                      }
                    />
                  </TableCell>
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
          <div className="space-y-2 w-full sm:w-auto">
            <label htmlFor="paymentType" className="block">
              Payment Type:
            </label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select Payment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-48 h-24 border rounded p-2 text-center print:border-black">
              <p className="mb-8">Space for sign</p>
            </div>
          </div>
          <div className="space-y-2 text-right mt-4 sm:mt-0">
            <p>Total Amount: ₹{totalAmount.toFixed(2)}</p>
            <p>Other Charges: ₹{totalOtherCharges.toFixed(2)}</p>
            <p>Total Expenses: ₹{totalExpenses.toFixed(2)}</p>
            <p>Commission: ₹{totalCommission.toFixed(2)}</p>
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
