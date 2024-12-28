'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Trash2, Edit2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  name: string;
  address: string;
  phone: string;
}

interface Settings {
  vendors: Vendor[];
}

type VendorSettingsProps = {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<Settings>;
};

const formSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

export function VendorSettings({ settings, onUpdate }: VendorSettingsProps) {
  const [vendors, setVendors] = useState<Vendor[]>(settings.vendors || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
    },
  });

  const handleAddOrUpdateVendor = async (values: z.infer<typeof formSchema>) => {
    setIsUpdating(true);
    try {
      let updatedVendors: Vendor[];

      if (editingIndex !== null) {
        updatedVendors = vendors.map((v, index) =>
          index === editingIndex ? { ...values } : v
        );
        toast({ title: 'Vendor updated', description: `${values.name} has been updated.` });
      } else {
        updatedVendors = [...vendors, values];
        toast({ title: 'Vendor added', description: `${values.name} has been added.` });
      }

      const updatedSettings = await onUpdate({ vendors: updatedVendors });
      setVendors(updatedSettings.vendors);
      form.reset();
      setEditingIndex(null);
    } catch (error) {
      console.error('Error updating vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the vendor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveVendor = async (index: number) => {
    setIsUpdating(true);
    try {
      const updatedVendors = vendors.filter((_, i) => i !== index);
      const updatedSettings = await onUpdate({ vendors: updatedVendors });
      setVendors(updatedSettings.vendors);
      toast({ title: 'Vendor removed', description: 'The vendor has been removed.' });
    } catch (error) {
      console.error('Error removing vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove the vendor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditVendor = (index: number) => {
    setEditingIndex(index);
    const vendor = vendors[index];
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
          <div className="flex space-x-2">
            <Button type="submit" disabled={isUpdating}>
              {editingIndex !== null ? 'Update Vendor' : 'Add Vendor'}
            </Button>
            {editingIndex !== null && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingIndex(null);
                  form.reset();
                }}
              >
                Cancel Edit
              </Button>
            )}
          </div>
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
          {vendors.map((vendor, index) => (
            <TableRow key={index}>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>{vendor.address}</TableCell>
              <TableCell>{vendor.phone}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditVendor(index)}
                    disabled={isUpdating}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveVendor(index)}
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
