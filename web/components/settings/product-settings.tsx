import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the Product type
type Product = {
  _id: string;
  name: string;
  price: number;
};

// Define the Settings type that includes the products field
type Settings = {
  products: Product[];
};

// Define the props for the component
type ProductSettingsProps = {
  settings: Settings;
  onUpdate: (updatedSettings: Partial<Settings>) => Promise<void>;
};

export function ProductSettings({ settings, onUpdate }: ProductSettingsProps) {
  const [products, setProducts] = useState<Product[]>(settings.products);
  const [newProduct, setNewProduct] = useState<Product>({
    _id: "",
    name: "",
    price: 0,
  });

  const handleAddProduct = () => {
    if (newProduct.name.trim() && newProduct.price > 0) {
      setProducts((prev) => [
        ...prev,
        { ...newProduct, _id: Date.now().toString() }, // Using Date.now() for unique _id
      ]);
      setNewProduct({ _id: "", name: "", price: 0 }); // Reset newProduct after adding
    }
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product._id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({ products });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="productName">Product Name</Label>
        <Input
          id="productName"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter product name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="productPrice">Product Price</Label>
        <Input
          id="productPrice"
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct((prev) => ({
              ...prev,
              price: Number(e.target.value), // Ensure the price is always a number
            }))
          }
          placeholder="Enter product price"
        />
      </div>
      <Button type="button" onClick={handleAddProduct}>
        Add Product
      </Button>
      <div>
        <Label>Products</Label>
        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product._id} className="flex justify-between items-center">
              <span>
                {product.name} - ${product.price}
              </span>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemoveProduct(product._id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <Button type="submit">Update Products</Button>
    </form>
  );
}
