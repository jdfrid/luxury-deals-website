import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, TrendingDown, ExternalLink, ArrowUpDown } from "lucide-react";

interface Deal {
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
  image_url?: string;
}

interface CategoryInfo {
  name: string;
  count: number;
  totalSavings: number;
  avgDiscount: number;
  icon: string;
}

export default function Categories() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [sortBy, setSortBy] = useState("featured");

  // Load deals from JSON
  useEffect(() => {
    fetch('/real_ebay_deals.json')
      .then(res => res.json())
      .then(data => {
        setDeals(data);
        
        // Calculate category statistics
        const categoryMap = new Map<string, CategoryInfo>();
        
        data.forEach((deal: Deal) => {
          if (!categoryMap.has(deal.category)) {
            categoryMap.set(deal.category, {
              name: deal.category,
              count: 0,
              totalSavings: 0,
              avgDiscount: 0,
              icon: getCategoryIcon(deal.category)
            });
          }
          
          const cat = categoryMap.get(deal.category)!;
          cat.count++;
          cat.totalSavings += (deal.original_price - deal.final_price);
        });
        
        // Calculate average discounts
        categoryMap.forEach((cat) => {
          const categoryDeals = data.filter((d: Deal) => d.category === cat.name);
          cat.avgDiscount = categoryDeals.reduce((sum: number, d: Deal) => sum + d.discount_percentage, 0) / categoryDeals.length;
        });
        
        setCategories(Array.from(categoryMap.values()).sort((a, b) => b.count - a.count));
      })
      .catch(err => console.error('Error loading deals:', err));
  }, []);

  // Filter and sort deals by selected category
  useEffect(() => {
    if (selectedCategory) {
      let filtered = deals.filter(deal => deal.category === selectedCategory);
      
      // Sort deals
      const sorted = [...filtered];
      switch (sortBy) {
        case "price-low":
          sorted.sort((a, b) => a.final_price - b.final_price);
          break;
        case "price-high":
          sorted.sort((a, b) => b.final_price - a.final_price);
          break;
        case "discount":
          sorted.sort((a, b) => b.discount_percentage - a.discount_percentage);
          break;
        case "featured":
        default:
          sorted.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return b.discount_percentage - a.discount_percentage;
          });
      }
      
      setFilteredDeals(sorted);
    } else {
      setFilteredDeals([]);
    }
  }, [selectedCategory, sortBy, deals]);

  // Get category icon emoji
  function getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      "Luxury Watches": "⌚",
      "Designer Handbags": "👜",
      "Luxury Jewelry": "💎",
      "Premium Headphones And Audio": "🎧",
      "Designer Sunglasses": "🕶️",
      "Luxury Pens": "🖊️",
      "Premium Leather Goods": "👔",
      "Luxury Home Decor": "🏠",
      "Designer Shoes": "👞",
      "Premium Tech Gadgets": "📱"
    };
    return iconMap[category] || "✨";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-amber-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                  Luxury Deals Store
                </h1>
              </a>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <a className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Home</a>
              </Link>
              <Link href="/categories">
                <a className="text-purple-600 font-bold">Categories</a>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {!selectedCategory ? (
          <>
            {/* Categories Overview */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                Browse by Category
              </h2>
              <p className="text-gray-600 text-lg">
                Explore {categories.length} premium categories with exclusive luxury deals
              </p>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="group overflow-hidden border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <CardContent className="p-8">
                    <div className="text-6xl mb-4">{category.icon}</div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-purple-200 text-purple-700">
                        {category.count} items
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 border-0">
                        Avg {category.avgDiscount.toFixed(0)}% off
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Total savings: <span className="font-bold text-green-600">${category.totalSavings.toLocaleString()}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white group-hover:shadow-lg transition-shadow">
                      View Deals
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Category Deals View */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
                className="mb-4 border-purple-200 hover:border-purple-400"
              >
                ← Back to Categories
              </Button>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-6xl">{getCategoryIcon(selectedCategory)}</span>
                <div className="flex-1">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                    {selectedCategory}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {filteredDeals.length} premium items available
                  </p>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[220px] h-12 border-purple-200">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="discount">Highest Discount</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.map(deal => (
                <Card key={deal.id} className="group overflow-hidden border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-64 bg-gradient-to-br from-purple-100 to-amber-50 flex items-center justify-center overflow-hidden">
                    {deal.image_url ? (
                      <img 
                        src={deal.image_url} 
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-amber-50 ${deal.image_url ? 'hidden' : ''}`}>
                      <div className="text-center p-6">
                        <div className="text-4xl font-bold text-purple-600 mb-2">{deal.brand}</div>
                        <div className="text-sm text-gray-600">{deal.condition}</div>
                      </div>
                    </div>
                    {deal.featured && (
                      <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {deal.discount_percentage > 0 && (
                      <Badge className="absolute top-3 right-3 bg-red-600 text-white text-lg font-bold border-0">
                        -{deal.discount_percentage.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {deal.title}
                    </h4>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-purple-600">
                        ${deal.final_price.toLocaleString()}
                      </span>
                      {deal.original_price > deal.final_price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${deal.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {deal.original_price > deal.final_price && (
                      <div className="flex items-center gap-1 text-green-600 text-sm mb-4">
                        <TrendingDown className="w-4 h-4" />
                        <span className="font-semibold">
                          Save ${(deal.original_price - deal.final_price).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <a
                      href={deal.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on eBay
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-purple-900 to-purple-800 text-white py-12 px-4 mt-20">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Luxury Deals Store</h3>
          </div>
          <p className="text-purple-200 mb-6">
            Your trusted source for authentic luxury items at unbeatable prices
          </p>
          <p className="text-sm text-purple-300">
            © 2024 Luxury Deals Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
