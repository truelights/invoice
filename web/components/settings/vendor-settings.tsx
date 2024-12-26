'use client'

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Trash2, Edit2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface Vendor {
  _id: string
  name: string
  address: string
  phone: string
}

interface Settings {
  vendors: Vendor[]
}


type CustomerSettingsProps = {
    settings: Settings; // `settings` is a complete `Settings` object
    onUpdate: (updatedSettings: Partial<Settings>) => Promise<Settings>; // Ensure it returns `Promise<Settings>`
  };



const formSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
})

export function VendorSettings({ settings, onUpdate }: CustomerSettingsProps) {
  const [vendors, setVendors] = useState<Vendor[]>(settings.vendors || [])
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
    },
  })

  const handleAddOrUpdateVendor = async (values: z.infer<typeof formSchema>) => {
    setIsUpdating(true);
    try {
      let updatedVendors: Vendor[];
      if (editingVendor) {
        updatedVendors = vendors.map((v) =>
          v._id === editingVendor._id ? { ...v, ...values } : v
        );
      } else {
        const newVendor: Vendor = { _id: crypto.randomUUID(), ...values }; // Generate unique _id
        updatedVendors = [...vendors, newVendor];
      }
      const updatedSettings = await onUpdate({ vendors: updatedVendors }); // Ensure onUpdate returns Settings
      setVendors(updatedSettings.vendors); // Update state with returned vendors
      form.reset();
      setEditingVendor(null);
      toast({
        title: editingVendor ? "Vendor updated" : "Vendor added",
        description: `${values.name} has been ${
          editingVendor ? "updated" : "added"
        } successfully.`,
      });
    } catch (error) {
      console.error("Error updating vendors:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          editingVendor ? "update" : "add"
        } the vendor. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveVendor = async (name: string) => {
    setIsUpdating(true);
    try {
      const updatedVendors = vendors.filter((vendor) => vendor.name !== name);
      const result = await onUpdate({ vendors: updatedVendors });
      setVendors(result.vendors || updatedVendors);
      toast({
        title: "Vendor removed",
        description: "The vendor has been removed from the list.",
      });
    } catch (error) {
      console.error("Error removing vendor:", error);
      toast({
        title: "Error",
        description: "Failed to remove the vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    form.reset({
      name: vendor.name,
      address: vendor.address,
      phone: vendor.phone,
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Vendor List</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddOrUpdateVendor)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vendor name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isUpdating}>
            {editingVendor ? 'Update Vendor' : 'Add Vendor'}
          </Button>
          {editingVendor && (
            <Button type="button" variant="outline" onClick={() => setEditingVendor(null)}>
              Cancel Edit
            </Button>
          )}
        </form>
      </Form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.name}>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>{vendor.address}</TableCell>
              <TableCell>{vendor.phone}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditVendor(vendor)}
                    disabled={isUpdating}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit vendor</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveVendor(vendor.name)}
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove vendor</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
