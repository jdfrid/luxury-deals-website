import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  description: string;
  original_price: number;
  final_price: number;
  discount_percentage: number;
  category: string;
  deal_type: string;
  product_url: string;
  brand: string;
  condition: string;
  featured: boolean;
  image_url: string;
}

const CATEGORIES = [
  'Luxury Watches',
  'Designer Handbags',
  'Designer Sunglasses',
  'Fine Jewelry',
  'Designer Shoes',
];

const DEAL_TYPES = ['Flash Sale', 'Daily Deal', 'Clearance', 'Limited Time', 'Luxury Item'];

const CONDITIONS = ['Brand New', 'Pre-Owned', 'Excellent', 'Good', 'Fair'];

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    description: '',
    original_price: 0,
    final_price: 0,
    discount_percentage: 0,
    category: 'Luxury Watches',
    deal_type: 'Flash Sale',
    product_url: '',
    brand: '',
    condition: 'Pre-Owned',
    featured: false,
    image_url: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/real_ebay_deals.json');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const calculateDiscount = (original: number, final: number) => {
    if (original <= 0) return 0;
    return Math.round(((original - final) / original) * 100);
  };

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    
    // Auto-calculate discount percentage
    if (field === 'original_price' || field === 'final_price') {
      const original = field === 'original_price' ? parseFloat(value) : (formData.original_price || 0);
      const final = field === 'final_price' ? parseFloat(value) : (formData.final_price || 0);
      newData.discount_percentage = calculateDiscount(original, final);
    }
    
    setFormData(newData);
  };

  const handleSave = () => {
    if (editingId !== null) {
      // Update existing product
      const updatedProducts = products.map((p) =>
        p.id === editingId ? { ...formData, id: editingId } as Product : p
      );
      setProducts(updatedProducts);
      saveToFile(updatedProducts);
      setEditingId(null);
    } else {
      // Add new product
      const newId = Math.max(...products.map((p) => p.id), 0) + 1;
      const newProduct = { ...formData, id: newId } as Product;
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      saveToFile(updatedProducts);
      setShowAddForm(false);
    }
    
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowAddForm(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      saveToFile(updatedProducts);
    }
  };

  const handleCancel = () => {
    resetForm();
    setEditingId(null);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      original_price: 0,
      final_price: 0,
      discount_percentage: 0,
      category: 'Luxury Watches',
      deal_type: 'Flash Sale',
      product_url: '',
      brand: '',
      condition: 'Pre-Owned',
      featured: false,
      image_url: '',
    });
  };

  const saveToFile = async (updatedProducts: Product[]) => {
    try {
      // In a real implementation, this would send to a backend API
      // For now, we'll download the JSON file
      const dataStr = JSON.stringify(updatedProducts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'real_ebay_deals.json';
      link.click();
      URL.revokeObjectURL(url);
      
      alert('Products updated! Download the JSON file and replace /public/real_ebay_deals.json');
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Error saving products');
    }
  };

  const ProductForm = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
        <CardDescription>
          {editingId ? 'Update product details' : 'Fill in the details to add a new luxury product'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Rolex Submariner Date 41mm"
            />
          </div>
          <div>
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="e.g., Rolex"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Detailed product description..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="original_price">Original Price ($) *</Label>
            <Input
              id="original_price"
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => handleInputChange('original_price', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="final_price">Final Price ($) *</Label>
            <Input
              id="final_price"
              type="number"
              step="0.01"
              value={formData.final_price}
              onChange={(e) => handleInputChange('final_price', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              value={formData.discount_percentage}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="deal_type">Deal Type *</Label>
            <Select
              value={formData.deal_type}
              onValueChange={(value) => handleInputChange('deal_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEAL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="condition">Condition *</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) => handleInputChange('condition', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((cond) => (
                  <SelectItem key={cond} value={cond}>
                    {cond}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="product_url">eBay Product URL *</Label>
          <Input
            id="product_url"
            value={formData.product_url}
            onChange={(e) => handleInputChange('product_url', e.target.value)}
            placeholder="https://www.ebay.com/itm/..."
          />
        </div>

        <div>
          <Label htmlFor="image_url">Image URL *</Label>
          <Input
            id="image_url"
            value={formData.image_url}
            onChange={(e) => handleInputChange('image_url', e.target.value)}
            placeholder="https://i.ebayimg.com/images/..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => handleInputChange('featured', e.target.checked)}
            className="w-4 h-4"
          />
          <Label htmlFor="featured">Featured Product</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {editingId ? 'Update Product' : 'Add Product'}
          </Button>
          <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Product Management</h1>
        <p className="text-gray-600">Add, edit, or delete luxury products</p>
      </div>

      {!showAddForm && !editingId && (
        <Button
          onClick={() => setShowAddForm(true)}
          className="mb-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Button>
      )}

      {(showAddForm || editingId !== null) && <ProductForm />}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">All Products ({products.length})</h2>
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/96?text=No+Image';
                  }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{product.title}</h3>
                      <p className="text-sm text-gray-600">{product.brand} • {product.category}</p>
                      <p className="text-sm mt-1">{product.description.substring(0, 100)}...</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-lg font-bold text-purple-600">
                          ${product.final_price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${product.original_price.toFixed(2)}
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          -{product.discount_percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(product)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(product.id)}
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
