export interface BillItem {
  sr: number;
  item: string;
  bags: number;
  weight: number;
  ratePerBag: number;
  amount: number;
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
}

export interface Vendor {
  name: string;
  address: string;
  phone: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
}

export interface Settings {
  companyDetails: BusinessDetails;
  vendors: Vendor[];
  products: Product[];
  expenseLabels: string[];
}

export interface Bill {
  type: "purchase" | "sales";
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
