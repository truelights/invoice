export interface Customer {
  name: string;
  address: string;
  phone: string;
}

export interface Product {
  name: string;
  price: number;
}

export interface BillItem {
  sr: number;
  item: string;
  bags: number;
  weight: number;
  rate: number;
  amount: number;
  
  otherCharges: number;
  applyCommission: boolean;
}

export interface Expense {
  type: string;
  amount: number;
}

export interface BusinessDetails {
  name?: string;
  logo?: string;
  gst?: string;
  address?: string;
  number?: string;
  commission?: number;
}

export interface Settings {
  customers: Customer[];
  products: Product[];
  companyDetails: BusinessDetails;
  expenseLabels: string[];
}

export interface Bill {
  type: "sales" | "purchase";
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

export interface NewBillNumbersResponse {
  receiptNo: string;
  invoiceNo: string;
}

export interface CreateBillResponse {
  success: boolean;
  data: Bill;
}
