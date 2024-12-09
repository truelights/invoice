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

  useEffect(() => {
    if (settings) {
      setBusiness(settings);
      setExpenses(
        settings.expenseLabels.map((label: string) => ({
          type: label,
          amount: 0,
        }))
      );
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
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    newItems[index].amount = newItems[index].bags * newItems[index].rate;
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
    const totalOtherCharges = items.reduce(
      (sum, item) => sum + (item.otherCharges || 0),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const commissionAmount = business?.commission || 0;

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

  const handlePrint = () => {
    window.print();
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
      const response = await createBill(billData);
      console.log("Bill saved:", response.data);

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
                      onValueChange={(value) => {
                        const selectedProduct = settings.products.find(
                          (p) => p.name === value
                        );
                        if (selectedProduct) {
                          updateItem(index, "item", selectedProduct.name);
                          updateItem(index, "rate", selectedProduct.price);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.products.map((product, productIndex) => (
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
