"use client"
import { useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBills } from "@/utils/api"
import dayjs from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { ReportDetails } from "@/components/report-details"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

dayjs.extend(isBetween)

const ReportsPage = () => {
  const [bills, setBills] = useState([])
  const [dateRange, setDateRange] = useState()
  const [activeTab, setActiveTab] = useState("purchase")
  const [dateFilter, setDateFilter] = useState("today")
  const [selectedBill, setSelectedBill] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  console.log(bills)

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await getBills()
        setBills(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Failed to fetch bills:", error)
      }
    }
    fetchBills()
  }, [])

  const filteredBills = useMemo(() => {
    if (!Array.isArray(bills)) return []

    const today = dayjs().startOf("day")
    const filtered = bills.filter((bill) => bill.type === activeTab)

    switch (dateFilter) {
      case "today":
        return filtered.filter((bill) => dayjs(bill.date).isSame(today, "day"))
      case "yesterday":
        const yesterday = today.subtract(1, "day")
        return filtered.filter((bill) => dayjs(bill.date).isSame(yesterday, "day"))
      case "weekly":
        const weekStart = today.startOf("week")
        const weekEnd = today.endOf("week")
        return filtered.filter((bill) => dayjs(bill.date).isBetween(weekStart, weekEnd, null, "[]"))
      case "monthly":
        const monthStart = today.startOf("month")
        const monthEnd = today.endOf("month")
        return filtered.filter((bill) => dayjs(bill.date).isBetween(monthStart, monthEnd, null, "[]"))
      case "range":
        if (dateRange?.from && dateRange?.to) {
          return filtered.filter((bill) =>
            dayjs(bill.date).isBetween(dayjs(dateRange.from), dayjs(dateRange.to), null, "[]"),
          )
        }
        return filtered
      default:
        return filtered
    }
  }, [bills, activeTab, dateFilter, dateRange])

  const totals = useMemo(() => {
    return filteredBills.reduce(
      (acc, bill) => {
        acc.totalAmount += bill.totalAmount
        acc.totalExpense += bill.totalExpense
        acc.netAmount += bill.netAmount
        acc.recievedAmount += bill.recievedAmount
        return acc
      },
      { totalAmount: 0, totalExpense: 0, netAmount: 0, recievedAmount: 0 },
    )
  }, [filteredBills])

  const handleRowClick = (bill) => {
    setSelectedBill(bill)
    setIsDrawerOpen(true)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <Tabs defaultValue="purchase" onValueChange={(value) => setActiveTab(value)}>
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
          {dateFilter === "range" && <DatePickerWithRange date={dateRange} setDate={setDateRange} />}
        </div>
        <TabsContent value="purchase">
          <ReportTable bills={filteredBills} totals={totals} type="purchase" onRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="sales">
          <ReportTable bills={filteredBills} totals={totals} type="sales" onRowClick={handleRowClick} />
        </TabsContent>
      </Tabs>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} className="overflow-auto">
        <DrawerContent className="overflow-auto">
          <DrawerHeader>
            <DrawerTitle>Report Details</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0 overflow-auto">
            {selectedBill && <ReportDetails bill={selectedBill} />}
            <DrawerClose asChild>
              <Button>Close ❌</Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

const ReportTable = ({ bills, totals, type, onRowClick }) => {
  const [sortColumn, setSortColumn] = useState(null)
  const [sortOrder, setSortOrder] = useState("asc")

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortOrder("asc")
    }
  }

  const sortedBills = [...bills].sort((a, b) => {
    if (!sortColumn) return 0

    let valueA, valueB

    if (sortColumn === "name") {
      valueA = type === "purchase" ? a.vendorDetails : a.customerDetails?.split(",")[0].trim()
      valueB = type === "purchase" ? b.vendorDetails : b.customerDetails?.split(",")[0].trim()
    } else {
      valueA = a[sortColumn]
      valueB = b[sortColumn]
    }

    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null
    return sortOrder === "asc" ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === "purchase" ? "Purchase" : "Sales"} Report</CardTitle>
      </CardHeader>
      <CardContent className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                Date <SortIcon column="date" />
              </TableHead>
              <TableHead onClick={() => handleSort("invoiceNo")} className="cursor-pointer">
                Invoice No <SortIcon column="invoiceNo" />
              </TableHead>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                {type === "purchase" ? "Vendor" : "Customer"} <SortIcon column="name" />
              </TableHead>
              <TableHead onClick={() => handleSort("totalAmount")} className="cursor-pointer">
                Total Amount <SortIcon column="totalAmount" />
              </TableHead>
              <TableHead onClick={() => handleSort("totalExpense")} className="cursor-pointer">
                Total Expense <SortIcon column="totalExpense" />
              </TableHead>
              <TableHead onClick={() => handleSort("netAmount")} className="cursor-pointer">
                Net Amount <SortIcon column="netAmount" />
              </TableHead>
              <TableHead onClick={() => handleSort("recievedAmount")} className="cursor-pointer">
                Received Amount <SortIcon column="recievedAmount" />
              </TableHead>
              <TableHead onClick={() => handleSort("paymentType")} className="cursor-pointer">
                Payment Type <SortIcon column="paymentType" />
              </TableHead>
              <TableHead onClick={() => handleSort("receiptNo")} className="cursor-pointer">
                Batch Number <SortIcon column="receiptNo" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBills.map((bill) => (
              <TableRow key={bill._id} onClick={() => onRowClick(bill)} className="cursor-pointer hover:bg-gray-100">
                <TableCell>{dayjs(bill.date).format("DD/MM/YYYY")}</TableCell>
                <TableCell>{bill.invoiceNo}</TableCell>
                <TableCell>
                  {type === "purchase"
                    ? bill.vendorDetails
                    : bill.customerDetails?.split(",").map((item) => item.trim())[0] || "N/A"}
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
  )
}

export default ReportsPage
