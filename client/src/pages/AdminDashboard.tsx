import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Pencil, Trash2, Plus, Save, X, LogOut, Search, Filter, Users, FolderOpen } from 'lucide-react';

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

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
}

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Luxury Watches', description: 'Premium timepieces from top brands', productCount: 0 },
  { id: 2, name: 'Designer Handbags', description: 'Luxury handbags and accessories', productCount: 0 },
  { id: 3, name: 'Designer Sunglasses', description: 'High-end eyewear', productCount: 0 },
  { id: 4, name: 'Fine Jewelry', description: 'Precious jewelry and accessories', productCount: 0 },
  { id: 5, name: 'Designer Shoes', description: 'Luxury footwear', productCount: 0 },
];

const DEAL_TYPES = ['Flash Sale', 'Daily Deal', 'Clearance', 'Limited Time', 'Luxury Item'];
const CONDITIONS = ['Brand New', 'Pre-Owned', 'Excellent', 'Good', 'Fair'];
const ROLES = ['admin', 'editor', 'viewer'];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDealType, setFilterDealType] = useState('all');
  const [activeTab, setActiveTab] = useState('products');
  
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

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    email: '',
    role: 'viewer' as 'admin' | 'editor' | 'viewer',
  });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }
    loadProducts();
    loadCategories();
    loadUsers();
  }, [user]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/real_ebay_deals.json');
      const data = await response.json();
      setProducts(data);
      updateCategoryProductCounts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = () => {
    const stored = localStorage.getItem('luxury_deals_categories');
    if (stored) {
      setCategories(JSON.parse(stored));
    } else {
      localStorage.setItem('luxury_deals_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
  };

  const loadUsers = () => {
    const stored = localStorage.getItem('luxury_deals_users');
    if (stored) {
      const allUsers = JSON.parse(stored);
      setUsers(allUsers.map(({ password, ...user }: any) => user));
    }
  };

  const updateCategoryProductCounts = (productList: Product[]) => {
    const counts: Record<string, number> = {};
    productList.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        productCount: counts[cat.name] || 0,
      }))
    );
  };

  const calculateDiscount = (original: number, final: number) => {
    if (original <= 0) return 0;
    return Math.round(((original - final) / original) * 100);
  };

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    
    if (field === 'original_price' || field === 'final_price') {
      const original = field === 'original_price' ? parseFloat(value) : (formData.original_price || 0);
      const final = field === 'final_price' ? parseFloat(value) : (formData.final_price || 0);
      newData.discount_percentage = calculateDiscount(original, final);
    }
    
    setFormData(newData);
  };

  const handleSaveProduct = () => {
    if (!hasPermission('edit')) {
      alert('You do not have permission to edit products');
      return;
    }

    if (editingId !== null) {
      const updatedProducts = products.map((p) =>
        p.id === editingId ? { ...formData, id: editingId } as Product : p
      );
      setProducts(updatedProducts);
      saveProductsToFile(updatedProducts);
      setEditingId(null);
    } else {
      const newId = Math.max(...products.map((p) => p.id), 0) + 1;
      const newProduct = { ...formData, id: newId } as Product;
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      saveProductsToFile(updatedProducts);
      setShowAddForm(false);
    }
    
    resetProductForm();
  };

  const handleEditProduct = (product: Product) => {
    if (!hasPermission('edit')) {
      alert('You do not have permission to edit products');
      return;
    }
    setFormData(product);
    setEditingId(product.id);
    setShowAddForm(false);
  };

  const handleDeleteProduct = (id: number) => {
    if (!hasPermission('delete')) {
      alert('You do not have permission to delete products');
      return;
    }
    
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      saveProductsToFile(updatedProducts);
    }
  };

  const resetProductForm = () => {
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

  const saveProductsToFile = (updatedProducts: Product[]) => {
    const dataStr = JSON.stringify(updatedProducts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'real_ebay_deals.json';
    link.click();
    URL.revokeObjectURL(url);
    alert('Products updated! Download the JSON file and replace /public/real_ebay_deals.json');
  };

  // Category Management
  const handleSaveCategory = () => {
    if (!hasPermission('manage_categories')) {
      alert('You do not have permission to manage categories');
      return;
    }

    if (editingCategoryId !== null) {
      const updated = categories.map((c) =>
        c.id === editingCategoryId ? { ...c, ...categoryForm } : c
      );
      setCategories(updated);
      localStorage.setItem('luxury_deals_categories', JSON.stringify(updated));
      setEditingCategoryId(null);
    } else {
      const newId = Math.max(...categories.map((c) => c.id), 0) + 1;
      const newCat = { id: newId, ...categoryForm, productCount: 0 };
      const updated = [...categories, newCat];
      setCategories(updated);
      localStorage.setItem('luxury_deals_categories', JSON.stringify(updated));
    }
    
    setCategoryForm({ name: '', description: '' });
  };

  const handleDeleteCategory = (id: number) => {
    if (!hasPermission('manage_categories')) {
      alert('You do not have permission to manage categories');
      return;
    }

    const category = categories.find((c) => c.id === id);
    if (category && category.productCount > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${category.productCount} products`);
      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      localStorage.setItem('luxury_deals_categories', JSON.stringify(updated));
    }
  };

  // User Management
  const handleSaveUser = () => {
    if (!hasPermission('manage_users')) {
      alert('You do not have permission to manage users');
      return;
    }

    const storedUsers = localStorage.getItem('luxury_deals_users');
    const allUsers = storedUsers ? JSON.parse(storedUsers) : [];

    if (editingUserId !== null) {
      const updated = allUsers.map((u: any) =>
        u.id === editingUserId ? { ...u, ...userForm } : u
      );
      localStorage.setItem('luxury_deals_users', JSON.stringify(updated));
      setEditingUserId(null);
    } else {
      const newId = Math.max(...allUsers.map((u: any) => u.id), 0) + 1;
      const newUser = { id: newId, ...userForm, createdAt: new Date().toISOString() };
      allUsers.push(newUser);
      localStorage.setItem('luxury_deals_users', JSON.stringify(allUsers));
    }
    
    loadUsers();
    setUserForm({ username: '', password: '', email: '', role: 'viewer' });
  };

  const handleDeleteUser = (id: number) => {
    if (!hasPermission('manage_users')) {
      alert('You do not have permission to manage users');
      return;
    }

    if (id === user?.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      const storedUsers = localStorage.getItem('luxury_deals_users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const updated = allUsers.filter((u: any) => u.id !== id);
      localStorage.setItem('luxury_deals_users', JSON.stringify(updated));
      loadUsers();
    }
  };

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesDealType = filterDealType === 'all' || product.deal_type === filterDealType;
    
    return matchesSearch && matchesCategory && matchesDealType;
  });

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.username} ({user.role})
          </p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories" disabled={!hasPermission('manage_categories')}>
            Categories
          </TabsTrigger>
          <TabsTrigger value="users" disabled={!hasPermission('manage_users')}>
            Users
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Search</Label>
                  <Input
                    placeholder="Search by title, brand, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deal Type</Label>
                  <Select value={filterDealType} onValueChange={setFilterDealType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Deal Types</SelectItem>
                      {DEAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </CardContent>
          </Card>

          {hasPermission('edit') && !showAddForm && !editingId && (
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
          )}

          {/* Product Form */}
          {(showAddForm || editingId !== null) && hasPermission('edit') && (
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Brand *</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Original Price ($) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) => handleInputChange('original_price', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Final Price ($) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.final_price}
                      onChange={(e) => handleInputChange('final_price', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      value={formData.discount_percentage}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Deal Type *</Label>
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
                    <Label>Condition *</Label>
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
                  <Label>eBay Product URL *</Label>
                  <Input
                    value={formData.product_url}
                    onChange={(e) => handleInputChange('product_url', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Image URL *</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
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
                  <Button onClick={handleSaveProduct} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingId ? 'Update' : 'Add'} Product
                  </Button>
                  <Button
                    onClick={() => {
                      resetProductForm();
                      setEditingId(null);
                      setShowAddForm(false);
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">All Products ({filteredProducts.length})</h2>
            {filteredProducts.map((product) => (
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
                          <p className="text-sm text-gray-600">
                            {product.brand} • {product.category}
                          </p>
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
                          {hasPermission('edit') && (
                            <Button
                              onClick={() => handleEditProduct(product)}
                              variant="outline"
                              size="sm"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission('delete') && (
                            <Button
                              onClick={() => handleDeleteProduct(product.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCategoryId ? 'Edit Category' : 'Add New Category'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category Name *</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., Luxury Watches"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  placeholder="Brief description of this category"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCategory}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategoryId ? 'Update' : 'Add'} Category
                </Button>
                {editingCategoryId && (
                  <Button
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryForm({ name: '', description: '' });
                    }}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                      <p className="text-sm text-gray-600 mt-2">
                        {category.productCount} products
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setCategoryForm({
                            name: category.name,
                            description: category.description,
                          });
                          setEditingCategoryId(category.id);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category.id)}
                        variant="destructive"
                        size="sm"
                        disabled={category.productCount > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingUserId ? 'Edit User' : 'Add New User'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username *</Label>
                  <Input
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder={editingUserId ? 'Leave blank to keep current' : ''}
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Select
                    value={userForm.role}
                    onValueChange={(value: any) => setUserForm({ ...userForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveUser}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingUserId ? 'Update' : 'Add'} User
                </Button>
                {editingUserId && (
                  <Button
                    onClick={() => {
                      setEditingUserId(null);
                      setUserForm({ username: '', password: '', email: '', role: 'viewer' });
                    }}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">All Users ({users.length})</h2>
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{u.username}</h3>
                      <p className="text-sm text-gray-600">{u.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {u.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          Created: {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const storedUsers = localStorage.getItem('luxury_deals_users');
                          const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
                          const fullUser = allUsers.find((user: any) => user.id === u.id);
                          if (fullUser) {
                            setUserForm({
                              username: fullUser.username,
                              password: '',
                              email: fullUser.email,
                              role: fullUser.role,
                            });
                            setEditingUserId(u.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(u.id)}
                        variant="destructive"
                        size="sm"
                        disabled={u.id === user?.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
