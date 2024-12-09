export interface Transaction {
  id: string
  type: 'in' | 'out' | 'credit'
  amount: number
  date: string
  dueDate?: string
  paymentMode: string
  description: string
  customerName: string
}

export interface Report {
  id: string
  type: 'purchase' | 'sales'
  date: string
  customerName: string
  item: string
  bags: number
  weight: number
  rate: number
  amount: number
  expenses: number[]
  totalExpense: number
  netAmount: number
  batchNumber?: string
  commission?: number
}

