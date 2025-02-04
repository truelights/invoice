import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import dayjs from "dayjs"

interface Vendor {
  _id: string
  name: string
  contact: string
}

interface Bill {
  _id: string
  type: "purchase" | "sales"
  invoiceNo: string
  date: string
  vendorDetails: string
  totalAmount: number
  netAmount: number
  recievedAmount: number
  paymentType: string
}

interface VendorListProps {
  vendors: Vendor[]
  bills: Bill[]
}

export const VendorList: React.FC<VendorListProps> = ({ vendors, bills }) => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsDrawerOpen(true)
  }

  const vendorBills = bills.filter(
    (bill) => bill.type === "purchase" && bill.vendorDetails.includes(selectedVendor?.name || ""),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>{vendor.contact}</TableCell>
                <TableCell>
                  <Button onClick={() => handleVendorClick(vendor)}>View History</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedVendor?.name} - Purchase History</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Received Amount</TableHead>
                  <TableHead>Payment Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorBills.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell>{dayjs(bill.date).format("DD/MM/YYYY")}</TableCell>
                    <TableCell>{bill.invoiceNo}</TableCell>
                    <TableCell>₹{bill.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>₹{bill.netAmount.toFixed(2)}</TableCell>
                    <TableCell>₹{bill.recievedAmount.toFixed(2)}</TableCell>
                    <TableCell>{bill.paymentType || "Not Received"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DrawerContent>
      </Drawer>
    </Card>
  )
}

