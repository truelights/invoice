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

interface Product {
  name: string;
  price: number;
}

interface Settings {
  products: Product[];
}

interface Props {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<Settings>; // Ensure it returns `Promise<Settings>`
}

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
});

const ProductSettings: React.FC<Props> = ({ settings, onUpdate }) => {
  const [products, setProducts] = useState<Product[]>(settings.products || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
    },
  });

  const handleAddOrUpdateProduct = async (values: z.infer<typeof formSchema>) => {
    try {
      let updatedProducts: Product[];

      if (editingIndex !== null) {
        // Update existing product
        updatedProducts = products.map((product, index) =>
          index === editingIndex ? { ...product, ...values } : product
        );
        toast({ title: 'Product updated', description: `${values.name} has been updated.` });
      } else {
        // Add new product
        updatedProducts = [...products, values];
        toast({ title: 'Product added', description: `${values.name} has been added.` });
      }

      setProducts(updatedProducts);
      form.reset();
      setEditingIndex(null);
      await onUpdate({ products: updatedProducts });
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveProduct = async (index: number) => {
    try {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
      await onUpdate({ products: updatedProducts });
      toast({ title: 'Product removed', description: 'The product has been removed.' });
    } catch (error) {
      console.error('Error removing product:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove the product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = (index: number) => {
    setEditingIndex(index);
    const product = products[index];
    form.reset({ name: product.name, price: product.price });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Product List</h1>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit((data) => {
              const numericPrice = parseFloat(data.price.toString());
              if (isNaN(numericPrice)) {
                form.setError('price', { type: 'manual', message: 'Invalid price' });
                return;
              }
              handleAddOrUpdateProduct({ ...data, price: numericPrice });
            })();
          }}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-2">
            <Button type="submit">{editingIndex !== null ? 'Update Product' : 'Add Product'}</Button>
            {editingIndex !== null && (
              <Button type="button" variant="outline" onClick={() => setEditingIndex(null)}>
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
            <TableHead>Price</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={index}>
              <TableCell>{product.name}</TableCell>
              <TableCell>₹ {product.price.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditProduct(index)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit product</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveProduct(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove product</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductSettings;
