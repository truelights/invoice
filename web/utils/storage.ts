import type { Transaction, Report } from '../types/transaction'
import type { Settings } from '../hooks/useSettings'

export const storage = {
  saveTransaction: (transaction: Transaction) => {
    const transactions = storage.getTransactions()
    transactions.push(transaction)
    localStorage.setItem('transactions', JSON.stringify(transactions))
  },

  getTransactions: (): Transaction[] => {
    const transactions = localStorage.getItem('transactions')
    return transactions ? JSON.parse(transactions) : []
  },

  saveReport: (report: Report) => {
    const reports = storage.getReports()
    reports.push(report)
    localStorage.setItem('reports', JSON.stringify(reports))
  },

  getReports: (): Report[] => {
    const reports = localStorage.getItem('reports')
    return reports ? JSON.parse(reports) : []
  },

  saveSettings: (settings: Settings) => {
    localStorage.setItem('billingSettings', JSON.stringify(settings))
  },

  getSettings: (): Settings => {
    const settings = localStorage.getItem('billingSettings')
    return settings ? JSON.parse(settings) : {
      companyDetails: { name: '', gst: '', address: '', phone: '' },
      expenseLabels: [],
      products: [],
      customers: [],
      vendors: []
    }
  },

  filterReportsByDate: (reports: Report[], timeFrame: string, startDate?: string, endDate?: string) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    return reports.filter(report => {
      const reportDate = new Date(report.date)
      
      switch(timeFrame) {
        case 'today':
          return reportDate.toDateString() === today.toDateString()
        case 'yesterday':
          return reportDate.toDateString() === yesterday.toDateString()
        case 'weekly':
          const weekAgo = new Date(today)
          weekAgo.setDate(today.getDate() - 7)
          return reportDate >= weekAgo && reportDate <= today
        case 'monthly':
          const monthAgo = new Date(today)
          monthAgo.setMonth(today.getMonth() - 1)
          return reportDate >= monthAgo && reportDate <= today
        case 'range':
          if (!startDate || !endDate) return true
          const start = new Date(startDate)
          const end = new Date(endDate)
          return reportDate >= start && reportDate <= end
        default:
          return true
      }
    })
  },

  getNextReceiptNumber: (): string => {
    const today = new Date().toISOString().split('T')[0]
    const lastReceiptData = localStorage.getItem('lastReceiptNumber')
    let lastReceiptNumber = 1

    if (lastReceiptData) {
      const { date, number } = JSON.parse(lastReceiptData)
      if (date === today) {
        lastReceiptNumber = number + 1
      }
    }

    localStorage.setItem('lastReceiptNumber', JSON.stringify({ date: today, number: lastReceiptNumber }))
    return `${today}-${lastReceiptNumber.toString().padStart(4, '0')}`
  },

  getNextInvoiceNumber: (): string => {
    const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber')
    const nextNumber = lastInvoiceNumber ? parseInt(lastInvoiceNumber) + 1 : 1
    localStorage.setItem('lastInvoiceNumber', nextNumber.toString())
    return nextNumber.toString().padStart(6, '0')
  },
}

