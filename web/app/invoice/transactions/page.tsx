"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { transactions, getBill, updateBill } from "@/utils/api";
import { BillUpdateDrawer } from "@/components/billupdatedrawer";

interface Transaction {
  _id: string;
  billType: string;
  operation: string;
  createdAt: string;
  billId: string;
  dataSnapshot: {
    invoiceNo: string;
    netAmount: number;
    paymentType: string;
    duedate?: string;
    recievedAmount: number;
    totalAmount: number;
    customerDetails?: string;
    vendorDetails?: string;
    receiptNo: string;
  };
}

interface BillUpdates {
  recievedAmount?: number;
  paymentType?: string;
}

const TransactionsPage = () => {
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedBill, setSelectedBill] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await transactions();
        if (response && response.data && Array.isArray(response.data)) {
          setTransactionData(response.data);
        } else {
          console.error("Unexpected API response structure:", response);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactionData.filter((transaction) => {
    if (activeTab === "all") return true;
    if (activeTab === "credit")
      return transaction.dataSnapshot.paymentType === "credit";
    return transaction.billType === activeTab;
  });

  const sortedTransactions =
    activeTab === "credit"
      ? [...filteredTransactions].sort((a, b) => {
          const dateA = new Date(a.dataSnapshot.duedate || a.createdAt);
          const dateB = new Date(b.dataSnapshot.duedate || b.createdAt);
          return dateA.getTime() - dateB.getTime();
        })
      : filteredTransactions;

  const handleTransactionClick = async (transaction: Transaction) => {
    try {
      const response = await getBill(transaction.billId);
      const billDetails = response.data;

      setSelectedBill({
        ...transaction,
        dataSnapshot: {
          ...transaction.dataSnapshot,
          ...billDetails?.dataSnapshot,
          paymentType:
            billDetails?.dataSnapshot?.paymentType ||
            transaction.dataSnapshot.paymentType ||
            "",
        },
      });
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Failed to fetch bill details:", error);
    }
  };

  const handleUpdateBill = async (billId: string, updates: BillUpdates) => {
    try {
      const response = await updateBill(billId, updates);

      if (response.data) {
        setTransactionData((prevData) =>
          prevData.map((transaction) =>
            transaction.billId === billId
              ? {
                  ...transaction,
                  dataSnapshot: {
                    ...transaction.dataSnapshot,
                    ...response.data,
                    recievedAmount: response.data.recievedAmount,
                    paymentType: response.data.paymentType,
                  },
                }
              : transaction
          )
        );
        setIsDrawerOpen(false);
      } else {
        console.error("Unexpected response from updateBill:", response);
      }
    } catch (error) {
      console.error("Failed to update bill:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
      </div>

      <Card>
        <CardHeader>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="credit">Credit/Udhar</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTransactions.map((transaction) => (
              <Card
                key={transaction._id}
                className={`cursor-pointer hover:bg-gray-100 ${
                  transaction.billType === "purchase" ? "border-l-4 border-l-blue-500" :
                  transaction.billType === "sales" ? "border-l-4 border-l-green-500" :
                  ""
                }`}
                onClick={() => handleTransactionClick(transaction)}
              >
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-semibold">
                      {transaction.billType} - {transaction.operation}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Invoice: {transaction.dataSnapshot.invoiceNo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Received: ₹{transaction.dataSnapshot.recievedAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Net Amount: ₹{transaction.dataSnapshot.netAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Remaining: <span className={transaction.dataSnapshot.paymentType === "credit" ? "text-red-600" : ""}>
                        ₹{(transaction.dataSnapshot.netAmount - transaction.dataSnapshot.recievedAmount).toFixed(2)}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Payment Type: {transaction.dataSnapshot.paymentType || "N/A"}
                    </p>
                    {transaction.dataSnapshot.duedate && (
                      <p className="text-sm text-muted-foreground">
                        Due Date: {new Date(transaction.dataSnapshot.duedate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {transaction.billType === "sales"
                        ? `Customer: ${transaction.dataSnapshot.customerDetails}`
                        : `Vendor: ${transaction.dataSnapshot.vendorDetails}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receipt No: {transaction.dataSnapshot.receiptNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.dataSnapshot.paymentType === "credit"
                          ? "text-red-600"
                          : transaction.billType === "purchase"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      ₹{transaction.dataSnapshot.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBill && (
        <BillUpdateDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          bill={selectedBill}
          onUpdate={handleUpdateBill}
        />
      )}
    </div>
  );
};

export default TransactionsPage;
